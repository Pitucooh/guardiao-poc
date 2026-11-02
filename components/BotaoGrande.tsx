import { Pressable, StyleSheet, Text } from 'react-native';
import { cores } from './cores';

type Props = {
  titulo: string;
  onPress: () => void;
  desabilitado?: boolean;
  secundario?: boolean;
};

/** Botão com no mínimo 56dp de altura, como no app em Kotlin. */
export function BotaoGrande({ titulo, onPress, desabilitado = false, secundario = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [
        styles.botao,
        secundario ? styles.secundario : styles.principal,
        desabilitado && styles.desabilitado,
        pressed && !desabilitado && styles.pressionado,
      ]}
    >
      <Text style={[styles.texto, secundario ? styles.textoSecundario : styles.textoPrincipal]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  principal: { backgroundColor: cores.principal },
  secundario: { backgroundColor: cores.fundo, borderWidth: 2, borderColor: cores.principal },
  desabilitado: { backgroundColor: cores.desabilitado, borderColor: cores.desabilitado },
  pressionado: { opacity: 0.8 },
  texto: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  textoPrincipal: { color: '#FFFFFF' },
  textoSecundario: { color: cores.principal },
});
