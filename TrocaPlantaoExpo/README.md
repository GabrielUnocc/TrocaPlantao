# Troca Plantão

Aplicativo mobile para atendentes de suporte (N1, N2, N3) e líderes/gestores solicitarem e gerenciarem trocas de turno de forma prática.

## Funcionalidades

- Cadastro e login de usuários
- Publicação de solicitações de troca de turno
- Seleção de equipe, data, turno e nível (N1, N2, N3 ou Líder)
- Visualização e gerenciamento das próprias solicitações

## Tecnologias

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/) v57
- [Expo Router](https://docs.expo.dev/router/introduction/) (navegação baseada em arquivos)
- TypeScript

---

## Como rodar o projeto

Tempo estimado para configurar: **10 a 20 minutos**

---

### Passo 1 — Verificar se Node.js e Git estão instalados

Abra o terminal e digite:

```bash
node --version
npm --version
git --version
```

Se aparecer as versões, pule para o Passo 3. Se der erro, siga o Passo 2.

---

### Passo 2 — Instalar Node.js e Git (se não tiver)

**Node.js:**
- Acesse [https://nodejs.org](https://nodejs.org)
- Baixe a versão **LTS** (botão verde da esquerda)
- Instale normalmente

No Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Git:**
- Windows: acesse [https://git-scm.com](https://git-scm.com) e instale
- Linux: `sudo apt-get install git`
- Mac: o Git já vem instalado

Após instalar, feche e abra o terminal novamente.

---

### Passo 3 — Instalar o Expo Go no celular

O Expo Go permite rodar o app no celular sem precisar gerar um APK.

- **Android:** [Baixar na Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iPhone:** [Baixar na App Store](https://apps.apple.com/app/expo-go/id982107779)

> O celular e o computador precisam estar na **mesma rede Wi-Fi**.

---

### Passo 4 — Clonar o repositório

```bash
git clone https://github.com/GabrielUnocc/TrocaPlantao.git
```

Depois entre na pasta correta do projeto:

```bash
cd TrocaPlantao/TrocaPlantaoExpo
```

> **Atenção:** o repositório tem duas pastas. Você deve entrar em `TrocaPlantaoExpo`, não na outra.

---

### Passo 5 — Instalar as dependências

```bash
npm install
```

Isso baixa todas as bibliotecas do projeto. Pode demorar alguns minutos. Vai criar uma pasta `node_modules` — isso é normal.

---

### Passo 6 — Rodar o projeto

```bash
npx expo start
```

O terminal vai exibir um QR code.

- **Android:** Abra o app Expo Go e aponte a câmera para o QR code
- **iPhone:** Abra a câmera do iPhone, aponte para o QR code e toque na notificação
- **Emulador Android:** pressione `a` no terminal
- **Navegador:** pressione `w` no terminal

---

### Resumo dos comandos (copie e cole em sequência)

```bash
git clone https://github.com/GabrielUnocc/TrocaPlantao.git
cd TrocaPlantao/TrocaPlantaoExpo
npm install
npx expo start
```

---

## Problemas comuns

**"Unable to find expo in this project"**
- Rode `npm install` novamente dentro da pasta `TrocaPlantaoExpo`

**App não carrega no Expo Go / "Network response timed out"**
- Verifique se o celular e o computador estão na mesma rede Wi-Fi
- Tente usar o modo tunnel:
```bash
npx expo start --tunnel
```
(vai pedir para instalar `@expo/ngrok` — aceite com `y`)

**"Error loading Metro config"**
- Confirme que você está dentro da pasta `TrocaPlantaoExpo`:
```bash
cd TrocaPlantao/TrocaPlantaoExpo
```

**"Command not found: npm"**
- O Node.js não foi instalado corretamente. Repita o Passo 2.

**App abre em tela branca ou trava**
- No terminal do Expo, pressione `r` para recarregar o app

---

## Estrutura do projeto

```
TrocaPlantaoExpo/
├── app/
│   ├── _layout.tsx          # Layout raiz (envolve todas as telas)
│   ├── index.tsx            # Redireciona para /login automaticamente
│   ├── login.tsx            # Tela de login
│   ├── register.tsx         # Tela de cadastro
│   └── (tabs)/
│       ├── _layout.tsx      # Configura a barra de abas
│       ├── index.tsx        # Feed de trocas disponíveis
│       ├── criar.tsx        # Formulário de nova solicitação
│       └── minhas-trocas.tsx # Perfil e histórico de solicitações
├── components/
│   ├── atoms/
│   │   ├── InputField.tsx   # Campo de texto reutilizável
│   │   └── PrimaryButton.tsx # Botão azul padrão
│   └── molecules/           # Componentes compostos (expansão futura)
├── metro.config.js          # Configuração do bundler Metro
├── app.json                 # Configurações do app (nome, ícone, etc.)
└── package.json             # Dependências do projeto
```
