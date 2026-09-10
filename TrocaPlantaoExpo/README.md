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

**Pré-requisitos:** Node.js e Expo CLI instalados.

```bash
# Instalar dependências
npm install

# Iniciar o projeto
npx expo start
```

Escaneie o QR code com o aplicativo **Expo Go** (Android ou iOS) para visualizar no dispositivo.

### Outros comandos

```bash
npm run android   # Rodar no emulador Android
npm run ios       # Rodar no simulador iOS
npm run web       # Rodar no navegador
```

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
