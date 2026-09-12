/**
 * El Taller: las piezas gráficas reales que hay en el repo.
 *
 * Antes esto era `galleryData.js` y cargaba tres cosas distintas —piezas de
 * cliente, portadas y un carrusel decorativo de muestras de la propia DAK— que
 * la página pintaba en tres secciones como si fueran lo mismo. Ahora son un
 * solo archivo ordenado, y las muestras de DAK se quedaron fuera: mezclarlas
 * con el trabajo de clientes es la deuda nº 2 que DESIGN.md ya declara.
 * Los ficheros siguen en `src/assets/dak/`, simplemente no se importan aquí.
 *
 * CADA PIEZA LLEVA TRES ANCHOS
 *   srcXs   360px — la celda de la hoja de contactos (85px en móvil, 140 en
 *                   escritorio; una pantalla de densidad 2 pide 280 como mucho)
 *   srcSm   700px — la lupa
 *   src    1080px+ — el visor a pantalla completa
 * Los genera `npm run taller:variantes`.
 *
 * Y LLEVA SUS MEDIDAS REALES (`w`/`h`)
 * No fijan el tamaño —manda el CSS—, solo la proporción, para reservar el
 * hueco antes de que baje la imagen. Aquí había un campo `aspect` que decía
 * 'square' en las veinte piezas y era falso en las veinte: no hay ni una
 * cuadrada. Son 4:5 casi todas, 9:16 las portadas de reel y panorámicas las
 * portadas de perfil. Esa variedad es la que compone la hoja.
 *
 * NO HAY COLOR POR CLIENTE
 * Lo había, y se usaba como color de texto. Cuatro de los siete no llegaban a
 * AA sobre el fondo (#2C3E50 da 2.4:1) y ninguno significa nada para quien
 * mira. El cliente se dice con su nombre, que se lee siempre.
 */

// ── Berse Line ──
import berse1 from '../assets/clients/berseline/2_REJUVENECIMIENTO.webp'
import berse1Sm from '../assets/clients/berseline/2_REJUVENECIMIENTO-sm.webp'
import berse1Xs from '../assets/clients/berseline/2_REJUVENECIMIENTO-xs.webp'
import berse2 from '../assets/clients/berseline/Mesa de trabajo 1 (1).webp'
import berse2Sm from '../assets/clients/berseline/Mesa de trabajo 1 (1)-sm.webp'
import berse2Xs from '../assets/clients/berseline/Mesa de trabajo 1 (1)-xs.webp'
import berse3 from '../assets/clients/berseline/Mesa de trabajo 3.webp'
import berse3Sm from '../assets/clients/berseline/Mesa de trabajo 3-sm.webp'
import berse3Xs from '../assets/clients/berseline/Mesa de trabajo 3-xs.webp'

// ── Gran Oportunidad GO! ──
import go1 from '../assets/clients/go/2-carrusel 1.webp'
import go1Sm from '../assets/clients/go/2-carrusel 1-sm.webp'
import go1Xs from '../assets/clients/go/2-carrusel 1-xs.webp'
import go2 from '../assets/clients/go/5_RULETA.webp'
import go2Sm from '../assets/clients/go/5_RULETA-sm.webp'
import go2Xs from '../assets/clients/go/5_RULETA-xs.webp'
import go3 from '../assets/clients/go/6_ESTRENO.webp'
import go3Sm from '../assets/clients/go/6_ESTRENO-sm.webp'
import go3Xs from '../assets/clients/go/6_ESTRENO-xs.webp'
import go4 from '../assets/clients/go/GANADORES DE SORTEO.webp'
import go4Sm from '../assets/clients/go/GANADORES DE SORTEO-sm.webp'
import go4Xs from '../assets/clients/go/GANADORES DE SORTEO-xs.webp'

// ── Dra. Jenny Rodríguez ──
import jeny1 from '../assets/clients/jeny/Mesa de trabajo 1.webp'
import jeny1Sm from '../assets/clients/jeny/Mesa de trabajo 1-sm.webp'
import jeny1Xs from '../assets/clients/jeny/Mesa de trabajo 1-xs.webp'
import jeny2 from '../assets/clients/jeny/Mesa de trabajo 2.webp'
import jeny2Sm from '../assets/clients/jeny/Mesa de trabajo 2-sm.webp'
import jeny2Xs from '../assets/clients/jeny/Mesa de trabajo 2-xs.webp'

// ── Colegio Manuel Pardo ──
import pardo1 from '../assets/clients/pardo/2DA VELA DE ADVIENTO_INICIAL.webp'
import pardo1Sm from '../assets/clients/pardo/2DA VELA DE ADVIENTO_INICIAL-sm.webp'
import pardo1Xs from '../assets/clients/pardo/2DA VELA DE ADVIENTO_INICIAL-xs.webp'
import pardo2 from '../assets/clients/pardo/ADMISIONES 2026_7.webp'
import pardo2Sm from '../assets/clients/pardo/ADMISIONES 2026_7-sm.webp'
import pardo2Xs from '../assets/clients/pardo/ADMISIONES 2026_7-xs.webp'
import pardo3 from '../assets/clients/pardo/ADMISIONES 2026_8.webp'
import pardo3Sm from '../assets/clients/pardo/ADMISIONES 2026_8-sm.webp'
import pardo3Xs from '../assets/clients/pardo/ADMISIONES 2026_8-xs.webp'
import pardo4 from '../assets/clients/pardo/ADMISIONES ABIERTAS_2.webp'
import pardo4Sm from '../assets/clients/pardo/ADMISIONES ABIERTAS_2-sm.webp'
import pardo4Xs from '../assets/clients/pardo/ADMISIONES ABIERTAS_2-xs.webp'
import pardo5 from '../assets/clients/pardo/ANIVERSARIO SACERDOTAL - PADRE JAVIER.webp'
import pardo5Sm from '../assets/clients/pardo/ANIVERSARIO SACERDOTAL - PADRE JAVIER-sm.webp'
import pardo5Xs from '../assets/clients/pardo/ANIVERSARIO SACERDOTAL - PADRE JAVIER-xs.webp'

// ── Prosadis ──
import prosadis1 from '../assets/clients/prosadis/Mesa de trabajo 1.webp'
import prosadis1Sm from '../assets/clients/prosadis/Mesa de trabajo 1-sm.webp'
import prosadis1Xs from '../assets/clients/prosadis/Mesa de trabajo 1-xs.webp'
import prosadis2 from '../assets/clients/prosadis/Mesa de trabajo 2.webp'
import prosadis2Sm from '../assets/clients/prosadis/Mesa de trabajo 2-sm.webp'
import prosadis2Xs from '../assets/clients/prosadis/Mesa de trabajo 2-xs.webp'
import prosadis3 from '../assets/clients/prosadis/PROSADIS PORTADA REEL.webp'
import prosadis3Sm from '../assets/clients/prosadis/PROSADIS PORTADA REEL-sm.webp'
import prosadis3Xs from '../assets/clients/prosadis/PROSADIS PORTADA REEL-xs.webp'

// ── Spa Kreativos ──
import spa1 from '../assets/clients/spa/IMG_4062.webp'
import spa1Sm from '../assets/clients/spa/IMG_4062-sm.webp'
import spa1Xs from '../assets/clients/spa/IMG_4062-xs.webp'
import spa2 from '../assets/clients/spa/Tratamiendo de recuperación.webp'
import spa2Sm from '../assets/clients/spa/Tratamiendo de recuperación-sm.webp'
import spa2Xs from '../assets/clients/spa/Tratamiendo de recuperación-xs.webp'
import spa3 from '../assets/clients/spa/UBICACIÓN DE SPA.webp'
import spa3Sm from '../assets/clients/spa/UBICACIÓN DE SPA-sm.webp'
import spa3Xs from '../assets/clients/spa/UBICACIÓN DE SPA-xs.webp'

// ── Veterinaria ──
import vet1 from '../assets/dak/2_portada video veterinaria.webp'
import vet1Sm from '../assets/dak/2_portada video veterinaria-sm.webp'
import vet1Xs from '../assets/dak/2_portada video veterinaria-xs.webp'

// ── Portadas ──
import portada1 from '../assets/banners/PORTADA ADMISIONES Y MATRÍCULAS 2026.webp'
import portada1Sm from '../assets/banners/PORTADA ADMISIONES Y MATRÍCULAS 2026-sm.webp'
import portada1Xs from '../assets/banners/PORTADA ADMISIONES Y MATRÍCULAS 2026-xs.webp'
import portada2 from '../assets/banners/Portada dra. jenny.webp'
import portada2Sm from '../assets/banners/Portada dra. jenny-sm.webp'
import portada2Xs from '../assets/banners/Portada dra. jenny-xs.webp'
import portada3 from '../assets/banners/PORTADA PROSADIS.webp'
import portada3Sm from '../assets/banners/PORTADA PROSADIS-sm.webp'
import portada3Xs from '../assets/banners/PORTADA PROSADIS-xs.webp'
import portada4 from '../assets/banners/PORTADA SEÑOR DE LOS MILAGROS.webp'
import portada4Sm from '../assets/banners/PORTADA SEÑOR DE LOS MILAGROS-sm.webp'
import portada4Xs from '../assets/banners/PORTADA SEÑOR DE LOS MILAGROS-xs.webp'

/**
 * Las categorías del filtro. Solo van las que tienen piezas de verdad: hubo
 * 'banners' y 'photography' devolviendo cero y vaciando la rejilla. 'portadas'
 * sí tiene, ahora que las portadas viven en la misma hoja en vez de en un
 * carrusel aparte de cuatro elementos.
 */
export const CATEGORIAS = [
  { id: 'todo', etiqueta: 'Todo' },
  { id: 'social', etiqueta: 'Social' },
  { id: 'branding', etiqueta: 'Branding' },
  { id: 'campanas', etiqueta: 'Campañas' },
  { id: 'portadas', etiqueta: 'Portadas' },
]

/**
 * Las piezas, en el orden en que se pintan sobre la hoja.
 *
 * `formato` no es decoración: dice en qué tira va la pieza y con qué
 * proporción se pinta el fotograma.
 *   'vertical'  4:5     la rejilla del Taller
 *   'reel'      9:16    la misma rejilla, recortado a 4:5 como en una hoja de
 *                       contactos de verdad; el fotograma entero está en el visor
 *   'panorama'  ~2.5:1  la tira de portadas, aparte y a su proporción real
 * Sale de las medidas del archivo, no de un índice.
 */
export const OBRAS = [
  { id: 't01', src: berse1, srcSm: berse1Sm, srcXs: berse1Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Rejuvenecimiento', cliente: 'Berse Line', categoria: 'social', tipo: 'Post' },
  { id: 't02', src: go2, srcSm: go2Sm, srcXs: go2Xs, w: 1280, h: 1600, formato: 'vertical', titulo: 'Ruleta de premios', cliente: 'Gran Oportunidad GO!', categoria: 'social', tipo: 'Post' },
  { id: 't03', src: jeny1, srcSm: jeny1Sm, srcXs: jeny1Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Identidad médica', cliente: 'Dra. Jenny Rodríguez', categoria: 'branding', tipo: 'Post' },
  { id: 't04', src: pardo1, srcSm: pardo1Sm, srcXs: pardo1Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Segunda vela de Adviento', cliente: 'Colegio Manuel Pardo', categoria: 'social', tipo: 'Post' },
  { id: 't05', src: prosadis1, srcSm: prosadis1Sm, srcXs: prosadis1Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Identidad dental', cliente: 'Prosadis', categoria: 'branding', tipo: 'Post' },
  { id: 't06', src: spa2, srcSm: spa2Sm, srcXs: spa2Xs, w: 1280, h: 1600, formato: 'vertical', titulo: 'Tratamiento de recuperación', cliente: 'Spa Kreativos', categoria: 'social', tipo: 'Post' },
  { id: 't07', src: pardo2, srcSm: pardo2Sm, srcXs: pardo2Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Admisiones 2026', cliente: 'Colegio Manuel Pardo', categoria: 'campanas', tipo: 'Campaña' },
  { id: 't08', src: go1, srcSm: go1Sm, srcXs: go1Xs, w: 1280, h: 1600, formato: 'vertical', titulo: 'Carrusel promocional', cliente: 'Gran Oportunidad GO!', categoria: 'campanas', tipo: 'Carrusel' },
  { id: 't09', src: prosadis3, srcSm: prosadis3Sm, srcXs: prosadis3Xs, w: 900, h: 1600, formato: 'reel', titulo: 'Portada de reel', cliente: 'Prosadis', categoria: 'social', tipo: 'Reel' },
  { id: 't10', src: pardo3, srcSm: pardo3Sm, srcXs: pardo3Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Admisiones 2026 · segunda versión', cliente: 'Colegio Manuel Pardo', categoria: 'campanas', tipo: 'Campaña' },
  { id: 't11', src: go3, srcSm: go3Sm, srcXs: go3Xs, w: 1280, h: 1600, formato: 'vertical', titulo: 'Estreno de productos', cliente: 'Gran Oportunidad GO!', categoria: 'campanas', tipo: 'Post' },
  { id: 't12', src: spa1, srcSm: spa1Sm, srcXs: spa1Xs, w: 1280, h: 1600, formato: 'vertical', titulo: 'Alisado brasileño', cliente: 'Spa Kreativos', categoria: 'campanas', tipo: 'Campaña' },
  { id: 't13', src: berse2, srcSm: berse2Sm, srcXs: berse2Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Pieza de marca', cliente: 'Berse Line', categoria: 'branding', tipo: 'Diseño' },
  { id: 't14', src: jeny2, srcSm: jeny2Sm, srcXs: jeny2Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Identidad médica II', cliente: 'Dra. Jenny Rodríguez', categoria: 'branding', tipo: 'Post' },
  { id: 't15', src: prosadis2, srcSm: prosadis2Sm, srcXs: prosadis2Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Identidad dental II', cliente: 'Prosadis', categoria: 'branding', tipo: 'Post' },
  { id: 't16', src: berse3, srcSm: berse3Sm, srcXs: berse3Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Pieza corporativa', cliente: 'Berse Line', categoria: 'branding', tipo: 'Post' },
  { id: 't17', src: go4, srcSm: go4Sm, srcXs: go4Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Ganadores del sorteo', cliente: 'Gran Oportunidad GO!', categoria: 'social', tipo: 'Post' },
  { id: 't18', src: pardo5, srcSm: pardo5Sm, srcXs: pardo5Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Aniversario sacerdotal', cliente: 'Colegio Manuel Pardo', categoria: 'social', tipo: 'Post' },
  { id: 't19', src: spa3, srcSm: spa3Sm, srcXs: spa3Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Ubicación del salón', cliente: 'Spa Kreativos', categoria: 'social', tipo: 'Post' },
  { id: 't20', src: vet1, srcSm: vet1Sm, srcXs: vet1Xs, w: 925, h: 1600, formato: 'reel', titulo: 'Portada de vídeo', cliente: 'Veterinaria', categoria: 'social', tipo: 'Vídeo' },
  { id: 't21', src: pardo4, srcSm: pardo4Sm, srcXs: pardo4Xs, w: 1080, h: 1350, formato: 'vertical', titulo: 'Admisiones abiertas', cliente: 'Colegio Manuel Pardo', categoria: 'campanas', tipo: 'Campaña' },

  /* La tira de panorámicas cierra la hoja, como el último tramo de un rollo:
     así la numeración de los fotogramas corre seguida en cada tira en vez de
     dejar huecos (…05, 06, 08…) que se leen como un fallo y no como formato. */
  { id: 't22', src: portada1, srcSm: portada1Sm, srcXs: portada1Xs, w: 1702, h: 700, formato: 'panorama', titulo: 'Admisiones y matrículas 2026', cliente: 'Colegio Manuel Pardo', categoria: 'portadas', tipo: 'Portada' },
  { id: 't23', src: portada2, srcSm: portada2Sm, srcXs: portada2Xs, w: 1700, h: 630, formato: 'panorama', titulo: 'Portada de consultorio', cliente: 'Dra. Jenny Rodríguez', categoria: 'portadas', tipo: 'Portada' },
  { id: 't24', src: portada3, srcSm: portada3Sm, srcXs: portada3Xs, w: 1600, h: 592, formato: 'panorama', titulo: 'Portada de clínica', cliente: 'Prosadis', categoria: 'portadas', tipo: 'Portada' },
  { id: 't25', src: portada4, srcSm: portada4Sm, srcXs: portada4Xs, w: 1600, h: 658, formato: 'panorama', titulo: 'Señor de los Milagros', cliente: 'Colegio Manuel Pardo', categoria: 'portadas', tipo: 'Portada' },
]
