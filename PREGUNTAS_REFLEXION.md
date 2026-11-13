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

> Porque React solo vuelve a dibujar la pantalla cuando cambia un estado (o una prop). Una variable normal se reinicia en cada render y, aunque cambie su valor, React no se entera, así que la lista nunca se actualizaría al llegar los datos de la API. Con `useState` el valor se conserva entre renders y `setCharacters` avisa que hay que redibujar.

## Paso 4 · useEffect

1. **¿Qué pasa si omito por completo el arreglo de dependencias?**

> El efecto se ejecuta después de **cada** render. Como dentro del efecto cambio estados (`setCharacters`, `setLoading`), eso provoca otro render, que vuelve a ejecutar el efecto y así en bucle infinito de peticiones a la API.

2. **¿Qué significa dejar el arreglo vacío?**

> Que el efecto no depende de ningún valor de la pantalla, así que React lo ejecuta una sola vez, justo después del primer render (al montar). Es lo que quiero para la primera carga.

3. **¿Por qué la función que recibe `useEffect` no debe ser `async` directamente?**

> Porque una función `async` siempre devuelve una promesa, y React espera que lo que devuelve el efecto sea `undefined` o una función de limpieza. Una promesa no se puede llamar como limpieza y React avisa del error. Por eso declaro una función `async` dentro del efecto y la llamo, dejando el efecto en sí como una función normal.

## Paso 5 · FlatList

1. **¿Para qué sirve la prop que extrae la llave de cada elemento?**

> `keyExtractor` le dice a `FlatList` cómo identificar de forma única a cada elemento (aquí `String(item.id)`; React espera un string). Con esa llave React sabe qué fila cambió, se agregó o se movió y reutiliza las que ya están dibujadas en vez de recrearlas, además de evitar la advertencia de *keys* faltantes o duplicadas.

2. **¿Por qué usar `FlatList` en lugar de un `ScrollView` con `.map()`?**

> `ScrollView` crea todos los hijos de golpe, aunque no se vean; con cientos de personajes eso gasta memoria y se nota lento. `FlatList` solo dibuja los elementos visibles (y unos pocos alrededor) y los recicla al desplazarse. Además trae listo el separador, la lista vacía, el pie, el pull to refresh y el aviso de "llegué al final" que uso en los pasos siguientes.

## Paso 6 · Carga y error

**¿Por qué es mejor mostrar un mensaje con un botón "Reintentar" que dejar la pantalla vacía?**

> Una pantalla vacía no le dice al usuario si la app falló, si sigue cargando o si de verdad no hay datos, y la única salida es cerrar y volver a abrir la app. Con el mensaje entiende qué pasó (por ejemplo, que no hay conexión) y con el botón puede resolverlo en un toque cuando vuelva la red.

## Paso 8 · Paginación

**¿Qué problema aparece si la función de "cargar más" se dispara varias veces seguidas? ¿Cómo lo evité?**

> `onEndReached` puede dispararse varias veces mientras el usuario está cerca del final y antes de que llegue la respuesta anterior. Si cada disparo pide `page + 1` con el mismo valor de `page`, se baja la misma página repetida veces y se agregan los mismos personajes duplicados (con `key` repetida). Lo evité con un "guardia" al inicio de `loadMore`: si ya estoy cargando (inicial, más elementos o actualizando) o si la API dijo que no hay más páginas, la función retorna sin pedir nada. El estado `loadingMore` se activa antes del `await`, así el segundo disparo ya lo encuentra en verdadero.

## Paso 9 · Pull to refresh

**¿Por qué usé un estado distinto (`refreshing`) y no el mismo de la carga inicial?**

> Porque se ven distinto. En la carga inicial se reemplaza toda la pantalla por un spinner grande (`loading`); al actualizar con el gesto la lista debe seguir visible y solo se muestra el indicador nativo arriba. Si usara el mismo estado, la lista desaparecería en pleno gesto y el `FlatList` se desmontaría. Además me permite saber exactamente cuándo bloquear "cargar más" mientras se actualiza.

## Paso 10 · Búsqueda

1. **¿Qué es el debounce y qué problema resuelve?**

> Es esperar a que el usuario deje de escribir un momento (500 ms aquí) antes de ejecutar la acción. Sin él, cada letra de "rick" lanzaría una petición (r, ri, ric, rick): cuatro peticiones, tres de ellas inútiles, que además saturan la API y hacen parpadear la lista. Con debounce se hace una sola petición con el texto final.

2. **¿Para qué sirve la función de limpieza (cleanup) que se devuelve en un `useEffect`? Da un ejemplo de esta práctica.**

> Se ejecuta antes de que el efecto vuelva a correr y cuando el componente se desmonta, y sirve para deshacer lo que el efecto dejó pendiente (temporizadores, suscripciones, peticiones en curso). En esta práctica: el efecto del debounce programa un `setTimeout` y devuelve `() => clearTimeout(timer)`; cuando el usuario teclea otra letra, React corre la limpieza del efecto anterior y el temporizador viejo se cancela sin llegar a ejecutarse. En la carga inicial uso la limpieza para invalidar la petición que sigue en camino.

3. **Si el usuario escribe rápido y las respuestas llegan en desorden, ¿qué podría salir mal?**

> Que una respuesta vieja y lenta llegue **después** de la más reciente y la pise: por ejemplo, busco "ri" y luego "rick", la respuesta de "rick" llega primero y la de "ri" después, y la pantalla termina mostrando resultados de "ri" aunque el cuadro diga "rick". Lo resolví con un número de petición (`requestId`, un `useRef`): cada búsqueda nueva lo incrementa y, al llegar una respuesta, solo se usa si su número sigue siendo el vigente; si no, se descarta.

## Cierre

**Menciona dos mejoras que le harías a la app si tuvieras una hora más:**

> 
