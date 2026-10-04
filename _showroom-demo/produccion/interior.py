"""Interiores de los departamentos (Blender 5.2, Cycles).

Un solo layout por tipología (LAYOUTS) alimenta tres salidas que por eso no
pueden contradecirse:
  - planta amoblada: render cenital con los muros cortados a 2,2 m
  - panoramas 360: cámara equirectangular en cada escena, con techo y luces
  - plano técnico: SVG generado de las mismas medidas (sin Blender)

Uso:
  blender -b -P interior.py -- --tipo A --salida planta --out planta.png
  blender -b -P interior.py -- --tipo A --salida 360 --escena sala --out sala.jpg
  python interior.py --tipo A --plano plano.svg        (solo el SVG, sin Blender)
"""

import argparse
import json
import math
import sys
from pathlib import Path

# ── Layouts ──────────────────────────────────────────────────────────────────
# Coordenadas en metros dentro de la unidad. x: de la medianera (0) al núcleo
# (ancho). y: de la fachada con ventanal (0) hacia el fondo.
# Ambientes: (id, nombre o None, x0, y0, x1, y1, piso)
# Muros: (x0, y0, x1, y1, grosor, vanos) con vanos (desde, hasta, tipo) medidos
# a lo largo del muro desde (x0, y0). Tipos: puerta, entrada, ventana, mampara.
# Escenas 360: id -> (x, y, nombre); la altura de cámara es la de ojo.

LAYOUT_A = {
    'ancho': 6.0,
    'fondo': 11.0,
    'ambientes': [
        ('sala', 'Sala-comedor', 0, 0, 6.0, 3.8, 'porcelanato'),
        ('cocina', 'Cocina', 0, 3.8, 2.8, 6.0, 'porcelanato'),
        ('pasillo', None, 2.8, 3.8, 3.8, 8.3, 'porcelanato'),
        ('bano2', 'Baño', 3.8, 3.8, 6.0, 6.0, 'ceramico'),
        ('dorm2', 'Dormitorio 2', 0, 6.0, 2.8, 8.3, 'laminado'),
        ('dorm3', 'Dormitorio 3', 3.8, 6.0, 6.0, 8.3, 'laminado'),
        ('principal', 'Dormitorio principal', 0, 8.3, 4.2, 11.0, 'laminado'),
        ('bano1', 'Baño principal', 4.2, 8.3, 6.0, 11.0, 'ceramico'),
    ],
    'muros': [
        (0, 0, 6.0, 0, 0.25, [(0.5, 5.5, 'mampara')]),
        (0, 0, 0, 11.0, 0.25, [(0.6, 2.2, 'ventana'), (9.0, 10.3, 'ventana'), (6.6, 7.6, 'ventana')]),
        (6.0, 0, 6.0, 11.0, 0.2, [(2.7, 3.6, 'entrada'), (6.6, 7.6, 'ventana')]),
        (0, 11.0, 6.0, 11.0, 0.2, []),
        (3.8, 3.8, 6.0, 3.8, 0.12, []),
        (2.8, 3.8, 2.8, 6.0, 0.12, []),
        (0, 6.0, 2.8, 6.0, 0.12, []),
        (3.8, 3.8, 3.8, 6.0, 0.12, [(0.35, 1.05, 'puerta')]),
        (3.8, 6.0, 6.0, 6.0, 0.12, []),
        (2.8, 6.0, 2.8, 8.3, 0.12, [(0.3, 1.1, 'puerta')]),
        (3.8, 6.0, 3.8, 8.3, 0.12, [(0.3, 1.1, 'puerta')]),
        (0, 8.3, 6.0, 8.3, 0.12, [(2.9, 3.7, 'puerta')]),
        (4.2, 8.3, 4.2, 11.0, 0.12, [(0.35, 1.05, 'puerta')]),
    ],
    'escenas': {
        'sala': (2.95, 2.95, 'Sala y comedor'),
        'cocina': (1.15, 4.4, 'Cocina'),
        'principal': (2.0, 8.62, 'Dormitorio principal'),
    },
}

# Tipo B: misma estructura, con el dormitorio 3 convertido en estudio.
LAYOUT_B = json.loads(json.dumps(LAYOUT_A))
LAYOUT_B['ambientes'] = [tuple(a) for a in LAYOUT_B['ambientes']]
LAYOUT_B['ambientes'][5] = ('estudio', 'Estudio', 3.8, 6.0, 6.0, 8.3, 'laminado')
LAYOUT_B['escenas'] = {
    'sala': (2.95, 2.95, 'Sala y cocina'),
    'principal': (2.0, 8.62, 'Dormitorio principal'),
}

LAYOUTS = {'A': LAYOUT_A, 'B': LAYOUT_B}

ALTO = 2.6          # piso a techo
CORTE = 2.2         # altura de corte de muros en la planta amoblada
OJO = 1.55


def area_ambiente(a):
    _, _, x0, y0, x1, y1, _ = a
    return (x1 - x0) * (y1 - y0)


def ambiente_en(L, x, y):
    for a in L['ambientes']:
        if a[2] <= x <= a[4] and a[3] <= y <= a[5]:
            return a[0]
    return None


def bisagra(L, x0, y0, ux, uy, d, h, tipo):
    """Dónde va la bisagra y hacia dónde abre cada puerta: hacia el baño si da
    a uno, si no hacia el ambiente que no es circulación; la entrada abre hacia
    adentro. La bisagra va en el extremo más cercano a una esquina del ambiente,
    para que la hoja abierta quede contra el muro y no en medio del paso.
    Devuelve (x, y, ángulo de la hoja)."""
    nx, ny = -uy, ux
    m = (d + h) / 2
    mx, my = x0 + ux * m, y0 + uy * m
    izq = ambiente_en(L, mx + 0.4 * nx, my + 0.4 * ny)
    der = ambiente_en(L, mx - 0.4 * nx, my - 0.4 * ny)

    def peso(r):
        if r is None:
            return -1
        return 2 if r.startswith('bano') else (0 if r in ('pasillo', 'sala') else 1)
    if tipo == 'entrada':
        lado = 1 if izq else -1
    else:
        lado = 1 if peso(izq) >= peso(der) else -1
    destino = izq if lado > 0 else der
    rect = next(a for a in L['ambientes'] if a[0] == destino) if destino else None
    if tipo == 'entrada' or rect is None:
        extremo = d
    else:
        horiz = abs(ux) > 0.5
        a0, a1 = (rect[2], rect[4]) if horiz else (rect[3], rect[5])
        pos = (lambda t: x0 + ux * t) if horiz else (lambda t: y0 + uy * t)
        dist = lambda t: min(abs(pos(t) - a0), abs(pos(t) - a1))
        extremo = d if dist(d) <= dist(h) else h
    return x0 + ux * extremo, y0 + uy * extremo, math.atan2(lado * ny, lado * nx)


# ── Plano técnico (SVG, sin Blender) ─────────────────────────────────────────

def plano_svg(L, titulo=''):
    """Muros en negro con sus vanos, arcos de puerta, ventanas en doble línea y
    cada ambiente con su nombre y su área. Escala: 1 m = 100 unidades. Se rota
    para que la fachada quede a la izquierda, igual que la planta amoblada."""
    S = 100
    m = 60
    W, F = L['ancho'], L['fondo']
    ancho_svg, alto_svg = F * S + 2 * m, W * S + 2 * m

    def P(x, y):  # unidad -> svg (rotado: y de la unidad es el eje horizontal; igual que el render)
        return m + y * S, m + x * S

    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho_svg:.0f} {alto_svg:.0f}" '
           f'font-family="system-ui, Segoe UI, sans-serif">',
           f'<rect width="100%" height="100%" fill="#fbfaf7"/>']
    for a in L['ambientes']:
        _, nombre, x0, y0, x1, y1, piso = a
        (sx0, sy0), (sx1, sy1) = P(x0, y0), P(x1, y1)
        relleno = {'ceramico': '#eef1f3', 'laminado': '#f5efe6'}.get(piso, '#fbfaf7')
        out.append(f'<rect x="{sx0:.1f}" y="{sy0:.1f}" width="{sx1 - sx0:.1f}" height="{sy1 - sy0:.1f}" fill="{relleno}"/>')
        if nombre:
            cx, cy = (sx0 + sx1) / 2, (sy0 + sy1) / 2
            out.append(f'<text x="{cx:.1f}" y="{cy - 4:.1f}" font-size="19" text-anchor="middle" fill="#2a2a28">{nombre}</text>')
            area = f'{area_ambiente(a):.1f}'.replace('.', ',')
            out.append(f'<text x="{cx:.1f}" y="{cy + 20:.1f}" font-size="16" text-anchor="middle" fill="#6b6a64">{area} m²</text>')
    for x0, y0, x1, y1, g, vanos in L['muros']:
        largo = math.hypot(x1 - x0, y1 - y0)
        ux, uy = (x1 - x0) / largo, (y1 - y0) / largo
        cortes = [0.0]
        for d, h, _ in sorted(vanos):
            cortes += [d, h]
        cortes.append(largo)
        for i in range(0, len(cortes), 2):
            a, b = cortes[i], cortes[i + 1]
            if b - a <= 0.001:
                continue
            ax, ay = P(x0 + ux * a, y0 + uy * a)
            bx, by = P(x0 + ux * b, y0 + uy * b)
            gx, gy = (g * S / 2, 0) if abs(ax - bx) < 0.01 else (0, g * S / 2)
            xa, xb = sorted((ax - gx, bx + gx))
            ya, yb = sorted((ay - gy, by + gy))
            out.append(f'<rect x="{xa:.1f}" y="{ya:.1f}" width="{xb - xa:.1f}" height="{yb - ya:.1f}" fill="#1c1c1a"/>')
        for d, h, tipo in vanos:
            ax, ay = P(x0 + ux * d, y0 + uy * d)
            bx, by = P(x0 + ux * h, y0 + uy * h)
            if tipo in ('ventana', 'mampara'):
                vertical = abs(ax - bx) < 0.01
                for off in (-g * S / 4, g * S / 4):
                    if vertical:
                        out.append(f'<line x1="{ax + off:.1f}" y1="{ay:.1f}" x2="{bx + off:.1f}" y2="{by:.1f}" stroke="#1c1c1a" stroke-width="2"/>')
                    else:
                        out.append(f'<line x1="{ax:.1f}" y1="{ay + off:.1f}" x2="{bx:.1f}" y2="{by + off:.1f}" stroke="#1c1c1a" stroke-width="2"/>')
            else:
                r = math.hypot(bx - ax, by - ay)
                # hoja abierta 90° y arco de giro, hacia el lado positivo del muro
                vertical = abs(ax - bx) < 0.01
                if vertical:
                    hx, hy = ax + r, ay
                    out.append(f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{hx:.1f}" y2="{hy:.1f}" stroke="#1c1c1a" stroke-width="2.5"/>')
                    out.append(f'<path d="M {hx:.1f} {hy:.1f} A {r:.1f} {r:.1f} 0 0 {1 if by > ay else 0} {bx:.1f} {by:.1f}" fill="none" stroke="#1c1c1a" stroke-width="1" stroke-dasharray="4 4"/>')
                else:
                    hx, hy = ax, ay - r
                    out.append(f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{hx:.1f}" y2="{hy:.1f}" stroke="#1c1c1a" stroke-width="2.5"/>')
                    out.append(f'<path d="M {hx:.1f} {hy:.1f} A {r:.1f} {r:.1f} 0 0 {0 if bx > ax else 1} {bx:.1f} {by:.1f}" fill="none" stroke="#1c1c1a" stroke-width="1" stroke-dasharray="4 4"/>')
    # rótulos de orientación y escala
    out.append(f'<text x="{m - 14}" y="{alto_svg / 2:.0f}" font-size="15" fill="#6b6a64" text-anchor="middle" '
               f'transform="rotate(-90 {m - 14} {alto_svg / 2:.0f})">FACHADA · VENTANAL</text>')
    out.append(f'<line x1="{ancho_svg - m - 100}" y1="{alto_svg - 22}" x2="{ancho_svg - m}" y2="{alto_svg - 22}" stroke="#1c1c1a" stroke-width="3"/>')
    out.append(f'<text x="{ancho_svg - m - 50}" y="{alto_svg - 30}" font-size="14" text-anchor="middle" fill="#6b6a64">1 m</text>')
    if titulo:
        out.append(f'<text x="{m}" y="34" font-size="22" font-weight="600" fill="#1c1c1a">{titulo}</text>')
    out.append('</svg>')
    return '\n'.join(out)


def argumentos():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    p = argparse.ArgumentParser()
    p.add_argument('--tipo', default='A', choices=LAYOUTS.keys())
    p.add_argument('--salida', default='planta', choices=['planta', '360', 'piso'])
    p.add_argument('--escena', default='sala')
    p.add_argument('--out', default='//interior.png')
    p.add_argument('--plano', default='', help='escribir el plano técnico SVG aquí')
    p.add_argument('--escenas-json', default='', help='escribir escenas y enlaces del recorrido aquí')
    p.add_argument('--muestras', type=int, default=256)
    p.add_argument('--vista-ventana', default='', help='render de la vista exterior para ver por el ventanal (360)')
    p.add_argument('--espejo', action='store_true', help='voltear la vista (unidades del fondo, giradas en planta)')
    p.add_argument('--ancho', type=int, default=0)
    return p.parse_args(argv)


def escenas_json(L):
    """Escenas del recorrido con los enlaces entre ellas. El yaw sale de las
    posiciones reales de cámara, así cada flecha apunta a donde está la otra
    escena. Convención: yaw 0 mira hacia +y (hacia el fondo de la unidad)."""
    res = []
    for id_, (x, y, nombre) in L['escenas'].items():
        enlaces = []
        for otro, (ox, oy, onombre) in L['escenas'].items():
            if otro == id_:
                continue
            yaw = math.degrees(math.atan2(ox - x, oy - y))
            # la flecha se posa en el piso donde está la otra cámara: más lejos,
            # más cerca del horizonte, así dos destinos alineados no se enciman
            pitch = -math.degrees(math.atan2(OJO - 0.25, math.hypot(ox - x, oy - y)))
            enlaces.append({'a': otro, 'yaw': round(yaw, 1), 'pitch': round(pitch, 1), 'texto': onombre})
        res.append({'id': id_, 'nombre': nombre, 'enlaces': enlaces})
    return res


# ── Blender ──────────────────────────────────────────────────────────────────

def blender_main(a):
    import bpy
    sys.path.insert(0, str(Path(__file__).parent))
    import edificio as E   # reutiliza materiales, cajas, recursos y vegetación

    L = LAYOUTS[a.tipo]
    E.limpiar()
    E.cargar_vegetacion(['potted_plant_02', 'potted_plant_04'])
    import muebles as MB
    caja = E.caja
    M = MB.materiales()
    M.update({
        'marco': M['negro'],
        'madera': M['roble'],
        'gris_mueble': E.material('gris_mueble', (0.18, 0.18, 0.19, 1), 0.4),
        'corte': E.material('corte', (0.12, 0.12, 0.12, 1), 0.9),
    })
    modo = a.salida
    corte = modo in ('planta', 'piso')
    h_muro = CORTE if corte else ALTO

    def construir(L, tipo):
        """Muros, pisos y muebles de una unidad en sus coordenadas locales."""
        # pisos por ambiente y zócalo bajo los muros
        for _, _, x0, y0, x1, y1, piso in L['ambientes']:
            caja('piso', x0, x1, y0, y1, -0.02, 0.0, M[piso], bisel=0)

        # muros con vanos
        for x0, y0, x1, y1, g, vanos in L['muros']:
            largo = math.hypot(x1 - x0, y1 - y0)
            ux, uy = (x1 - x0) / largo, (y1 - y0) / largo
            horiz = abs(uy) < 0.5

            def tramo(d, h, z0, z1, m_=None):
                if h - d <= 0.001 or z1 - z0 <= 0.001:
                    return
                ax, ay = x0 + ux * d, y0 + uy * d
                bx, by = x0 + ux * h, y0 + uy * h
                if horiz:
                    caja('muro', ax, bx, ay - g / 2, ay + g / 2, z0, z1, m_ or M['pared'], bisel=0)
                else:
                    caja('muro', ax - g / 2, ax + g / 2, ay, by, z0, z1, m_ or M['pared'], bisel=0)
                if z0 == 0 and not corte:
                    # zócalo blanco a ambas caras del muro
                    e, hz = 0.012, 0.08
                    if horiz:
                        for yy in (ay - g / 2 - e, ay + g / 2):
                            caja('zocalo', ax, bx, yy, yy + e, 0, hz, M['blanco_brillo'], bisel=0)
                    else:
                        for xx in (ax - g / 2 - e, ax + g / 2):
                            caja('zocalo', xx, xx + e, ay, by, 0, hz, M['blanco_brillo'], bisel=0)

            cortes = [0.0]
            for d, h, _ in sorted(vanos):
                cortes += [d, h]
            cortes.append(largo)
            for i in range(0, len(cortes), 2):
                tramo(cortes[i], cortes[i + 1], 0, h_muro)
            for d, h, clase in vanos:
                if clase == 'ventana':
                    tramo(d, h, 0, 1.0)
                    if not corte:
                        tramo(d, h, 2.15, h_muro)
                    vz0, vz1 = 1.0, 2.15
                elif clase == 'mampara':
                    if not corte:
                        tramo(d, h, 2.3, h_muro)
                    vz0, vz1 = 0.0, 2.3
                else:
                    if not corte:
                        tramo(d, h, 2.1, h_muro)
                    vz0 = None
                if clase in ('ventana', 'mampara'):
                    ax, ay = x0 + ux * d, y0 + uy * d
                    bx, by = x0 + ux * h, y0 + uy * h
                    z1v = min(vz1, h_muro)
                    # vidrio con marco de aluminio negro completo y parantes:
                    # dos hojas en la ventana, cuatro en la mampara corrediza
                    hojas = 4 if clase == 'mampara' else 2
                    t = 0.045
                    if horiz:
                        caja('vidrio', ax, bx, ay - 0.01, ay + 0.01, vz0, z1v, M['vidrio'], bisel=0)
                        caja('marco', ax, bx, ay - 0.03, ay + 0.03, vz0, vz0 + t, M['marco'], bisel=0)
                        caja('marco', ax, bx, ay - 0.03, ay + 0.03, z1v - t, z1v, M['marco'], bisel=0)
                        for k in range(hojas + 1):
                            xm = ax + (bx - ax) * k / hojas
                            caja('marco', xm - t / 2, xm + t / 2, ay - 0.03, ay + 0.03, vz0, z1v, M['marco'], bisel=0)
                    else:
                        caja('vidrio', ax - 0.01, ax + 0.01, ay, by, vz0, z1v, M['vidrio'], bisel=0)
                        caja('marco', ax - 0.03, ax + 0.03, ay, by, vz0, vz0 + t, M['marco'], bisel=0)
                        caja('marco', ax - 0.03, ax + 0.03, ay, by, z1v - t, z1v, M['marco'], bisel=0)
                        for k in range(hojas + 1):
                            ym = ay + (by - ay) * k / hojas
                            caja('marco', ax - 0.03, ax + 0.03, ym - t / 2, ym + t / 2, vz0, z1v, M['marco'], bisel=0)
                elif clase in ('puerta', 'entrada'):
                    # hoja de madera abierta a 90° hacia su ambiente y
                    # contra el muro más cercano (ver bisagra())
                    ancho_hoja = h - d
                    hx, hy, ang = bisagra(L, x0, y0, ux, uy, d, h, clase)
                    hoja = caja('hoja', 0, ancho_hoja, -0.02, 0.02, 0, 2.05, M['madera'], bisel=0)
                    hoja.location = (hx, hy, 0)
                    hoja.rotation_euler = (0, 0, ang)
                    tir = caja('tirador', ancho_hoja - 0.12, ancho_hoja - 0.06, -0.045, 0.045, 1.0, 1.03, M['negro'], bisel=0)
                    tir.parent = hoja

        # corte de muros en negro (la cara superior), como en una planta de arquitectura
        if corte:
            for x0, y0, x1, y1, g, vanos in L['muros']:
                pass  # el material de pared ya contrasta con los pisos; se mantiene limpio

        MB.amoblar(L, tipo, M)

    if modo == 'piso':
        piso_completo(bpy, construir, M, caja)
        L = LAYOUT_PISO
    else:
        construir(L, a.tipo)

    W, F = L['ancho'], L['fondo']
    if modo == '360':
        caja('techo', -0.2, W + 0.2, -0.2, F + 0.2, ALTO, ALTO + 0.1, M['techo'], bisel=0)
        MB.luces(L, M)
        MB.pozo_de_luz(M, L)
        MB.hall(M, L)
        if a.vista_ventana:
            ventana_exterior(bpy, a.vista_ventana, a.espejo)
    mundo(bpy, E, modo)
    camara(bpy, L, a, modo)
    render(bpy, a, modo, L)
    bpy.ops.render.render(write_still=True)
    print(f'RENDER OK -> {a.out}')


# Piso típico completo: 4 unidades alrededor del núcleo, con las medidas de la
# planta del edificio (14,4 x 22 m, avenida en y=0). Mismas coordenadas que los
# polígonos de datos/edificio.js, así cada departamento cae en su polígono.
LAYOUT_PISO = {'ancho': 14.4, 'fondo': 22.0, 'nucleo': (6.0, 8.4)}


def piso_completo(bpy, construir, M, caja):
    W, F = LAYOUT_PISO['ancho'], LAYOUT_PISO['fondo']
    colecciones = {}
    for t in ('A', 'B'):
        antes = set(bpy.data.objects)
        construir(LAYOUTS[t], t)
        col = bpy.data.collections.new(f'unidad_{t}')
        for o in [o for o in bpy.data.objects if o not in antes]:
            for c in list(o.users_collection):
                c.objects.unlink(o)
            col.objects.link(o)
        colecciones[t] = col

    def colocar(t, ubicacion, escala):
        e = bpy.data.objects.new(f'unidad_{t}', None)
        e.instance_type = 'COLLECTION'
        e.instance_collection = colecciones[t]
        e.location = ubicacion
        e.scale = escala
        bpy.context.collection.objects.link(e)

    colocar('A', (0, 0, 0), (1, 1, 1))          # 01: frente izquierda
    colocar('A', (W, 0, 0), (-1, 1, 1))         # 02: frente derecha, en espejo
    colocar('B', (W, F, 0), (-1, -1, 1))        # 03: fondo derecha
    colocar('B', (0, F, 0), (1, -1, 1))         # 04: fondo izquierda, sala al patio
    # núcleo: hall, ascensor y escalera
    n0, n1 = LAYOUT_PISO['nucleo']
    caja('hall', n0 + 0.1, n1 - 0.1, 0, F, -0.02, 0.0, M['porcelanato'], bisel=0)
    caja('ascensor', n0 + 0.25, n0 + 1.45, 8.7, 10.3, 0, CORTE, M['gris_mueble'], bisel=0.01)
    caja('ascensor_puerta', n0 + 1.45, n0 + 1.5, 9.0, 10.0, 0, 2.1, M['acero'], bisel=0)
    for k in range(12):
        y = 10.8 + k * 0.25
        caja('peldaño', n0 + 0.2, n1 - 0.2, y, y + 0.25, 0, 0.17 * (k + 1), M['pared'], bisel=0.005)
    caja('baranda_escalera', n0 + 1.18, n0 + 1.22, 10.8, 13.8, 0, CORTE, M['marco'], bisel=0)


def ventana_exterior(bpy, ruta, espejo=False):
    """Lo que se ve por el ventanal: la vista renderizada desde ese piso
    (edificio.py --vista vista_*), en un plano emisivo a 6 m de la fachada,
    del tamaño que cubre el campo del lente de 16 mm. No proyecta sombras."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=(3.0, -6.0, 1.5))
    ob = bpy.context.active_object
    ob.scale = (-13.6 if espejo else 13.6, 7.65, 1)
    ob.rotation_euler = (math.radians(90), 0, math.radians(180))
    ob.visible_shadow = False
    m = bpy.data.materials.new('vista_exterior')
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    for x in list(n):
        if x.type == 'BSDF_PRINCIPLED':
            n.remove(x)
    img = n.new('ShaderNodeTexImage')
    img.image = bpy.data.images.load(ruta)
    em = n.new('ShaderNodeEmission')
    em.inputs['Strength'].default_value = 1.6
    l.new(img.outputs['Color'], em.inputs['Color'])
    l.new(em.outputs['Emission'], n.get('Material Output').inputs['Surface'])
    ob.data.materials.append(m)


def mundo(bpy, E, modo):
    w = bpy.data.worlds.new('mundo')
    bpy.context.scene.world = w
    w.use_nodes = True
    n = w.node_tree.nodes
    bg = n.get('Background')
    hdri = E.RECURSOS / 'kloofendal_43d_clear_puresky' / 'kloofendal_43d_clear_puresky_4k.hdr'
    if hdri.exists():
        env = n.new('ShaderNodeTexEnvironment')
        env.image = bpy.data.images.load(str(hdri))
        w.node_tree.links.new(env.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = 0.6 if modo == '360' else 1.1
    sol = bpy.data.lights.new('sol', 'SUN')
    sol.energy = 2.5 if modo == '360' else 1.3
    sol.angle = math.radians(1.0)
    sol.color = (1.0, 0.94, 0.86)
    ob = bpy.data.objects.new('sol', sol)
    # El sol entra por el ventanal (fachada en y=0) y deja manchas en el piso;
    # de lado contrario la luz quedaba pareja y plana.
    ob.rotation_euler = (math.radians(58), 0, math.radians(15)) if modo == '360' else (math.radians(55), 0, math.radians(200))
    bpy.context.collection.objects.link(ob)


def camara(bpy, L, a, modo):
    cam = bpy.data.cameras.new('cam')
    ob = bpy.data.objects.new('cam', cam)
    bpy.context.collection.objects.link(ob)
    W, F = L['ancho'], L['fondo']
    if modo == 'piso':
        # encuadre exacto del rectángulo del edificio: 100 px por metro, sin
        # margen, para que los polígonos normalizados calcen sobre la imagen
        cam.type = 'ORTHO'
        cam.ortho_scale = max(W, F)
        ob.location = (W / 2, F / 2, 30)
        ob.rotation_euler = (0, 0, 0)
    elif modo == 'planta':
        cam.type = 'ORTHO'
        cam.ortho_scale = F + 0.8
        ob.location = (W / 2, F / 2, 20)
        # fachada a la izquierda de la imagen: el eje y de la unidad va a la derecha
        ob.rotation_euler = (0, 0, math.radians(90))
    else:
        x, y, _ = L['escenas'][a.escena]
        cam.type = 'PANO'
        if hasattr(cam, 'panorama_type'):
            cam.panorama_type = 'EQUIRECTANGULAR'
        else:
            cam.cycles.panorama_type = 'EQUIRECTANGULAR'
        ob.location = (x, y, OJO)
        # mirando hacia +y en el centro de la imagen (yaw 0 en el visor)
        ob.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.scene.camera = ob


def render(bpy, a, modo, L):
    s = bpy.context.scene
    s.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for tipo in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = tipo
            prefs.get_devices()
            if any(d.type == tipo for d in prefs.devices):
                for d in prefs.devices:
                    d.use = d.type == tipo
                s.cycles.device = 'GPU'
                break
        except TypeError:
            continue
    s.cycles.samples = a.muestras
    s.cycles.use_denoising = True
    s.cycles.max_bounces = 8
    if modo == 'piso':
        s.render.resolution_x = int(L['ancho'] * 100)
        s.render.resolution_y = int(L['fondo'] * 100)
        s.render.film_transparent = True
        s.render.image_settings.file_format = 'PNG'
        s.render.image_settings.color_mode = 'RGBA'
    elif modo == 'planta':
        W, F = L['ancho'], L['fondo']
        ancho = a.ancho or 2200
        s.render.resolution_x = ancho
        s.render.resolution_y = int(ancho * (W + 0.8) / (F + 0.8))
        s.render.film_transparent = True
        s.render.image_settings.file_format = 'PNG'
        s.render.image_settings.color_mode = 'RGBA'
    else:
        ancho = a.ancho or 4096
        s.render.resolution_x = ancho
        s.render.resolution_y = ancho // 2
        s.render.image_settings.file_format = 'JPEG'
        s.render.image_settings.quality = 88
    for look in ('AgX - Medium High Contrast', 'Medium High Contrast', 'None'):
        try:
            s.view_settings.look = look
            break
        except TypeError:
            continue
    s.view_settings.exposure = -0.25 if modo == '360' else 0.0
    s.render.filepath = a.out


if __name__ == '__main__':
    a = argumentos()
    if a.plano or a.escenas_json:
        if a.plano:
            Path(a.plano).write_text(plano_svg(LAYOUTS[a.tipo], f'Tipo {a.tipo}'), encoding='utf8')
            print(f'PLANO OK -> {a.plano}')
        if a.escenas_json:
            Path(a.escenas_json).write_text(json.dumps(escenas_json(LAYOUTS[a.tipo]), ensure_ascii=False, indent=2), encoding='utf8')
            print(f'ESCENAS OK -> {a.escenas_json}')
    else:
        blender_main(a)
