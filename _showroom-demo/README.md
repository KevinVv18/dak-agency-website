# Showroom de edificios — demo DAK

Segunda línea de producto inmobiliario: showroom web para edificios en preventa
(edificio → piso → departamento → ficha → tour → consulta). Inspirado en la
experiencia de President Tower / Urbania 3D, sin usar ninguno de sus materiales.

- Plan maestro: [`docs/PLAN-MAESTRO.md`](docs/PLAN-MAESTRO.md)
- Estado: **Fase 1 (búsqueda del ejemplar)**. Nada desplegado.

> Carpeta **sin workflow ni subdominio** todavía. Cuando se cree el subdominio en
> hPanel, seguir el patrón de `AGENTS.md` («Cómo se añade una superficie que no es
> la SPA»): workflow propio + entrada en `deploy-protect.txt` mergeada el mismo día.

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
