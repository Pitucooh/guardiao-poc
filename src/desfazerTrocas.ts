/**
 * Desfaz trocas de letras por números e símbolos ("leetspeak"), um truque
 * usado em golpes para escapar de filtros: "TR0QUE", "bl0qu3ada", "@ss1m".
 *
 * O resultado serve só para as regras de pontos de atenção lerem o texto.
 * A mensagem mostrada ao usuário continua a original.
 *
 * Para não estragar mensagens legítimas, um pedaço de palavra só é convertido
 * quando TODAS as condições valem:
 *  - tem pelo menos 2 letras de verdade (assim "4G", "1a", "2o" ficam iguais);
 *  - tem pelo menos 1 número ou símbolo trocável (0 1 3 4 5 7 @ $);
 *  - não tem 2 dígitos seguidos (assim "TJ152828943BR", "09h18", "R$50" e
 *    "COVID19" ficam iguais);
 *  - tem mais letras do que trocas (assim "1o3" não vira palavra).
 * Links e e-mails ficam intactos, porque as regras de link precisam deles.
 */

const TROCAS: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  $: 's',
};

const PARECE_LINK_OU_EMAIL =
  /(https?:\/\/|www\.|[^\s@]+@[^\s@]+\.[^\s@]+|[a-z0-9-]+\.(com|br|net|org|ly|gy|cc|gg|me|io|co|xyz|online|site|app|link|top|info|club|shop|vip|live|click)\b)/i;

// Pedaços de palavra: letras, dígitos e os símbolos trocáveis.
const PEDACO = /[\p{L}\d@$]+/gu;

const LETRA = /\p{L}/u;

export type ResultadoTrocas = {
  /** Texto com as trocas desfeitas. */
  texto: string;
  /** Pedaços que foram convertidos, como apareciam na mensagem (ex.: "TR0QUE"). */
  trocados: string[];
};

function converterPedaco(pedaco: string): string | null {
  let letras = 0;
  let trocaveis = 0;
  for (const c of pedaco) {
    if (LETRA.test(c)) letras++;
    else if (c in TROCAS) trocaveis++;
  }
  if (letras < 2 || trocaveis === 0) return null;
  const sequenciasDeDigitos = /\d{2,}/g;
  let sequencia: RegExpExecArray | null;
  while ((sequencia = sequenciasDeDigitos.exec(pedaco)) !== null) {
    const inicio = sequencia.index;
    const fim = inicio + sequencia[0].length;
    const cercadaPorLetras =
      inicio > 0 &&
      fim < pedaco.length &&
      LETRA.test(pedaco[inicio - 1]) &&
      LETRA.test(pedaco[fim]);
    if (!cercadaPorLetras) return null;
  }
  if (trocaveis >= letras) return null;
  // Algum caractere não trocável sobrou (ex.: "2", "8", "9")? Então não é leetspeak.
  for (const c of pedaco) {
    if (!LETRA.test(c) && !(c in TROCAS)) return null;
  }
  // Moeda: "US$", "U$", "AU$".
  if (/^\p{L}{1,3}\$$/u.test(pedaco)) return null;
  // Quantidade com unidade: "1GB", "5GB", "4G", "10MB" (número só no começo).
  if (/^\d\p{L}+$/u.test(pedaco)) return null;
  // Perfil de rede social: "@dideclub", "@HyperCard" (o @ é a única troca).
  if (/^@\p{L}+$/u.test(pedaco)) return null;

  // Palavras em CAIXA ALTA com "l" minúsculo no lugar de "I" (ex.: "lTAU").
  const minusculas = [...pedaco].filter((c) => LETRA.test(c) && c === c.toLowerCase() && c !== c.toUpperCase());
  const maiusculas = [...pedaco].filter((c) => LETRA.test(c) && c === c.toUpperCase() && c !== c.toLowerCase());
  const caixaAlta = maiusculas.length >= 2 && minusculas.every((c) => c === 'l');

  return [...pedaco]
    .map((c) => {
      if (c in TROCAS) return caixaAlta ? TROCAS[c].toUpperCase() : TROCAS[c];
      if (caixaAlta && c === 'l') return 'I';
      return c;
    })
    .join('');
}

/** Converte "lTAU" em "ITAU": caixa alta com "l" minúsculo, sem números. */
function converterLMinusculo(pedaco: string): string | null {
  if (!pedaco.includes('l')) return null;
  const letras = [...pedaco].filter((c) => LETRA.test(c));
  if (letras.length !== [...pedaco].length) return null;
  const outrasMinusculas = letras.filter((c) => c !== 'l' && c === c.toLowerCase() && c !== c.toUpperCase());
  const maiusculas = letras.filter((c) => c === c.toUpperCase() && c !== c.toLowerCase());
  if (outrasMinusculas.length > 0 || maiusculas.length < 3) return null;
  return pedaco.replace(/l/g, 'I');
}

export function desfazerTrocas(texto: string): ResultadoTrocas {
  const trocados: string[] = [];

  // Separa por espaços mantendo os espaços, para devolver o texto no mesmo formato.
  const partes = texto.split(/(\s+)/);
  const convertidas = partes.map((parte) => {
    if (parte.trim() === '' || PARECE_LINK_OU_EMAIL.test(parte)) return parte;
    return parte.replace(PEDACO, (pedaco) => {
      const novo = converterPedaco(pedaco) ?? converterLMinusculo(pedaco);
      if (novo === null || novo === pedaco) return pedaco;
      trocados.push(pedaco);
      return novo;
    });
  });

  return { texto: convertidas.join(''), trocados };
}
