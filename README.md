# Troca Plantão

Aplicativo mobile para atendentes de suporte (N1, N2, N3) e líderes/gestores solicitarem e gerenciarem trocas de turno de forma prática.

## Funcionalidades

- Cadastro e login de usuários
- Publicação de solicitações de troca de turno
- Seleção de equipe, data, turno e nível (N1, N2, N3 ou Líder)
- Visualização e gerenciamento das próprias solicitações

## Tecnologias

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/) SDK 57
- [Expo Router](https://docs.expo.dev/router/introduction/) (navegação baseada em arquivos)
- TypeScript

---

## Como rodar o projeto

> **Resumo rápido** (se você já tem Node.js, Git e o Expo Go):
>
> ```bash
> git clone https://github.com/GabrielUnocc/TrocaPlantao.git
> cd TrocaPlantao/TrocaPlantaoExpo
> npm install
> npx expo start
> ```

### 1. Pré-requisitos

| Ferramenta | Como verificar | Onde baixar |
|---|---|---|
| Node.js (versão LTS) | `node --version` | [nodejs.org](https://nodejs.org) |
| Git | `git --version` | [git-scm.com](https://git-scm.com) |
| Expo Go (no celular) | — | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iPhone](https://apps.apple.com/app/expo-go/id982107779) |

No Linux (Ubuntu/Debian), dá para instalar o Node.js e o Git pelo terminal:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

Depois de instalar, feche e abra o terminal novamente.

### 2. Clonar o repositório

```bash
git clone https://github.com/GabrielUnocc/TrocaPlantao.git
cd TrocaPlantao/TrocaPlantaoExpo
```

> O código do app fica dentro da pasta **`TrocaPlantaoExpo`**. Todos os comandos abaixo devem ser rodados dentro dela.

### 3. Instalar as dependências

```bash
npm install
```

Pode demorar alguns minutos na primeira vez.

### 4. Rodar o app

```bash
npx expo start
```

O terminal vai exibir um QR code:

- **Android:** abra o Expo Go e escaneie o QR code
- **iPhone:** abra a câmera, aponte para o QR code e toque na notificação
- **Emulador Android:** pressione `a` no terminal
- **Navegador:** pressione `w` no terminal

> O celular e o computador precisam estar na **mesma rede Wi-Fi**.

### Scripts disponíveis

Rode dentro de `TrocaPlantaoExpo`:

| Comando | O que faz |
|---|---|
| `npm start` | Inicia o servidor do Expo |
| `npm run android` | Abre no emulador/dispositivo Android |
| `npm run ios` | Abre no simulador iOS (somente macOS) |
| `npm run web` | Abre no navegador |
| `npm run lint` | Verifica o código com o ESLint |

---

## Problemas comuns

**"Unable to find expo in this project" ou "Error loading Metro config"**
Confira se você está dentro da pasta `TrocaPlantaoExpo` e rode `npm install` novamente.

**App não carrega no Expo Go / "Network response timed out"**
Verifique se celular e computador estão na mesma rede Wi-Fi. Se não resolver, use o modo tunnel:

```bash
npx expo start --tunnel
```

**"Command not found: npm"**
O Node.js não foi instalado corretamente. Reinstale pelo passo 1.

**App abre em tela branca ou trava**
No terminal do Expo, pressione `r` para recarregar.

---

## Estrutura do repositório

```
TrocaPlantao/
├── README.md
└── TrocaPlantaoExpo/             # Projeto Expo (o app)
    ├── app/                      # Telas (rotas do Expo Router)
    │   ├── _layout.tsx           # Layout raiz
    │   ├── index.tsx             # Redireciona para /login
    │   ├── login.tsx             # Tela de login
    │   ├── register.tsx          # Tela de cadastro
    │   └── (tabs)/
    │       ├── _layout.tsx       # Barra de abas
    │       ├── index.tsx         # Feed de trocas disponíveis
    │       ├── criar.tsx         # Nova solicitação de troca
    │       └── minhas-trocas.tsx # Perfil e histórico
    ├── components/
    │   ├── atoms/                # InputField, PrimaryButton
    │   └── ui/                   # Ícones
    ├── hooks/
    ├── assets/                   # Imagens e ícones do app
    ├── app.json                  # Configurações do app
    └── package.json              # Dependências e scripts
```
