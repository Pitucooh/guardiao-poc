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
2. `desfazerTrocas` percorre cada pedaço de palavra. Só converte quando o pedaço tem pelo menos 2 letras, tem algum 0 1 3 4 5 7 @ $ e tem mais letras do que trocas. Dois ou mais dígitos seguidos só são aceitos no meio da palavra, entre letras ("bl0qu34d0"); no começo ou no fim ("MXRF11", "COVID19", "30HORAS") bloqueiam a conversão. Links, e-mails, moedas ("US$"), quantidades ("5GB") e perfis ("@loja") ficam como estão.
3. As mesmas regras do Kotlin (porte de `AttentionPointsDetector.kt`) leem o texto já convertido.
4. Se houve troca, aparece um ponto de atenção novo: "Troca letras por números, como 'TR0QUE'. Golpistas fazem isso para enganar filtros."
5. A mensagem mostrada continua a original. A chave "Desfazer letras trocadas" liga e desliga a conversão, para comparar antes e depois.

## Experimento: a regra no dataset_v7
Script: `npx tsx scripts/avaliar-dataset.ts dados/dataset_v7.csv` (3.396 mensagens: 1.545 golpes e 1.851 legítimas).

| Versão da regra | Quem escreveu | Testes | Golpes detectados | Legítimas marcadas (aviso falso) |
|---|---|---|---|---|
| 1ª: converte qualquer pedaço com letras e trocas | Claude | 41 passando | 17 | **8** |
| 2ª: exceções para moeda ("US$"), unidade ("5GB") e perfil ("@loja") | Claude | 48 passando | 12 | **0** |
| 3ª: aceita dígitos seguidos se houver 4+ letras ("bl0qu34d0") | Copilot | 54 passando | 12 | **2** |
| 4ª: aceita dígitos seguidos só entre letras | Copilot, com pedido corrigido | 58 passando | 12 | **0** |

- Em todas as versões, os testes passaram. Só a medição no dataset mostrou os avisos falsos.
- Avisos falsos da 1ª versão: "US$" (2), "1GB"/"5GB" (5, mensagens de operadora) e "@dideclub" (1). Nos golpes, a mesma correção tirou 5 detecções que não eram disfarce ("US$", "@HyperCard", "@fashionmodel").
- Avisos falsos da 3ª versão: "MXRF11" (2, avisos de fundo imobiliário da B3). Ela também passou a converter "30HORAS" num golpe; o total de golpes não mudou porque a mensagem já era contada pelo "lTAU".
- Cada aviso falso virou um caso de teste antes da correção. Hoje são 58 testes, todos passando (`npm run test:ci`).
- Dos 12 golpes, 11 são disfarces de verdade ("TR0QUE", "lTAU", "PONTO$", "CAlXA"...). Um é nome de marca ("R7Bet"), convertido sem necessidade.
- Em nenhuma mensagem do dataset a conversão revelou *outra* dica (urgência, senha etc.) que estava escondida. O ganho medido é o ponto de atenção novo, que explica o truque ao usuário. Os casos dos testes ("bl0qu3ada", "s3nh4", "bl0qu34d0") mostram o ganho maior possível, mas não aparecem no dataset.

## Onde a IA errou

**Erro 1 (Copilot, ao ampliar a regra)**
- Pedido: permitir dígitos seguidos para que "bl0qu34d0" vire "bloqueado".
- O que veio: uma regra que aceita dígitos seguidos quando o pedaço tem pelo menos 4 letras. Os 54 testes passaram.
- Como percebi: rodei `scripts/avaliar-dataset.ts`. As legítimas marcadas passaram de 0 para 2: avisos da B3 com o fundo imobiliário "MXRF11", que viraria "MXRFii". Lendo a lista de exemplos, vi também que "30HORAS" (de "lTAU'30HORAS") passou a ser convertido, embora seja "30 horas".
- O certo: dígitos seguidos só podem ser convertidos no meio da palavra, entre letras ("bl0qu34d0"). No começo ou no fim ("MXRF11", "COVID19", "30HORAS") são números legítimos. Os testes passavam porque nenhum caso cobria códigos assim.

**Erro 2 (Copilot, ao explicar o próprio modo agente)**
- Pedido: "como ativo vc como agent?"
- O que veio: o Copilot disse que, para ativá-lo como agente, bastava seguir as instruções do `AGENTS.md`.
- Como percebi: o `AGENTS.md` só tem regras e contexto do projeto. O seletor de modo não aparecia porque o VS Code estava desatualizado; depois de atualizar, a opção "Agent" surgiu no chat.
- O certo: o modo Agent é escolhido no menu do chat do VS Code. O `AGENTS.md` é lido pelo agente, mas não o liga.

**Erro 3 (Gemini, no mapa do tema)**
- Pedido: alternativas para tratar letras trocadas num app Expo em TypeScript, e como testar.
- O que veio: "utilize o Jest (nativo do Expo) para rodar testes unitários".
- Como percebi: o package.json gerado pelo create-expo-app não tem nenhuma dependência de Jest.
- O certo: o Jest precisa ser instalado com `npx expo install jest-expo jest @types/jest --dev`, com `"preset": "jest-expo"` no package.json (Expo, Unit testing with Jest).

**Erro 4 (ChatGPT, no mapa do tema)**
- Pedido: o mesmo prompt.
- O que veio: para retreinar o BERTimbau em Python, indicou como documentação "Hugging Face — Tokenizers", com link para huggingface.co/docs/transformers.js/api/tokenizers.
- Como percebi: abri o link; a página é do Transformers.js, a biblioteca JavaScript, e não da usada no treinamento em Python.
- O certo: o treinamento usa a biblioteca transformers do Python (Hugging Face Transformers, Training).

**Erro 5 (Claude, na primeira versão da regra)**
- Pedido: escrever `desfazerTrocas` e os testes, sem estragar mensagens legítimas.
- O que veio: uma regra com 41 testes passando que marcava 8 mensagens legítimas do dataset ("US$ 1.000,00", "pacote de 5GB", "@dideclub").
- Como percebi: rodando a regra nas 3.396 mensagens do dataset_v7.
- O certo: os testes foram escritos pela mesma IA que escreveu a regra e só cobriam os casos que ela imaginou. Os casos reais viraram testes, e a regra ganhou exceções para moeda, unidade e perfil.

**Erro 6 (Claude, nas instruções para rodar)**
- Pedido: montar o projeto com instruções para rodar.
- O que veio: README sem a versão mínima do Node.
- Como percebi: `npx expo start` quebrou com `TypeError: URL.parse is not a function` no Node 20.11.1.
- O certo: o package.json do expo 58 exige Node `^22.13.0 || ^24.3.0`. Atualizei o Node e funcionou.

**Erro 7 (Claude, na escolha do tema)**
- Pedido: sugerir um tema da disciplina a partir da descrição do TCC.
- O que veio: a IA aceitou que o modelo rodava "na nuvem, no Hugging Face" e recomendou a trilha de Consumo de API.
- Como percebi: o `OnnxClassifier.kt` roda o modelo com o ONNX Runtime no celular, e o README do app diz que a inferência roda 100% no aparelho.
- O certo: a inferência é local. A trilha de API mandaria as mensagens para fora do celular, contra a decisão de LGPD do TCC.

### Onde as IAs divergiram
| Ponto | Gemini | ChatGPT | O que confirma |
|---|---|---|---|
| Tokenizador | Ajustar o normalizador do tokenizador | Usar exatamente o tokenizador do treinamento | ChatGPT. O tokenizador do app foi verificado idêntico ao do Hugging Face (3.408/3.408 mensagens); mudar exigiria retreinar |
| Biblioteca nativa (ONNX) | Não menciona | Precisa de development build, não só Expo Go | ChatGPT. Documentação do Expo (development builds) |

### Onde a IA acertou (conferido)
- Copilot previu o resultado de `desfazerTrocas` para "MP3", "g4t0", "R7Bet", "4ss1m", "B4ND1D0" e "US$". Todos certos, conferidos com teste no jest.
- Copilot escreveu 5 testes novos de mensagens legítimas sem mexer em `src/`. Todos passaram.
- Copilot procurou o `dataset_v7` no projeto, não achou e avisou, em vez de inventar um resultado.

### O que a comparação revelou sobre a regra
Os exemplos de "leetspeak pesado" do Gemini ("5eu c4r74o f01 bl0qu34d0") passavam sem nenhum ponto de atenção. As exceções que evitam avisos falsos também barravam o disfarce pesado. Isso motivou as versões 3 e 4 da regra.

## Resultado e próximos passos no TCC
- A prova de conceito mostra que dá para reconhecer o disfarce de letras sem criar avisos falsos no dataset: 12 golpes marcados, 0 legítimas.
- **Levar a regra para o Kotlin:** acrescentar a conversão ao `AttentionPointsDetector.kt`, junto do ponto `DISGUISED_TEXT` que já existe para letras de outros alfabetos. Os 58 casos de teste viram testes JUnit.
- **Testar o modelo:** passar as mensagens com letras trocadas pelo BERTimbau, com e sem conversão (no `comparar_variantes.py`), e ver se a probabilidade de golpe muda. Esta prova de conceito não testou o modelo, só as dicas.
- **Limitações:** "1" pode ser "i" ou "l" (a regra escolhe "i"); nomes de marca com número ("R7Bet") e "MP3" são convertidos; pedaços com tantas trocas quanto letras ("c4r74o", "4pr0v4d0") não são convertidos; disfarces fora da lista (8, 9, "|") não são tratados.
