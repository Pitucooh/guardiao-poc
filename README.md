# Guardião SMS: prova de conceito de letras trocadas

Prova de conceito da disciplina de aplicativos híbridos (trilha **Testes**, `jest-expo`) para o TCC Guardião SMS.

Uma tela onde se cola uma mensagem e se veem os pontos de atenção, com e sem desfazer trocas de letras por números ("TR0QUE" → "TROQUE").

## Rodar

```
npm install
npx expo start
```

Leia o QR Code com o Expo Go (Android). Se a rede bloquear, use `npx expo start --tunnel`.

## Testes

```
npm run test:ci     # roda uma vez (48 testes)
npm test            # modo observação
```

## Medir no dataset do TCC

```
npx tsx scripts/avaliar-dataset.ts caminho/para/dataset_v7.csv
```

## Arquivos

- `src/desfazerTrocas.ts`: a normalização.
- `src/pontosDeAtencao.ts`: porte das regras de `AttentionPointsDetector.kt`.
- `__tests__/`: os casos de teste.
- `PESQUISA.md`, `CRITERIOS.md`, `ROTEIRO.md`: diário, critérios e roteiro da apresentação.
