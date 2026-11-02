# Critérios de aceitação

- [X] Ao tocar em **Golpe disfarçado** e depois em **Analisar**, a tela mostra "4 pontos de atenção encontrados", entre eles "Troca letras por números", e a caixa "Como o app leu" lista `URG3NTE → URGENTE`, `c0nt4 → conta`, `bl0qu3ada → bloqueada`, `Inf0rme → Informe` e `s3nh4 → senha`.
- [X] Com a mesma mensagem, ao desligar **Desfazer letras trocadas por números**, o resultado cai para "1 ponto de atenção encontrado" (só o link). Ao ligar de novo, volta para 4.
- [X] Ao tocar em **Mensagem legítima** e em **Analisar** (texto com "5GB", "TJ152828943BR" e "29/01"), aparece "Nenhum ponto de atenção encontrado.", sem o aviso de letras trocadas.
- [X] Com o campo vazio (ou só com espaços), o botão **Analisar** fica cinza, não responde ao toque, e aparece "Cole ou digite uma mensagem para poder analisar."
- [X] Ao mudar o texto depois de analisar, o resultado antigo some até tocar em **Analisar** de novo.
- [X] Com o TalkBack ligado, ao tocar em **Analisar**, o celular lê em voz alta o resumo do resultado.
- [X] `npm run test:ci` mostra "Tests: 58 passed, 58 total".

**Verificado em:** (X) aparelho físico ( ) emulador
**Resultado:** (X) passou ( ) reprovou
