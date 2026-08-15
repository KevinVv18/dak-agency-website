import { fotoUrl, fotoFuentes, CARPETA_ESTUDIO } from '../utils/cloudinary'

// Las 6 fotos que ya viven en el repo. Se conservan como línea familiar.
import fBaby from '../assets/gallery/baby1-min.webp'
import fFamilia from '../assets/gallery/Familia1-min.webp'
import fHermanos from '../assets/gallery/hermanos.webp'
import fMami from '../assets/gallery/mami1-min.webp'
import fPareja from '../assets/gallery/pareja1-min.webp'
import fPediatra from '../assets/gallery/PEDIATRA CORRALES@3x-min.webp'

// Logos de cliente. Solo hay cuatro por ahora; el resto cae al monograma.
// Comprobado que los cuatro son a todo color y se leen sobre el fondo claro de
// la sección — un logo en versión blanca ahí sería invisible.
import lPardo from '../assets/logos/LOGO-MANUEL PARDO@4x-8.webp'
import lGo from '../assets/logos/logo-go.webp'
import lSpa from '../assets/logos/logo-spa-kreativos.svg'
import lProsadis from '../assets/logos/LOGO 1.svg'
import lOasis from '../assets/logos/logo-oasis-dental.webp'
import lUrbanPet from '../assets/logos/logo-urban-pet.webp'
import lBumbum from '../assets/logos/logo-bumbum.webp'
import lRosita from '../assets/logos/logo-cocina-rosita.webp'
// El monograma A+V, no el lockup con la palabra: a 38px el texto no se lee y
// el nombre del cliente ya va impreso al lado. Usa currentColor, que dentro de
// un <img> resuelve a negro, asi que contrasta con la caja blanca del rotulo.
import lAmericanVault from '../assets/logos/logo-american-vault.svg'

/**
 * Logo por cliente. Se indexa por el mismo nombre que muestra la ficha.
 * Para añadir uno: deja el archivo en src/assets/logos/, impórtalo arriba y
 * añade la entrada aquí. Preferible SVG; si es PNG o WebP, con fondo
 * transparente y en su versión a color (no la blanca).
 */
export const LOGOS = {
  'Colegio Manuel Pardo': lPardo,
  'Gran Oportunidad GO!': lGo,
  'Spa Kreativos': lSpa,
  'Prosadis': lProsadis,
  'Oasis Dental': lOasis,
  'The Urban Pet': lUrbanPet,
  'Bumbum': lBumbum,
  'La Cocina de Rosita': lRosita,
  'American Vault': lAmericanVault,
}

/**
 * Iniciales para cuando no hay logo. Se saltan artículos y conectores para que
 * "La Cocina de Rosita" dé CR y no LC.
 */
const IGNORAR = new Set(['la', 'el', 'los', 'las', 'de', 'del', 'the', 'y', '&'])

export const monograma = (nombre = '') =>
  nombre
    .split(/[\s.]+/)
    .filter((p) => p && !IGNORAR.has(p.toLowerCase()))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

/**
 * Catálogo de fotografía del Estudio.
 *
 * ─── CÓMO AÑADIR LAS SESIONES REALES ──────────────────────────────────────
 *
 * 1. Sube los archivos a Cloudinary, a la carpeta `dak/estudio`.
 * 2. El nombre del archivo (sin extensión) tiene que ser exactamente el
 *    `id` que aparece abajo. Da igual si subes .jpg, .png o .webp: con
 *    f_auto, Cloudinary sirve el formato que mejor soporte cada navegador.
 * 3. Cambia `publicado: false` por `true` en esa sesión.
 *
 * No hace falta tocar nada más: ni el componente, ni el tamaño, ni el peso.
 * La rejilla sirve un srcset de 400/700/1000/1400px y el navegador pide el que
 * le toca según su ancho y su densidad; Cloudinary genera cada variante al
 * vuelo. Sube el original tal cual salga de la edición.
 *
 * `publicado: false` es explícito a propósito. Construir la URL de un archivo
 * que todavía no existe daría un 404 y un hueco roto en producción; así la
 * sesión simplemente no se pinta hasta que esté arriba.
 *
 * ─── POR QUÉ COMERCIAL ────────────────────────────────────────────────────
 *
 * La cartera real de DAK es B2B: clínicas, veterinarias, restaurantes, spas,
 * colegios, retail. El sitio enseñaba sobre todo retrato familiar, que es la
 * línea menor. Se invierte el peso: comercial primero, familiar como una
 * línea más.
 */

export const LINEAS = {
  comercial: 'Comercial',
  familiar: 'Familiar',
}

export const sesiones = [
  // ── LÍNEA COMERCIAL — pendiente de subir ────────────────────────────────
  // Orden pensado para que dos sectores parecidos no queden seguidos.
  {
    id: 'oasis-dental-01', w: 900, h: 600, cliente: 'Oasis Dental', sector: 'Clínica dental',
    linea: 'comercial', publicado: true,
    alt: 'Odontóloga de Oasis Dental en su consultorio, junto al sillón dental',
  },
  {
    id: 'oasis-dental-02', w: 900, h: 600, cliente: 'Oasis Dental', sector: 'Clínica dental',
    linea: 'comercial', publicado: true,
    alt: 'Dos odontólogas de Oasis Dental atendiendo a una paciente',
  },
  {
    id: 'al-palo-01', w: 900, h: 1622, cliente: 'Al Palo', sector: 'Restaurante',
    linea: 'comercial', publicado: true,
    alt: 'Chef de Al Palo en el comedor del restaurante, entre plantas y botellas de vino',
  },
  {
    id: 'urban-pet-01', w: 900, h: 1350, cliente: 'The Urban Pet', sector: 'Veterinaria',
    linea: 'comercial', publicado: true,
    alt: 'Clientas de The Urban Pet sosteniendo un caniche blanco en la tienda',
  },
  {
    id: 'urban-pet-02', w: 900, h: 506, cliente: 'The Urban Pet', sector: 'Veterinaria',
    linea: 'comercial', publicado: true,
    alt: 'Perro pomerania en el área de exhibición de The Urban Pet',
  },
  {
    id: 'spa-kreativos-01', w: 900, h: 1200, cliente: 'Spa Kreativos', sector: 'Spa y bienestar',
    linea: 'comercial', publicado: true,
    alt: 'Tratamiento facial y de cejas en Spa Kreativos',
  },
  {
    id: 'spa-kreativos-02', w: 900, h: 675, cliente: 'Spa Kreativos', sector: 'Spa y bienestar',
    linea: 'comercial', publicado: true,
    alt: 'Rótulo de neón de Kreativos Salón & Spa en el interior del local',
  },
  {
    id: 'manuel-pardo-01', w: 900, h: 1350, cliente: 'Colegio Manuel Pardo', sector: 'Educación',
    linea: 'comercial', publicado: true,
    alt: 'Banda de clarinetes del Colegio Manuel Pardo tocando al aire libre',
  },
  {
    id: 'manuel-pardo-02', w: 900, h: 1200, cliente: 'Colegio Manuel Pardo', sector: 'Educación',
    linea: 'comercial', publicado: true,
    alt: 'Ceremonia religiosa con alumnos del Colegio Manuel Pardo en el polideportivo',
  },
  {
    id: 'bumbum-01', w: 900, h: 1350, cliente: 'Bumbum', sector: 'Floristería',
    linea: 'comercial', publicado: true,
    alt: 'Pareja con globos de corazón y un peluche frente a la tienda Bumbum',
  },
  {
    id: 'bumbum-02', w: 900, h: 1350, cliente: 'Bumbum', sector: 'Floristería',
    linea: 'comercial', publicado: true,
    alt: 'Clienta con un ramo frente a la fachada de Bumbum, globos y flores',
  },
  {
    id: 'american-vault-01', w: 900, h: 1205, cliente: 'American Vault', sector: 'Retail',
    linea: 'comercial', publicado: true,
    alt: 'Bolso negro de American Vault fotografiado sobre fondo blanco',
  },
  {
    id: 'american-vault-02', w: 900, h: 1205, cliente: 'American Vault', sector: 'Retail',
    linea: 'comercial', publicado: true,
    alt: 'Bolso marrón de American Vault fotografiado sobre fondo blanco',
  },
  {
    id: 'rosita-01', w: 900, h: 1622, cliente: 'La Cocina de Rosita', sector: 'Restaurante',
    linea: 'comercial', publicado: true,
    alt: 'Cantante en vivo durante un evento en La Cocina de Rosita',
  },
  {
    id: 'bersa-medic-01', w: 900, h: 1200, cliente: 'Bersa Medic', sector: 'Salud',
    linea: 'comercial', publicado: true,
    alt: 'Retrato del Dr. Enrique, de Bersa Medic, con bata blanca',
  },
  {
    id: 'casa-club-01', w: 900, h: 600, cliente: 'Casa Club T&G', sector: 'Inmobiliario',
    linea: 'comercial', publicado: true,
    alt: 'Terraza de Casa Club T&G decorada, con comensales en las mesas',
  },
  {
    id: 'casa-club-02', w: 900, h: 600, cliente: 'Casa Club T&G', sector: 'Inmobiliario',
    linea: 'comercial', publicado: true,
    alt: 'Grupo compartiendo una comida bajo el toldo de Casa Club T&G',
  },
  {
    id: 'prosadis-01', w: 900, h: 1600, cliente: 'Prosadis', sector: 'Distribución',
    linea: 'comercial', publicado: true,
    alt: 'Fachada de Prosadis con su rótulo: Cuidando la Salud de tu Familia',
  },
  {
    id: 'go-01', w: 720, h: 1280, cliente: 'Gran Oportunidad GO!', sector: 'Retail',
    linea: 'comercial', publicado: true,
    alt: 'Sorteo de Gran Oportunidad GO! con las participantes y la urna de premios',
  },
  {
    id: 'go-02', w: 900, h: 1350, cliente: 'Gran Oportunidad GO!', sector: 'Retail',
    linea: 'comercial', publicado: true,
    alt: 'Moto y ruleta de premios en una activación de Gran Oportunidad GO!',
  },

  // ── LÍNEA FAMILIAR — ya en el repo, se sirven en local ───────────────────
  { id: 'pediatra-corrales', w: 900, h: 1600, cliente: 'Pediatría Corrales', sector: 'Salud',
    linea: 'comercial', publicado: true, local: fPediatra,
    alt: 'Equipo médico de Pediatría Corrales sobre fondo blanco' },
  { id: 'familia', w: 1067, h: 1600, cliente: null, sector: 'Retrato familiar',
    linea: 'familiar', publicado: true, local: fFamilia,
    alt: 'Retrato de familia en estudio' },
  { id: 'hermanos', w: 1067, h: 1600, cliente: null, sector: 'Retrato infantil',
    linea: 'familiar', publicado: true, local: fHermanos,
    alt: 'Retrato de dos hermanos sobre fondo navideño' },
  { id: 'pareja', w: 1067, h: 1600, cliente: null, sector: 'Retrato de pareja',
    linea: 'familiar', publicado: true, local: fPareja,
    alt: 'Retrato de pareja en estudio' },
  { id: 'maternidad', w: 1067, h: 1600, cliente: null, sector: 'Maternidad',
    linea: 'familiar', publicado: true, local: fMami,
    alt: 'Sesión de maternidad en estudio' },
  { id: 'newborn', w: 1600, h: 1067, cliente: null, sector: 'Recién nacido',
    linea: 'familiar', publicado: true, local: fBaby,
    alt: 'Sesión de recién nacido en estudio' },
]

/** Solo lo que existe de verdad, en el orden declarado. */
export const sesionesPublicadas = () => sesiones.filter((s) => s.publicado)

/**
 * Fuente de la imagen. Las que ya están en el repo usan su import local; el
 * resto se piden a Cloudinary por su id.
 */
export const srcDeSesion = (sesion, ancho) =>
  sesion.local ? sesion.local : fotoUrl(sesion.id, ancho)

/**
 * srcset/sizes de una sesión, para que cada pantalla pida el ancho que le hace
 * falta. Solo aplica a las de Cloudinary: las seis del repo son un archivo
 * único y no hay variantes que ofrecer, así que devuelven nada y se quedan con
 * su src.
 */
export const fuentesDeSesion = (sesion, medida) =>
  sesion.local ? {} : fotoFuentes(sesion.id, medida)

/** Para el informe de pendientes: qué falta subir y con qué nombre exacto. */
export const pendientes = () =>
  sesiones.filter((s) => !s.publicado).map((s) => ({
    archivo: `${s.id}`,
    ruta: `${CARPETA_ESTUDIO}/${s.id}`,
    cliente: s.cliente,
    sector: s.sector,
  }))
