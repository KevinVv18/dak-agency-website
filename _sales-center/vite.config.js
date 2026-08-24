import { defineConfig } from 'vite'

export default defineConfig({
  // ⚠️ Tiene que ser '/' absoluta, y no es cosmetico.
  //
  // Estuvo en './' para poder abrir el dist/ a doble clic. Con las URLs limpias
  // eso rompe el sitio: desde /prospectos, un './assets/x.js' se resuelve a
  // /prospectos/assets/x.js, que no existe, y sale pantalla en blanco. Solo se
  // nota al recargar en una ruta profunda, que es justo lo que nadie prueba.
  base: '/',

  // Sin publicDir. El muro dejo de ser un .htaccess que viajaba dentro del
  // build y paso a ser la puerta PHP de gate/, que el despliegue coloca en la
  // raiz del docroot mientras este dist/ va dentro de app/. El robots.txt vive
  // alli tambien, porque tiene que servirse sin sesion.
  publicDir: false,
})
