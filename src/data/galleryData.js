// ── Client Work ──
import berse1 from '../assets/clients/berseline/2_REJUVENECIMIENTO.webp'
import berse2 from '../assets/clients/berseline/Mesa de trabajo 1 (1).webp'
import berse3 from '../assets/clients/berseline/Mesa de trabajo 3.webp'

import go1 from '../assets/clients/go/2-carrusel 1.webp'
import go1Sm from '../assets/clients/go/2-carrusel 1-sm.webp'
import go2 from '../assets/clients/go/5_RULETA.webp'
import go2Sm from '../assets/clients/go/5_RULETA-sm.webp'
import go3 from '../assets/clients/go/6_ESTRENO.webp'
import go3Sm from '../assets/clients/go/6_ESTRENO-sm.webp'
import go4 from '../assets/clients/go/GANADORES DE SORTEO.webp'
import go4Sm from '../assets/clients/go/GANADORES DE SORTEO-sm.webp'

import jeny1 from '../assets/clients/jeny/Mesa de trabajo 1.webp'
import jeny1Sm from '../assets/clients/jeny/Mesa de trabajo 1-sm.webp'
import jeny2 from '../assets/clients/jeny/Mesa de trabajo 2.webp'
import jeny2Sm from '../assets/clients/jeny/Mesa de trabajo 2-sm.webp'

import pardo1 from '../assets/clients/pardo/2DA VELA DE ADVIENTO_INICIAL.webp'
import pardo1Sm from '../assets/clients/pardo/2DA VELA DE ADVIENTO_INICIAL-sm.webp'
import pardo2 from '../assets/clients/pardo/ADMISIONES 2026_7.webp'
import pardo2Sm from '../assets/clients/pardo/ADMISIONES 2026_7-sm.webp'
import pardo3 from '../assets/clients/pardo/ADMISIONES 2026_8.webp'
import pardo3Sm from '../assets/clients/pardo/ADMISIONES 2026_8-sm.webp'
import pardo4 from '../assets/clients/pardo/ADMISIONES ABIERTAS_2.webp'
import pardo4Sm from '../assets/clients/pardo/ADMISIONES ABIERTAS_2-sm.webp'
import pardo5 from '../assets/clients/pardo/ANIVERSARIO SACERDOTAL - PADRE JAVIER.webp'
import pardo5Sm from '../assets/clients/pardo/ANIVERSARIO SACERDOTAL - PADRE JAVIER-sm.webp'

import prosadis1 from '../assets/clients/prosadis/Mesa de trabajo 1.webp'
import prosadis1Sm from '../assets/clients/prosadis/Mesa de trabajo 1-sm.webp'
import prosadis2 from '../assets/clients/prosadis/Mesa de trabajo 2.webp'
import prosadis2Sm from '../assets/clients/prosadis/Mesa de trabajo 2-sm.webp'
import prosadis3 from '../assets/clients/prosadis/PROSADIS PORTADA REEL.webp'
import prosadis3Sm from '../assets/clients/prosadis/PROSADIS PORTADA REEL-sm.webp'

import spa1 from '../assets/clients/spa/IMG_4062.webp'
import spa1Sm from '../assets/clients/spa/IMG_4062-sm.webp'
import spa2 from '../assets/clients/spa/Tratamiendo de recuperación.webp'
import spa2Sm from '../assets/clients/spa/Tratamiendo de recuperación-sm.webp'
import spa3 from '../assets/clients/spa/UBICACIÓN DE SPA.webp'
import spa3Sm from '../assets/clients/spa/UBICACIÓN DE SPA-sm.webp'

// ── Banners ──
import banner1 from '../assets/banners/PORTADA ADMISIONES Y MATRÍCULAS 2026.webp'
import banner2 from '../assets/banners/Portada dra. jenny.webp'
import banner3 from '../assets/banners/PORTADA PROSADIS.webp'
import banner4 from '../assets/banners/PORTADA SEÑOR DE LOS MILAGROS.webp'

// ── DAK showcase ──
import dakFotografia from '../assets/dak/dak_Fotografía.webp'
import dakDron from '../assets/dak/dak_dron.webp'
import dakInmobiliario from '../assets/dak/dak_inmobiliario.webp'
import dakSephora from '../assets/dak/dak_sephora.webp'
import dakSkincare from '../assets/dak/dak_skincare.webp'
import vetPortada from '../assets/dak/2_portada video veterinaria.webp'

// Las fotos de estudio ya no se importan aquí: las declara fotografia.js.

// Hero images for Gallery page
export const heroImages = [
  { src: dakFotografia, alt: 'DAK Fotografía' },
  { src: dakSephora, alt: 'DAK Sephora' },
  { src: dakSkincare, alt: 'DAK Skincare' },
  { src: dakDron, alt: 'DAK Dron' },
  { src: dakInmobiliario, alt: 'DAK Inmobiliario' },
]

/**
 * Filtros del Taller. Solo van los que tienen piezas de verdad.
 *
 * 'banners' y 'photography' estaban aquí y devolvían cero: los banners se
 * pintan en su propio carrusel (bannerItems) y la fotografía vive en Estudio,
 * así que ninguna pieza de galleryItems llevaba esas categorías. Eran dos
 * botones que vaciaban la rejilla.
 */
export const categories = [
  { id: 'all', label: 'Todo' },
  { id: 'social', label: 'Social Media' },
  { id: 'branding', label: 'Branding' },
  { id: 'campaigns', label: 'Campañas' },
]

export const galleryItems = [
  // Social Media Posts
  { id: 1, src: berse1, alt: 'Rejuvenecimiento - Berse Line', client: 'Berse Line', category: 'social', type: 'Post', color: '#D4AF37', aspect: 'square' },
  { id: 2, src: go2, srcSm: go2Sm, alt: 'Ruleta de Premios - GO!', client: 'Gran Oportunidad GO!', category: 'social', type: 'Post', color: '#E74C3C', aspect: 'square' },
  { id: 3, src: jeny1, srcSm: jeny1Sm, alt: 'Diseño Médico - Dra. Jenny', client: 'Dra. Jenny', category: 'branding', type: 'Post', color: '#3498DB', aspect: 'square' },
  { id: 4, src: pardo1, srcSm: pardo1Sm, alt: '2da Vela de Adviento', client: 'Manuel Pardo', category: 'social', type: 'Post', color: '#2C3E50', aspect: 'square' },
  { id: 5, src: prosadis1, srcSm: prosadis1Sm, alt: 'Diseño Dental', client: 'Prosadis', category: 'branding', type: 'Post', color: '#16A085', aspect: 'square' },
  { id: 6, src: spa2, srcSm: spa2Sm, alt: 'Tratamiento de Recuperación', client: 'Spa Kreativos', category: 'social', type: 'Post', color: '#9B59B6', aspect: 'square' },

  // Campaigns
  { id: 7, src: pardo2, srcSm: pardo2Sm, alt: 'Admisiones 2026', client: 'Manuel Pardo', category: 'campaigns', type: 'Campaña', color: '#2C3E50', aspect: 'square' },
  { id: 8, src: go1, srcSm: go1Sm, alt: 'Carrusel Promocional', client: 'Gran Oportunidad GO!', category: 'campaigns', type: 'Carrusel', color: '#E74C3C', aspect: 'square' },
  { id: 9, src: pardo3, srcSm: pardo3Sm, alt: 'Admisiones 2026 v2', client: 'Manuel Pardo', category: 'campaigns', type: 'Campaña', color: '#2C3E50', aspect: 'square' },
  { id: 10, src: go3, srcSm: go3Sm, alt: 'Estreno de Productos', client: 'Gran Oportunidad GO!', category: 'campaigns', type: 'Post', color: '#E74C3C', aspect: 'square' },
  { id: 11, src: pardo4, srcSm: pardo4Sm, alt: 'Admisiones Abiertas', client: 'Manuel Pardo', category: 'campaigns', type: 'Campaña', color: '#2C3E50', aspect: 'square' },

  // Branding
  { id: 12, src: berse2, alt: 'Mesa de Trabajo - Berse Line', client: 'Berse Line', category: 'branding', type: 'Diseño', color: '#D4AF37', aspect: 'square' },
  { id: 13, src: jeny2, srcSm: jeny2Sm, alt: 'Diseño Médico 2 - Dra. Jenny', client: 'Dra. Jenny', category: 'branding', type: 'Post', color: '#3498DB', aspect: 'square' },
  { id: 14, src: prosadis2, srcSm: prosadis2Sm, alt: 'Diseño Dental 2', client: 'Prosadis', category: 'branding', type: 'Post', color: '#16A085', aspect: 'square' },
  { id: 15, src: berse3, alt: 'Diseño Corporativo - Berse', client: 'Berse Line', category: 'branding', type: 'Post', color: '#D4AF37', aspect: 'square' },

  // More social
  { id: 16, src: go4, srcSm: go4Sm, alt: 'Ganadores de Sorteo', client: 'Gran Oportunidad GO!', category: 'social', type: 'Post', color: '#E74C3C', aspect: 'square' },
  { id: 17, src: pardo5, srcSm: pardo5Sm, alt: 'Aniversario Sacerdotal', client: 'Manuel Pardo', category: 'social', type: 'Post', color: '#2C3E50', aspect: 'square' },
  { id: 18, src: spa3, srcSm: spa3Sm, alt: 'Ubicación de Spa', client: 'Spa Kreativos', category: 'social', type: 'Post', color: '#9B59B6', aspect: 'square' },
  { id: 19, src: prosadis3, srcSm: prosadis3Sm, alt: 'Portada Reel Prosadis', client: 'Prosadis', category: 'social', type: 'Reel', color: '#16A085', aspect: 'portrait' },
  { id: 20, src: vetPortada, alt: 'Portada Video Veterinaria', client: 'Veterinaria', category: 'social', type: 'Video', color: '#45B7D1', aspect: 'square' },
]

export const bannerItems = [
  { id: 'b1', src: banner1, alt: 'Admisiones y Matrículas 2026', client: 'Manuel Pardo' },
  { id: 'b2', src: banner2, alt: 'Portada Dra. Jenny', client: 'Dra. Jenny' },
  { id: 'b3', src: banner3, alt: 'Portada Prosadis', client: 'Prosadis' },
  { id: 'b4', src: banner4, alt: 'Señor de los Milagros', client: 'Manuel Pardo' },
]

// photoItems vivía aquí: las mismas 6 fotos del repo que ya declara
// src/data/fotografia.js, que es ahora la única fuente del archivo fotográfico.
// Tener las dos listas garantizaba que se desincronizaran —de hecho ya pasó: la
// home enseñaba las 26 sesiones y /gallery seguía con estas 6.
