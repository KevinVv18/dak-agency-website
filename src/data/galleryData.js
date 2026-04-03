// ── Client Work ──
import berse1 from '../assets/clients/berseline/2_REJUVENECIMIENTO.png'
import berse2 from '../assets/clients/berseline/Mesa de trabajo 1 (1).png'
import berse3 from '../assets/clients/berseline/Mesa de trabajo 3.png'

import go1 from '../assets/clients/go/2-carrusel 1.png'
import go2 from '../assets/clients/go/5_RULETA.png'
import go3 from '../assets/clients/go/6_ESTRENO.png'
import go4 from '../assets/clients/go/GANADORES DE SORTEO.png'

import jeny1 from '../assets/clients/jeny/Mesa de trabajo 1.jpg'
import jeny2 from '../assets/clients/jeny/Mesa de trabajo 2.jpg'

import pardo1 from '../assets/clients/pardo/2DA VELA DE ADVIENTO_INICIAL.jpg'
import pardo2 from '../assets/clients/pardo/ADMISIONES 2026_7.jpg'
import pardo3 from '../assets/clients/pardo/ADMISIONES 2026_8.jpg'
import pardo4 from '../assets/clients/pardo/ADMISIONES ABIERTAS_2.jpg'
import pardo5 from '../assets/clients/pardo/ANIVERSARIO SACERDOTAL - PADRE JAVIER.jpg'

import prosadis1 from '../assets/clients/prosadis/Mesa de trabajo 1.png'
import prosadis2 from '../assets/clients/prosadis/Mesa de trabajo 2.png'
import prosadis3 from '../assets/clients/prosadis/PROSADIS PORTADA REEL.jpg'

import spa1 from '../assets/clients/spa/IMG_4062.jpg'
import spa2 from '../assets/clients/spa/Tratamiendo de recuperación.jpg'
import spa3 from '../assets/clients/spa/UBICACIÓN DE SPA.png'

// ── Banners ──
import banner1 from '../assets/banners/PORTADA ADMISIONES Y MATRÍCULAS 2026.jpg'
import banner2 from '../assets/banners/Portada dra. jenny.jpg'
import banner3 from '../assets/banners/PORTADA PROSADIS.png'
import banner4 from '../assets/banners/PORTADA SEÑOR DE LOS MILAGROS.png'

// ── Photography ──
import babyPhoto from '../assets/gallery/baby1-min.jpg'
import familiaPhoto from '../assets/gallery/Familia1-min.jpg'
import hermanosPhoto from '../assets/gallery/hermanos.jpg'
import mamiPhoto from '../assets/gallery/mami1-min.jpg'
import parejaPhoto from '../assets/gallery/pareja1-min.jpg'
import pediatraPhoto from '../assets/gallery/PEDIATRA CORRALES@3x-min.jpg'

export const categories = [
  { id: 'all', label: 'Todo' },
  { id: 'social', label: 'Social Media' },
  { id: 'banners', label: 'Banners' },
  { id: 'photography', label: 'Fotografía' },
  { id: 'branding', label: 'Branding' },
  { id: 'campaigns', label: 'Campañas' },
]

export const galleryItems = [
  // Social Media Posts
  { id: 1, src: berse1, alt: 'Rejuvenecimiento - Berse Line', client: 'Berse Line', category: 'social', type: 'Post', color: '#D4AF37', aspect: 'square' },
  { id: 2, src: go2, alt: 'Ruleta de Premios - GO!', client: 'Gran Oportunidad GO!', category: 'social', type: 'Post', color: '#E74C3C', aspect: 'square' },
  { id: 3, src: jeny1, alt: 'Diseño Médico - Dra. Jenny', client: 'Dra. Jenny', category: 'branding', type: 'Post', color: '#3498DB', aspect: 'square' },
  { id: 4, src: pardo1, alt: '2da Vela de Adviento', client: 'Manuel Pardo', category: 'social', type: 'Post', color: '#2C3E50', aspect: 'square' },
  { id: 5, src: prosadis1, alt: 'Diseño Dental', client: 'Prosadis', category: 'branding', type: 'Post', color: '#16A085', aspect: 'square' },
  { id: 6, src: spa2, alt: 'Tratamiento de Recuperación', client: 'Spa Kreativos', category: 'social', type: 'Post', color: '#9B59B6', aspect: 'square' },

  // Campaigns
  { id: 7, src: pardo2, alt: 'Admisiones 2026', client: 'Manuel Pardo', category: 'campaigns', type: 'Campaña', color: '#2C3E50', aspect: 'square' },
  { id: 8, src: go1, alt: 'Carrusel Promocional', client: 'Gran Oportunidad GO!', category: 'campaigns', type: 'Carrusel', color: '#E74C3C', aspect: 'square' },
  { id: 9, src: pardo3, alt: 'Admisiones 2026 v2', client: 'Manuel Pardo', category: 'campaigns', type: 'Campaña', color: '#2C3E50', aspect: 'square' },
  { id: 10, src: go3, alt: 'Estreno de Productos', client: 'Gran Oportunidad GO!', category: 'campaigns', type: 'Post', color: '#E74C3C', aspect: 'square' },
  { id: 11, src: pardo4, alt: 'Admisiones Abiertas', client: 'Manuel Pardo', category: 'campaigns', type: 'Campaña', color: '#2C3E50', aspect: 'square' },

  // Branding
  { id: 12, src: berse2, alt: 'Mesa de Trabajo - Berse Line', client: 'Berse Line', category: 'branding', type: 'Diseño', color: '#D4AF37', aspect: 'square' },
  { id: 13, src: jeny2, alt: 'Diseño Médico 2 - Dra. Jenny', client: 'Dra. Jenny', category: 'branding', type: 'Post', color: '#3498DB', aspect: 'square' },
  { id: 14, src: prosadis2, alt: 'Diseño Dental 2', client: 'Prosadis', category: 'branding', type: 'Post', color: '#16A085', aspect: 'square' },
  { id: 15, src: berse3, alt: 'Diseño Corporativo - Berse', client: 'Berse Line', category: 'branding', type: 'Post', color: '#D4AF37', aspect: 'square' },

  // More social
  { id: 16, src: go4, alt: 'Ganadores de Sorteo', client: 'Gran Oportunidad GO!', category: 'social', type: 'Post', color: '#E74C3C', aspect: 'square' },
  { id: 17, src: pardo5, alt: 'Aniversario Sacerdotal', client: 'Manuel Pardo', category: 'social', type: 'Post', color: '#2C3E50', aspect: 'square' },
  { id: 18, src: spa3, alt: 'Ubicación de Spa', client: 'Spa Kreativos', category: 'social', type: 'Post', color: '#9B59B6', aspect: 'square' },
  { id: 19, src: prosadis3, alt: 'Portada Reel Prosadis', client: 'Prosadis', category: 'social', type: 'Reel', color: '#16A085', aspect: 'portrait' },
]

export const bannerItems = [
  { id: 'b1', src: banner1, alt: 'Admisiones y Matrículas 2026', client: 'Manuel Pardo' },
  { id: 'b2', src: banner2, alt: 'Portada Dra. Jenny', client: 'Dra. Jenny' },
  { id: 'b3', src: banner3, alt: 'Portada Prosadis', client: 'Prosadis' },
  { id: 'b4', src: banner4, alt: 'Señor de los Milagros', client: 'Manuel Pardo' },
]

export const photoItems = [
  { id: 'p1', src: pediatraPhoto, title: 'Fotografía Profesional', category: 'Comercial' },
  { id: 'p2', src: familiaPhoto, title: 'Retrato Familiar', category: 'Familias' },
  { id: 'p3', src: hermanosPhoto, title: 'Lazos de Hermanos', category: 'Infantil' },
  { id: 'p4', src: parejaPhoto, title: 'Amor en Pareja', category: 'Parejas' },
  { id: 'p5', src: mamiPhoto, title: 'Maternidad', category: 'Maternidad' },
  { id: 'p6', src: babyPhoto, title: 'Sesión Newborn', category: 'Bebés' },
]
