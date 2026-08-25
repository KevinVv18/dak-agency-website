<?php /* La pantalla de acceso. La incluye index.php cuando no hay sesion. */ ?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#123A2A">
<title>DAK · Documentos de socios</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo+Narrow:wght@400;700&family=Archivo:wght@400;700&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23123A2A'/%3E%3Crect x='5' y='7' width='22' height='5' fill='%23D93A14'/%3E%3Crect x='5' y='15' width='22' height='3' fill='%23EFEAD8'/%3E%3Crect x='5' y='21' width='14' height='3' fill='%23EFEAD8'/%3E%3C/svg%3E">
<style>
/* Misma puerta que ventas.dakagency.net, en la paleta de estos documentos: dos
   tintas de prensa sobre verde inundado. Quien la cruza no deberia notar que
   estaba en otro sitio. */
:root{
  --tinta:#123A2A; --senal:#D93A14; --papel:#DDD6C4; --calado:#F1ECDE;
  --apagado:#9FB3A9; --exp:cubic-bezier(.16,1,.3,1);
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{
  display:grid; place-items:center; padding:24px;
  background:var(--tinta); color:var(--calado);
  font-family:Archivo,system-ui,sans-serif; font-size:15px; line-height:1.6;
  -webkit-font-smoothing:antialiased; position:relative; overflow-x:hidden;
}
/* la trama de semitono del documento, para que la puerta sea del mismo papel */
body::before{
  content:""; position:fixed; inset:0; pointer-events:none;
  background-image:radial-gradient(currentColor .9px,transparent .9px);
  background-size:7px 7px; opacity:.13;
}
::selection{background:var(--senal);color:#fff}
:focus-visible{outline:3px solid var(--senal);outline-offset:3px}

.puerta{width:100%;max-width:395px;position:relative;z-index:1}

.marca{width:52px;margin-bottom:34px}
.marca svg{display:block;width:100%;height:auto}
.marca polygon{fill:var(--calado)}

h1{
  font-family:'Archivo Black',system-ui,sans-serif; font-weight:400;
  font-size:clamp(1.9rem,1.3rem + 2.4vw,2.6rem); line-height:.96;
  letter-spacing:-.03em; text-transform:uppercase; margin-bottom:.9rem;
}
.frase{color:var(--papel);margin-bottom:1.7rem;max-width:32ch}

/* la regla doble de la portada del documento */
.regla{border-top:6px solid var(--calado);border-bottom:2px solid var(--calado);height:11px;margin-bottom:1.7rem}

.boton{display:flex;min-height:44px}

.aviso{
  display:flex;align-items:flex-start;gap:11px;
  margin-top:1.5rem;padding:.85rem 1rem; text-align:left;
  border:3px solid var(--senal); background:var(--senal); color:#fff;
  font-family:'Archivo Narrow',system-ui,sans-serif; font-size:.92rem; line-height:1.5;
}
.aviso b{flex:none;width:7px;height:7px;margin-top:.52rem;background:#fff;transform:rotate(45deg)}

.pie{
  margin-top:1.9rem;padding-top:.8rem;border-top:2px solid #3B6153;
  font-family:'Archivo Narrow',system-ui,sans-serif; font-size:.85rem;
  letter-spacing:.03em; line-height:1.55; color:var(--apagado);
}
.pie code{font-family:inherit;color:var(--calado)}

/* Entrada sobria: la misma que hace el documento al abrirse. */
.puerta>*{animation:entra 420ms var(--exp) both}
.puerta>*:nth-child(2){animation-delay:70ms}
.puerta>*:nth-child(3){animation-delay:120ms}
.puerta>*:nth-child(4){animation-delay:170ms}
.puerta>*:nth-child(5){animation-delay:220ms}
.puerta>*:nth-child(6){animation-delay:270ms}
@keyframes entra{from{opacity:0;transform:translateY(10px)}}
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

    <h1>Documentos de socios</h1>
    <p class="frase">Entra con tu cuenta de DAK.</p>
    <div class="regla"></div>

    <?php if (PUERTA_CONFIGURADA): ?>
      <div class="boton">
        <div id="g_id_onload"
             data-client_id="<?= htmlspecialchars(GOOGLE_CLIENT_ID, ENT_QUOTES) ?>"
             data-context="signin"
             data-ux_mode="popup"
             data-login_uri="/"
             data-hd="<?= htmlspecialchars(DOMINIO_PERMITIDO, ENT_QUOTES) ?>"
             data-auto_prompt="false"></div>
        <div class="g_id_signin"
             data-type="standard"
             data-theme="filled_black"
             data-text="continue_with"
             data-shape="rectangular"
             data-size="large"
             data-logo_alignment="left"></div>
      </div>
    <?php else: ?>
      <p class="aviso"><b></b><span>La puerta todavía no tiene identificador de Google. Hasta que lo tenga no entra nadie, que es como debe fallar.</span></p>
    <?php endif; ?>

    <?php if (!empty($errorAcceso)): ?>
      <p class="aviso"><b></b><span><?= htmlspecialchars($errorAcceso, ENT_QUOTES) ?></span></p>
    <?php endif; ?>

    <p class="pie">Solo cuentas <code>@<?= htmlspecialchars(DOMINIO_PERMITIDO, ENT_QUOTES) ?></code>.<br>Aquí dentro hay honorarios, márgenes y posición de negociación. No circula fuera de la sociedad.</p>
  </main>

  <?php if (PUERTA_CONFIGURADA): ?>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  <?php endif; ?>
</body>
</html>
