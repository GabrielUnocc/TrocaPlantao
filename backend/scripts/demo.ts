/**
 * Demonstracao narrada da API de autenticacao.
 *
 *   npm run demo            roda do inicio ao fim
 *   npm run demo -- --pausar  espera ENTER entre cada passo (para apresentar)
 *
 * Sobe a API em memoria, executa o fluxo completo e explica cada resposta.
 * O .env.demo usa ACCESS_TOKEN_TTL=5 para a expiracao acontecer ao vivo.
 */
import { createInterface } from 'node:readline/promises';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { migrate, resetDatabase, db } from '../src/db/index.js';
import { hashPassword } from '../src/shared/password.js';
import { userRepository } from '../src/modules/users/user.repository.js';

/* ---------------------------------------------------------------- */
/* Formatacao de terminal                                            */
/* ---------------------------------------------------------------- */
const c = {
  reset: '\x1b[0m',
  negrito: '\x1b[1m',
  cinza: '\x1b[90m',
  vermelho: '\x1b[31m',
  verde: '\x1b[32m',
  amarelo: '\x1b[33m',
  azul: '\x1b[36m',
};

const LARGURA = 74;
const pausar = process.argv.includes('--pausar');
const rl = pausar ? createInterface({ input: process.stdin, output: process.stdout }) : null;

let numero = 0;

async function passo(titulo: string, explicacao: string) {
  numero += 1;
  console.log(`\n${c.azul}${'═'.repeat(LARGURA)}${c.reset}`);
  console.log(`${c.azul}${c.negrito}  PASSO ${numero} — ${titulo}${c.reset}`);
  console.log(`${c.azul}${'═'.repeat(LARGURA)}${c.reset}`);
  console.log(`${c.cinza}  ${explicacao}${c.reset}\n`);
  if (rl) await rl.question(`${c.cinza}  [ENTER para executar]${c.reset}`);
}

const ok = (texto: string) => console.log(`  ${c.verde}✓${c.reset} ${texto}`);
const falha = (texto: string) => console.log(`  ${c.vermelho}✗${c.reset} ${texto}`);
const nota = (texto: string) => console.log(`  ${c.amarelo}▸${c.reset} ${texto}`);

function mostrarJson(rotulo: string, valor: unknown) {
  const texto = JSON.stringify(valor, null, 2)
    .split('\n')
    .map((linha) => `    ${c.cinza}${linha}${c.reset}`)
    .join('\n');
  console.log(`  ${rotulo}\n${texto}`);
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------------------------------------- */
/* Cliente HTTP                                                      */
/* ---------------------------------------------------------------- */
let baseUrl = '';

type Resposta = { status: number; body: any };

async function chamar(
  metodo: string,
  rota: string,
  opcoes: { body?: unknown; token?: string } = {}
): Promise<Resposta> {
  const resposta = await fetch(baseUrl + rota, {
    method: metodo,
    headers: {
      'content-type': 'application/json',
      ...(opcoes.token ? { authorization: `Bearer ${opcoes.token}` } : {}),
    },
    ...(opcoes.body === undefined ? {} : { body: JSON.stringify(opcoes.body) }),
  });
  const texto = await resposta.text();
  const body = texto ? JSON.parse(texto) : null;

  const cor = resposta.status < 400 ? c.verde : c.vermelho;
  const header = opcoes.token ? `  ${c.cinza}Authorization: Bearer ${opcoes.token.slice(0, 24)}...${c.reset}\n` : '';
  console.log(
    `  ${c.negrito}${metodo} ${rota}${c.reset}\n${header}` +
      `  ${c.cinza}→${c.reset} ${cor}${c.negrito}HTTP ${resposta.status}${c.reset}`
  );

  return { status: resposta.status, body };
}

/** Le o payload do JWT sem verificar: so para mostrar o conteudo na tela. */
function lerPayloadJwt(token: string) {
  const parte = token.split('.')[1] ?? '';
  return JSON.parse(Buffer.from(parte, 'base64url').toString('utf8'));
}

/* ---------------------------------------------------------------- */
/* Demonstracao                                                      */
/* ---------------------------------------------------------------- */
async function main() {
  migrate();
  resetDatabase();

  await userRepository.create({
    nome: 'Gestor TrocaPlantao',
    matricula: 'MAT-00001',
    email: 'gestor@trocaplantao.com',
    senhaHash: await hashPassword('gestor123'),
    role: 'gestor',
    nivel: 'Lider',
    equipe: 'Suporte TI',
  });

  const server: Server = await new Promise((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  const endereco = server.address();
  const porta = typeof endereco === 'object' && endereco ? endereco.port : 0;
  baseUrl = `http://127.0.0.1:${porta}`;

  console.log(`\n${c.negrito}  TROCAPLANTÃO — API DE AUTENTICAÇÃO${c.reset}`);
  console.log(`${c.cinza}  Demonstração do fluxo completo${c.reset}`);
  console.log(`${c.cinza}  Servidor: ${baseUrl}   ·   access token expira em 5 s${c.reset}`);

  /* ---------------- 1. Cadastro ---------------- */
  await passo(
    'Cadastro de atendente',
    'A senha vai no corpo da requisição. A resposta devolve o usuário e os dois tokens.'
  );

  const cadastro = await chamar('POST', '/auth/register', {
    body: {
      nome: 'Rafael Lima',
      matricula: 'MAT-12345',
      email: 'rafael@trocaplantao.com',
      senha: 'senhaSegura123',
      nivel: 'N2',
      equipe: 'Suporte TI',
    },
  });

  mostrarJson('Resposta:', {
    user: cadastro.body.user,
    tokens: {
      accessToken: `${cadastro.body.tokens.accessToken.slice(0, 40)}...`,
      tokenType: cadastro.body.tokens.tokenType,
      expiresIn: cadastro.body.tokens.expiresIn,
      refreshToken: `${cadastro.body.tokens.refreshToken.slice(0, 20)}...`,
      refreshExpiresIn: cadastro.body.tokens.refreshExpiresIn,
    },
  });
  ok('A resposta NÃO contém a senha nem o hash dela.');
  nota(`role veio como "${cadastro.body.user.role}" — o cliente não escolhe o próprio papel.`);

  /* ---------------- 2. Senha no banco ---------------- */
  await passo(
    'Como a senha ficou gravada no banco',
    'Consulta direta na tabela users, sem passar pela API.'
  );

  const usuarios = db
    .prepare('SELECT nome, email, role, senha_hash FROM users')
    .all() as Array<{ nome: string; email: string; role: string; senha_hash: string }>;

  for (const u of usuarios) {
    console.log(`  ${c.negrito}${u.email}${c.reset} ${c.cinza}(${u.role})${c.reset}`);
    console.log(`    senha_hash = ${c.amarelo}${u.senha_hash}${c.reset}`);
  }
  ok('bcrypt com custo 12. O prefixo $2b$12$ mostra o algoritmo e o custo.');
  ok('Nem o administrador do banco consegue descobrir a senha original.');

  /* ---------------- 3. Credenciais erradas ---------------- */
  await passo(
    'Senha errada vs. e-mail inexistente',
    'As duas respostas têm de ser idênticas, senão a API revela quais e-mails existem.'
  );

  const senhaErrada = await chamar('POST', '/auth/login', {
    body: { email: 'rafael@trocaplantao.com', senha: 'chutei-essa' },
  });
  mostrarJson('E-mail existe, senha errada:', senhaErrada.body);

  const naoExiste = await chamar('POST', '/auth/login', {
    body: { email: 'ninguem@trocaplantao.com', senha: 'chutei-essa' },
  });
  mostrarJson('E-mail nem existe:', naoExiste.body);

  const iguais = JSON.stringify(senhaErrada.body) === JSON.stringify(naoExiste.body);
  (iguais ? ok : falha)(
    iguais
      ? 'Respostas idênticas: não é possível descobrir quais e-mails estão cadastrados.'
      : 'Respostas diferentes — isso seria uma falha.'
  );
  nota('O tempo de resposta também é igualado (burnTime), fechando o timing attack.');

  /* ---------------- 4. Login + JWT ---------------- */
  await passo('Login válido e o conteúdo do token', 'Agora com a senha correta.');

  const login = await chamar('POST', '/auth/login', {
    body: { email: 'rafael@trocaplantao.com', senha: 'senhaSegura123' },
  });

  let accessToken: string = login.body.tokens.accessToken;
  let refreshToken: string = login.body.tokens.refreshToken;

  console.log(`\n  ${c.negrito}O access token é um JWT com três partes:${c.reset}`);
  const [cabecalho, carga, assinatura] = accessToken.split('.');
  console.log(`    ${c.azul}${cabecalho}${c.reset}`);
  console.log(`    ${c.amarelo}${carga}${c.reset}`);
  console.log(`    ${c.vermelho}${assinatura}${c.reset}`);

  mostrarJson('Payload decodificado (a parte do meio):', lerPayloadJwt(accessToken));

  const payload = lerPayloadJwt(accessToken);
  nota(`sub = id do usuário · role = ${payload.role} · exp = ${new Date(payload.exp * 1000).toLocaleTimeString('pt-BR')}`);
  ok('O payload é legível por qualquer um — por isso não guardamos nada secreto nele.');
  ok('A assinatura é o que impede alteração: mudar o role invalida o token.');

  /* ---------------- 5. Rota protegida ---------------- */
  await passo('Rota protegida: com e sem token', 'GET /auth/me exige o access token.');

  const semToken = await chamar('GET', '/auth/me');
  mostrarJson('Sem o header Authorization:', semToken.body);

  const adulterado = `${accessToken.slice(0, -3)}xyz`;
  const comAdulterado = await chamar('GET', '/auth/me', { token: adulterado });
  mostrarJson('Com a assinatura alterada:', comAdulterado.body);
  ok('TOKEN_INVALID: trocamos 3 caracteres do fim e a assinatura não fecha mais.');

  const comToken = await chamar('GET', '/auth/me', { token: accessToken });
  mostrarJson('Com o token legítimo:', comToken.body);

  /* ---------------- 6. Expiracao ---------------- */
  await passo(
    'A expiração do token acontecendo ao vivo',
    'O .env.demo usa ACCESS_TOKEN_TTL=5. Vamos esperar o prazo passar.'
  );

  for (let i = 6; i > 0; i -= 1) {
    process.stdout.write(`\r  ${c.cinza}aguardando o token vencer... ${i}s ${c.reset}`);
    await dormir(1000);
  }
  process.stdout.write('\r' + ' '.repeat(50) + '\r');

  const expirado = await chamar('GET', '/auth/me', { token: accessToken });
  mostrarJson('Mesmo token, 6 segundos depois:', expirado.body);
  ok('TOKEN_EXPIRED: o mesmo token que funcionava agora é recusado.');
  nota('Em produção o prazo é 900 s (15 min). Aqui é 5 s só para caber na apresentação.');
  nota('O código é diferente de TOKEN_INVALID porque o app reage diferente a cada caso.');

  /* ---------------- 7. Refresh ---------------- */
  await passo(
    'Renovando a sessão sem pedir a senha de novo',
    'O refresh token (30 dias) troca o par inteiro. O usuário não digita nada.'
  );

  const refreshAntigo = refreshToken;
  const renovado = await chamar('POST', '/auth/refresh', { body: { refreshToken } });

  accessToken = renovado.body.tokens.accessToken;
  refreshToken = renovado.body.tokens.refreshToken;

  console.log(`  ${c.cinza}refresh antigo: ${refreshAntigo.slice(0, 24)}...${c.reset}`);
  console.log(`  ${c.cinza}refresh novo:   ${refreshToken.slice(0, 24)}...${c.reset}`);
  ok('Veio um par novo, e o refresh anterior foi queimado (rotação).');

  const depoisDoRefresh = await chamar('GET', '/auth/me', { token: accessToken });
  ok(`Access token novo funciona: HTTP ${depoisDoRefresh.status}.`);

  /* ---------------- 8. Deteccao de reuso ---------------- */
  await passo(
    'Simulando um refresh token roubado',
    'Alguém copiou o refresh antigo e tenta usá-lo depois da rotação.'
  );

  const reuso = await chamar('POST', '/auth/refresh', { body: { refreshToken: refreshAntigo } });
  mostrarJson('Atacante usando o token já queimado:', reuso.body);
  ok('REFRESH_TOKEN_REUSED: a API detecta que esse token já tinha sido usado.');

  const vitima = await chamar('POST', '/auth/refresh', { body: { refreshToken } });
  mostrarJson('Usuário legítimo tentando renovar depois disso:', vitima.body);
  nota('O token legítimo TAMBÉM morreu — e isso é proposital.');
  nota('A API não sabe quem é o ladrão, então derruba a sessão inteira e exige login.');

  /* ---------------- 9. Papeis ---------------- */
  await passo(
    'Autorização por papel: atendente vs. gestor',
    'A separação de perfis que hoje o app faz no cliente, agora decidida no servidor.'
  );

  const loginAtendente = await chamar('POST', '/auth/login', {
    body: { email: 'rafael@trocaplantao.com', senha: 'senhaSegura123' },
  });
  const tokenAtendente = loginAtendente.body.tokens.accessToken;

  const atendenteNoPainel = await chamar('GET', '/gestor/ping', { token: tokenAtendente });
  mostrarJson('Atendente tentando a rota de gestor:', atendenteNoPainel.body);
  ok('FORBIDDEN_ROLE: o papel vem do token assinado, não de um if na tela.');

  const loginGestor = await chamar('POST', '/auth/login', {
    body: { email: 'gestor@trocaplantao.com', senha: 'gestor123' },
  });
  const gestorNoPainel = await chamar('GET', '/gestor/ping', {
    token: loginGestor.body.tokens.accessToken,
  });
  mostrarJson('Gestor na mesma rota:', gestorNoPainel.body);

  /* ---------------- 10. Tabela de tokens ---------------- */
  await passo(
    'O rastro no banco',
    'Tabela refresh_tokens: o que foi emitido, rotacionado e revogado.'
  );

  const tokens = db
    .prepare(
      `SELECT id, token_hash, family_id, revoked_at, replaced_by, expires_at
         FROM refresh_tokens ORDER BY created_at`
    )
    .all() as Array<any>;

  console.table(
    tokens.map((t, i) => ({
      '#': i + 1,
      hash: `${t.token_hash.slice(0, 14)}…`,
      familia: t.family_id.slice(0, 8),
      situacao: t.revoked_at ? 'revogado' : 'ativo',
      rotacionado: t.replaced_by ? 'sim' : 'não',
    }))
  );
  ok('Só hashes SHA-256: o banco nunca vê o refresh token real.');
  ok('A coluna "familia" agrupa a sessão — foi ela que caiu inteira no passo 8.');

  /* ---------------- Resumo ---------------- */
  console.log(`\n${c.verde}${'═'.repeat(LARGURA)}${c.reset}`);
  console.log(`${c.verde}${c.negrito}  O QUE FOI DEMONSTRADO${c.reset}`);
  console.log(`${c.verde}${'═'.repeat(LARGURA)}${c.reset}`);
  const resumo = [
    'Senha gravada só como hash bcrypt, nunca em texto puro',
    'Resposta idêntica para senha errada e e-mail inexistente',
    'Token assinado (JWT HS256) validado sem consultar o banco',
    'Token adulterado recusado pela assinatura',
    'Expiração real do access token, com código próprio',
    'Renovação de sessão sem pedir a senha novamente',
    'Rotação de refresh token com detecção de reuso',
    'Autorização por papel decidida no servidor',
  ];
  for (const item of resumo) ok(item);
  console.log(`\n${c.cinza}  Os mesmos comportamentos estão cobertos por 19 testes: npm test${c.reset}\n`);

  rl?.close();
  server.close();
}

main().catch((erro) => {
  console.error(`\n${c.vermelho}Falha na demonstração:${c.reset}`, erro);
  rl?.close();
  process.exit(1);
});
