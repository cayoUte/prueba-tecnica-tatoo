# Sistema de Consulta de Clima

Prueba técnica: SPA en **React** que consume una **API en Laravel**, la cual a su vez
consulta **OpenWeatherMap**. Permite buscar el clima de una ciudad, guardar cada
consulta en un historial y comentarla.

- **Backend:** Laravel 13 · PHP 8.5 · SQLite · Sanctum (Breeze, stack `api`)
- **Frontend:** React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · React Router 7 · Framer Motion
- **Tests:** 33 tests de feature en PHPUnit (104 aserciones), sin tocar la API externa

## Estructura del repositorio

```
.
├── backend/          API Laravel
│   ├── app/
│   │   ├── Http/     Controllers/Api, Requests (validación), Resources (JSON)
│   │   ├── Models/   Clima, Comentario, User
│   │   └── Services/ Weather/ — única parte que habla con OpenWeatherMap
│   ├── lang/es/      mensajes de validación y de auth en español
│   ├── docs/         colección de Postman
│   └── tests/
└── frontend/         SPA React
    └── src/
        ├── services/     llamadas HTTP (axios vive solo aquí)
        ├── context/      Auth, Clima y Snackbar: el estado en `.tsx`, los tipos y el
        │                 contexto en `.ts`, y el reducer del clima aparte
        ├── hooks/        useWeather, usePronostico, useAuth, useSnackbar, useFormulario
        ├── components/   CitySearch, WeatherList/Card, WeatherDetail, HourlyForecast,
        │                 CommentSection, Snackbar, Logo, WeatherIcon, ui/
        ├── pages/        Login, Registro, Dashboard
        └── utils/        validaciones, formato y clima, sin React
```

La regla de organización es que las capas no se salten: los componentes no importan
`axios` ni los servicios; hablan con los hooks. Los servicios no conocen React.

## Requisitos previos

| Herramienta | Versión | Nota |
|---|---|---|
| PHP | 8.3 o superior | con `openssl`, `curl`, `mbstring`, `pdo_sqlite`, `fileinfo` |
| Composer | 2.x | |
| Node.js | 20.19+ o 22+ | lo exige Vite 8 |

**No hace falta API key ni crear un `.env`.** El repositorio incluye `backend/.env` con
credenciales de demo ya listas. Es una decisión consciente para que la prueba se pueda
ejecutar sin trámites; abajo está el razonamiento completo.

## Instalación

### 1. Backend

```bash
cd backend
composer install
```

El `.env` ya viene en el repositorio, así que no hay que copiarlo ni generar `APP_KEY`.
Crea el archivo de la base de datos y aplica las migraciones:

```bash
touch database/database.sqlite   # en PowerShell: New-Item -ItemType File database\database.sqlite
php artisan migrate
```

Levanta el servidor **en el puerto 8000**:

```bash
php artisan serve
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Queda en `http://localhost:5173`. No necesita `.env`: el código usa
`http://localhost:8000` por defecto. Si tu backend está en otro sitio, crea un `.env`
con `VITE_API_URL=http://otra-url`.

### Los puertos importan

El backend confía en el frontend por su origen. `SANCTUM_STATEFUL_DOMAINS` y
`FRONTEND_URL` en el `.env` apuntan a `localhost:5173`, y CORS permite solo ese origen.
Si Vite arrancara en otro puerto, la sesión dejaría de considerarse "del frontend" y
toda petición autenticada devolvería 401 sin más explicación. Por eso `vite.config.ts`
usa `strictPort: true`: preferimos que falle al arrancar antes que depurar 401 fantasma.

## Cómo usarlo

Regístrate desde `/registro` — no hace falta seeder ni usuario precargado. Buscar una
ciudad requiere sesión; ver el historial no.

## Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/sanctum/csrf-cookie` | público (obligatorio antes de escribir) |
| `POST` | `/register` | público |
| `POST` | `/login` | público |
| `POST` | `/logout` | autenticado |
| `GET` | `/api/user` | autenticado |
| `GET` | `/api/climas` | **público** |
| `GET` | `/api/climas/{id}` | público |
| `GET` | `/api/climas/{id}/pronostico` | público |
| `POST` | `/api/climas` | autenticado |
| `DELETE` | `/api/climas/{id}` | autenticado |
| `POST` | `/api/climas/{id}/comentarios` | autenticado |
| `DELETE` | `/api/comentarios/{id}` | autenticado |

Códigos que devuelve: `200`, `201`, `204`, `401` (sin sesión), `403` (comentario de otro),
`404` (ciudad no encontrada), `422` (validación), `503` (OpenWeatherMap no responde).

Las rutas de autenticación **no** están bajo `/api` porque Breeze las publica en el grupo
`web`: la autenticación por cookies necesita sesión y CSRF.

### Colección de Postman

En `backend/docs/api-clima.postman_collection.json`. Importa, ejecuta primero
"Obtener cookie CSRF" y registra un usuario. Un detalle de configuración: el script
pre-request lee la cookie `XSRF-TOKEN`, y para que Postman lo permita hay que agregar
`localhost` en *Cookies* (bajo el botón Send). Sin eso, los POST responden 419.

## Tests

```bash
cd backend
php artisan test
```

33 tests, 104 aserciones. Cubren los códigos 200/201/401/403/404/422/503, el accessor
`temp_fahrenheit`, el borrado en cascada, el caché y el pronóstico.

Los tests usan `Http::fake()`, así que **no consumen la API externa ni necesitan una key
válida**: `phpunit.xml` inyecta una clave falsa. Eso permite además probar los casos de
error (404 y caída del servicio), que a mano son casi imposibles de reproducir.

## Las credenciales están en el repositorio a propósito

`backend/.env` está versionado, con la clave de OpenWeatherMap y el `APP_KEY` dentro. No es
un descuido: es para que revisar esta prueba cueste un `git clone` y nada más.

El motivo es que el coste de pedirlas supera al riesgo de exponerlas. Registrarse en
OpenWeatherMap obliga a crear una cuenta y esperar: **una clave recién emitida tarda entre
varios minutos y un par de horas en activarse**, y durante ese rato la aplicación responde
`401` sin que quede claro si falla el código o la clave. Eso convierte "probar esto en cinco
minutos" en un trámite con una espera indeterminada.

Qué se expone y hasta dónde llega:

| Credencial | Alcance | Riesgo real |
|---|---|---|
| `OPENWEATHER_KEY` | plan gratuito, solo lectura del clima | agotar la cuota; se rota al terminar la evaluación |
| `APP_KEY` | firma las cookies de sesión | ninguno en local; un despliegue real genera la suya |
| SQLite | se crea vacía con `migrate` | no se versiona, no hay datos de nadie |

**Esto no es lo que haría en un proyecto real.** Ahí `.env` se queda fuera del control de
versiones, en el repositorio solo vive `.env.example` —que sigue estando aquí, sin valores—
y las claves las inyecta el gestor de secretos del entorno. La diferencia es que este
repositorio tiene un único propósito y una vida corta: se lee, se ejecuta y se archiva.

La excepción está declarada en los dos `.gitignore` con un comentario que apunta a esta
sección, y el propio `.env` lleva una cabecera explicando lo mismo, para que nadie lo copie
a otro proyecto dando por hecho que versionarlo es lo normal.

## Decisiones tomadas

**Buscar una ciudad es crear un registro.** El enunciado pide que solo un usuario
autenticado pueda crear registros, y cada búsqueda guarda una consulta. Por coherencia
`POST /api/climas` exige sesión, y por eso el frontend tiene login. La lectura del
historial quedó pública para que se vea sin autenticarse.

**Autenticación por cookies de sesión, no por tokens.** Es lo que genera
`breeze:install api` y el camino que Laravel documenta para SPAs del mismo sitio. A
cambio, el cliente debe pedir `/sanctum/csrf-cookie` antes de escribir y enviar
`withCredentials`. En el frontend eso es una línea: `withXSRFToken: true` hace que axios
lea la cookie en cada petición, lo cual importa porque **Laravel rota el token CSRF al
iniciar sesión** para prevenir session fixation.

**La llamada externa está aislada en `WeatherService`.** No sabe qué es un status HTTP:
lanza `CiudadNoEncontradaException` o `ClimaNoDisponibleException`, y `bootstrap/app.php`
las traduce a 404 y 503. Así el servicio se puede testear sin servidor y los controladores
no tienen un solo `try/catch`.

**503 y no 500 cuando falla OpenWeatherMap.** Un 500 dice "mi código se rompió"; un 503
dice "mi dependencia no está disponible". Es información distinta para quien consume la API.

**Se distinguen dos modos de falla externa.** Si no hay respuesta (DNS, timeout) Guzzle
lanza `ConnectionException` y se atrapa con `try/catch`. Si hay respuesta pero es un 404,
se inspecciona con `$respuesta->notFound()`. Envolver todo en un `try/catch` trataría una
ciudad inexistente como caída de red.

**El caché evita la llamada externa, no el registro.** Si se busca la misma ciudad dos
veces en 10 minutos, OpenWeatherMap se consulta una sola vez, pero ambas búsquedas quedan
en el historial: son dos consultas del usuario. Hay un test que fija ese comportamiento.

**`decimal` en la base y cast a `float` en el modelo.** `decimal(5,2)` es exacto y no
arrastra error de redondeo, pero la base lo devuelve como string `"18.50"`. El cast evita
que el JSON lleve la temperatura entre comillas y que React tenga que parsearla.

**El cliente no puede falsificar autoría.** `Comentario` solo admite `contenido` en
`$fillable`; el clima sale de la URL y el autor de la sesión. Aunque alguien mande
`user_id` en el cuerpo, se descarta.

**Solo el autor borra su comentario (403).** El enunciado pedía "usuario autenticado", así
que esto es más estricto de lo pedido. El resource expone `es_mio` para que la interfaz
no ofrezca un botón que iba a fallar; la regla de verdad sigue en el controlador.

**El historial es una lista de tarjetas, no una tabla.** El enunciado hablaba de una
tabla y al principio lo fue, pero el rediseño la sustituyó por tarjetas: una tabla real
obliga a scroll horizontal en móvil, y cada registro tiene una jerarquía clara
(temperatura, ciudad, condición) que la tarjeta expresa mejor.

**Dashboard de dos columnas con la pantalla fija.** Desde `lg` el historial va a la
izquierda y el detalle de la consulta a la derecha, en proporción áurea (1 : 1.618) a favor
del detalle, que es quien tiene más que mostrar. Ocupan la pantalla completa, sin bordes ni
separación: lo único que las distingue es su color de fondo. En una pantalla de altura
normal no se desplaza nada; solo se desplaza el historial cuando las tarjetas no caben, y
el detalle únicamente si la ventana es demasiado baja para mostrarlo entero.

El contenido del detalle tiene un tope de 672px centrado. La columna da 743px de ancho útil
en una pantalla de 1280 y crece desde ahí, así que sin el tope el contenido se estiraba en
cualquier portátil.

Por debajo de `lg` no caben las dos, así que se convierten en dos pestañas. Una búsqueda
exitosa salta sola a la pestaña del detalle: si no, el resultado quedaría en una pestaña
que no se está viendo.

**El buscador vive en la barra superior**, centrado con un grid de tres columnas en vez de
`justify-between`, para que el logo y el botón de salir no lo desplacen. El botón es solo
un icono: en una barra de 42px no cabe una etiqueta, y el `aria-label` deja claro el
propósito para quien no lo ve.

**Un buscador vacío no es un error.** El campo no aplica la regla `required` en el
navegador. Si está vacío no se busca y tampoco se avisa, porque no hay nada que decir. Las
reglas de longitud sí se comprueban, y en el servidor `ciudad` sigue siendo obligatoria: la
diferencia está en cuándo la interfaz decide molestar, no en lo que el backend acepta.

**Un snackbar concentra las respuestas de la API.** Cada mutación —buscar, eliminar una
consulta, comentar, borrar un comentario— avisa de su resultado con un mensaje deslizante
en la esquina superior derecha, con icono y color por tono. Se conecta en `ClimaProvider`,
que ya era el único punto que orquesta las llamadas, así que no hay que acordarse de avisar
en cada componente.

Quedan fuera dos cosas a propósito. Los errores por campo de un `422` se pintan junto a su
input, porque repetirlos arriba sería decir dos veces lo mismo. Y el fallo al cargar el
historial conserva su `Alert` con botón de reintentar: es un estado persistente con una
acción, no un evento que deba desaparecer solo.

**El estado del clima vive en un reducer, no en `useState` sueltos.** Antes eran cinco
(`climas`, `cargando`, `error`, `consultando`, `eliminandoId`) que se movían juntos y
permitían combinaciones sin sentido, como estar cargando y en error a la vez. Ahora
`clima-context.ts` declara el estado y las once acciones posibles con su payload, y
`clima-reducer.ts` concentra las transiciones.

Dos cosas lo sostienen. La carga del historial es una unión discriminada
(`cargando | listo | fallo`), así que "cargando y fallido" deja de ser representable: no
hay que acordarse de limpiar un campo al tocar otro, el tipo no lo permite. Y el `default`
del reducer asigna la acción a `never`, de modo que agregar una acción y olvidar su caso
es un error de compilación en vez de un bug silencioso.

El contexto expone el estado y las operaciones, pero **no `dispatch`**: las transiciones
válidas salen de esas funciones, que son las que saben hablar con la API. Dejar despachar
desde cualquier componente permitiría marcar un clima como eliminado sin haber llamado al
`DELETE`.

El reducer resuelve las transiciones síncronas; el `await` sigue en el provider. No elimina
el async, lo separa del estado.

**La escala de la interfaz es compacta y única.** Texto de 10px, controles de 30px de alto
y radio de 6px, en formularios, botones y tarjetas. Las clases de tamaño se escriben
completas en un `Record` y nunca con plantillas (`text-${tamano}`): Tailwind escanea los
archivos como texto y una clase construida así jamás llegaría a generarse.

**El pronóstico mezcla dos fuentes porque no hay otra.** El plan gratuito de
OpenWeatherMap solo entrega futuro (`/forecast`, en franjas de 3 horas); las horas pasadas
son un producto de pago. El slider resuelve el pasado con las consultas que ya están en el
historial de esa misma ciudad: son lecturas reales, aunque irregulares, porque solo hay
dato cuando alguien buscó.

**`temp_min` y `temp_max` son nullable.** Se agregaron después, cuando el diseño de la
tarjeta pidió la línea `H:24° L:18°`. Las consultas anteriores a esa migración no las
tienen, así que la interfaz oculta la línea en vez de inventar un valor o dejar un hueco.

**La interfaz es solo oscura.** El diseño de referencia no tiene variante clara, así que
se quitaron el interruptor de tema y todas las clases `dark:` en vez de mantener un modo
que nadie diseñó.

**Skeleton en vez de spinner.** No desplaza el contenido cuando llegan los datos, porque
el hueco ya estaba ocupado.

**La validación está duplicada a propósito.** El navegador valida para no gastar un viaje
y dar feedback inmediato; el servidor valida porque es la única autoridad. Los mensajes del
`422` se pintan en el campo que corresponde.

**Convención de nombres.** Los componentes y hooks conservan los nombres del enunciado
(`CitySearch`, `CommentSection`, `CommentForm`, `useWeather`); `WeatherTable` pasó a ser
`WeatherList` al cambiar la tabla por tarjetas. El dominio y la interfaz están en español,
igual que en el backend (`Clima`, `Comentario`, `ciudad`).

## Problemas que encontré y cómo los resolví

**`cURL error 60` al llamar a OpenWeatherMap.** El PHP instalado a mano en Windows no
traía bundle de certificados CA, así que toda petición HTTPS fallaba al validar el
certificado — Composer funcionaba porque trae su propio bundle. Se arregla descargando
[cacert.pem](https://curl.se/ca/cacert.pem) y apuntando `curl.cainfo` y `openssl.cafile`
en el `php.ini`. Es configuración de la máquina, no del proyecto: con Herd, XAMPP, Laragon,
Linux o macOS no aparece. Añadí el `Log::warning` que le faltaba a la rama de
`ConnectionException` justamente porque el mensaje real de cURL no quedaba registrado.

**419 en lugar de 401 al probar con PowerShell.** El token CSRF cambia al iniciar sesión.
Mi script lo capturaba una vez y lo reutilizaba. Es el mismo problema que axios resuelve
solo releyendo la cookie en cada petición.

**500 al repetir una consulta: la caché devolvía objetos rotos.** `Cache::remember`
guardaba el DTO ya construido (`WeatherData`). Con el store de base de datos el objeto se
serializa, y al releerlo volvía como `__PHP_Incomplete_Class`: buscar la misma ciudad dos
veces dentro de los 10 minutos de caché reventaba con un 500. Lo encontré al añadir el
pronóstico, pero el fallo ya estaba en `consultar()`. Ahora la caché guarda el payload
crudo y el DTO se construye al leer, lo que además inmuniza las entradas viejas frente a
un cambio de forma de la clase. Los tests no lo reproducen por el driver —en `phpunit.xml`
la caché es `array` y no serializa—, así que fijan el invariante que lo evita: lo que entra
a la caché tiene que ser un array sin objetos.

**`react-hooks/set-state-in-effect`.** El hook llamaba a `setCargando(true)` de forma
sincrónica dentro del efecto, lo que provoca un render en cascada. Se reescribió para
poner el estado desde los callbacks de la promesa, que es el patrón que la regla acepta, y
de paso se agregó un guard para no actualizar estado después de desmontar.

## Qué me faltó o qué haría diferente con más tiempo

- **Tests de frontend.** No hay ninguno. Con más tiempo: Vitest + Testing Library sobre
  `climaReducer`, que al ser una función pura se prueba pasándole un estado y una acción,
  sin montar React ni simular la red; `ClimaProvider` con `msw` para los caminos de error;
  y `HourlyForecast`, que arma el slider mezclando historial y pronóstico.
- **Los iconos del clima se deducen del texto.** `utils/clima.ts` mapea la descripción en
  español de OpenWeatherMap a uno de siete dibujos buscando palabras clave. El servicio
  devuelve además un código de icono (`weather.0.icon`) que sería más fiable y no dependería
  del idioma; no lo estoy guardando.
- **Paginación del historial.** `GET /api/climas` devuelve todo. Con muchos registros hay
  que paginar; en Laravel es cambiar `get()` por `paginate()`, y en el frontend manejar
  `meta`/`links`. Lo dejé fuera para no complicar el consumo en React.
- **React Query.** El manejo de carga, error y refresco está escrito a mano entre el
  reducer y el provider. Es explícito y se lee bien, pero React Query daría caché,
  revalidación y deduplicación gratis.
- **Traducción completa de Laravel.** `lang/es` cubre solo las reglas que la API usa; el
  resto cae al inglés por `APP_FALLBACK_LOCALE`.
- **Refresco del historial entre pestañas.** Si dos pestañas están abiertas, una no ve las
  búsquedas de la otra hasta recargar.
- **Docker y CI.** Un `docker-compose` evitaría todo el episodio de los certificados, y un
  workflow de GitHub Actions correría `php artisan test` y `npm run lint` en cada push.
