# El puente hacia DAK LEADS MASTER

`Codigo.gs` se pega a mano en Apps Script (Extensiones → Apps Script en la hoja) y se publica con
**Implementar → Gestionar implementaciones → ✏️ → Nueva versión**. Nunca «Nueva implementación»:
eso da una URL distinta y hay que reconectar el panel.

## Antes de pasárselo a nadie, comprobarlo

Apps Script corre sobre V8, así que `node --check` detecta los mismos errores de sintaxis:

```bash
cp apps-script/Codigo.gs /tmp/c.js && node --check /tmp/c.js
```

Esto no es opcional. Un `var` mal puesto no se ve leyendo el archivo y el error solo aparece
cuando la persona ya está delante del editor de Google.

## La trampa que ya nos pilló una vez

`var` es de ámbito de FUNCIÓN, no de bloque. Un `var hoja` dentro de un bucle de `doPost` choca con
el `const hoja` que hay más abajo en esa misma función, y **el script entero deja de compilar** —
no solo esa línea.

Por eso aquí no queda ni un `var`. Si hace falta un bucle, `for...of` con `const`.
