This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Convenções deste projeto

- Não altere arquivos fora do escopo pedido. Explique cada alteração.
- Componentes ficam em `components/`, um arquivo por componente.
- Estado nunca é modificado no lugar: sempre gere um novo valor.
- Valores que podem ser calculados a partir do estado não viram estado.
- Antes de usar um pacote, confirme na documentação se ele funciona no Expo Go.

## Contexto desta prova de conceito

- TCC: Guardião SMS, app Android (Kotlin) que detecta SMS de golpe com o BERTimbau rodando no próprio celular e mostra "pontos de atenção" para pessoas idosas.
- Problema: golpes trocam letras por números ("TR0QUE", "bl0qu3ada", "lTAU") e escapam das regras de pontos de atenção.
- Tecnologia investigada: testes com `jest-expo` de uma função de normalização em TypeScript (`src/desfazerTrocas.ts`). As regras em `src/pontosDeAtencao.ts` são um porte de `AttentionPointsDetector.kt`; não mude o comportamento delas sem pedido.
- Restrição: mensagens legítimas com números (rastreio, valores, datas, "5GB", "US$") não podem ganhar o aviso de letras trocadas. Todo caso novo de erro vira teste em `__tests__/` antes da correção.
- Uma tela só, em `App.tsx`: o usuário cola uma mensagem, toca em Analisar e vê os pontos de atenção e as palavras convertidas.
- Nada é enviado pela rede. Não adicione `fetch`, APIs ou pacotes com código nativo.
- Não usar Expo Router, a menos que a tecnologia investigada seja a navegação.
- Fora de escopo: login, design final, o modelo BERTimbau e tudo que não demonstre a pergunta.
