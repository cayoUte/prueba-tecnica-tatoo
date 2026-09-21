# Sistema de Consulta de Clima

Prueba técnica: SPA en **React** que consume una **API en Laravel**, la cual a su vez
consulta **OpenWeatherMap**. Permite buscar el clima de una ciudad, guardar cada
consulta en un historial y comentarla.

- **Backend:** Laravel 13 · PHP 8.5 · SQLite · Sanctum (Breeze, stack `api`)
- **Frontend:** React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · React Router 7 · Framer Motion
- **Tests:** 23 tests de feature en PHPUnit (66 aserciones), sin tocar la API externa

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
        ├── hooks/        useWeather, useAuth, useFormulario, useTheme
        ├── components/   CitySearch, WeatherTable, CommentSection, CommentForm, ui/
        ├── pages/        Login, Registro, Dashboard
        └── utils/        validaciones y formato, sin React
```

La regla de organización es que las capas no se salten: los componentes no importan
`axios` ni los servicios; hablan con los hooks. Los servicios no conocen React.

## Requisitos previos

| Herramienta | Versión | Nota |
|---|---|---|
| PHP | 8.3 o superior | con `openssl`, `curl`, `mbstring`, `pdo_sqlite`, `fileinfo` |
| Composer | 2.x | |
| Node.js | 20.19+ o 22+ | lo exige Vite 8 |
| API key | — | gratuita en [openweathermap.org/api](https://openweathermap.org/api) |

La API key nueva puede tardar entre minutos y un par de horas en activarse.

## Instalación

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env          # en PowerShell: Copy-Item .env.example .env
php artisan key:generate
```

Crea el archivo de la base de datos y aplica las migraciones:

```bash
touch database/database.sqlite   # en PowerShell: New-Item -ItemType File database\database.sqlite
php artisan migrate
```

Abre `.env` y pon tu API key:

```dotenv
OPENWEATHER_KEY=tu_api_key_aqui
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

23 tests, 66 aserciones. Cubren los códigos 200/201/401/403/404/422/503, el accessor
`temp_fahrenheit`, el borrado en cascada y el caché.

Los tests usan `Http::fake()`, así que **no consumen la API externa ni necesitan una key
válida**: `phpunit.xml` inyecta una clave falsa. Eso permite además probar los casos de
error (404 y caída del servicio), que a mano son casi imposibles de reproducir.

## Decisiones tomadas

**Buscar una ciudad es crear un registro.** El enunciado pide que solo un usuario
autenticado pueda crear registros, y cada búsqueda guarda una consulta. Por coherencia
`POST /api/climas` exige sesión, y por eso el frontend tiene login. La lectura del
historial quedó pública para que la tabla se vea sin autenticarse.

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

**La tabla es una rejilla CSS, no un `<table>`.** Una tabla real obliga a scroll
horizontal en móvil. Con Grid hay un solo markup: en móvil son dos columnas donde cada
celda muestra su etiqueta, y desde `md` son seis columnas con cabecera.

**Skeleton en vez de spinner.** No desplaza el contenido cuando llegan los datos, porque
el hueco ya estaba ocupado.

**La validación está duplicada a propósito.** El navegador valida para no gastar un viaje
y dar feedback inmediato; el servidor valida porque es la única autoridad. Los mensajes del
`422` se pintan en el campo que corresponde.

**Convención de nombres.** Los componentes y hooks usan los nombres del enunciado
(`WeatherTable`, `CitySearch`, `CommentSection`, `CommentForm`, `useWeather`); el dominio y
la interfaz están en español, igual que en el backend (`Clima`, `Comentario`, `ciudad`).

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

**`react-hooks/set-state-in-effect`.** El hook llamaba a `setCargando(true)` de forma
sincrónica dentro del efecto, lo que provoca un render en cascada. Se reescribió para
poner el estado desde los callbacks de la promesa, que es el patrón que la regla acepta, y
de paso se agregó un guard para no actualizar estado después de desmontar.

## Qué me faltó o qué haría diferente con más tiempo

- **Tests de frontend.** No hay ninguno. Con más tiempo: Vitest + Testing Library sobre
  `CitySearch` (validación en tiempo real) y `useWeather` (los tres estados con `msw`).
- **Paginación del historial.** `GET /api/climas` devuelve todo. Con muchos registros hay
  que paginar; en Laravel es cambiar `get()` por `paginate()`, y en el frontend manejar
  `meta`/`links`. Lo dejé fuera para no complicar el consumo en React.
- **React Query.** El manejo de carga, error y refresco está escrito a mano en
  `useWeather`. Es explícito y se lee bien, pero React Query daría caché, revalidación y
  deduplicación gratis.
- **Traducción completa de Laravel.** `lang/es` cubre solo las reglas que la API usa; el
  resto cae al inglés por `APP_FALLBACK_LOCALE`.
- **Iconos del clima.** OpenWeatherMap devuelve un código de icono que no estoy usando;
  mostrarlo haría la tabla mucho más legible de un vistazo.
- **Refresco del historial entre pestañas.** Si dos pestañas están abiertas, una no ve las
  búsquedas de la otra hasta recargar.
- **Docker y CI.** Un `docker-compose` evitaría todo el episodio de los certificados, y un
  workflow de GitHub Actions correría `php artisan test` y `npm run lint` en cada push.
