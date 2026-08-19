import { defineConfig } from 'vite'

export default defineConfig({
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
