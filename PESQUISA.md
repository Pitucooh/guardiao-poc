# Diário de pesquisa

## Contexto do TCC
O Guardião SMS é um app Android (Kotlin) que lê os SMS recebidos e usa o BERTimbau, convertido para ONNX e rodando dentro do próprio celular, para avisar pessoas idosas quando uma mensagem pode ser golpe (smishing). Além do alerta, o app mostra "pontos de atenção": dicas em linguagem simples, geradas por regras de texto, que explicam o que há de suspeito na mensagem.

## Pergunta de pesquisa
Como uma função de normalização em TypeScript, verificada com testes do **jest-expo**, faz os pontos de atenção do Guardião SMS reconhecerem golpes que trocam letras por números ("TR0QUE", "bl0qu3ada", "lTAU") **sem criar avisos falsos em mensagens legítimas cheias de números** (códigos de rastreio, valores, datas, "5GB")?

Trilha: **Testes** (`jest-expo`).

## Por que esse problema
- As regras de pontos de atenção do app (`AttentionPointsDetector.kt`) procuram palavras como "bloqueada", "senha" e "urgente". Escrito como "bl0qu3ada", "s3nh4" ou "URG3NTE", o golpe passa sem nenhuma dica.
- O truque aparece em mensagens do próprio dataset do TCC (`dataset_v7.csv`): "TR0QUE em DINHEIR0", "TRANSF0RME", "CASHBACKAG0RA", "lTAU", "DlNHElRO", "PONTO$".
- O público é idoso: um aviso falso em mensagem legítima ensina a pessoa a ignorar os avisos. Por isso a restrição principal é **não errar nas legítimas**.

## Alternativas consideradas
| Opção | Serve para | Funciona no Expo Go? | Decisão |
|---|---|---|---|
| Função própria `desfazerTrocas` em TypeScript + testes com `jest-expo` | Converter "TR0QUE" em "TROQUE" antes das regras e provar, caso a caso, que mensagens legítimas não mudam | Sim. É só JavaScript, sem módulo nativo. Os testes rodam no computador, com `jest` | **Sim.** Cabe no prazo, mantém tudo no aparelho e a resposta à pergunta é verificável (testes + medição no dataset) |
| Rodar o BERTimbau no app Expo com `onnxruntime-react-native` | Ter o próprio modelo do TCC dentro de um app Expo | Não. É biblioteca com código nativo; a documentação do Expo diz que instalar biblioteca com código nativo exige uma *development build* | **Não, por agora.** Exige *development build*, modelo de 105 MB e portar o tokenizador para TypeScript: não cabe em dois encontros. Fica como próximo passo |
| Mandar a mensagem para o modelo no Hugging Face com `fetch` (trilha Consumo de API) | Classificar sem embutir o modelo | Sim | **Não.** A mensagem sairia do celular, o que quebra a decisão 3 do TCC (inferência local, LGPD). O app já roda o modelo no aparelho |

## Fontes oficiais lidas
- Expo. *Unit testing with Jest* (https://docs.expo.dev/develop/unit-testing/): instalação com `npx expo install jest-expo jest @types/jest --dev`, `"jest": { "preset": "jest-expo" }` no `package.json` e `"jest"` em `types` no `tsconfig.json`.
- Expo. *Introduction to development builds* (https://docs.expo.dev/develop/development-builds/introduction/): "A development build is essentially your own version of Expo Go where you are free to use any native libraries"; instalar biblioteca com código nativo pede nova build.
- React Native. *Accessibility* (https://reactnative.dev/docs/accessibility): `accessibilityLiveRegion="polite"` faz o TalkBack (Android) anunciar mudanças na view. Usado no resultado da análise.
- Código do próprio TCC: `tips/AttentionPointsDetector.kt`, `classifier/OnnxClassifier.kt`, `README.md` e `DECISOES_ARQUITETURA.md` do app; `datasets/dataset_v7.csv` do repositório de ML.

## Como funciona
1. O usuário cola a mensagem e toca em **Analisar**.
2. `desfazerTrocas` percorre cada pedaço de palavra. Só converte quando o pedaço tem pelo menos 2 letras, tem algum 0 1 3 4 5 7 @ $, não tem dois dígitos seguidos e tem mais letras do que trocas. Links, e-mails, moedas ("US$"), quantidades ("5GB") e perfis ("@loja") ficam como estão.
3. As mesmas regras do Kotlin (porte de `AttentionPointsDetector.kt`) leem o texto já convertido.
4. Se houve troca, aparece um ponto de atenção novo: "Troca letras por números, como 'TR0QUE'. Golpistas fazem isso para enganar filtros."
5. A mensagem mostrada continua a original. A chave "Desfazer letras trocadas" liga e desliga a conversão, para comparar antes e depois.

## Experimento: a regra no dataset_v7
Script: `npx tsx scripts/avaliar-dataset.ts dataset_v7.csv` (3.396 mensagens: 1.545 golpes e 1.851 legítimas).

| Versão da regra | Golpes com letras trocadas detectadas | Legítimas marcadas (aviso falso) |
|---|---|---|
| 1ª versão (todos os 41 testes passando) | 17 | **8** |
| 2ª versão (com 3 exceções novas) | 12 | **0** |

- Os 8 avisos falsos da 1ª versão: "US$" (2), "1GB"/"5GB" (5, todas mensagens de operadora) e o perfil "@dideclub" (1). Nos golpes, a mesma correção tirou 5 detecções que não eram disfarce ("US$", "@HyperCard", "@fashionmodel").
- Cada um virou um caso de teste antes da correção. Hoje são 48 testes, todos passando (`npm run test:ci`).
- Dos 12 golpes, 11 são disfarces de verdade ("TR0QUE", "lTAU", "PONTO$", "CAlXA"...). Um é nome de marca ("R7Bet"), convertido sem necessidade: limitação conhecida.
- Em nenhuma mensagem do dataset a conversão revelou *outra* dica (urgência, senha etc.) que estava escondida. O ganho medido é o ponto de atenção novo, que explica o truque ao usuário. Os casos inventados nos testes ("bl0qu3ada", "s3nh4") mostram o ganho maior possível, mas não aparecem no dataset.

## Onde a IA errou
**Erro 1 (Claude, na escolha do tema)**
- Pedido: sugerir um tema da disciplina a partir da descrição do TCC.
- O que veio: a IA aceitou que o modelo rodava "na nuvem, no Hugging Face" e recomendou a trilha de Consumo de API (mandar a mensagem para o Hugging Face). Também levantou uma suposta contradição de privacidade no projeto.
- Como percebi: lendo o código do app. O `OnnxClassifier.kt` roda o modelo com o ONNX Runtime no próprio celular; o README diz "A inferência roda 100% no aparelho". O Hugging Face só guarda os pesos para a conversão.
- O certo: a inferência é local. A trilha de API mandaria as mensagens para fora do celular e iria contra a decisão 3 do TCC (LGPD).

**Erro 2 (Claude, na primeira versão da regra)**
- Pedido: escrever `desfazerTrocas` e os testes, sem estragar mensagens legítimas.
- O que veio: uma regra com 41 testes, todos passando, que mesmo assim marcava 8 mensagens legítimas do dataset ("US$ 1.000,00", "pacote de 5GB", "@dideclub").
- Como percebi: rodando a regra nas 3.396 mensagens reais (`scripts/avaliar-dataset.ts`), não nos testes.
- O certo: os testes foram escritos pela mesma IA que escreveu a regra e só cobriam os casos que ela imaginou. Os casos reais viraram testes e a regra ganhou exceções para moeda, quantidade com unidade e perfil de rede social.

**Erro 3 (Copilot, durante a construção)**
- Pedido: [preencher]
- O que veio: [preencher]
- Como percebi: [preencher]
- O certo: [preencher]

## Resultado e próximos passos no TCC
- A prova de conceito mostra que dá para reconhecer o disfarce de letras sem criar avisos falsos no dataset: 12 golpes marcados, 0 legítimas.
- **Levar a regra para o Kotlin:** acrescentar a conversão ao `AttentionPointsDetector.kt`, junto do ponto `DISGUISED_TEXT` que já existe para letras de outros alfabetos. Os 48 casos de teste viram testes JUnit.
- **Testar o modelo:** passar as mensagens com letras trocadas pelo BERTimbau, com e sem conversão (no `comparar_variantes.py`), e ver se a probabilidade de golpe muda. Esta prova de conceito não testou o modelo, só as dicas.
- **Limitações:** "1" pode ser "i" ou "l" (a regra escolhe "i"); nomes de marca com número ("R7Bet") são convertidos; disfarces fora da lista (8, 9, "|") não são tratados.
