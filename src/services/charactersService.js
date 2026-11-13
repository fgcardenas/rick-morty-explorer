import { API_BASE_URL } from '../config/constants';

// Contrato que usa la pantalla:
//
//   getCharacters({ page, name })  →  Promise<{ results, hasNextPage }>
//
//   - page : número de página (por defecto 1)
//   - name : texto a buscar (por defecto vacío = sin filtro)
//   - results     : arreglo de personajes
//   - hasNextPage : true si la API indica que existe una página siguiente

export async function getCharacters({ page = 1, name = '' } = {}) {
  let url = `${API_BASE_URL}/character?page=${page}`;

  // El filtro solo se agrega si hay texto, y se codifica para que espacios
  // o acentos no rompan la URL.
  const term = name.trim();
  if (term) {
    url += `&name=${encodeURIComponent(term)}`;
  }

  // Si falla la red, fetch rechaza la promesa y el error sigue de largo:
  // lo atiende la pantalla.
  const response = await fetch(url);

  // La API responde 404 cuando no hay coincidencias: eso es "sin resultados",
  // no un error de la app.
  if (response.status === 404) {
    return { results: [], hasNextPage: false };
  }

  // fetch NO rechaza en errores HTTP (500, 429...), hay que revisar response.ok.
  if (!response.ok) {
    throw new Error(`No se pudo cargar la lista (código ${response.status})`);
  }

  const data = await response.json();
  return {
    results: data.results,
    hasNextPage: data.info.next !== null,
  };
}
