<?php /* La pantalla de acceso. La incluye index.php cuando no hay sesion. */ ?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>DAK · Centro de Ventas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500&display=swap" rel="stylesheet">
<style>
/* Misma paleta y mismas curvas que el panel: quien pasa esta puerta no deberia
   notar que estaba en otro sitio. El acento es el oro, el morado solo en la
   marca — igual que dentro. */
:root{
  --fondo:#030106; --superficie:#0a0612; --linea:rgba(255,255,255,.07);
  --linea-viva:rgba(255,255,255,.14); --text:#f4f1f8;
  --secondary:rgba(244,241,248,.74); --muted:rgba(244,241,248,.58);
  --oro:#E8B562; --purple:#b93eff; --danger:#ff9b9b;
  --ease:cubic-bezier(.32,.72,0,1);
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{
  display:grid; place-items:center; padding:24px;
  background:var(--fondo); color:var(--text);
  font-family:Poppins,system-ui,sans-serif; font-size:14px;
  -webkit-font-smoothing:antialiased;
}
.puerta{width:100%;max-width:380px;text-align:center}

/* La D del logo, la misma que vive en el rail del panel. */
.marca{width:60px;margin:0 auto 30px}
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

.pie{margin-top:30px;color:var(--muted);font-size:14px;line-height:1.55}
.pie code{font-family:inherit;color:var(--secondary)}

/* Entrada sobria: lo mismo que hace el contenido del panel al aparecer. */
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

    <h1>Centro de Ventas</h1>
    <p class="frase">Entra con tu cuenta de DAK.</p>

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
           data-shape="pill"
           data-size="large"
           data-logo_alignment="left"></div>
    </div>

    <?php if (!empty($errorAcceso)): ?>
      <p class="aviso"><b></b><span><?= htmlspecialchars($errorAcceso, ENT_QUOTES) ?></span></p>
    <?php endif; ?>

    <p class="pie">Solo cuentas <code>@<?= htmlspecialchars(DOMINIO_PERMITIDO, ENT_QUOTES) ?></code>.<br>Aquí dentro hay datos de prospectos reales.</p>
  </main>

  <script src="https://accounts.google.com/gsi/client" async defer></script>
</body>
</html>
