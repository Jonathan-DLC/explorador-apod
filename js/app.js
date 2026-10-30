// ===== Paso 2.6 · Comprobar que Day.js funciona en español =====
dayjs.locale("es");
console.log(dayjs().format("D [de] MMMM [de] YYYY"));
