# TrocaPlantão — API

Backend de autenticação do TrocaPlantão: cadastro, login, token com expiração e
renovação de sessão.

- **Node.js 22+** · **TypeScript** · **Express 5** · **SQLite** (better-sqlite3)
- **bcrypt** para senha · **JWT HS256** (access token) + **refresh token opaco rotativo**
- Validação de entrada com **Zod** · testes com o runner nativo do Node

---

## 1. Por que este método de autenticação

O app é mobile (Expo/React Native). Foram consideradas quatro opções:

| Opção | Como funciona | Por que não / por que sim |
|---|---|---|
| Sessão + cookie | servidor guarda a sessão, navegador manda cookie | cookie em app nativo é ruim: não existe "navegador" com `Set-Cookie` confiável, e dificulta multiplataforma |
| Basic Auth | e-mail e senha em **toda** requisição | a senha circula sempre, não dá para expirar nem revogar |
| Só JWT longo (7–30 dias) | um token que vale muito tempo | simples, mas **impossível de revogar**: token roubado funciona até vencer |
| **JWT curto + refresh token rotativo** | access token de 15 min + refresh de 30 dias guardado no banco | **escolhido** |

**Escolha: access token JWT de 15 minutos + refresh token opaco de 30 dias, com rotação.**

Como funciona na prática:

```
login  ──► accessToken  (JWT, 15 min, NÃO fica no banco)
       └─► refreshToken (32 bytes aleatórios, 30 dias, hash SHA-256 no banco)

requisição ──► Authorization: Bearer <accessToken>
                 └─ verificação só com assinatura: zero consulta ao banco

accessToken expirou (401 TOKEN_EXPIRED)
       └─► POST /auth/refresh com o refreshToken
             └─► novo par; o refresh anterior é QUEIMADO (rotação)
```

Os três motivos da escolha:

1. **Validar o access token não toca o banco.** A assinatura HS256 já prova que o
   token é nosso e o campo `exp` já prova que está no prazo. Cada tela do app pode
   chamar a API sem gerar consulta de sessão.
2. **O dano de um vazamento é limitado no tempo.** Access token roubado vale no
   máximo 15 minutos. É o oposto do JWT de 30 dias, que não dá para cancelar.
3. **A sessão longa continua revogável.** O refresh fica no banco, então
   logout, "sair de todos os dispositivos" e bloqueio de usuário funcionam de verdade.

### Rotação + detecção de reuso

Cada `/auth/refresh` invalida o refresh usado e devolve um novo, da mesma *família*
(`family_id`). Se um refresh **já queimado** aparecer outra vez, só há duas
explicações: ou alguém copiou o token, ou houve replay. Nos dois casos a API
derruba a família inteira e obriga login novamente (`REFRESH_TOKEN_REUSED`).
É o padrão recomendado pela RFC 6819 / OAuth 2.0 Security BCP.

### Outras decisões de segurança

| Decisão | Motivo |
|---|---|
| `bcrypt` custo 12 | senha nunca é guardada em texto; hash lento encarece força bruta |
| senha limitada a 72 caracteres | o bcrypt ignora bytes além de 72; sem o limite, senhas diferentes colidiriam |
| refresh guardado como `SHA-256` | se o banco vazar, os refresh tokens vazados são inúteis |
| e-mail errado e senha errada → resposta idêntica | não revela quais e-mails existem (*user enumeration*) |
| `burnTime()` quando o e-mail não existe | iguala o tempo de resposta e fecha o *timing attack* |
| `role` ignorado no cadastro | ninguém se autodeclara gestor; promoção é ato administrativo |
| rate limit no `/auth/login` por IP + e-mail | trava o chute de senha sem travar a conta de terceiros |
| `helmet` + `express.json({ limit: '100kb' })` | cabeçalhos de segurança e corpo limitado |
| `JWT_SECRET` validado na subida | a API morre na inicialização se faltar segredo, em vez de falhar em produção |

---

## 2. Endpoints

Base: `http://localhost:3333`

| Método | Rota | Protegida | O que faz |
|---|---|---|---|
| GET | `/health` | não | checagem de vida |
| POST | `/auth/register` | não | cria atendente e já devolve a sessão |
| POST | `/auth/login` | não | autentica e devolve o par de tokens |
| POST | `/auth/refresh` | não¹ | rotaciona o refresh e devolve par novo |
| POST | `/auth/logout` | não¹ | invalida o refresh enviado |
| POST | `/auth/logout-all` | **sim** | encerra todas as sessões do usuário |
| GET | `/auth/me` | **sim** | dados do usuário do token |
| GET | `/gestor/ping` | **sim** (gestor) | exemplo de rota restrita por papel |

¹ não precisa de access token — o próprio refresh token é a credencial.

### Resposta de sucesso (`register` / `login` / `refresh`)

```json
{
  "user": {
    "id": "3d0d25c9-...",
    "nome": "Gestor TrocaPlantão",
    "matricula": "MAT-00001",
    "email": "gestor@trocaplantao.com",
    "role": "gestor",
    "nivel": "Lider",
    "equipe": "Suporte TI",
    "status": "ativo"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "refreshToken": "JhD5qsFeVty4qz9sWHuWnkwc9WAiM655THOU545nEsc",
    "refreshExpiresIn": 2592000
  }
}
```

### Resposta de erro (formato único)

```json
{ "error": { "code": "TOKEN_EXPIRED", "message": "Access token expirado. Use /auth/refresh." } }
```

Códigos que o app precisa tratar:

| `code` | HTTP | O que o app deve fazer |
|---|---|---|
| `VALIDATION_ERROR` | 400 | mostrar os erros de `error.details[]` nos campos |
| `INVALID_CREDENTIALS` | 401 | "E-mail ou senha incorretos" |
| `TOKEN_MISSING` / `TOKEN_INVALID` | 401 | mandar para a tela de login |
| `TOKEN_EXPIRED` | 401 | chamar `/auth/refresh` e repetir a requisição |
| `REFRESH_TOKEN_EXPIRED` / `REUSED` / `INVALID` | 401 | limpar storage e exigir login |
| `FORBIDDEN_ROLE` | 401 | esconder a área de gestor |
| `EMAIL_IN_USE` / `MATRICULA_IN_USE` | 409 | apontar o campo duplicado |
| `TOO_MANY_REQUESTS` | 429 | esperar o `Retry-After` |

---

## 3. Como rodar

```bash
cd backend
npm install
cp .env.example .env
```

Gere um segredo real e cole em `JWT_SECRET` do `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Crie as tabelas e os usuários de teste:

```bash
npm run migrate
npm run seed
```

Suba a API:

```bash
npm run dev
```

Saída esperada:

```
TrocaPlantao API rodando em http://localhost:3333  [development]
Health check:  http://localhost:3333/health
```

Usuários criados pelo `seed`:

| E-mail | Senha | Papel |
|---|---|---|
| `gestor@trocaplantao.com` | `gestor123` | gestor |
| `atendente@trocaplantao.com` | `atendente123` | atendente |

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | sobe a API com reload automático |
| `npm run migrate` | aplica o schema (`src/db/schema.sql`) |
| `npm run seed` | cria gestor e atendente de teste |
| `npm run demo` | demonstração narrada do fluxo completo |
| `npm run db:inspect` | imprime users e refresh_tokens |
| `npm test` | roda os 19 testes automatizados |
| `npm run typecheck` | checa os tipos sem gerar build |
| `npm run build` + `npm start` | build e execução de produção |

---

## 4. Como testar

### 4.0 Demonstração narrada (o caminho para apresentar)

```bash
npm run demo
```

Sobe a API sozinha, executa o fluxo completo em 10 passos e explica cada
resposta na tela: cadastro, senha gravada como hash, credenciais erradas,
conteúdo do JWT decodificado, rota protegida, **expiração do token ao vivo**,
renovação, token roubado, autorização por papel e o rastro no banco.

Para apresentar com pausas (espera `ENTER` entre cada passo):

```bash
npm run demo -- --pausar
```

Usa o `.env.demo`, com `ACCESS_TOKEN_TTL=5` — é o que permite a expiração
acontecer durante a apresentação. Banco separado (`data/demo.sqlite`), zerado
a cada execução, então rode quantas vezes quiser.

### 4.1 Testes automatizados (o caminho rápido)

```bash
npm test
```

Cobre cadastro, duplicidade, validação, login, resposta idêntica para senha errada
e e-mail inexistente, rota protegida, **expiração real do access token** (o
`.env.test` usa TTL de 2 s), rotação de refresh, detecção de reuso, logout e
bloqueio por papel. Resultado esperado: `# pass 19` / `# fail 0`.

### 4.2 No navegador / REST Client

Com a API no ar, abra `backend/requests.http` no VS Code (extensão **REST Client**)
e clique em *Send Request*. Os tokens são encadeados automaticamente entre as
requisições.

Ou importe os mesmos endpoints no Postman / Insomnia.

### 4.3 Na mão, com curl

Health check:

```bash
curl http://localhost:3333/health
```

Cadastro:

```bash
curl -X POST http://localhost:3333/auth/register -H 'content-type: application/json' -d '{"nome":"Rafael Lima","matricula":"MAT-12345","email":"rafael@trocaplantao.com","senha":"senhaSegura123","nivel":"N2","equipe":"Suporte TI"}'
```

Login guardando os tokens em variáveis:

```bash
LOGIN=$(curl -s -X POST http://localhost:3333/auth/login -H 'content-type: application/json' -d '{"email":"gestor@trocaplantao.com","senha":"gestor123"}')
AT=$(node -e "console.log(JSON.parse(process.argv[1]).tokens.accessToken)" "$LOGIN")
RT=$(node -e "console.log(JSON.parse(process.argv[1]).tokens.refreshToken)" "$LOGIN")
```

Rota protegida com o token:

```bash
curl http://localhost:3333/auth/me -H "authorization: Bearer $AT"
```

Rota protegida sem token (deve dar 401 `TOKEN_MISSING`):

```bash
curl http://localhost:3333/auth/me
```

Senha errada (deve dar 401 `INVALID_CREDENTIALS`):

```bash
curl -X POST http://localhost:3333/auth/login -H 'content-type: application/json' -d '{"email":"gestor@trocaplantao.com","senha":"errada"}'
```

Renovar a sessão:

```bash
curl -X POST http://localhost:3333/auth/refresh -H 'content-type: application/json' -d "{\"refreshToken\":\"$RT\"}"
```

Reusar o refresh antigo (deve dar 401 `REFRESH_TOKEN_REUSED`):

```bash
curl -X POST http://localhost:3333/auth/refresh -H 'content-type: application/json' -d "{\"refreshToken\":\"$RT\"}"
```

### 4.4 Ver a expiração acontecendo ao vivo

No `.env`, troque o TTL para 10 segundos e reinicie a API:

```bash
ACCESS_TOKEN_TTL=10
```

Faça login, chame `/auth/me` (200), espere 11 segundos e chame de novo:
agora vem 401 com `TOKEN_EXPIRED`. Em seguida use o `refreshToken` em
`/auth/refresh` e um access token novo volta a funcionar. Depois devolva
`ACCESS_TOKEN_TTL=900`.

### 4.5 Olhar o banco

```bash
npm run db:inspect
```

Imprime as tabelas `users` e `refresh_tokens` em formato de tabela. Confirme as
duas coisas: **nenhuma senha em texto puro** e **nenhum refresh token em texto
puro** — só hashes. A coluna `rotacionado` mostra quais refresh tokens já foram
queimados pelo `/auth/refresh`.

(Se você tiver o CLI `sqlite3` instalado, `sqlite3 data/trocaplantao.sqlite
"SELECT email, role FROM users;"` também funciona — mas o script acima não
depende dele.)

---

## 5. Estrutura

```
backend/
├── src/
│   ├── server.ts                 # sobe o HTTP, migra, limpa tokens vencidos
│   ├── app.ts                    # monta o Express (helmet, cors, rotas)
│   ├── config/env.ts             # valida .env com Zod (fail fast)
│   ├── db/
│   │   ├── index.ts              # conexão SQLite + migrate()
│   │   └── schema.sql            # tabelas users e refresh_tokens
│   ├── middlewares/
│   │   ├── require-auth.ts       # Bearer token + requireRole()
│   │   ├── rate-limit.ts         # limite de tentativas de login
│   │   └── error-handler.ts      # formato único de erro
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts        # HTTP
│   │   │   ├── auth.service.ts           # regra de negócio
│   │   │   ├── auth.schemas.ts           # validação Zod
│   │   │   └── refresh-token.repository.ts
│   │   └── users/
│   │       ├── user.repository.ts        # SQL
│   │       └── user.types.ts             # UserRow vs PublicUser
│   └── shared/
│       ├── password.ts           # bcrypt + burnTime
│       ├── tokens.ts             # JWT e refresh token
│       ├── errors.ts             # AppError
│       └── validate.ts
├── scripts/{migrate,seed}.ts
├── tests/{auth.test.ts,helpers.ts}
└── requests.http
```

Camadas: **rota → controller → service → repository**. O controller só traduz
HTTP; a regra vive no service; SQL só no repository. Trocar SQLite por Postgres
mexe apenas nos repositories e no `db/`.
