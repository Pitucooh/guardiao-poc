import { desfazerTrocas } from '../src/desfazerTrocas';

describe('desfazerTrocas: golpes com letras trocadas', () => {
  // Os quatro primeiros casos são trechos reais do dataset_v7 do TCC.
  test.each([
    ['TR0QUE em DINHEIR0', 'TROQUE em DINHEIRO'],
    ['CASHBACKAG0RA', 'CASHBACKAGORA'],
    ['TRANSF0RME', 'TRANSFORME'],
    ['lTAU_CARTOES', 'ITAU_CARTOES'],
    ['sua c0nt4 sera bl0qu3ada', 'sua conta sera bloqueada'],
    ['fala @ss1m', 'fala assim'],
    ['envie sua s3nh4', 'envie sua senha'],
    ['pr3m1o', 'premio'],
    ['$aldo', 'saldo'],
    // Também reais do dataset_v7:
    ['PONTO$', 'PONTOS'],
    ['DlNHElRO', 'DINHEIRO'],
    ['CAlXA', 'CAIXA'],
  ])('"%s" vira "%s"', (entrada, esperado) => {
    expect(desfazerTrocas(entrada).texto).toBe(esperado);
  });

  test('lista os pedaços que foram trocados, como apareciam', () => {
    expect(desfazerTrocas('TR0QUE seus pontos AG0RA').trocados).toEqual(['TR0QUE', 'AG0RA']);
  });
});

describe('desfazerTrocas: mensagens legítimas ficam iguais', () => {
  test.each([
    'Seu pedido TJ152828943BR chega dia 29/01/25',
    'Compra de R$ 7,00 as 09h18',
    'Pague R$50 ate sexta',
    'Plano 4G e 5G liberado',
    'A 1a parcela vence dia 10',
    'Vacina da COVID19 na UBS',
    'Senha 1234 do portao',
    'Seu codigo e 482913',
    'Ligue 0800 7199291',
    'Mande para joao3@gmail.com',
    'Acesse https://rb.gy/jc7px6 hoje',
    'Oi mae, cheguei bem em casa!',
    'Win10 e B2B',
    // Falsos positivos achados ao rodar a regra no dataset_v7 (scripts/avaliar-dataset.ts):
    'A cotação é de US$ 1.000,00',
    'TIM: novo pacote de dados de 5GB ativado',
    'responda SIM para contratar 1GB adicional',
    'Sou o Jonas da SIDE (@dideclub)',
  ])('"%s" não muda', (entrada) => {
    const r = desfazerTrocas(entrada);
    expect(r.texto).toBe(entrada);
    expect(r.trocados).toEqual([]);
  });
});

describe('desfazerTrocas: entradas inválidas', () => {
  test('texto vazio devolve vazio', () => {
    expect(desfazerTrocas('')).toEqual({ texto: '', trocados: [] });
  });

  test('só espaços e emoji não quebram', () => {
    expect(desfazerTrocas('   🙂  ').texto).toBe('   🙂  ');
  });

  test('preserva quebras de linha e espaços', () => {
    expect(desfazerTrocas('linha 1\n\nTR0QUE  ja').texto).toBe('linha 1\n\nTROQUE  ja');
  });
});
