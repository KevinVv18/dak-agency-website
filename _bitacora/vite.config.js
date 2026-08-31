import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ⚠️ Tiene que ser '/' absoluta, y no es cosmetico.
  //
  // Con URLs limpias, un './assets/x.js' se resuelve desde /cierre a
  // /cierre/assets/x.js, que no existe, y sale pantalla en blanco. Solo se nota
  // al recargar en una ruta profunda, que es justo lo que nadie prueba.
  base: '/',

  // Sin publicDir. El muro no viaja dentro del build: es la puerta PHP de gate/,
  // que el despliegue coloca en la raiz del docroot mientras este dist/ va dentro
  // de app/. Lo que tenga que servirse sin sesion —robots.txt— vive alli.
  publicDir: false,

  server: {
    // En local no hay puerta PHP. Para trabajar contra la API de verdad se
    // levanta `php -S localhost:8080 -t publicar` y se apunta aqui.
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: false },
    },
  },
})
