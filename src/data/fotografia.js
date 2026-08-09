import { fotoUrl, CARPETA_ESTUDIO } from '../utils/cloudinary'

// Las 6 fotos que ya viven en el repo. Se conservan como línea familiar.
import fBaby from '../assets/gallery/baby1-min.webp'
import fFamilia from '../assets/gallery/Familia1-min.webp'
import fHermanos from '../assets/gallery/hermanos.webp'
import fMami from '../assets/gallery/mami1-min.webp'
import fPareja from '../assets/gallery/pareja1-min.webp'
import fPediatra from '../assets/gallery/PEDIATRA CORRALES@3x-min.webp'

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
 * `fotoUrl()` pide la variante que toca según el viewport (900px en móvil,
 * 1600px en escritorio) y Cloudinary la genera al vuelo.
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
    id: 'oasis-dental-01', cliente: 'Oasis Dental', sector: 'Clínica dental',
    linea: 'comercial', publicado: true,
    alt: 'Odontóloga de Oasis Dental en su consultorio, junto al sillón dental',
  },
  {
    id: 'oasis-dental-02', cliente: 'Oasis Dental', sector: 'Clínica dental',
    linea: 'comercial', publicado: true,
    alt: 'Dos odontólogas de Oasis Dental atendiendo a una paciente',
  },
  {
    id: 'al-palo-01', cliente: 'Al Palo', sector: 'Restaurante',
    linea: 'comercial', publicado: true,
    alt: 'Chef de Al Palo en el comedor del restaurante, entre plantas y botellas de vino',
  },
  {
    id: 'al-palo-02', cliente: 'Al Palo', sector: 'Restaurante',
    linea: 'comercial', publicado: false,
    alt: 'Preparación en la cocina de Al Palo',
  },
  {
    id: 'urban-pet-01', cliente: 'The Urban Pet', sector: 'Veterinaria',
    linea: 'comercial', publicado: true,
    alt: 'Clientas de The Urban Pet sosteniendo un caniche blanco en la tienda',
  },
  {
    id: 'urban-pet-02', cliente: 'The Urban Pet', sector: 'Veterinaria',
    linea: 'comercial', publicado: true,
    alt: 'Perro pomerania en el área de exhibición de The Urban Pet',
  },
  {
    id: 'spa-kreativos-01', cliente: 'Spa Kreativos', sector: 'Spa y bienestar',
    linea: 'comercial', publicado: true,
    alt: 'Tratamiento facial y de cejas en Spa Kreativos',
  },
  {
    id: 'spa-kreativos-02', cliente: 'Spa Kreativos', sector: 'Spa y bienestar',
    linea: 'comercial', publicado: false,
    alt: 'Tratamiento en curso en Spa Kreativos',
  },
  {
    id: 'manuel-pardo-01', cliente: 'Colegio Manuel Pardo', sector: 'Educación',
    linea: 'comercial', publicado: true,
    alt: 'Banda de clarinetes del Colegio Manuel Pardo tocando al aire libre',
  },
  {
    id: 'manuel-pardo-02', cliente: 'Colegio Manuel Pardo', sector: 'Educación',
    linea: 'comercial', publicado: true,
    alt: 'Ceremonia religiosa con alumnos del Colegio Manuel Pardo en el polideportivo',
  },
  {
    id: 'bumbum-01', cliente: 'Bumbum', sector: 'Floristería',
    linea: 'comercial', publicado: true,
    alt: 'Pareja con globos de corazón y un peluche frente a la tienda Bumbum',
  },
  {
    id: 'bumbum-02', cliente: 'Bumbum', sector: 'Floristería',
    linea: 'comercial', publicado: true,
    alt: 'Clienta con un ramo frente a la fachada de Bumbum, globos y flores',
  },
  {
    id: 'american-vault-01', cliente: 'American Vault', sector: 'Retail',
    linea: 'comercial', publicado: true,
    alt: 'Bolso negro de American Vault fotografiado sobre fondo blanco',
  },
  {
    id: 'american-vault-02', cliente: 'American Vault', sector: 'Retail',
    linea: 'comercial', publicado: true,
    alt: 'Bolso marrón de American Vault fotografiado sobre fondo blanco',
  },
  {
    id: 'rosita-01', cliente: 'La Cocina de Rosita', sector: 'Restaurante',
    linea: 'comercial', publicado: true,
    alt: 'Cantante en vivo durante un evento en La Cocina de Rosita',
  },
  {
    id: 'beauty-house-01', cliente: 'Beauty House', sector: 'Estética',
    linea: 'comercial', publicado: false,
    alt: 'Sala de Beauty House',
  },
  {
    id: 'jenny-rodriguez-01', cliente: 'Dra. Jenny Rodríguez', sector: 'Salud',
    linea: 'comercial', publicado: false,
    alt: 'Dra. Jenny Rodríguez en su consulta',
  },
  {
    id: 'bersa-medic-01', cliente: 'Bersa Medic', sector: 'Salud',
    linea: 'comercial', publicado: true,
    alt: 'Retrato del Dr. Enrique, de Bersa Medic, con bata blanca',
  },
  {
    id: 'casa-club-01', cliente: 'Casa Club T&G', sector: 'Inmobiliario',
    linea: 'comercial', publicado: true,
    alt: 'Terraza de Casa Club T&G decorada, con comensales en las mesas',
  },
  {
    id: 'casa-club-02', cliente: 'Casa Club T&G', sector: 'Inmobiliario',
    linea: 'comercial', publicado: true,
    alt: 'Grupo compartiendo una comida bajo el toldo de Casa Club T&G',
  },
  {
    id: 'prosadis-01', cliente: 'Prosadis', sector: 'Distribución',
    linea: 'comercial', publicado: true,
    alt: 'Fachada de Prosadis con su rótulo: Cuidando la Salud de tu Familia',
  },
  {
    id: 'titan-01', cliente: 'Titan', sector: 'Industria',
    linea: 'comercial', publicado: false,
    alt: 'Instalación de Titan',
  },
  {
    id: 'go-01', cliente: 'Gran Oportunidad GO!', sector: 'Retail',
    linea: 'comercial', publicado: true,
    alt: 'Sorteo de Gran Oportunidad GO! con las participantes y la urna de premios',
  },
  {
    id: 'go-02', cliente: 'Gran Oportunidad GO!', sector: 'Retail',
    linea: 'comercial', publicado: true,
    alt: 'Moto y ruleta de premios en una activación de Gran Oportunidad GO!',
  },

  // ── LÍNEA FAMILIAR — ya en el repo, se sirven en local ───────────────────
  { id: 'pediatra-corrales', cliente: 'Pediatría Corrales', sector: 'Salud',
    linea: 'comercial', publicado: true, local: fPediatra,
    alt: 'Equipo médico de Pediatría Corrales sobre fondo blanco' },
  { id: 'familia', cliente: null, sector: 'Retrato familiar',
    linea: 'familiar', publicado: true, local: fFamilia,
    alt: 'Retrato de familia en estudio' },
  { id: 'hermanos', cliente: null, sector: 'Retrato infantil',
    linea: 'familiar', publicado: true, local: fHermanos,
    alt: 'Retrato de dos hermanos sobre fondo navideño' },
  { id: 'pareja', cliente: null, sector: 'Retrato de pareja',
    linea: 'familiar', publicado: true, local: fPareja,
    alt: 'Retrato de pareja en estudio' },
  { id: 'maternidad', cliente: null, sector: 'Maternidad',
    linea: 'familiar', publicado: true, local: fMami,
    alt: 'Sesión de maternidad en estudio' },
  { id: 'newborn', cliente: null, sector: 'Recién nacido',
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

/** Para el informe de pendientes: qué falta subir y con qué nombre exacto. */
export const pendientes = () =>
  sesiones.filter((s) => !s.publicado).map((s) => ({
    archivo: `${s.id}`,
    ruta: `${CARPETA_ESTUDIO}/${s.id}`,
    cliente: s.cliente,
    sector: s.sector,
  }))
