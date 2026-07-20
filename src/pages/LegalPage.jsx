import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Legal.css'

/* Páginas legales de DAK Agency.
   Contenido base para el sitio y para habilitar las APIs de redes
   (Meta/Instagram/WhatsApp/TikTok exigen URL de privacidad y de
   eliminación de datos). Revisar razón social / RUC con el usuario. */

const EMAIL = 'marketing@dakagency.net'
const WHATSAPP = '+51 906 765 040'
const ADDRESS = 'Mnz. G Lt. 11, Av. Antenor Orrego, La Victoria, Chiclayo, Lambayeque, Perú'
const UPDATED = '20 de julio de 2026'

const DOCS = {
  privacidad: {
    tag: 'Legal',
    title: 'Política de Privacidad',
    render: () => (
      <>
        <p className="legal-lead">
          En <strong>DAK Agency</strong> (Digital Acceleration Key) respetamos tu privacidad.
          Esta política explica qué datos tratamos, con qué fin y qué derechos tienes,
          tanto al usar <a href="https://dakagency.net">dakagency.net</a> como cuando
          gestionamos presencia y campañas en redes sociales.
        </p>

        <h2>1. Responsable del tratamiento</h2>
        <p>
          DAK Agency, con domicilio en {ADDRESS}. Contacto: {' '}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> · WhatsApp {WHATSAPP}.
        </p>

        <h2>2. Qué datos recopilamos</h2>
        <ul>
          <li><strong>Datos de contacto</strong> que nos das voluntariamente en formularios o por WhatsApp (nombre, teléfono, correo, mensaje).</li>
          <li><strong>Datos de navegación</strong> del sitio (cookies técnicas y de medición básica: páginas vistas, dispositivo aproximado).</li>
          <li><strong>Datos de redes sociales</strong> a los que accedemos mediante las APIs oficiales cuando administramos cuentas —propias de la agencia o de clientes que nos autorizan— tales como métricas de alcance e interacción, comentarios, mensajes y el contenido que se programa o publica.</li>
        </ul>

        <h2>3. Con qué finalidad</h2>
        <ul>
          <li>Responder tus consultas y darte soporte comercial.</li>
          <li>Prestar nuestros servicios: gestión de redes, publicación y programación de contenido, campañas y reportes de analítica.</li>
          <li>Mejorar el sitio y medir su desempeño.</li>
        </ul>

        <h2>4. Base legal</h2>
        <p>
          Tratamos tus datos con tu <strong>consentimiento</strong> (al escribirnos o aceptar
          nuestros servicios) y para la <strong>ejecución de la relación contractual</strong> con
          nuestros clientes, conforme a la Ley N.° 29733 de Protección de Datos Personales del Perú.
        </p>

        <h2>5. Plataformas y terceros</h2>
        <p>
          Para operar redes sociales usamos las APIs oficiales de <strong>Meta (Facebook e
          Instagram)</strong>, <strong>WhatsApp Business</strong> y <strong>TikTok</strong>, sujetas
          a sus propias políticas. También usamos proveedores de hosting y herramientas de
          automatización que procesan datos por encargo nuestro, bajo obligaciones de
          confidencialidad. No vendemos tus datos personales.
        </p>

        <h2>6. Conservación</h2>
        <p>
          Conservamos los datos el tiempo necesario para la finalidad que los originó y mientras
          exista relación con el cliente; luego los eliminamos o anonimizamos, salvo obligación
          legal de conservarlos.
        </p>

        <h2>7. Tus derechos</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO),
          y solicitar la eliminación de tus datos, escribiéndonos a {' '}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Consulta el detalle en {' '}
          <Link to="/eliminacion-de-datos">Eliminación de datos</Link>.
        </p>

        <h2>8. Cookies</h2>
        <p>
          Usamos cookies técnicas necesarias para el funcionamiento del sitio y cookies de
          medición básica. Puedes gestionarlas desde tu navegador.
        </p>

        <h2>9. Cambios</h2>
        <p>
          Podemos actualizar esta política; publicaremos la versión vigente en esta página con su
          fecha de actualización.
        </p>
      </>
    ),
  },

  'eliminacion-de-datos': {
    tag: 'Legal',
    title: 'Eliminación de datos',
    render: () => (
      <>
        <p className="legal-lead">
          Tienes derecho a solicitar la eliminación de los datos personales que DAK Agency haya
          tratado sobre ti, incluidos los obtenidos a través de las APIs de redes sociales.
        </p>

        <h2>Cómo solicitarla</h2>
        <ol>
          <li>Escríbenos a <a href={`mailto:${EMAIL}?subject=Eliminaci%C3%B3n%20de%20datos`}>{EMAIL}</a> con el asunto <strong>“Eliminación de datos”</strong>, o por WhatsApp al {WHATSAPP}.</li>
          <li>Indícanos tu nombre y el dato o cuenta relacionada (por ejemplo, el correo, teléfono o el usuario de la red social con el que interactuamos).</li>
          <li>Podemos pedirte una verificación mínima de identidad para proteger tu información.</li>
        </ol>

        <h2>Qué eliminamos y en cuánto tiempo</h2>
        <p>
          Eliminaremos los datos personales asociados a tu solicitud dentro de un plazo máximo de
          <strong> 30 días hábiles</strong>, salvo aquellos que debamos conservar por obligación
          legal. Te confirmaremos por escrito cuando se complete.
        </p>

        <h2>Datos obtenidos vía Meta / Facebook / Instagram</h2>
        <p>
          Si interactuamos con tu perfil a través de las plataformas de Meta y deseas que
          eliminemos esa información, puedes solicitarlo por los medios indicados arriba. También
          puedes revisar y revocar los permisos de aplicaciones desde la configuración de tu cuenta
          de Facebook o Instagram.
        </p>
      </>
    ),
  },

  terminos: {
    tag: 'Legal',
    title: 'Términos de Servicio',
    render: () => (
      <>
        <p className="legal-lead">
          Estos términos regulan el uso del sitio <a href="https://dakagency.net">dakagency.net</a> y
          la contratación de los servicios de DAK Agency.
        </p>

        <h2>1. Servicios</h2>
        <p>
          DAK Agency ofrece servicios de marketing digital: gestión de redes sociales, desarrollo
          web, branding, fotografía, campañas publicitarias y automatización. El alcance, plazos y
          precios de cada proyecto se acuerdan por separado en una propuesta o contrato.
        </p>

        <h2>2. Uso del sitio</h2>
        <p>
          Te comprometes a usar el sitio de forma lícita y a no interferir con su funcionamiento.
          Las demos publicadas (por ejemplo, proyectos de muestra) son ilustrativas y pueden usar
          imágenes de stock y datos ficticios.
        </p>

        <h2>3. Propiedad intelectual</h2>
        <p>
          La marca, el diseño y los contenidos propios del sitio pertenecen a DAK Agency. No
          pueden reproducirse sin autorización. Los materiales de terceros se usan bajo sus
          respectivas licencias.
        </p>

        <h2>4. Responsabilidad</h2>
        <p>
          Trabajamos con estándares profesionales, pero el sitio se ofrece “tal cual”. En la medida
          permitida por la ley, DAK Agency no será responsable por daños indirectos derivados del
          uso del sitio.
        </p>

        <h2>5. Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia se
          someterá a los tribunales competentes de Chiclayo, Lambayeque.
        </p>

        <h2>6. Contacto</h2>
        <p>
          Para cualquier consulta: <a href={`mailto:${EMAIL}`}>{EMAIL}</a> · WhatsApp {WHATSAPP}.
        </p>
      </>
    ),
  },
}

const LegalPage = ({ doc }) => {
  const data = DOCS[doc]

  useEffect(() => {
    window.scrollTo(0, 0)
    if (data) document.title = `${data.title} · DAK Agency`
  }, [data])

  if (!data) {
    return (
      <main className="legal-page">
        <div className="legal-container">
          <h1>Documento no encontrado</h1>
          <Link className="legal-back" to="/">← Volver al inicio</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="legal-page">
      <div className="legal-container">
        <span className="legal-tag">{data.tag}</span>
        <h1 className="legal-title">{data.title}</h1>
        <p className="legal-updated">Última actualización: {UPDATED}</p>
        <div className="legal-body">{data.render()}</div>
        <Link className="legal-back" to="/">← Volver al inicio</Link>
      </div>
    </main>
  )
}

export default LegalPage
