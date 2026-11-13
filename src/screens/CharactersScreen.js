import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getCharacters } from '../services/charactersService';
import CharacterCard from '../components/CharacterCard';
import { COLORS } from '../config/constants';

export default function CharactersScreen() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFirstPage() {
      try {
        const { results } = await getCharacters({ page: 1 });
        setCharacters(results);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadFirstPage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rick and Morty</Text>

      <FlatList
        data={characters}
        renderItem={({ item }) => <CharacterCard character={item} />}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
      />
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
});
