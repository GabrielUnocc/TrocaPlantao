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

## Como rodar o projeto

### 1. Pré-requisitos

- [Node.js LTS](https://nodejs.org) (v18 ou superior)
- [Git](https://git-scm.com)
- App **Expo Go** no celular → [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)
- Celular e computador na **mesma rede Wi-Fi**

### 2. Clonar o repositório

```bash
git clone https://github.com/GabrielUnocc/TrocaPlantao.git
cd TrocaPlantao/TrocaPlantaoExpo
```

> Atenção: entre na pasta `TrocaPlantaoExpo`, não na raiz do repositório.

### 3. Instalar dependências

```bash
npm install
```

### 4. Iniciar o projeto

```bash
npx expo start
```

Escaneie o QR code com o app **Expo Go** para visualizar no celular.

### Outros comandos

```bash
npm run android   # Rodar no emulador Android
npm run ios       # Rodar no simulador iOS
npm run web       # Rodar no navegador
```

### Problemas comuns

| Erro | Solução |
|------|---------|
| `Unable to find expo in this project` | Rode `npm install` dentro de `TrocaPlantaoExpo` |
| App não carrega no Expo Go | Verifique se celular e PC estão na mesma rede Wi-Fi |
| Sem Wi-Fi compartilhado | Use `npx expo start --tunnel` |
| `Error loading Metro config` | Confirme que está na pasta `TrocaPlantaoExpo` |

## Estrutura do projeto

```
app/
  _layout.tsx         # Layout raiz e configuração de autenticação
  index.tsx           # Redireciona para login
  login.tsx           # Tela de login
  register.tsx        # Tela de cadastro
  (tabs)/
    index.tsx         # Feed de solicitações disponíveis
    criar.tsx         # Nova solicitação de troca de turno
    minhas-trocas.tsx # Minhas solicitações
components/
  atoms/              # Componentes básicos (inputs, botões)
  molecules/          # Componentes compostos
```
