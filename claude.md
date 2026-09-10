# TrocaPlantão — Tarefa: Aplicar Atomic Design (material da disciplina)

> Arquivo de instrução para o **Claude Code**. Define uma tarefa de **escopo fechado**:
> aplicar **apenas** o conteúdo dos dois materiais da disciplina, nada além disso.
> O contexto geral do projeto continua em `CONTEXTO.md` — este arquivo trata só desta tarefa.

## Materiais de referência (fonte única da tarefa)

- `Aula_React_Native_Atomic_Design.pdf` (apostila)
- `React_Native_e_Atomic_Design.pdf` (slides)

Ambos ensinam **Atomic Design** aplicado a componentes de UII em React Native.

## Objetivo

Cumprir a **atividade** dos materiais (último slide):

1. Criar componentes atômicos reutilizáveis (campos, botão, texto…).
2. Exibir **no mínimo 4 componentes** em uma tela e deixar pronto para apresentar.

## ⚠️ Adaptação obrigatória: Expo Router NÃO se aplica

Os materiais usam **Expo + Expo Router**. Este projeto é **React Native CLI (bare, sem Expo)**.
Portanto:

- Os **componentes** do material (`InputField`, `PrimaryButton`, `LoginForm`) usam **apenas
  imports de `react-native`** (`TextInput`, `Pressable`, `Text`, `View`). Copie-os **fielmente**,
  pois funcionam igual no bare CLI.
- **Ignore** tudo que vem de `expo-router` no material: `Stack`, `Redirect`, `useRouter`,
  `Tabs`, roteamento por arquivos e grupos `(auth)`/`(tabs)`. **Não** replique isso.
- A "tela qualquer" da atividade será renderizada **direto pelo `App.tsx`**, sem navegador.

## O que NÃO fazer (fora de escopo — "nada mais")

- ❌ Não instalar Expo, `expo-router` nem **nenhuma** dependência nova.
- ❌ Não configurar React Navigation nem criar navegação/rotas.
- ❌ Não implementar backend, autenticação real, JWT, banco, API ou axios.
- ❌ Não mexer em `android/`, `ios/`, ESLint/Prettier, `package.json` ou na stack.
- ❌ Não criar organisms/templates (ficam para depois; a atividade não os exige).

## Estrutura de pastas a criar

Segue a organização sugerida em `CONTEXTO.md` (`src/`) combinada com o Atomic Design do material:

```
src/
├── components/
│   ├── atoms/
│   │   ├── InputField.tsx
│   │   ├── PrimaryButton.tsx
│   │   └── AppText.tsx
│   └── molecules/
│       └── LoginForm.tsx
└── screens/
    └── ComponentesDemo.tsx
```

## Especificação dos componentes (fiel ao material, com tipagem TS)

O projeto é **TypeScript**. Reproduza o código do material, mas adicione tipos de props para
manter o build e o lint limpos.

### `src/components/atoms/InputField.tsx` (atom)
- Base: `TextInput` de `react-native`, repassando todas as props (`{...props}`).
- `placeholderTextColor="#596579"` e `style={{ borderWidth: 1, padding: 14 }}` (como no material).
- Tipar como `TextInputProps`. É a unidade mínima: **não conhece** a tela de login.

### `src/components/atoms/PrimaryButton.tsx` (atom)
- Base: `Pressable` + `Text` de `react-native`.
- Props: `{ title: string; onPress: () => void }`.
- Estilo do material: `backgroundColor: '#2775F6'`, `padding: 14`, texto branco.
- O atom recebe o título e a ação; quem decide o efeito é a tela.

### `src/components/atoms/AppText.tsx` (atom)
- Base: `Text` de `react-native`, com variantes conforme a apostila (seção 2.1): `title | body | caption`.
- Props: `{ variant?: 'title' | 'body' | 'caption'; children: React.ReactNode }`.
- Estilos simples por variante (ex.: title maior/bold, caption menor/cinza).

### `src/components/molecules/LoginForm.tsx` (molecule)
- Combina **dois `InputField`** (E-mail; Senha com `secureTextEntry`) + **`PrimaryButton` "Entrar"**.
- Prop: `{ onSubmit: () => void }`.
- Exatamente como o material: molecule = combinação de atoms com uma função clara.

### `src/screens/ComponentesDemo.tsx` (tela da atividade)
- `View` centralizada (`flex: 1, justifyContent: 'center', padding: 24`).
- Exibir **no mínimo 4 componentes**, por exemplo:
  1. `AppText` com `variant="title"` (título da tela);
  2. um `InputField` avulso (ex.: busca);
  3. um `PrimaryButton` avulso;
  4. o `LoginForm`.
- Sem navegação: `onSubmit`/`onPress` podem apenas chamar `Alert.alert(...)` ou `console.log(...)`.

### `App.tsx`
- Substituir a `NewAppScreen` padrão por `<ComponentesDemo />` para a tela aparecer ao rodar.

## Fluxo de trabalho (passo a passo, com checkpoint)

O Gabriel trabalha em etapas com pontos de parada. **Faça uma etapa por vez e PARE para
confirmação antes de seguir** — não gere tudo de uma vez.

1. **Atoms** — criar `InputField`, `PrimaryButton`, `AppText`. → parar e aguardar confirmação.
2. **Molecule** — criar `LoginForm` usando os atoms. → parar e aguardar confirmação.
3. **Tela + App** — criar `ComponentesDemo` e ligar no `App.tsx`. → parar e aguardar confirmação.
4. **Validação** — o Gabriel roda o app (`npm start` + `npm run android`) e confere a tela.

## Convenções

- Só imports de `react-native`. Zero dependências novas.
- Manter TypeScript e ESLint/Prettier sem erros.
- Commits em Conventional Commits, ex.: `feat: componentes atomic design (atoms + LoginForm)`.