<?php /* La pantalla de acceso. La incluye index.php cuando no hay sesion. */ ?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="theme-color" content="#e94007">
<title>DAK · Bitácora</title>
<link rel="preload" href="/tipo/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>
/*
 * La puerta, en el mismo mundo que hay detras: la mesa de montaje.
 * Contrato de direccion: ver index.html. Semilla 1d90a862.
 *
 * EL NARANJA ES EL SUELO. La ventana de acceso es un agujero de blanco
 * perforado punzado en la tira, que es justo donde la gramatica manda poner un
 * objeto ajeno — y el boton de Google lo es.
 *
 * La fuente se sirve de /tipo/, exenta del muro en el .htaccess: esta pantalla
 * se le sirve a quien NO tiene sesion, asi que una fuente tras el muro dejaria
 * la puerta dibujada con la letra del sistema. Antes venia del CDN de Google,
 * que ademas es un tercero bloqueante en la primera pantalla.
 */
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 400 900;
  font-stretch: 62% 125%;
  font-display: swap;
  src: url('/tipo/archivo-latin.woff2') format('woff2');
}

:root{
  --naranja:#e94007; --tinta:#020202; --tinta-quemada:#0d0a09;
  --perforado:#fdfdfd; --emulsion:#e8e2da; --sobre-naranja:#180500;
  --paso:13px;
  --ease-tira:cubic-bezier(.16,1,.3,1);
  --grano:url('/tipo/grano.png');
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{
  display:flex; flex-direction:column;
  background-color:var(--naranja);
  background-image:var(--grano);
  background-size:160px 160px;
  background-blend-mode:soft-light;
  color:var(--sobre-naranja);
  font-family:Archivo,system-ui,sans-serif; font-size:16px; font-stretch:88%;
  -webkit-font-smoothing:antialiased; overflow:hidden;
  padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
::selection{background:var(--sobre-naranja);color:var(--naranja)}
a:focus-visible,button:focus-visible{outline:3px solid var(--sobre-naranja);outline-offset:-3px}

/* El riel: perforaciones de tinta punzadas en la banda. */
.riel{
  position:relative; flex:none;
  padding:calc(var(--paso)*.85) 18px;
  display:flex; align-items:center; gap:9px;
  box-shadow:0 6px 18px -6px rgba(0,0,0,.7);
}
.riel::before,.riel::after{
  content:''; position:absolute; left:0; right:0; height:6px;
  background-image:radial-gradient(circle at 3.5px 3px,var(--tinta) 0 2.8px,transparent 2.9px);
  background-size:var(--paso) 6px; background-repeat:repeat-x;
}
.riel::before{top:3px} .riel::after{bottom:3px}
.riel svg{display:block;width:22px;height:auto}
.riel polygon{fill:currentColor}
.etiqueta{font-size:12px;font-weight:800;font-stretch:74%;letter-spacing:.14em;text-transform:uppercase}

.cuerpo{
  flex:1; min-height:0;
  display:flex; flex-direction:column; justify-content:center;
  align-items:flex-start;      /* sin esto un hijo inline se estira a lo ancho */
  gap:calc(var(--paso)*1.1);
  padding:calc(var(--paso)*1.2) 20px;
  width:100%; max-width:560px;
}
h1{
  font-size:clamp(38px,13vw,72px); font-weight:800; font-stretch:62%;
  line-height:.88; letter-spacing:-.035em; text-transform:uppercase;
}

/* La ventana: el agujero blanco donde vive el objeto ajeno. */
.ventana{
  width:100%;
  background:var(--perforado); color:#241f1c;
  padding:18px 16px;
  box-shadow:0 6px 18px -6px rgba(0,0,0,.7);
  display:grid; justify-items:center; gap:12px;
}
.ventana__pie{
  font-size:12px;font-weight:800;font-stretch:76%;
  letter-spacing:.12em;text-transform:uppercase;color:#5c534e;text-align:center;
}
.ventana__pie code{font-family:inherit;color:#241f1c}

.aviso{
  width:100%;
  padding:12px 14px;
  background:var(--tinta-quemada); color:var(--emulsion);
  font-size:16px; line-height:1.4;
  box-shadow:inset 0 2px 6px rgba(0,0,0,.55);
}
.aviso b{
  display:block;margin-bottom:3px;
  font-size:12px;font-weight:800;font-stretch:74%;
  letter-spacing:.13em;text-transform:uppercase;color:#ff5a1a;
}

/* `align-self` explicito: dentro de una columna flex, un inline-flex se estira
   igualmente y el subrayado cruzaba la pantalla entera. */
.otra-cuenta{
  align-self:flex-start;
  display:inline-flex; align-items:center; min-height:48px;
  padding:0 14px;
  background:var(--tinta); color:#ff5a1a;
  font-size:12px;font-weight:800;font-stretch:76%;
  letter-spacing:.11em;text-transform:uppercase;text-decoration:none;
}
.otra-cuenta:hover{background:var(--sobre-naranja)}

.cuerpo>*{animation:enhebrar 760ms var(--ease-tira) both}
.cuerpo>*:nth-child(2){animation-delay:70ms}
.cuerpo>*:nth-child(3){animation-delay:130ms}
.cuerpo>*:nth-child(4){animation-delay:190ms}
@keyframes enhebrar{
  from{transform:translate3d(0,calc(var(--paso)*-5),0);opacity:0;filter:blur(6px)}
  70%{filter:blur(0)}
  to{transform:none;opacity:1;filter:blur(0)}
}
@media (prefers-reduced-motion:reduce){.cuerpo>*{animation:none}}
</style>
</head>
<body>
  <header class="riel">
    <svg viewBox="0 0 521.16 420.36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61"/>
    </svg>
    <span class="etiqueta">Bitácora</span>
  </header>

  <main class="cuerpo">
    <h1>La mesa<br>está lista</h1>

    <div class="ventana">
      <div id="g_id_onload"
           data-client_id="<?= htmlspecialchars(GOOGLE_CLIENT_ID, ENT_QUOTES) ?>"
           data-context="signin"
           data-ux_mode="popup"
           data-login_uri="<?= htmlspecialchars(URL_ACCESO, ENT_QUOTES) ?>"
           data-hd="<?= htmlspecialchars(DOMINIO_PERMITIDO, ENT_QUOTES) ?>"
           data-auto_prompt="false"></div>
      <div class="g_id_signin"
           data-type="standard"
           data-theme="outline"
           data-text="continue_with"
           data-shape="rectangular"
           data-size="large"
           data-locale="es"
           data-logo_alignment="left"></div>
      <p class="ventana__pie">Solo cuentas <code>@<?= htmlspecialchars(DOMINIO_PERMITIDO, ENT_QUOTES) ?></code></p>
    </div>

    <?php if (!empty($errorAcceso)): ?>
      <p class="aviso"><b>No se pudo entrar</b><?= htmlspecialchars($errorAcceso, ENT_QUOTES) ?></p>
    <?php endif; ?>

    <!--
      La salida a otra cuenta. Va SIEMPRE visible, no solo tras un fallo.

      Casi todo el mundo tiene varias cuentas de Google abiertas a la vez y el
      navegador elige la personal por defecto. Sin este enlace, quien entra con
      la equivocada se queda mirando un error sin manera evidente de cambiar:
      Google recuerda la seleccion y volver a pulsar el boton repite el mismo
      fallo. AccountChooser fuerza el selector y devuelve aqui.
    -->
    <a class="otra-cuenta" href="https://accounts.google.com/AccountChooser?continue=<?= rawurlencode(URL_ACCESO) ?>">
      <?= !empty($ofrecerOtraCuenta) ? 'Cambiar de cuenta' : '¿Varias cuentas? Elige otra' ?>
    </a>
  </main>

  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script>
    // Que Google no reutilice en silencio la ultima cuenta elegida. Sin esto,
    // quien se equivoco una vez se queda atrapado repitiendo el mismo error sin
    // ver siquiera con que cuenta lo esta intentando.
    window.addEventListener('load', function () {
      if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect()
      }
    })
  </script>
</body>
</html>
