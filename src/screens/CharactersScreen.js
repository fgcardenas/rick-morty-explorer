import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { getCharacters } from '../services/charactersService';
import CharacterCard from '../components/CharacterCard';
import StateMessage from '../components/StateMessage';
import { COLORS, DEBOUNCE_MS } from '../config/constants';

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
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Lo que el usuario escribe (cambia en cada tecla) y el texto que de verdad
  // se usa para buscar (cambia cuando deja de escribir un momento).
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  // Número de la "búsqueda vigente". Cada carga inicial o actualización lo
  // sube; una respuesta solo se usa si su número sigue siendo el actual.
  // Así una petición lenta de una búsqueda vieja no pisa a la más reciente.
  const requestId = useRef(0);

  // Debounce: espera DEBOUNCE_MS desde la última tecla. Si el usuario sigue
  // escribiendo, la limpieza cancela el temporizador anterior antes de que
  // llegue a ejecutarse.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchText), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Carga inicial: se repite al cambiar la búsqueda o al presionar "Reintentar".
  useEffect(() => {
    const id = ++requestId.current;

    async function loadFirstPage() {
      setLoading(true);
      setLoadingMore(false);
      setRefreshing(false);
      setError(null);
      try {
        const { results, hasNextPage } = await getCharacters({ page: 1, name: query });
        if (id !== requestId.current) return;
        setCharacters(results);
        setPage(1);
        setHasNextPage(hasNextPage);
      } catch (e) {
        if (id !== requestId.current) return;
        setCharacters([]);
        setHasNextPage(false);
        setError(getErrorMessage(e));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }

    loadFirstPage();

    // Si el efecto se vuelve a ejecutar (o la pantalla se desmonta), esta
    // respuesta deja de corresponderle.
    return () => {
      requestId.current++;
    };
  }, [query, reloadKey]);

  async function loadMore() {
    // No tiene sentido pedir más si hay otra carga en curso o si la API dijo
    // que no hay más páginas: onEndReached puede dispararse varias veces
    // seguidas y duplicaría personajes.
    if (loading || loadingMore || refreshing || !hasNextPage) return;

    const id = requestId.current;
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const { results, hasNextPage: more } = await getCharacters({
        page: nextPage,
        name: query,
      });
      if (id !== requestId.current) return;
      // Arreglo nuevo: los anteriores se conservan y los nuevos van al final.
      setCharacters((current) => [...current, ...results]);
      setPage(nextPage);
      setHasNextPage(more);
    } catch (e) {
      // El error se guarda sin borrar los personajes ya cargados.
      if (id === requestId.current) setError(getErrorMessage(e));
    } finally {
      if (id === requestId.current) setLoadingMore(false);
    }
  }

  async function refresh() {
    const id = ++requestId.current;
    setRefreshing(true);
    setLoadingMore(false);
    setError(null);
    try {
      const { results, hasNextPage } = await getCharacters({ page: 1, name: query });
      if (id !== requestId.current) return;
      // Reemplaza toda la lista y reinicia la paginación.
      setCharacters(results);
      setPage(1);
      setHasNextPage(hasNextPage);
    } catch (e) {
      if (id === requestId.current) setError(getErrorMessage(e));
    } finally {
      if (id === requestId.current) setRefreshing(false);
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
        ListEmptyComponent={
          <StateMessage
            message={
              query.trim()
                ? `No encontré personajes llamados "${query.trim()}".`
                : 'No hay personajes que mostrar.'
            }
          />
        }
        ListFooterComponent={renderFooter}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rick and Morty</Text>

      {/* Fuera de renderContent: si estuviera dentro se desmontaría al cargar
          y se cerraría el teclado. */}
      <TextInput
        style={styles.input}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Buscar por nombre..."
        placeholderTextColor={COLORS.textMuted}
        autoCorrect={false}
        autoCapitalize="none"
      />

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
