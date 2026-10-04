# Showroom de edificios — demo DAK

Segunda línea de producto inmobiliario: showroom web para edificios en preventa
(edificio → piso → departamento → ficha → tour → consulta). Inspirado en la
experiencia de President Tower / Urbania 3D, sin usar ninguno de sus materiales.

- Plan maestro: [`docs/PLAN-MAESTRO.md`](docs/PLAN-MAESTRO.md)
- Resultados de la búsqueda y del mercado: [`docs/INVESTIGACION-FASE1.md`](docs/INVESTIGACION-FASE1.md)
- Estado: Fase 1 cerrada con candidato; **motor en esquema** (cajas grises, sin
  material visual). Nada desplegado.

## Cómo se trabaja

```
node _showroom-demo/generar.js     # valida datos y escribe dist/
```

Vista local: configuración `showroom` de `.claude/launch.json` (sirve `dist/` en
el puerto 4340).

- `datos/` — proyecto, edificio (vistas, plantillas, pisos), tipologías,
  unidades. **Única fuente de verdad**: el generador la serializa a
  `dist/datos.js` y el navegador lee lo mismo.
- `src/core.js` / `src/core.css` — el motor. No contiene ningún dato del
  proyecto; clonar para otro edificio = cambiar `datos/`.
- `generar.js` — **falla el build** si los datos se contradicen: IDs
  duplicados, precio 0, vendido con precio, posición de planta sin unidad o con
  dos, tipología inexistente, coordenadas fuera de 0–1.
- Una página por ruta (`piso/7/`, `departamento/701/`), así un enlace o un QR
  abre directo sin reescrituras en Apache. El estado de interfaz (vista, modo,
  depto elegido, pestaña, filtros) va en la query; nunca datos personales.
- La consulta está en **modo demo**: muestra lo que llegaría al asesor y no
  envía nada.

Cada recurso visual pendiente se dibuja como marcador que dice qué irá ahí.
Cuando llegue el material, se rellenan los `null` de `datos/` (`imagen`,
`planta.amoblada`, etc.) y el motor deja de dibujar el marcador.

> Carpeta **sin workflow ni subdominio** todavía. Cuando se cree el subdominio en
> hPanel, seguir el patrón de `AGENTS.md` («Cómo se añade una superficie que no es
> la SPA»): workflow propio + entrada en `deploy-protect.txt` mergeada el mismo día.

## Producción visual (gratis, en local)

Todo el material visual sale de un **edificio procedural** en Blender: no hay
modelo comprado ni dibujado a mano.

```
python  _showroom-demo/produccion/recursos.py      # baja los recursos CC0 (una vez)
blender -b -P _showroom-demo/produccion/edificio.py -- --vista web_frente --ancho 1920 --alto 1080 --out x.png
```

- Blender 5.2 LTS portable en `C:\Users\kevin\tools\blender\` (Cycles por GPU).
- `edificio.py`: el edificio sale de `PARAM` (frente, fondo, pisos, alturas) y
  el color de acento es un argumento. Incluye el barrio alrededor (casas de 1–4
  pisos con la paleta de Chiclayo, tanques de agua, avenida con berma central)
  y medianeras de ladrillo a la altura real de los vecinos.
- `recursos.py`: lista versionada de recursos de **Poly Haven (CC0)** —árboles
  tipo faique/algarrobo, helechos, pasto, texturas, cielo—. Los archivos van a
  una caché fuera del repo (`~/tools/recursos-showroom`).
- Las vistas `web_*` de `edificio.py` son las mismas que `datos/edificio.js`
  declara en `camara`: cada imagen publicada se puede regenerar.
- `interior.py`: un layout por tipología (ambientes, muros con vanos, escenas)
  del que salen **la planta amoblada** (render cenital con muros cortados), **el
  plano técnico** (SVG con áreas, sin Blender) y **los panoramas 360**
  (equirectangulares, con los enlaces entre escenas calculados de las
  posiciones de cámara). Por eso planta, plano, recorrido y ficha cuadran.

  ```
  python  produccion/interior.py --tipo A --plano assets/plantas/tipo-a-plano-v1.svg --escenas-json escenas.json
  blender -b -P produccion/interior.py -- --tipo A --salida planta --out planta.png
  blender -b -P produccion/interior.py -- --tipo A --salida 360 --escena sala --out sala.jpg
  ```

- `muebles.py`: muebles y vestido de los interiores (sofá de bouclé, comedor de
  roble con sillas de cuerda, camas tapizadas, cocina en L con repisa LED,
  baños con mueble flotante, cortinas de lino, plafones encendidos), el pozo de
  luz que se ve por las ventanas de la medianera y el hall tras la puerta de
  entrada. Poly Haven casi no tiene mobiliario actual: los muebles se modelan
  aquí y de Poly Haven salen telas, maderas y accesorios. La vara de acabado son
  los renders de Domaria (oct-2026).
- Noche (`edificio.py --noche`): cada ventana del edificio tiene un cuarto real
  detrás (vaciado del volumen con un booleano), con plafón cálido y siluetas de
  muebles; luz rasante en las celosías, pista mojada, LED en el cerco y cielo
  de hora azul. Antes el muro macizo tapaba los interiores y las ventanas no se
  veían encendidas.
- **Giro 360 de dron** (`edificio.py --orbita 60`): la cámara da la vuelta al
  edificio a altura de dron y deja un cuadro cada 6°, más `franjas.json` (piso
  por cuadro) y `rotulos.json` (dónde caen los letreros). La escena se arma una
  sola vez; los cuadros existentes se saltan. Los vecinos de dos lotes por lado
  van como maqueta translúcida (`--fantasma`), y la fachada posterior es la
  delantera reflejada. En la web se arrastra para girar; la portada usa los
  mismos cuadros como intro que pasa del día a la noche.
- **Vistas de calle con vecino fantasma**: las diagonales tienen una variante
  `--fantasma` que la web funde encima al elegir un piso, así la franja no cae
  sobre la casa de al lado.
- **Pase de realismo con IA** (`realismo.py`, `lote_realismo.py`): Stable
  Diffusion XL local (RealVisXL V5 + ControlNet canny + VAE fp16) en img2img con
  poca fuerza. Es el recurso de los renders de la competencia, gratis y en la
  GPU propia; la geometría no se mueve (las franjas siguen calzando) y los
  letreros se reponen del render original. Entorno en `~/tools/ia-render`.
- `comunes.py`: planta del piso 1 (recepción, depósitos y cocheras). La azotea
  sale de `edificio.py --vista planta_azotea`, de la misma escena del giro.
- `publicar.py`: convierte renders + pase de IA en assets versionados
  (`assets/giro/<modo>-vN/`, `assets/exterior/*-vN.webp`, plantas) y escribe
  `datos/giro.json` con las franjas de cada cuadro.

  ```
  blender -b -P produccion/edificio.py -- --orbita 60 --orbita-dir R/giro/dia --muestras 64 --ancho 1600 --alto 900
  blender -b -P produccion/edificio.py -- --vista web_diag_izq --fantasma --muestras 256 --ancho 1920 --alto 1080 --out R/calle/dia_web_diag_izq_fantasma.png
  ~/tools/ia-render/venv/Scripts/python produccion/lote_realismo.py R IA
  python produccion/publicar.py R IA --version 2
  ```

- El visor 360 es **Pannellum 2.5.7 (MIT)** en `vendor/`, cargado solo al
  abrir un recorrido.

## Varios proyectos con el mismo motor

`node generar.js` genera la vitrina pública (esta carpeta). `node generar.js
privado/<cliente>` genera el showroom de un cliente real desde su carpeta,
excluida de git porque **el repo es público**. Ver `privado/<cliente>/FICHA.md`.
- Referencia de estilo: el tipo de edificio del cliente objetivo (VARU I).
  Sus renders son **solo referencia y no se publican**.

## Hallazgo técnico sobre la referencia (3-oct-2026)

Inspeccionando las peticiones de red de `president-tower.urbania3d.app`:

- **No hay 3D en tiempo real.** Cero `<canvas>`, cero WebGL. El "giro 360°" del
  exterior son **paradas fijas (PNG) unidas por clips MP4 de transición**
  (`buildings/<id>/exterior/*.mp4`), más clips `exterior/floors-intro/*.mp4` para
  entrar al selector de pisos. La portada también es un MP4.
- La selección de unidades son **polígonos SVG** sobre imágenes.
- El tour interior es un **embed de Kuula**.

Consecuencia: el visor es la parte barata. El costo real está en **producir el
material visual** (paradas, transiciones, plantas, panoramas) y en que todo sea
coherente entre sí.
