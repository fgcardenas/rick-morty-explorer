# Preguntas de reflexión

_Escribe tus respuestas debajo de cada pregunta._

**Alumno:** Fares Cárdenas

---

## Paso 1 · Explorando la API

| Pregunta | Mi respuesta |
|---|---|
| ¿Cuántos personajes trae cada página? | 20 (la última página, la 42, trae solo 6; en total hay 826). |
| ¿Qué campo me dice si existe una página siguiente? | `info.next`: trae la URL de la página siguiente (`info.prev` hace lo mismo hacia atrás). |
| ¿Qué valor tiene ese campo en la última página? | `null`. |
| ¿Qué código HTTP devuelve una búsqueda sin resultados? | 404 (con el cuerpo `{"error":"There is nothing here"}`). |
| ¿Qué campos del personaje usa `CharacterCard`? | `name`, `status`, `species` e `image` (el `id` lo uso yo para la `key`). |

## Paso 2 · Petición HTTP

**¿Qué diferencia hay entre que `fetch` "falle" y que el servidor responda con un error? ¿Qué debo revisar en la respuesta?**

> `fetch` solo rechaza su promesa cuando no se pudo completar la comunicación (sin internet, DNS caído, servidor inalcanzable). Si el servidor responde, aunque sea con un 404 o un 500, la promesa se cumple igual, porque técnicamente sí hubo respuesta. Por eso tengo que revisar `response.ok` (verdadero solo con códigos 200-299) y `response.status` para el código. En mi servicio el 404 de la búsqueda sin coincidencias lo trato como "sin resultados" y cualquier otro código que no sea exitoso lanza un `Error` con el número recibido.

## Paso 3 · Estado

**¿Por qué guardo los personajes en estado y no en una variable normal?**

> 

## Paso 4 · useEffect

1. **¿Qué pasa si omito por completo el arreglo de dependencias?**

> 

2. **¿Qué significa dejar el arreglo vacío?**

> 

3. **¿Por qué la función que recibe `useEffect` no debe ser `async` directamente?**

> 

## Paso 5 · FlatList

1. **¿Para qué sirve la prop que extrae la llave de cada elemento?**

> 

2. **¿Por qué usar `FlatList` en lugar de un `ScrollView` con `.map()`?**

> 

## Paso 6 · Carga y error

**¿Por qué es mejor mostrar un mensaje con un botón "Reintentar" que dejar la pantalla vacía?**

> 

## Paso 8 · Paginación

**¿Qué problema aparece si la función de "cargar más" se dispara varias veces seguidas? ¿Cómo lo evité?**

> 

## Paso 9 · Pull to refresh

**¿Por qué usé un estado distinto (`refreshing`) y no el mismo de la carga inicial?**

> 

## Paso 10 · Búsqueda

1. **¿Qué es el debounce y qué problema resuelve?**

> 

2. **¿Para qué sirve la función de limpieza (cleanup) que se devuelve en un `useEffect`? Da un ejemplo de esta práctica.**

> 

3. **Si el usuario escribe rápido y las respuestas llegan en desorden, ¿qué podría salir mal?**

> 

## Cierre

**Menciona dos mejoras que le harías a la app si tuvieras una hora más:**

> 
