import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { getCharacters } from '../services/charactersService';
import CharacterCard from '../components/CharacterCard';
import StateMessage from '../components/StateMessage';
import { COLORS } from '../config/constants';

// Si falla la red, fetch rechaza con un TypeError de mensaje técnico y en
// inglés ("Failed to fetch"); se lo cambio por algo comprensible. Los errores
// HTTP del servicio ya traen un mensaje claro.
function getErrorMessage(error) {
  if (error instanceof TypeError) {
    return 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.';
  }
  return error.message;
}

export default function CharactersScreen() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Contador que sube con cada "Reintentar": como está en las dependencias del
  // efecto, cambiarlo hace que la carga inicial se ejecute otra vez.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function loadFirstPage() {
      setLoading(true);
      setError(null);
      try {
        const { results } = await getCharacters({ page: 1 });
        setCharacters(results);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    }

    loadFirstPage();
  }, [reloadKey]);

  function renderContent() {
    if (loading) {
      return <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />;
    }

    if (error && characters.length === 0) {
      return (
        <StateMessage
          message={error}
          actionLabel="Reintentar"
          onAction={() => setReloadKey((k) => k + 1)}
        />
      );
    }

    return (
      <FlatList
        data={characters}
        renderItem={({ item }) => <CharacterCard character={item} />}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rick and Morty</Text>

      {renderContent()}
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
