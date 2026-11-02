/**
 * Pontos de atenção: dicas de leitura para o usuário, obtidas por regras
 * simples de texto. Porte para TypeScript das regras de
 * `tips/AttentionPointsDetector.kt` do app Guardião SMS (Kotlin).
 *
 * Não são o motivo do alerta: no app, quem decide é o modelo BERTimbau.
 *
 * A novidade desta prova de conceito é o parâmetro `desfazer`: com ele, as
 * regras leem o texto depois de `desfazerTrocas`, e a troca de letras por
 * números vira um ponto de atenção próprio.
 */
import { desfazerTrocas } from './desfazerTrocas';

export type PontoDeAtencao =
  | 'LINK'
  | 'PEDIDO_DE_DINHEIRO'
  | 'PEDIDO_DE_DADOS'
  | 'URGENCIA_OU_AMEACA'
  | 'TELEFONE'
  | 'LETRAS_TROCADAS';

export const DESCRICAO: Record<PontoDeAtencao, string> = {
  LINK: 'Tem um link. Não toque nele.',
  PEDIDO_DE_DINHEIRO: 'Pede dinheiro, Pix ou pagamento.',
  PEDIDO_DE_DADOS: 'Pede senha, código ou dados pessoais.',
  URGENCIA_OU_AMEACA: 'Tenta apressar você ou fala em bloqueio.',
  TELEFONE: 'Pede para ligar ou chamar em um número.',
  LETRAS_TROCADAS: 'Troca letras por números, como "TR0QUE". Golpistas fazem isso para enganar filtros.',
};

const ORDEM: PontoDeAtencao[] = [
  'LINK',
  'PEDIDO_DE_DINHEIRO',
  'PEDIDO_DE_DADOS',
  'URGENCIA_OU_AMEACA',
  'TELEFONE',
  'LETRAS_TROCADAS',
];

const TLDS = 'com|br|net|org|ly|cc|gg|me|io|co|xyz|online|site|app|link|top|info|club|shop|vip|live|click';

const encurtador =
  /\b(bit\.ly|tinyurl\.com|cutt\.ly|gg\.gg|tiny\.cc|is\.gd|t\.co|ow\.ly|rb\.gy|shorturl\.at|encurtador\.com\.br|abre\.ai)\b/;
const url = /(https?:\/\/|www\.)\S+/;
const dominio = new RegExp(`\\b[a-z0-9][a-z0-9-]*(\\.[a-z0-9-]+)*\\.(${TLDS})\\b(\\/\\S*)?`);

const dinheiro = /\br\$|\bpix\b|\btransfer\w*|\bempresta\w*|\bemprestimo\w*|\bdeposit\w*/;
const boleto = /\bboletos?\b/;

const dados = /\b(senhas?|cpf|cartao|cartoes|token|cvv)\b|\b(seus|teus) dados\b/;
const pedidoDeCodigo = new RegExp(
  '\\b(envie|enviar|envia|informe|informar|informa|passe|passar|passa|digite|digitar|mande|mandar|manda|confirme|confirmar|repasse|repassar|me (passa|manda|envia))\\s+(o\\s+|esse\\s+|este\\s+|seu\\s+)?codigo\\b' +
    '|\\bcodigos?\\s+de\\s+(verificacao|seguranca|acesso|confirmacao)\\b',
);

const urgencia = new RegExp(
  '\\b(urgente|urgencia|bloque\\w*|ultimo dia|cancelamento|cancelad\\w*|imediatamente|suspens\\w*|expira\\w*)\\b' +
    '|\\b(expira|vence|ate|ainda|somente|so|apenas)\\s+hoje\\b',
);

const telefone = new RegExp(
  '(?<![\\p{L}\\d])(\\+?55[\\s.-]?)?(\\(?\\d{2}\\)?[\\s.-]?)?9?\\d{4}[\\s.-]?\\d{4}(?![\\p{L}\\d])' +
    '|(?<![\\p{L}\\d])(0800|4004|3003)[\\s.-]?\\d{3,4}[\\s.-]?\\d{0,4}(?![\\p{L}\\d])' +
    '|\\bwa\\.me\\/',
  'u',
);

/** Minúsculas e sem acentos, como o `normalize` do Kotlin. */
function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/\p{Mn}+/gu, '');
}

export type Analise = {
  pontos: PontoDeAtencao[];
  /** Texto que as regras leram (já sem acentos e, se pedido, com as trocas desfeitas). */
  textoLido: string;
  /** Pedaços convertidos por `desfazerTrocas`, para mostrar na tela. */
  trocados: string[];
};

export function analisar(texto: string, opcoes: { desfazer: boolean }): Analise {
  const { texto: semTrocas, trocados } = opcoes.desfazer
    ? desfazerTrocas(texto)
    : { texto, trocados: [] as string[] };
  const lido = normalizar(semTrocas);
  const achados = new Set<PontoDeAtencao>();

  const temLink = encurtador.test(lido) || url.test(lido) || dominio.test(lido);
  const temUrgencia = urgencia.test(lido);
  const temDinheiro = dinheiro.test(lido) || (boleto.test(lido) && (temUrgencia || temLink));
  const temDados = dados.test(lido) || pedidoDeCodigo.test(lido);

  if (temLink) achados.add('LINK');
  if (temDinheiro) achados.add('PEDIDO_DE_DINHEIRO');
  if (temDados) achados.add('PEDIDO_DE_DADOS');
  if (temUrgencia) achados.add('URGENCIA_OU_AMEACA');
  if (telefone.test(lido)) achados.add('TELEFONE');
  if (trocados.length > 0) achados.add('LETRAS_TROCADAS');

  return { pontos: ORDEM.filter((p) => achados.has(p)), textoLido: lido, trocados };
}
