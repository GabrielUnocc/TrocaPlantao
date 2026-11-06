import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resetDatabase } from '../src/db/index.js';
import { esperar, novoUsuario, startTestApi, type TestApi } from './helpers.js';

let api: TestApi;

before(async () => {
  api = await startTestApi();
});
after(async () => {
  await api.close();
});
beforeEach(() => {
  resetDatabase();
});

describe('infra', () => {
  it('GET /health responde ok', async () => {
    const r = await api.get('/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'ok');
  });

  it('rota inexistente retorna 404 com codigo', async () => {
    const r = await api.get('/nao-existe');
    assert.equal(r.status, 404);
    assert.equal(r.body.error.code, 'ROUTE_NOT_FOUND');
  });
});

describe('POST /auth/register', () => {
  it('cria usuario, devolve tokens e NUNCA devolve a senha', async () => {
    const r = await api.post('/auth/register', novoUsuario());

    assert.equal(r.status, 201);
    assert.equal(r.body.user.email, 'teste1@trocaplantao.com');
    assert.equal(r.body.user.role, 'atendente');
    assert.equal(r.body.user.senha, undefined);
    assert.equal(r.body.user.senha_hash, undefined);
    assert.ok(r.body.tokens.accessToken);
    assert.ok(r.body.tokens.refreshToken);
    assert.equal(r.body.tokens.tokenType, 'Bearer');
  });

  it('recusa senha com menos de 8 caracteres', async () => {
    const r = await api.post('/auth/register', { ...novoUsuario(), senha: '123' });
    assert.equal(r.status, 400);
    assert.equal(r.body.error.code, 'VALIDATION_ERROR');
    assert.equal(r.body.error.details[0].campo, 'senha');
  });

  it('recusa e-mail invalido', async () => {
    const r = await api.post('/auth/register', { ...novoUsuario(), email: 'nao-e-email' });
    assert.equal(r.status, 400);
    assert.equal(r.body.error.code, 'VALIDATION_ERROR');
  });

  it('recusa e-mail duplicado', async () => {
    await api.post('/auth/register', novoUsuario());
    const r = await api.post('/auth/register', { ...novoUsuario(), matricula: 'MAT-OUTRA' });
    assert.equal(r.status, 409);
    assert.equal(r.body.error.code, 'EMAIL_IN_USE');
  });

  it('nao deixa o cliente se autodeclarar gestor', async () => {
    const r = await api.post('/auth/register', { ...novoUsuario(), role: 'gestor' });
    assert.equal(r.status, 201);
    assert.equal(r.body.user.role, 'atendente');
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await api.post('/auth/register', novoUsuario());
  });

  it('autentica com credenciais corretas', async () => {
    const r = await api.post('/auth/login', {
      email: 'teste1@trocaplantao.com',
      senha: 'senhaSegura123',
    });
    assert.equal(r.status, 200);
    assert.ok(r.body.tokens.accessToken);
  });

  it('o e-mail nao e sensivel a maiusculas', async () => {
    const r = await api.post('/auth/login', {
      email: '  TESTE1@TrocaPlantao.com ',
      senha: 'senhaSegura123',
    });
    assert.equal(r.status, 200);
  });

  it('senha errada e e-mail inexistente dao a MESMA resposta', async () => {
    const senhaErrada = await api.post('/auth/login', {
      email: 'teste1@trocaplantao.com',
      senha: 'errada123',
    });
    const naoExiste = await api.post('/auth/login', {
      email: 'ninguem@trocaplantao.com',
      senha: 'errada123',
    });

    assert.equal(senhaErrada.status, 401);
    assert.equal(naoExiste.status, 401);
    assert.equal(senhaErrada.body.error.code, 'INVALID_CREDENTIALS');
    assert.deepEqual(senhaErrada.body.error, naoExiste.body.error);
  });
});

describe('GET /auth/me (rota protegida)', () => {
  it('sem header Authorization retorna 401 TOKEN_MISSING', async () => {
    const r = await api.get('/auth/me');
    assert.equal(r.status, 401);
    assert.equal(r.body.error.code, 'TOKEN_MISSING');
  });

  it('com token adulterado retorna 401 TOKEN_INVALID', async () => {
    const { body } = await api.post('/auth/register', novoUsuario());
    const adulterado = body.tokens.accessToken.slice(0, -2) + 'xx';
    const r = await api.get('/auth/me', adulterado);
    assert.equal(r.status, 401);
    assert.equal(r.body.error.code, 'TOKEN_INVALID');
  });

  it('com token valido devolve o usuario', async () => {
    const { body } = await api.post('/auth/register', novoUsuario());
    const r = await api.get('/auth/me', body.tokens.accessToken);
    assert.equal(r.status, 200);
    assert.equal(r.body.user.email, 'teste1@trocaplantao.com');
  });
});

describe('expiracao do access token', () => {
  it('depois do TTL o token para de valer com codigo TOKEN_EXPIRED', async () => {
    const { body } = await api.post('/auth/register', novoUsuario());
    const token = body.tokens.accessToken;

    assert.equal((await api.get('/auth/me', token)).status, 200);

    // ACCESS_TOKEN_TTL=2 no .env.test
    await esperar(3100);

    const r = await api.get('/auth/me', token);
    assert.equal(r.status, 401);
    assert.equal(r.body.error.code, 'TOKEN_EXPIRED');
  });
});

describe('POST /auth/refresh (rotacao)', () => {
  it('troca o refresh por um par novo', async () => {
    const { body } = await api.post('/auth/register', novoUsuario());
    const r = await api.post('/auth/refresh', { refreshToken: body.tokens.refreshToken });

    assert.equal(r.status, 200);
    assert.ok(r.body.tokens.refreshToken);
    assert.notEqual(r.body.tokens.refreshToken, body.tokens.refreshToken);
    assert.equal((await api.get('/auth/me', r.body.tokens.accessToken)).status, 200);
  });

  it('refresh token invalido retorna 401', async () => {
    const r = await api.post('/auth/refresh', { refreshToken: 'token-inventado' });
    assert.equal(r.status, 401);
    assert.equal(r.body.error.code, 'REFRESH_TOKEN_INVALID');
  });

  it('reusar um refresh ja rotacionado derruba a familia inteira', async () => {
    const cadastro = await api.post('/auth/register', novoUsuario());
    const antigo = cadastro.body.tokens.refreshToken;

    const primeiro = await api.post('/auth/refresh', { refreshToken: antigo });
    const novo = primeiro.body.tokens.refreshToken;

    // Atacante usa o token roubado (ja queimado)
    const reuso = await api.post('/auth/refresh', { refreshToken: antigo });
    assert.equal(reuso.status, 401);
    assert.equal(reuso.body.error.code, 'REFRESH_TOKEN_REUSED');

    // E o token legitimo tambem morre: a sessao inteira foi invalidada
    const depois = await api.post('/auth/refresh', { refreshToken: novo });
    assert.equal(depois.status, 401);
    assert.equal(depois.body.error.code, 'REFRESH_TOKEN_REUSED');
  });
});

describe('POST /auth/logout', () => {
  it('invalida o refresh token apresentado', async () => {
    const { body } = await api.post('/auth/register', novoUsuario());

    const saida = await api.post('/auth/logout', { refreshToken: body.tokens.refreshToken });
    assert.equal(saida.status, 204);

    const r = await api.post('/auth/refresh', { refreshToken: body.tokens.refreshToken });
    assert.equal(r.status, 401);
    assert.equal(r.body.error.code, 'REFRESH_TOKEN_REUSED');
  });
});

describe('autorizacao por papel', () => {
  it('atendente nao acessa rota de gestor', async () => {
    const { body } = await api.post('/auth/register', novoUsuario());
    const r = await api.get('/gestor/ping', body.tokens.accessToken);
    assert.equal(r.status, 401);
    assert.equal(r.body.error.code, 'FORBIDDEN_ROLE');
  });
});
