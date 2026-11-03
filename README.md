# Explorador APOD

Página web para explorar la **Astronomy Picture of the Day (APOD)** de la NASA: la imagen o video del universo que la NASA publica cada día desde el 16 de junio de 1995, con su explicación científica.

El diseño imita un televisor de tubo de los años 80: la foto se ve en la pantalla, la fecha aparece como el sello de una videocámara y para cambiar de día se usan botones de VHS (◀◀ y ▶▶).

## Funcionalidades

- **Foto del día**: al abrir la página se carga la APOD más reciente, con título, fecha en español, imagen y explicación.
- **Búsqueda por fecha**: se puede ver la APOD de cualquier día. Antes de llamar a la API se revisa que la fecha:
  - no esté vacía,
  - no sea futura,
  - no sea anterior al 16 de junio de 1995.
- **Videos**: cuando la APOD es un video, se muestra su imagen de vista previa y un enlace para verlo en el sitio de la NASA.
- **Favoritos**: se guardan en `localStorage` (solo la fecha y el título), no se repiten y siguen ahí al recargar la página. Al hacer clic en uno se carga esa APOD, y también se puede quitar de la lista.
- **Navegación por días**: botones *Día anterior* y *Día siguiente*, que no dejan pasar de hoy ni ir antes de la primera APOD.
- **Mensajes en pantalla**: "Cargando…" mientras llega la respuesta, y avisos visibles cuando hay errores (por ejemplo, un día sin APOD o sin conexión).
- **Diseño adaptable** con Flexbox: en celular los favoritos pasan debajo de la foto.

## Tecnologías

- HTML, CSS y JavaScript (sin frameworks)
- [npm](https://www.npmjs.com/) para manejar las dependencias
- [Day.js](https://day.js.org/) para formatear, comparar y validar fechas
- `fetch` con `async/await` y `try/catch`
- `localStorage` y JSON para los favoritos

## Cómo ejecutarlo

Necesitas [Node.js](https://nodejs.org/) (trae npm) y un servidor local, por ejemplo la extensión **Live Server** de VS Code.

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Jonathan-DLC/explorador-apod.git
   ```

2. Entra a la carpeta e instala las dependencias (`node_modules` no se sube al repositorio):

   ```bash
   cd explorador-apod
   ```

   ```bash
   npm install
   ```

3. Abre `index.html` con Live Server (clic derecho → *Open with Live Server*).

> Day.js se carga desde `node_modules`, así que si ves el error `dayjs is not defined`, revisa que hayas ejecutado `npm install`.

## API

Se usa la API pública de APOD del sitio de la NASA, que no necesita API key:

| Para qué | URL | Respuesta |
|---|---|---|
| La APOD más reciente | `https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1` | Un arreglo con una APOD |
| La APOD de una fecha | `https://science.nasa.gov/wp-json/wp/v2/apod-basic/AAMMDD` | Un objeto con la APOD |
| Un día sin APOD | La misma URL de una fecha | Error 404 |

Campos que usa la página: `title`, `date`, `hdurl` (la imagen), `media_type`, `explanation` (viene en HTML) y `permalink`.

## Notas

- Las explicaciones vienen en inglés, tal como las publica la NASA.
- Algunas fechas antiguas (sobre todo antes de 2001) muestran una imagen genérica de la NASA en lugar de la foto original; así vienen desde la API.

## Autor

Jonathan Lozano — proyecto del laboratorio *Using NPM – End of module Assessment*.

Las imágenes y textos son de la API pública APOD de la NASA.
