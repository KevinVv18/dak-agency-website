// Scroll suave a una sección por selector (#contact, #projects, etc.).
// Reintenta hasta ~3s si la sección aún no montó (secciones lazy-loaded
// o navegación desde otra ruta). Evita que el click "no haga nada".
export function scrollToSection(selector, block = 'start', attempts = 30) {
  const el = document.querySelector(selector)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block })
    return
  }
  if (attempts > 0) {
    setTimeout(() => scrollToSection(selector, block, attempts - 1), 100)
  }
}
