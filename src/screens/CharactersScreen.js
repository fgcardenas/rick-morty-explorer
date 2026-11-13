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

// Fuera del componente para que no se cree una función nueva en cada render.
const ItemSeparator = () => <View style={styles.separator} />;

export default function CharactersScreen() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Paginación: página que ya tengo, si la API tiene otra y si estoy pidiéndola.
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // Actualizar con el gesto es distinto de la carga inicial: la lista sigue
  // visible y solo se muestra el indicador nativo.
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function loadFirstPage() {
      setLoading(true);
      setError(null);
      try {
        const { results, hasNextPage } = await getCharacters({ page: 1 });
        setCharacters(results);
        setPage(1);
        setHasNextPage(hasNextPage);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    }

    loadFirstPage();
  }, [reloadKey]);

  async function loadMore() {
    // No tiene sentido pedir más si ya hay una carga en curso o si la API
    // dijo que no hay más páginas. Sin esto, onEndReached dispararía
    // peticiones repetidas de la misma página y habría personajes duplicados.
    if (loading || loadingMore || refreshing || !hasNextPage) return;

    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const { results, hasNextPage: more } = await getCharacters({ page: nextPage });
      // Arreglo nuevo: los anteriores se conservan y los nuevos van al final.
      setCharacters((current) => [...current, ...results]);
      setPage(nextPage);
      setHasNextPage(more);
    } catch (e) {
      // El error se guarda sin borrar los personajes ya cargados.
      setError(getErrorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    setError(null);
    try {
      const { results, hasNextPage } = await getCharacters({ page: 1 });
      // Reemplaza toda la lista y reinicia la paginación.
      setCharacters(results);
      setPage(1);
      setHasNextPage(hasNextPage);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }

  function renderFooter() {
    if (loadingMore) {
      return <ActivityIndicator style={styles.footer} color={COLORS.primary} />;
    }
    if (error) {
      return <Text style={styles.footerError}>{error}</Text>;
    }
    return null;
  }

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
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={<StateMessage message="No hay personajes que mostrar." />}
        ListFooterComponent={renderFooter}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
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
