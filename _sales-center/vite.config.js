import { defineConfig } from 'vite'

export default defineConfig({
  // ⚠️ Tiene que ser '/' absoluta, y no es cosmetico.
  //
  // Estuvo en './' para poder abrir el dist/ a doble clic. Con las URLs limpias
  // eso rompe el sitio: desde /prospectos, un './assets/x.js' se resuelve a
  // /prospectos/assets/x.js, que no existe, y sale pantalla en blanco. Solo se
  // nota al recargar en una ruta profunda, que es justo lo que nadie prueba.
  base: '/',

  // El .htaccess con el Basic Auth y el robots.txt viven en publico/ y Vite los
  // copia a dist/ en cada build.
  //
  // Podrian copiarse en el workflow, pero entonces dependerian de que el paso
  // siga ahi: quien despliegue a mano desde su PC subiria el panel SIN el muro
  // y sin enterarse. Saliendo del build, no hay forma de producir un dist/ que
  // no lleve su .htaccess.
  //
  // Se llama publico/ y no public/ solo porque el nombre por defecto invita a
  // meter ahi imagenes; aqui dentro no hay assets, hay configuracion de servidor.
  publicDir: 'publico',
})
