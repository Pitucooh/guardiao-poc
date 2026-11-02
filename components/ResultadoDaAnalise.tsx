import { StyleSheet, Text, View } from 'react-native';
import { desfazerTrocas } from '../src/desfazerTrocas';
import { Analise, DESCRICAO } from '../src/pontosDeAtencao';
import { cores } from './cores';

type Props = { analise: Analise };

export function ResultadoDaAnalise({ analise }: Props) {
  const { pontos, trocados } = analise;
  const resumo =
    pontos.length === 0
      ? 'Nenhum ponto de atenção encontrado.'
      : `${pontos.length} ${pontos.length === 1 ? 'ponto de atenção encontrado' : 'pontos de atenção encontrados'}.`;

  return (
    // accessibilityLiveRegion faz o TalkBack ler o resultado quando ele muda (Android).
    <View accessibilityLiveRegion="polite" style={styles.caixa}>
      <Text accessibilityRole="header" style={[styles.resumo, pontos.length > 0 ? styles.alerta : styles.ok]}>
        {resumo}
      </Text>

      {pontos.map((p) => (
        <View key={p} style={styles.item}>
          <Text style={styles.marcador} accessibilityElementsHidden importantForAccessibility="no">
            !
          </Text>
          <Text style={styles.textoItem}>{DESCRICAO[p]}</Text>
        </View>
      ))}

      {trocados.length > 0 && (
        <View style={styles.trocas}>
          <Text style={styles.subtitulo}>Como o app leu as palavras disfarçadas:</Text>
          {trocados.map((t, i) => (
            <Text key={`${t}-${i}`} style={styles.troca}>
              {t} → {desfazerTrocas(t).texto}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.aviso}>
        Estas dicas são uma verificação simples do texto. No Guardião SMS, quem decide o alerta é o modelo de IA.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { gap: 12, marginTop: 8 },
  resumo: { fontSize: 22, fontWeight: '700', padding: 12, borderRadius: 12 },
  alerta: { color: cores.alerta, backgroundColor: cores.alertaFundo },
  ok: { color: cores.ok, backgroundColor: cores.okFundo },
  item: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  marcador: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: cores.alerta,
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
  },
  textoItem: { flex: 1, fontSize: 20, color: cores.texto, lineHeight: 28 },
  trocas: { gap: 4, padding: 12, borderWidth: 1, borderColor: cores.borda, borderRadius: 12 },
  subtitulo: { fontSize: 18, fontWeight: '700', color: cores.texto },
  troca: { fontSize: 20, color: cores.texto, fontFamily: 'monospace' },
  aviso: { fontSize: 16, color: cores.textoFraco, lineHeight: 22 },
});
