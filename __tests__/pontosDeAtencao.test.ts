import { analisar } from '../src/pontosDeAtencao';

const GOLPE_DISFARCADO = 'URG3NTE: sua c0nt4 sera bl0qu3ada. Inf0rme sua s3nh4';

describe('analisar: o que a normalização muda', () => {
  test('sem desfazer as trocas, o golpe disfarçado passa sem dicas', () => {
    expect(analisar(GOLPE_DISFARCADO, { desfazer: false }).pontos).toEqual([]);
  });

  test('desfazendo as trocas, aparecem dados, urgência e letras trocadas', () => {
    expect(analisar(GOLPE_DISFARCADO, { desfazer: true }).pontos).toEqual([
      'PEDIDO_DE_DADOS',
      'URGENCIA_OU_AMEACA',
      'LETRAS_TROCADAS',
    ]);
  });

  test('mensagem real do dataset: "TR0QUE em DINHEIR0" ganha o ponto de letras trocadas', () => {
    const msg = 'Voce possui 98.435 Bonus vencendo hoje, TR0QUE em DINHEIR0 :https://ww.suporte-pontuax.com';
    const r = analisar(msg, { desfazer: true });
    expect(r.pontos).toContain('LINK');
    expect(r.pontos).toContain('LETRAS_TROCADAS');
    expect(r.trocados).toEqual(['TR0QUE', 'DINHEIR0']);
  });
});

describe('analisar: mesmas regras do Kotlin (sem trocas)', () => {
  test.each([
    ['Acesse bit.ly/regularizar', ['LINK']],
    ['Faca um Pix de R$ 200 para mim', ['PEDIDO_DE_DINHEIRO']],
    ['Me passa o codigo que chegou ai', ['PEDIDO_DE_DADOS']],
    ['Seu codigo de rastreio e BR123456789', []],
    ['Sua conta expira hoje', ['URGENCIA_OU_AMEACA']],
    ['Ligue (11) 98765-4321', ['TELEFONE']],
    ['Oi mae, cheguei bem em casa. Te ligo mais tarde!', []],
  ] as const)('"%s"', (msg, esperado) => {
    expect(analisar(msg, { desfazer: true }).pontos).toEqual(esperado);
  });
});

describe('analisar: legítimas com números não ganham "letras trocadas"', () => {
  test.each([
    'Seu pedido TJ152828943BR chega dia 29/01/25',
    'PagBank: compra de R$ 7,00 em 29/01/25 as 09h18',
    'Sua fatura de R$ 89,90 vence dia 10',
    'Plano 5G ativado. Bom uso!',
  ])('"%s"', (msg) => {
    expect(analisar(msg, { desfazer: true }).pontos).not.toContain('LETRAS_TROCADAS');
  });
});

describe('analisar: entrada vazia', () => {
  test('não encontra nada e não quebra', () => {
    expect(analisar('', { desfazer: true })).toEqual({ pontos: [], textoLido: '', trocados: [] });
  });
});
