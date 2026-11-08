# Guardião SMS: prova de conceito de letras trocadas

Prova de conceito da disciplina de aplicativos híbridos para o TCC Guardião SMS.

Uma tela onde se cola uma mensagem e se veem os pontos de atenção, com e sem desfazer trocas de letras por números ("TR0QUE" → "TROQUE").

## Rodar

```
npm install
npx expo start
```

Leia o QR Code com o Expo Go (Android). Se a rede bloquear, use `npx expo start --tunnel`.

## Testes

```
npm run test:ci     # roda uma vez (58 testes)
npm test            # modo observação
```

## Arquivos

- `src/desfazerTrocas.ts`: a normalização.
- `src/pontosDeAtencao.ts`: porte das regras de `AttentionPointsDetector.kt`.
- `__tests__/`: os casos de teste.
- `PESQUISA.md`, `CRITERIOS.md`: diário e critérios.

## Requisitos
Node 22.13 ou mais novo (recomendado: 24 LTS).

## Apresentação
- Slides: [apresentacao/slides.pdf](apresentacao/slides.pdf)
- Vídeo: [assistir](https://youtu.be/B0W4iiC-038)