import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCharacters } from '../services/charactersService';
import { COLORS } from '../config/constants';

export default function CharactersScreen() {
  // Lo que cambia con el tiempo y obliga a redibujar la pantalla.
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rick and Morty</Text>

      <Text style={styles.placeholder}>Aquí aparecerá la lista de personajes.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
  title: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  loader: { marginTop: 40 },
  separator: { height: 10 },
  listContent: { paddingBottom: 24 },
  footer: { marginVertical: 16 },
  footerError: { color: COLORS.danger, textAlign: 'center', marginVertical: 16 },
  placeholder: { color: COLORS.textMuted, fontSize: 16, marginTop: 24 },
});
