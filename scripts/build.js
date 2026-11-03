// Arma la carpeta dist/ que publica Vercel. Vercel no sirve node_modules,
// así que los archivos de Day.js se copian a dist/vendor/ y el HTML se
// reescribe para apuntar ahí. En local (Live Server) index.html sigue
// cargando Day.js desde node_modules, como pide el laboratorio.
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const destino = path.join(raiz, "dist");

fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(destino);

fs.cpSync(path.join(raiz, "css"), path.join(destino, "css"), { recursive: true });
fs.cpSync(path.join(raiz, "js"), path.join(destino, "js"), { recursive: true });

const archivosDayjs = ["dayjs.min.js", "locale/es.js"];
archivosDayjs.forEach((archivo) => {
  const salida = path.join(destino, "vendor/dayjs", archivo);
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  fs.copyFileSync(path.join(raiz, "node_modules/dayjs", archivo), salida);
});

const html = fs.readFileSync(path.join(raiz, "index.html"), "utf8");
fs.writeFileSync(
  path.join(destino, "index.html"),
  html.replaceAll("node_modules/dayjs/", "vendor/dayjs/")
);

console.log("Build listo en dist/");
