<?php /* La pantalla de acceso. La incluye index.php cuando no hay sesion. */ ?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="theme-color" content="#030106">
<title>DAK · Bitácora</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500&display=swap" rel="stylesheet">
<style>
/* Misma paleta y mismas curvas que la aplicacion: quien pasa esta puerta no
   deberia notar que estaba en otro sitio. */
:root{
  --fondo:#030106; --superficie:#0a0612; --linea:rgba(255,255,255,.07);
  --text:#f4f1f8; --secondary:rgba(244,241,248,.74); --muted:rgba(244,241,248,.58);
  --teal:#3ddad7; --danger:#ff9b9b;
  --ease:cubic-bezier(.32,.72,0,1);
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{
  display:grid; place-items:center; padding:24px;
  background:var(--fondo); color:var(--text);
  font-family:Poppins,system-ui,sans-serif; font-size:15px;
  -webkit-font-smoothing:antialiased;
}
.puerta{width:100%;max-width:360px;text-align:center}

.marca{width:56px;margin:0 auto 30px}
.marca svg{display:block;width:100%;height:auto}
.marca polygon{fill:var(--text)}

h1{font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.frase{font-size:20px;font-weight:200;line-height:1.4;letter-spacing:-.01em;margin-bottom:34px}

.boton{display:flex;justify-content:center;min-height:44px}

.aviso{
  display:flex;align-items:flex-start;gap:9px;
  margin-top:26px;padding:13px 15px;text-align:left;
  border:1px solid rgba(255,155,155,.3);border-radius:12px;
  background:var(--superficie);color:var(--danger);
  font-size:14px;line-height:1.5;
}
.aviso b{flex:none;width:5px;height:5px;margin-top:8px;border-radius:50%;background:var(--danger)}

.pie{margin-top:30px;color:var(--muted);font-size:14px;line-height:1.9}
.pie code{font-family:inherit;color:var(--secondary)}
.otra-cuenta{
  display:inline-block;min-height:44px;line-height:44px;
  color:var(--teal);text-decoration:none;
  border-bottom:1px solid transparent;
  transition:border-color var(--t-corta,240ms) var(--ease);
}
.otra-cuenta:hover,.otra-cuenta:focus-visible{border-bottom-color:var(--teal)}

.puerta>*{animation:entra 380ms var(--ease) both}
.puerta>*:nth-child(2){animation-delay:60ms}
.puerta>*:nth-child(3){animation-delay:110ms}
.puerta>*:nth-child(4){animation-delay:160ms}
.puerta>*:nth-child(5){animation-delay:210ms}
@keyframes entra{from{opacity:0;transform:translateY(8px)}}
@media (prefers-reduced-motion:reduce){.puerta>*{animation:none}}
</style>
</head>
<body>
  <main class="puerta">
    <div class="marca" aria-hidden="true">
      <svg viewBox="0 0 521.16 420.36" xmlns="http://www.w3.org/2000/svg">
        <polygon points="521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61"/>
      </svg>
    </div>

    <h1>Bitácora</h1>
    <p class="frase">Entra con tu cuenta de DAK.</p>

    <div class="boton">
      <div id="g_id_onload"
           data-client_id="<?= htmlspecialchars(GOOGLE_CLIENT_ID, ENT_QUOTES) ?>"
           data-context="signin"
           data-ux_mode="popup"
           data-login_uri="<?= htmlspecialchars(URL_ACCESO, ENT_QUOTES) ?>"
           data-hd="<?= htmlspecialchars(DOMINIO_PERMITIDO, ENT_QUOTES) ?>"
           data-auto_prompt="false"></div>
      <div class="g_id_signin"
           data-type="standard"
           data-theme="filled_black"
           data-text="continue_with"
           data-shape="pill"
           data-size="large"
           data-locale="es"
           data-logo_alignment="left"></div>
    </div>

    <?php if (!empty($errorAcceso)): ?>
      <p class="aviso"><b></b><span><?= htmlspecialchars($errorAcceso, ENT_QUOTES) ?></span></p>
    <?php endif; ?>

    <!--
      La salida a otra cuenta. Va SIEMPRE visible, no solo tras un fallo.

      Casi todo el mundo tiene varias cuentas de Google abiertas a la vez y el
      navegador elige la personal por defecto. Sin este enlace, quien entra con
      la equivocada se queda mirando un error sin manera evidente de cambiar:
      Google recuerda la seleccion y volver a pulsar el boton repite el mismo
      fallo. AccountChooser fuerza el selector y devuelve aqui.
    -->
    <p class="pie">
      Solo cuentas <code>@<?= htmlspecialchars(DOMINIO_PERMITIDO, ENT_QUOTES) ?></code>.<br>
      <a class="otra-cuenta" href="https://accounts.google.com/AccountChooser?continue=<?= rawurlencode(URL_ACCESO) ?>">
        <?= !empty($ofrecerOtraCuenta) ? 'Cambiar de cuenta de Google' : '¿Tienes varias cuentas? Elige otra' ?>
      </a>
    </p>
  </main>

  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script>
    // Que Google no reutilice en silencio la ultima cuenta elegida. Sin esto,
    // quien se equivoco una vez se queda atrapado repitiendo el mismo error
    // sin ver siquiera con que cuenta lo esta intentando.
    window.addEventListener('load', function () {
      if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect()
      }
    })
  </script>
</body>
</html>
