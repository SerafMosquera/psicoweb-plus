// app.js - Funcionalidades globales de PsicoWeb Plus
console.log("PsicoWeb Plus cargado correctamente");

// Guarda un valor en localStorage
function guardarDato(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

// Obtiene un valor de localStorage
function obtenerDato(clave) {
  const dato = localStorage.getItem(clave);
  return dato ? JSON.parse(dato) : null;
}
