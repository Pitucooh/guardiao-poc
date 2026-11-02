import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, ScrollView, StatusBar as RNStatusBar, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { BotaoGrande } from './components/BotaoGrande';
import { cores } from './components/cores';
import { ResultadoDaAnalise } from './components/ResultadoDaAnalise';
import { analisar } from './src/pontosDeAtencao';

const EXEMPLOS = [
  { titulo: 'Golpe disfarçado', texto: 'URG3NTE: sua c0nt4 sera bl0qu3ada. Inf0rme sua s3nh4 em bit.ly/r3gular' },
  {
    titulo: 'Golpe real do dataset',
    texto: 'lTAU: Voce tem 72.103 pontos vencendo hoje! Troque por DlNHElRO acesse: https://app.va',
  },
  { titulo: 'Mensagem legítima', texto: 'TIM: seu pacote de 5GB foi ativado. Pedido TJ152828943BR chega dia 29/01.' },
];

export default function App() {
  const [texto, setTexto] = useState('');
  // Guarda o texto do último toque em "Analisar"; a análise em si é calculada, não vira estado.
  const [textoAnalisado, setTextoAnalisado] = useState<string | null>(null);
  const [desfazer, setDesfazer] = useState(true);

  const vazio = texto.trim() === '';
  const analise = textoAnalisado === null ? null : analisar(textoAnalisado, { desfazer });

  function trocarTexto(novo: string) {
    setTexto(novo);
    setTextoAnalisado(null); // resultado antigo some quando a mensagem muda
  }

  return (
    <ScrollView contentContainerStyle={styles.tela} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={styles.titulo}>
        Esta mensagem é golpe?
      </Text>
      <Text style={styles.explicacao}>Cole ou digite a mensagem que você recebeu.</Text>

      <TextInput
        value={texto}
        onChangeText={trocarTexto}
        multiline
        placeholder="Cole a mensagem aqui"
        placeholderTextColor={cores.textoFraco}
        accessibilityLabel="Mensagem para analisar"
        style={styles.campo}
      />

      <Text style={styles.subtitulo}>Ou teste um exemplo:</Text>
      <View style={styles.exemplos}>
        {EXEMPLOS.map((e) => (
          <BotaoGrande key={e.titulo} titulo={e.titulo} secundario onPress={() => trocarTexto(e.texto)} />
        ))}
      </View>

      <View style={styles.linhaSwitch}>
        <Text style={styles.textoSwitch} nativeID="rotuloDesfazer">
          Desfazer letras trocadas por números
        </Text>
        <Switch
          value={desfazer}
          onValueChange={setDesfazer}
          accessibilityLabelledBy="rotuloDesfazer"
          accessibilityLabel="Desfazer letras trocadas por números"
          style={styles.switch}
        />
      </View>

      <BotaoGrande titulo="Analisar" desabilitado={vazio} onPress={() => setTextoAnalisado(texto)} />
      {vazio && <Text style={styles.dica}>Cole ou digite uma mensagem para poder analisar.</Text>}

      {analise && <ResultadoDaAnalise analise={analise} />}

      <StatusBar style="dark" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    padding: 16,
    paddingTop: (Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 48) + 16,
    gap: 12,
    backgroundColor: cores.fundo,
    flexGrow: 1,
  },
  titulo: { fontSize: 30, fontWeight: '800', color: cores.texto },
  explicacao: { fontSize: 20, color: cores.texto },
  campo: {
    minHeight: 140,
    borderWidth: 2,
    borderColor: cores.borda,
    borderRadius: 12,
    padding: 12,
    fontSize: 20,
    color: cores.texto,
    textAlignVertical: 'top',
  },
  subtitulo: { fontSize: 18, fontWeight: '700', color: cores.texto },
  exemplos: { gap: 8 },
  linhaSwitch: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  textoSwitch: { flex: 1, fontSize: 18, color: cores.texto },
  switch: { transform: [{ scale: 1.2 }] },
  dica: { fontSize: 16, color: cores.textoFraco },
});
