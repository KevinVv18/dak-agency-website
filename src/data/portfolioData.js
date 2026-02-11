// Logos
import logoBerse from '../assets/logos/logo-berse-line.svg'
import logoGO from '../assets/logos/logo-go.png'
import logoJeny from '../assets/logos/LOGO BLANCO.svg'
import logoPardo from '../assets/logos/LOGO-MANUEL PARDO@4x-8.png'
import logoProsadis from '../assets/logos/LOGO 1.svg'
import logoSpa from '../assets/logos/logo-spa-kreativos.svg'

// Berseline images
import berse1 from '../assets/clients/berseline/2_REJUVENECIMIENTO.png'
import berse2 from '../assets/clients/berseline/Mesa de trabajo 1 (1).png'
import berse3 from '../assets/clients/berseline/Mesa de trabajo 3.png'

// Gran Oportunidad GO! images
import go1 from '../assets/clients/go/2-carrusel 1.png'
import go2 from '../assets/clients/go/5_RULETA.png'
import go3 from '../assets/clients/go/6_ESTRENO.png'
import go4 from '../assets/clients/go/GANADORES DE SORTEO.png'

// Dra. Jenny images
import jeny1 from '../assets/clients/jeny/Mesa de trabajo 1.jpg'
import jeny2 from '../assets/clients/jeny/Mesa de trabajo 2.jpg'

// Manuel Pardo images
import pardo1 from '../assets/clients/pardo/2DA VELA DE ADVIENTO_INICIAL.jpg'
import pardo2 from '../assets/clients/pardo/ADMISIONES 2026_7.jpg'
import pardo3 from '../assets/clients/pardo/ADMISIONES 2026_8.jpg'
import pardo4 from '../assets/clients/pardo/ADMISIONES ABIERTAS_2.jpg'
import pardo5 from '../assets/clients/pardo/ANIVERSARIO SACERDOTAL - PADRE JAVIER.jpg'

// Prosadis images
import prosadis1 from '../assets/clients/prosadis/Mesa de trabajo 1.png'
import prosadis2 from '../assets/clients/prosadis/Mesa de trabajo 2.png'
import prosadis3 from '../assets/clients/prosadis/PROSADIS PORTADA REEL.jpg'

// Spa Kreativos images
import spa1 from '../assets/clients/spa/IMG_4062.jpg'
import spa2 from '../assets/clients/spa/Tratamiendo de recuperación.jpg'
import spa3 from '../assets/clients/spa/UBICACIÓN DE SPA.png'

// Banners
import banner1 from '../assets/banners/PORTADA ADMISIONES Y MATRÍCULAS 2026.jpg'
import banner2 from '../assets/banners/Portada dra. jenny.jpg'
import banner3 from '../assets/banners/PORTADA PROSADIS.png'
import banner4 from '../assets/banners/PORTADA SEÑOR DE LOS MILAGROS.png'

export const portfolioData = {
  clients: [
    {
      id: "berseline",
      nombre: "Berse Line",
      categoria: "Spa & Wellness",
      color: "#D4AF37",
      logo: logoBerse,
      imagenes: [
        { src: berse1, alt: "Tratamiento Rejuvenecimiento", tipo: "Post" },
        { src: berse2, alt: "Diseño Mesa de Trabajo", tipo: "Post" },
        { src: berse3, alt: "Diseño Corporativo", tipo: "Post" }
      ],
      servicios: ["Social Media", "Diseño Gráfico"],
      orden: 1
    },
    {
      id: "gran-oportunidad",
      nombre: "Gran Oportunidad GO!",
      categoria: "Retail & Promociones",
      color: "#E74C3C",
      logo: logoGO,
      imagenes: [
        { src: go1, alt: "Carrusel Promocional", tipo: "Carrusel" },
        { src: go2, alt: "Ruleta de Premios", tipo: "Post" },
        { src: go3, alt: "Estreno de Productos", tipo: "Post" },
        { src: go4, alt: "Ganadores de Sorteo", tipo: "Post" }
      ],
      servicios: ["Campañas", "Diseño", "Social Media"],
      orden: 2
    },
    {
      id: "jeny-dr",
      nombre: "Dra. Jenny",
      categoria: "Salud & Medicina",
      color: "#3498DB",
      logo: logoJeny,
      imagenes: [
        { src: jeny1, alt: "Diseño Médico 1", tipo: "Post" },
        { src: jeny2, alt: "Diseño Médico 2", tipo: "Post" }
      ],
      servicios: ["Branding", "Social Media"],
      orden: 3
    },
    {
      id: "pardo",
      nombre: "Manuel Pardo",
      categoria: "Educación",
      color: "#2C3E50",
      logo: logoPardo,
      imagenes: [
        { src: pardo1, alt: "2da Vela de Adviento", tipo: "Post" },
        { src: pardo2, alt: "Admisiones 2026", tipo: "Campaña" },
        { src: pardo3, alt: "Admisiones 2026 - Versión 2", tipo: "Campaña" },
        { src: pardo4, alt: "Admisiones Abiertas", tipo: "Post" },
        { src: pardo5, alt: "Aniversario Sacerdotal", tipo: "Post" }
      ],
      servicios: ["Campañas", "Diseño", "Social Media"],
      orden: 4
    },
    {
      id: "prosadis",
      nombre: "Prosadis",
      categoria: "Salud Dental",
      color: "#16A085",
      logo: logoProsadis,
      imagenes: [
        { src: prosadis1, alt: "Mesa de Trabajo 1", tipo: "Post" },
        { src: prosadis2, alt: "Mesa de Trabajo 2", tipo: "Post" },
        { src: prosadis3, alt: "Portada Reel", tipo: "Reel" }
      ],
      servicios: ["Branding", "Social Media", "Video"],
      orden: 5
    },
    {
      id: "spa-kreativos",
      nombre: "Spa Kreativos",
      categoria: "Spa & Wellness",
      color: "#9B59B6",
      logo: logoSpa,
      imagenes: [
        { src: spa1, alt: "Fotografía de Spa", tipo: "Foto" },
        { src: spa2, alt: "Tratamiento de Recuperación", tipo: "Post" },
        { src: spa3, alt: "Ubicación de Spa", tipo: "Post" }
      ],
      servicios: ["Diseño", "Social Media", "Fotografía"],
      orden: 6
    }
  ],

  banners: {
    id: "portadas",
    nombre: "Banners & Portadas",
    categoria: "Diseño Gráfico",
    color: "#E67E22",
    imagenes: [
      {
        src: banner1,
        alt: "Admisiones y Matrículas 2026",
        cliente: "Manuel Pardo",
        tipo: "Banner"
      },
      {
        src: banner2,
        alt: "Portada Dra. Jenny",
        cliente: "Dra. Jenny",
        tipo: "Banner"
      },
      {
        src: banner3,
        alt: "Portada Prosadis",
        cliente: "Prosadis",
        tipo: "Banner"
      },
      {
        src: banner4,
        alt: "Señor de los Milagros",
        cliente: "Manuel Pardo",
        tipo: "Banner"
      }
    ]
  }
}
