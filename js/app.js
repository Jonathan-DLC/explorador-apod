dayjs.locale("es");

// La API vieja (api.nasa.gov/planetary/apod con DEMO_KEY) devuelve el logo
// de la NASA en vez de la foto; esta es la que pide el laboratorio.
const URL_API = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";
const PRIMERA_APOD = "1995-06-16";
const CLAVE_FAVORITOS = "favoritosApod";
const FORMATO_INPUT = "YYYY-MM-DD";
const FORMATO_LEGIBLE = "D [de] MMMM [de] YYYY";

const inputFecha = document.getElementById("input-fecha");
const btnBuscar = document.getElementById("btn-buscar");
const btnHoy = document.getElementById("btn-hoy");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const mensajeEstado = document.getElementById("mensaje-estado");
const contenedorApod = document.getElementById("contenedor-apod");
const apodFecha = document.getElementById("apod-fecha");
const apodTitulo = document.getElementById("apod-titulo");
const apodImagen = document.getElementById("apod-imagen");
const apodEnlaceVideo = document.getElementById("apod-enlace-video");
const apodExplicacion = document.getElementById("apod-explicacion");
const btnFavorito = document.getElementById("btn-favorito");
const mensajeFavoritos = document.getElementById("mensaje-favoritos");
const listaFavoritos = document.getElementById("lista-favoritos");

let apodActual = null;
// Se guarda aparte de apodActual para que ◀◀ / ▶▶ sigan funcionando
// desde una fecha que dio 404 (ahí apodActual queda en null).
let fechaSeleccionada = null;
// Si se hacen varios clics seguidos, solo se pinta la última respuesta.
let numeroPeticion = 0;
let temporizadorFavoritos = null;

/* ---------- Fechas ---------- */

function hoy() {
  return dayjs().format(FORMATO_INPUT);
}

function formatearFechaLegible(fecha) {
  return dayjs(fecha).format(FORMATO_LEGIBLE);
}

function validarFecha(fecha) {
  if (!fecha) {
    return "Elige una fecha antes de buscar.";
  }
  if (!dayjs(fecha).isValid()) {
    return "Esa fecha no es válida.";
  }
  if (dayjs(fecha).isAfter(dayjs(), "day")) {
    return "Esa fecha es futura: la NASA todavía no publica esa APOD.";
  }
  if (dayjs(fecha).isBefore(dayjs(PRIMERA_APOD), "day")) {
    return "La primera APOD es del 16 de junio de 1995. Elige una fecha desde ese día.";
  }
  return "";
}

/* ---------- Mensajes en pantalla ---------- */

function mostrarMensaje(texto, esError = false) {
  mensajeEstado.textContent = texto;
  mensajeEstado.classList.toggle("error", esError);
  mensajeEstado.classList.remove("oculto");
}

function ocultarMensaje() {
  mensajeEstado.classList.add("oculto");
}

function mostrarAvisoFavoritos(texto) {
  mensajeFavoritos.textContent = texto;
  mensajeFavoritos.classList.remove("oculto");
  clearTimeout(temporizadorFavoritos);
  temporizadorFavoritos = setTimeout(() => {
    mensajeFavoritos.classList.add("oculto");
  }, 3000);
}

/* ---------- API ---------- */

async function pedirApod(fecha) {
  // Sin fecha se pide la última publicada: la de "hoy" en la NASA puede
  // no existir aún por la diferencia horaria, así que no se arma con hoy().
  const url = fecha
    ? `${URL_API}/${dayjs(fecha).format("YYMMDD")}`
    : `${URL_API}?per_page=1`;

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error("No hay APOD para esa fecha");
  }
  const datos = await respuesta.json();
  return fecha ? datos : datos[0];
}

async function cargarApod(fecha) {
  const peticion = ++numeroPeticion;
  if (fecha) {
    fechaSeleccionada = fecha;
    inputFecha.value = fecha;
  }
  actualizarNavegacion();
  mostrarMensaje("Cargando…");
  contenedorApod.classList.add("oculto");

  try {
    const apod = await pedirApod(fecha);
    if (peticion !== numeroPeticion) return;

    apodActual = apod;
    fechaSeleccionada = apod.date;
    inputFecha.value = apod.date;
    mostrarApod(apod);
    ocultarMensaje();
  } catch (error) {
    if (peticion !== numeroPeticion) return;

    apodActual = null;
    // fetch lanza TypeError cuando no hay conexión; ese mensaje viene en inglés.
    const texto = error instanceof TypeError
      ? "No se pudo conectar con la NASA. Revisa tu conexión e inténtalo de nuevo."
      : error.message;
    mostrarMensaje(texto, true);
  } finally {
    if (peticion === numeroPeticion) actualizarNavegacion();
  }
}

/* ---------- Mostrar la APOD ---------- */

function mostrarApod(apod) {
  apodTitulo.textContent = apod.title;
  apodFecha.textContent = formatearFechaLegible(apod.date);
  mostrarImagen(apod);
  mostrarEnlaceVideo(apod);
  // explanation trae HTML de la NASA (negritas y enlaces): con textContent
  // se verían las etiquetas.
  apodExplicacion.innerHTML = apod.explanation;
  abrirEnlacesEnOtraPestana(apodExplicacion);
  actualizarBotonFavorito();
  contenedorApod.classList.remove("oculto");
}

function mostrarImagen(apod) {
  // El campo url es la página del artículo, no la imagen: se usa hdurl.
  if (apod.hdurl) {
    apodImagen.src = apod.hdurl;
    apodImagen.alt = apod.title;
    apodImagen.classList.remove("oculto");
  } else {
    apodImagen.removeAttribute("src");
    apodImagen.classList.add("oculto");
  }
}

function mostrarEnlaceVideo(apod) {
  const esVideo = apod.media_type === "video";
  apodEnlaceVideo.href = esVideo ? apod.permalink : "#";
  apodEnlaceVideo.classList.toggle("oculto", !esVideo);
}

// Así un clic en la explicación no saca a la persona de la página.
function abrirEnlacesEnOtraPestana(contenedor) {
  contenedor.querySelectorAll("a").forEach((enlace) => {
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
  });
}

/* ---------- Búsqueda y navegación ---------- */

function buscarPorFecha() {
  const fecha = inputFecha.value;
  const error = validarFecha(fecha);
  if (error) {
    mostrarMensaje(error, true);
    return;
  }
  cargarApod(fecha);
}

function cambiarDia(dias) {
  const base = fechaSeleccionada || hoy();
  const nuevaFecha = dayjs(base).add(dias, "day").format(FORMATO_INPUT);
  if (validarFecha(nuevaFecha)) return;
  cargarApod(nuevaFecha);
}

function actualizarNavegacion() {
  const fecha = fechaSeleccionada || hoy();
  btnAnterior.disabled = !dayjs(fecha).isAfter(dayjs(PRIMERA_APOD), "day");
  btnSiguiente.disabled = !dayjs(fecha).isBefore(dayjs(), "day");
}

/* ---------- Favoritos ---------- */

function leerFavoritos() {
  const guardados = localStorage.getItem(CLAVE_FAVORITOS);
  if (!guardados) return [];
  try {
    return JSON.parse(guardados);
  } catch {
    return [];
  }
}

function guardarFavoritos(favoritos) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
}

function esFavorito(fecha) {
  return leerFavoritos().some((favorito) => favorito.date === fecha);
}

function agregarFavorito() {
  if (!apodActual) return;

  if (esFavorito(apodActual.date)) {
    mostrarAvisoFavoritos("Esta APOD ya está en tus favoritos.");
    return;
  }

  const favoritos = leerFavoritos();
  favoritos.push({ date: apodActual.date, title: apodActual.title });
  guardarFavoritos(favoritos);
  mostrarAvisoFavoritos("APOD guardada en favoritos.");
  renderizarFavoritos();
  actualizarBotonFavorito();
}

function eliminarFavorito(fecha) {
  const favoritos = leerFavoritos().filter((favorito) => favorito.date !== fecha);
  guardarFavoritos(favoritos);
  renderizarFavoritos();
  actualizarBotonFavorito();
}

function actualizarBotonFavorito() {
  const guardada = apodActual !== null && esFavorito(apodActual.date);
  btnFavorito.classList.toggle("guardado", guardada);
  btnFavorito.textContent = guardada ? "⭐ En favoritos" : "⭐ Guardar en favoritos";
}

function crearItemFavorito(favorito) {
  const item = document.createElement("li");
  item.className = "item-favorito";

  const btnCargar = document.createElement("button");
  btnCargar.type = "button";
  btnCargar.className = "btn-cargar-favorito";
  btnCargar.dataset.fecha = favorito.date;

  const fecha = document.createElement("span");
  fecha.className = "fav-fecha";
  fecha.textContent = formatearFechaLegible(favorito.date);

  const titulo = document.createElement("span");
  titulo.className = "fav-titulo";
  titulo.textContent = favorito.title;

  const btnEliminar = document.createElement("button");
  btnEliminar.type = "button";
  btnEliminar.className = "btn-eliminar-fav";
  btnEliminar.dataset.fecha = favorito.date;
  btnEliminar.textContent = "Quitar";
  btnEliminar.setAttribute("aria-label", `Quitar ${favorito.title} de favoritos`);

  btnCargar.append(fecha, titulo);
  item.append(btnCargar, btnEliminar);
  return item;
}

function renderizarFavoritos() {
  const favoritos = leerFavoritos();
  listaFavoritos.innerHTML = "";

  if (favoritos.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "favoritos-vacio";
    vacio.textContent = "Todavía no guardas ninguna APOD.";
    listaFavoritos.append(vacio);
    return;
  }

  favoritos.forEach((favorito) => {
    listaFavoritos.append(crearItemFavorito(favorito));
  });
}

function manejarClicFavoritos(evento) {
  const btnEliminar = evento.target.closest(".btn-eliminar-fav");
  if (btnEliminar) {
    eliminarFavorito(btnEliminar.dataset.fecha);
    return;
  }

  const btnCargar = evento.target.closest(".btn-cargar-favorito");
  if (btnCargar) {
    cargarApod(btnCargar.dataset.fecha);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ---------- Inicio ---------- */

function iniciar() {
  // max se asigna aquí porque cambia cada día; igual se valida en JS
  // porque la fecha se puede escribir a mano.
  inputFecha.max = hoy();

  btnBuscar.addEventListener("click", buscarPorFecha);
  inputFecha.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") buscarPorFecha();
  });
  btnHoy.addEventListener("click", () => cargarApod());
  btnAnterior.addEventListener("click", () => cambiarDia(-1));
  btnSiguiente.addEventListener("click", () => cambiarDia(1));
  btnFavorito.addEventListener("click", agregarFavorito);
  listaFavoritos.addEventListener("click", manejarClicFavoritos);

  renderizarFavoritos();
  cargarApod();
}

iniciar();
