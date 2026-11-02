/**
 * Mede a regra de letras trocadas no dataset do TCC.
 *
 * Uso (a partir da raiz do projeto):
 *   npx tsx scripts/avaliar-dataset.ts caminho/para/dataset_v7.csv
 *
 * O CSV precisa das colunas `mensagem_chat_sintetica` e `label_ia` (1 = golpe).
 */
import { readFileSync } from 'node:fs';
import { analisar } from '../src/pontosDeAtencao';

function lerCsv(conteudo: string): string[][] {
  const linhas: string[][] = [];
  let campo = '';
  let linha: string[] = [];
  let aspas = false;
  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];
    if (aspas) {
      if (c === '"' && conteudo[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ',') {
      linha.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && conteudo[i + 1] === '\n') i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = '';
    } else campo += c;
  }
  if (campo !== '' || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas.filter((l) => l.some((v) => v !== ''));
}

const caminho = process.argv[2];
if (!caminho) {
  console.error('Informe o caminho do CSV.');
  process.exit(1);
}

const [cabecalho, ...linhas] = lerCsv(readFileSync(caminho, 'utf8').replace(/^﻿/, ''));
const iMsg = cabecalho.indexOf('mensagem_chat_sintetica');
const iLabel = cabecalho.indexOf('label_ia');

const total = { golpe: 0, legitima: 0 };
const comTroca = { golpe: 0, legitima: 0 };
const ganhouOutraDica = { golpe: 0, legitima: 0 };
const exemplos: Record<'golpe' | 'legitima', string[]> = { golpe: [], legitima: [] };

for (const l of linhas) {
  const msg = l[iMsg];
  const classe = l[iLabel].trim() === '1' ? 'golpe' : 'legitima';
  total[classe]++;

  const antes = analisar(msg, { desfazer: false });
  const depois = analisar(msg, { desfazer: true });

  if (depois.trocados.length > 0) {
    comTroca[classe]++;
    exemplos[classe].push(`${depois.trocados.join(', ')}  <=  ${msg.slice(0, 110)}`);
  }
  // Dicas novas além de "letras trocadas" (ex.: urgência que só aparece depois de desfazer).
  const novas = depois.pontos.filter((p) => p !== 'LETRAS_TROCADAS' && !antes.pontos.includes(p));
  if (novas.length > 0) ganhouOutraDica[classe]++;
}

console.log('Mensagens:', total);
console.log('Com letras trocadas detectadas:', comTroca);
console.log('Ganharam outra dica depois de desfazer as trocas:', ganhouOutraDica);
for (const classe of ['golpe', 'legitima'] as const) {
  console.log(`\nExemplos (${classe}):`);
  for (const e of exemplos[classe]) console.log('  ' + e);
}
