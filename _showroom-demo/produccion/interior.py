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
        'cocina': (1.45, 4.65, 'Cocina'),
        'principal': (3.55, 9.45, 'Dormitorio principal'),
    },
}

# Tipo B: misma estructura, con el dormitorio 3 convertido en estudio.
LAYOUT_B = json.loads(json.dumps(LAYOUT_A))
LAYOUT_B['ambientes'] = [tuple(a) for a in LAYOUT_B['ambientes']]
LAYOUT_B['ambientes'][5] = ('estudio', 'Estudio', 3.8, 6.0, 6.0, 8.3, 'laminado')
LAYOUT_B['escenas'] = {
    'sala': (2.95, 2.95, 'Sala y cocina'),
    'principal': (3.55, 9.45, 'Dormitorio principal'),
}

LAYOUTS = {'A': LAYOUT_A, 'B': LAYOUT_B}

ALTO = 2.6          # piso a techo
CORTE = 2.2         # altura de corte de muros en la planta amoblada
OJO = 1.55


def area_ambiente(a):
    _, _, x0, y0, x1, y1, _ = a
    return (x1 - x0) * (y1 - y0)


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
    E.cargar_vegetacion(['modern_coffee_table_01', 'modern_arm_chair_01', 'modern_wooden_cabinet',
                         'side_table_01', 'potted_plant_02', 'potted_plant_04'])
    caja, inst, VEG = E.caja, E.instancia, E.VEGETACION
    tex = E.material_tex
    mat = E.material
    M = {
        'pared': mat('pared', (0.82, 0.8, 0.76, 1), 0.85),
        'corte': mat('corte', (0.12, 0.12, 0.12, 1), 0.9),
        'porcelanato': tex('porcelanato', 'large_floor_tiles_02', tinte=E.hex_rgb('e6dfd2'), escala=1.6, normal=0.3),
        'ceramico': tex('ceramico', 'grey_tiles', tinte=E.hex_rgb('d3d6d8'), escala=1.0, normal=0.4),
        'laminado': tex('laminado', 'laminate_floor_02', tinte=E.hex_rgb('dcc199'), escala=2.0, normal=0.3),
        'madera': tex('madera', 'wood_table_001', tinte=E.hex_rgb('a7825c'), escala=1.2, normal=0.3),
        'marmol': tex('marmol', 'marble_01', escala=1.5, normal=0.2),
        'vidrio': mat('vidrio', (0.9, 0.95, 0.97, 1), 0.02, transmision=1.0),
        'marco': mat('marco', (0.02, 0.02, 0.02, 1), 0.4),
        'tela_sofa': mat('tela_sofa', E.hex_rgb('3f5a73'), 0.95, ruido=0.4),
        'tela_clara': mat('tela_clara', (0.78, 0.76, 0.72, 1), 0.95, ruido=0.3),
        'tela_cama': mat('tela_cama', (0.86, 0.85, 0.82, 1), 0.95, ruido=0.25),
        'manta': mat('manta', E.hex_rgb('7d9494'), 0.95, ruido=0.4),
        'alfombra': mat('alfombra', E.hex_rgb('b9b1a3'), 1.0, ruido=0.6),
        'blanco_mueble': mat('blanco_mueble', (0.85, 0.84, 0.82, 1), 0.35),
        'gris_mueble': mat('gris_mueble', (0.18, 0.18, 0.19, 1), 0.4),
        'acero': mat('acero', (0.75, 0.75, 0.75, 1), 0.25, metal=1.0),
        'loza': mat('loza', (0.92, 0.92, 0.92, 1), 0.08),
        'negro': mat('negro', (0.01, 0.01, 0.01, 1), 0.3),
        'cortina': mat('cortina_visillo', (0.92, 0.9, 0.86, 1), 0.9, transmision=0.6),
        'pantalla_luz': E.emisivo('pantalla_luz', (1.0, 0.86, 0.66, 1), 2.5),
    }
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

            cortes = [0.0]
            for d, h, _ in sorted(vanos):
                cortes += [d, h]
            cortes.append(largo)
            for i in range(0, len(cortes), 2):
                tramo(cortes[i], cortes[i + 1], 0, h_muro)
            for d, h, tipo in vanos:
                if tipo == 'ventana':
                    tramo(d, h, 0, 1.0)
                    if not corte:
                        tramo(d, h, 2.15, h_muro)
                    vz0, vz1 = 1.0, 2.15
                elif tipo == 'mampara':
                    if not corte:
                        tramo(d, h, 2.3, h_muro)
                    vz0, vz1 = 0.0, 2.3
                else:
                    if not corte:
                        tramo(d, h, 2.1, h_muro)
                    vz0 = None
                if tipo in ('ventana', 'mampara'):
                    ax, ay = x0 + ux * d, y0 + uy * d
                    bx, by = x0 + ux * h, y0 + uy * h
                    z1v = min(vz1, h_muro)
                    if horiz:
                        caja('vidrio', ax, bx, ay - 0.01, ay + 0.01, vz0, z1v, M['vidrio'], bisel=0)
                        caja('marco', ax, bx, ay - 0.03, ay + 0.03, vz0, vz0 + 0.05, M['marco'], bisel=0)
                    else:
                        caja('vidrio', ax - 0.01, ax + 0.01, ay, by, vz0, z1v, M['vidrio'], bisel=0)
                        caja('marco', ax - 0.03, ax + 0.03, ay, by, vz0, vz0 + 0.05, M['marco'], bisel=0)
                elif tipo in ('puerta', 'entrada'):
                    # hoja de madera abierta ~80° hacia el lado positivo del muro
                    ancho_hoja = h - d
                    ax, ay = x0 + ux * d, y0 + uy * d
                    hoja = caja('hoja', 0, ancho_hoja, -0.02, 0.02, 0, 2.05, M['madera'], bisel=0)
                    hoja.location = (ax, ay, 0)
                    ang = math.atan2(uy, ux) + math.radians(80)
                    hoja.rotation_euler = (0, 0, ang)

        # corte de muros en negro (la cara superior), como en una planta de arquitectura
        if corte:
            for x0, y0, x1, y1, g, vanos in L['muros']:
                pass  # el material de pared ya contrasta con los pisos; se mantiene limpio

        amoblar(L, tipo, M, caja, inst, VEG, E)

    if modo == 'piso':
        piso_completo(bpy, construir, M, caja)
        L = LAYOUT_PISO
    else:
        construir(L, a.tipo)

    W, F = L['ancho'], L['fondo']
    if modo == '360':
        caja('techo', -0.2, W + 0.2, -0.2, F + 0.2, ALTO, ALTO + 0.1, M['pared'], bisel=0)
        luces(L, bpy)
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


def amoblar(L, tipo, M, caja, inst, VEG, E):
    """Muebles por ambiente. Coordenadas de LAYOUT_A (el B comparte estructura)."""
    import bpy

    def sofa(x0, x1, y0, profundidad, mirando=1):
        yb = y0 if mirando > 0 else y0 - profundidad
        caja('sofa_base', x0, x1, yb, yb + profundidad, 0.12, 0.42, M['tela_sofa'], bisel=0.04)
        respaldo = (yb, yb + 0.22) if mirando > 0 else (yb + profundidad - 0.22, yb + profundidad)
        caja('sofa_respaldo', x0, x1, *respaldo, 0.42, 0.85, M['tela_sofa'], bisel=0.05)
        caja('sofa_brazo', x0, x0 + 0.18, yb, yb + profundidad, 0.12, 0.62, M['tela_sofa'], bisel=0.05)
        caja('sofa_brazo', x1 - 0.18, x1, yb, yb + profundidad, 0.12, 0.62, M['tela_sofa'], bisel=0.05)
        n = 3
        paso = (x1 - x0 - 0.36) / n
        for i in range(n):
            xa = x0 + 0.18 + i * paso + 0.02
            caja('cojin', xa, xa + paso - 0.04, yb + 0.22, yb + profundidad - 0.03, 0.42, 0.55, M['tela_sofa'], bisel=0.05)
        for x in (x0 + 0.05, x1 - 0.1):
            caja('pata', x, x + 0.05, yb + 0.05, yb + 0.1, 0, 0.12, M['negro'], bisel=0)

    def mesa(x0, x1, y0, y1, alto=0.75, m_=None):
        caja('tablero', x0, x1, y0, y1, alto - 0.04, alto, m_ or M['madera'], bisel=0.01)
        for (x, y) in ((x0 + 0.06, y0 + 0.06), (x1 - 0.1, y0 + 0.06), (x0 + 0.06, y1 - 0.1), (x1 - 0.1, y1 - 0.1)):
            caja('pata', x, x + 0.04, y, y + 0.04, 0, alto - 0.04, M['negro'], bisel=0)

    def silla(x, y, giro):
        ob = []
        ob.append(caja('silla_asiento', -0.21, 0.21, -0.21, 0.21, 0.44, 0.48, M['tela_clara'], bisel=0.02))
        ob.append(caja('silla_respaldo', -0.2, 0.2, 0.17, 0.21, 0.48, 0.88, M['tela_clara'], bisel=0.02))
        for (px, py) in ((-0.18, -0.18), (0.15, -0.18), (-0.18, 0.15), (0.15, 0.15)):
            ob.append(caja('silla_pata', px, px + 0.03, py, py + 0.03, 0, 0.44, M['negro'], bisel=0))
        grupo = bpy.data.objects.new('silla', None)
        bpy.context.collection.objects.link(grupo)
        for o in ob:
            o.parent = grupo
        grupo.location = (x, y, 0)
        grupo.rotation_euler = (0, 0, giro)

    def cama(xc, y_cabecera, ancho, largo=1.95, hacia=1):
        """Cama con cabecera contra el muro en y_cabecera; se extiende hacia +y o -y."""
        y0, y1 = (y_cabecera, y_cabecera + largo) if hacia > 0 else (y_cabecera - largo, y_cabecera)
        x0, x1 = xc - ancho / 2, xc + ancho / 2
        caja('cama_base', x0, x1, y0, y1, 0.08, 0.32, M['tela_clara'], bisel=0.02)
        caja('colchon', x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.02, 0.32, 0.52, M['tela_cama'], bisel=0.04)
        # edredón cubre dos tercios, del lado de los pies
        if hacia > 0:
            caja('edredon', x0 - 0.01, x1 + 0.01, y0 + largo * 0.33, y1 + 0.01, 0.5, 0.56, M['manta'], bisel=0.04)
            caja('cabecera', x0 - 0.05, x1 + 0.05, y0 - 0.06, y0, 0.08, 1.1, M['tela_clara'], bisel=0.03)
            yp = y0 + 0.1
        else:
            caja('edredon', x0 - 0.01, x1 + 0.01, y0 - 0.01, y1 - largo * 0.33, 0.5, 0.56, M['manta'], bisel=0.04)
            caja('cabecera', x0 - 0.05, x1 + 0.05, y1, y1 + 0.06, 0.08, 1.1, M['tela_clara'], bisel=0.03)
            yp = y1 - 0.45
        n = 2 if ancho > 1.2 else 1
        for i in range(n):
            xa = x0 + 0.08 + i * (ancho - 0.16) / n
            caja('almohada', xa, xa + (ancho - 0.16) / n - 0.06, yp, yp + 0.35, 0.52, 0.66, M['tela_cama'], bisel=0.06)

    def cama_x(x_cabecera, yc, ancho, largo=1.95, hacia=1):
        """Cama con cabecera contra un muro en x (se extiende en x)."""
        x0, x1 = (x_cabecera, x_cabecera + largo) if hacia > 0 else (x_cabecera - largo, x_cabecera)
        y0, y1 = yc - ancho / 2, yc + ancho / 2
        caja('cama_base', x0, x1, y0, y1, 0.08, 0.32, M['tela_clara'], bisel=0.02)
        caja('colchon', x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.02, 0.32, 0.52, M['tela_cama'], bisel=0.04)
        if hacia > 0:
            caja('edredon', x0 + largo * 0.33, x1 + 0.01, y0 - 0.01, y1 + 0.01, 0.5, 0.56, M['manta'], bisel=0.04)
            caja('cabecera', x0 - 0.06, x0, y0 - 0.05, y1 + 0.05, 0.08, 1.0, M['tela_clara'], bisel=0.03)
            caja('almohada', x0 + 0.1, x0 + 0.45, y0 + 0.08, y1 - 0.08, 0.52, 0.66, M['tela_cama'], bisel=0.06)
        else:
            caja('edredon', x0 - 0.01, x1 - largo * 0.33, y0 - 0.01, y1 + 0.01, 0.5, 0.56, M['manta'], bisel=0.04)
            caja('cabecera', x1, x1 + 0.06, y0 - 0.05, y1 + 0.05, 0.08, 1.0, M['tela_clara'], bisel=0.03)
            caja('almohada', x1 - 0.45, x1 - 0.1, y0 + 0.08, y1 - 0.08, 0.52, 0.66, M['tela_cama'], bisel=0.06)

    def ropero(x0, x1, y0, y1):
        caja('ropero', x0, x1, y0, y1, 0, 2.2, M['madera'], bisel=0.01)

    def inodoro(x, y, giro):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.2, depth=0.4, location=(x, y, 0.2))
        b = bpy.context.active_object
        b.scale = (0.9, 1.15, 1)
        b.data.materials.append(M['loza'])
        dx, dy = -math.sin(giro) * 0.3, math.cos(giro) * 0.3
        t = caja('tanque', -0.2, 0.2, -0.09, 0.09, 0.4, 0.78, M['loza'], bisel=0.02)
        t.location = (x + dx, y + dy, 0)
        t.rotation_euler = (0, 0, giro)

    def lavatorio(x0, x1, y0, y1):
        caja('mueble_lav', x0, x1, y0, y1, 0.15, 0.82, M['blanco_mueble'], bisel=0.01)
        caja('ovalin', x0 + 0.08, x1 - 0.08, y0 + 0.08, y1 - 0.08, 0.82, 0.86, M['loza'], bisel=0.02)

    def ducha(x0, x1, y0, y1):
        caja('plato', x0, x1, y0, y1, 0, 0.04, M['loza'], bisel=0.01)
        caja('mampara_ducha', x0, x1, y0 - 0.01, y0 + 0.01, 0.04, 2.0, M['vidrio'], bisel=0)

    def planta(id_, x, y, alto):
        if id_ in VEG:
            inst(VEG[id_], x, y, 0, alto)

    # ── sala-comedor (0..6 x 0..3.8), ventanal en y=0
    sofa(3.4, 5.6, 0.45, 0.9)
    caja('alfombra', 3.2, 5.8, 1.3, 3.1, 0, 0.012, M['alfombra'], bisel=0)
    if 'modern_coffee_table_01' in VEG:
        inst(VEG['modern_coffee_table_01'], 4.5, 2.05, 0, 0.42, math.radians(90))
    if 'modern_wooden_cabinet' in VEG:
        inst(VEG['modern_wooden_cabinet'], 4.9, 3.5, 0, 0.55, 0)
    caja('tv', 4.25, 5.55, 3.6, 3.64, 0.75, 1.5, M['negro'], bisel=0.005)
    if 'modern_arm_chair_01' in VEG:
        inst(VEG['modern_arm_chair_01'], 3.2, 1.3, 0, 0.85, math.radians(-90))
    mesa(0.6, 2.0, 1.0, 2.4)
    for (x, y, g) in ((1.3, 0.72, 0), (1.3, 2.68, math.pi), (0.35, 1.7, -math.pi / 2), (2.25, 1.7, math.pi / 2)):
        silla(x, y, g)
    planta('potted_plant_02', 0.35, 0.4, 1.1)
    # vestir la sala: cojines, lámpara de pie, libros, planta, colgante del comedor
    for x0 in (3.75, 4.95):
        caja('cojin_deco', x0, x0 + 0.42, 0.62, 0.72, 0.55, 0.95, M['manta'], bisel=0.06)
    caja('lampara_pie', 5.72, 5.76, 0.38, 0.42, 0, 1.45, M['negro'], bisel=0)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.24, radius2=0.16, depth=0.3, location=(5.74, 0.4, 1.5))
    bpy.context.active_object.data.materials.append(M['pantalla_luz'])
    for k, (ancho, alto, m_) in enumerate(((0.05, 0.24, 'tela_sofa'), (0.04, 0.22, 'manta'), (0.06, 0.26, 'tela_clara'))):
        x = 4.35 + k * 0.07
        caja('libro', x, x + ancho, 3.38, 3.58, 0.55, 0.55 + alto, M[m_], bisel=0.003)
    planta('potted_plant_04', 5.75, 3.45, 0.75)
    caja('cable_colgante', 1.29, 1.31, 1.69, 1.71, 1.9, ALTO, M['negro'], bisel=0)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.26, radius2=0.08, depth=0.24, location=(1.3, 1.7, 1.78))
    bpy.context.active_object.data.materials.append(M['pantalla_luz'])
    # cuadros: sin ellos la sala se ve de catálogo vacío
    cuadro(M, caja, 'x', 5.9, 1.2, 1.55, 1.0, 0.7, '5d7b8a')
    cuadro(M, caja, 'y', 10.9, 2.0, 1.55, 1.1, 0.5, '9aa79a')
    # barra de cocina abierta a la sala
    caja('barra', 0.15, 2.6, 3.55, 3.95, 0, 1.0, M['blanco_mueble'], bisel=0.01)
    caja('barra_tope', 0.1, 2.65, 3.45, 3.98, 1.0, 1.04, M['marmol'], bisel=0.01)
    # visillo en el ventanal
    caja('visillo', 0.5, 1.6, 0.14, 0.17, 0.0, 2.3, M['cortina'], bisel=0)
    caja('visillo', 4.6, 5.5, 0.14, 0.17, 0.0, 2.3, M['cortina'], bisel=0)

    # ── cocina (0..2.8 x 3.8..6.0): en L contra x=0 y contra y=6
    caja('mueble_bajo', 0.06, 0.66, 4.0, 5.94, 0, 0.88, M['blanco_mueble'], bisel=0.01)
    caja('mueble_bajo', 0.66, 2.1, 5.34, 5.94, 0, 0.88, M['blanco_mueble'], bisel=0.01)
    caja('encimera', 0.04, 0.68, 3.98, 5.96, 0.88, 0.92, M['marmol'], bisel=0.005)
    caja('encimera', 0.68, 2.12, 5.32, 5.96, 0.88, 0.92, M['marmol'], bisel=0.005)
    caja('lavadero', 0.14, 0.58, 4.3, 4.9, 0.9, 0.93, M['acero'], bisel=0.01)
    caja('cocina_tope', 1.0, 1.6, 5.4, 5.9, 0.92, 0.94, M['negro'], bisel=0.005)
    caja('refri', 2.12, 2.74, 5.28, 5.94, 0, 1.8, M['acero'], bisel=0.02)
    caja('alacena', 0.06, 0.4, 4.0, 5.94, 1.5, 2.2, M['madera'], bisel=0.01)
    # enchape entre encimera y alacena, campana, grifería y microondas
    caja('enchape', 0.06, 0.08, 4.0, 5.94, 0.92, 1.5, M['ceramico'], bisel=0)
    caja('enchape', 0.66, 2.1, 5.92, 5.94, 0.92, 1.5, M['ceramico'], bisel=0)
    caja('campana', 1.05, 1.55, 5.5, 5.94, 1.65, 1.85, M['acero'], bisel=0.01)
    caja('griferia', 0.12, 0.16, 4.58, 4.62, 0.93, 1.22, M['acero'], bisel=0)
    caja('caño', 0.12, 0.36, 4.58, 4.62, 1.18, 1.22, M['acero'], bisel=0)
    caja('microondas', 0.12, 0.55, 4.05, 4.5, 0.92, 1.2, M['negro'], bisel=0.01)
    for (x, y) in ((1.15, 5.55), (1.45, 5.55), (1.15, 5.8), (1.45, 5.8)):
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.07, depth=0.01, location=(x, y, 0.945))
        bpy.context.active_object.data.materials.append(M['acero'])

    # ── baño 2 (3.8..6 x 3.8..6)
    lavatorio(5.4, 5.94, 4.0, 4.7)
    inodoro(5.65, 5.3, math.pi / 2)
    ducha(3.88, 4.9, 5.0, 5.94)

    # ── dormitorio 2 (0..2.8 x 6..8.3): cama de plaza y media contra x=0
    cama_x(0.0, 6.75, 1.05, 1.95, 1)
    if 'side_table_01' in VEG:
        inst(VEG['side_table_01'], 0.28, 7.6, 0, 0.5)
    ropero(1.3, 2.7, 7.7, 8.24)

    # ── dormitorio 3 / estudio (3.8..6 x 6..8.3)
    if tipo == 'A':
        cama_x(6.0, 7.55, 1.0, 1.95, -1)
        ropero(3.95, 5.0, 6.06, 6.6)
    else:
        mesa(4.4, 5.9, 6.1, 6.75, alto=0.75, m_=M['madera'])
        silla(5.1, 7.05, math.pi)
        caja('estante', 3.9, 4.25, 6.8, 8.2, 0, 1.9, M['madera'], bisel=0.01)
        planta('potted_plant_04', 5.7, 8.0, 0.6)

    # ── dormitorio principal (0..4.2 x 8.3..11): cama queen contra y=11
    cama(2.0, 11.0, 1.55, 1.95, -1)
    if 'side_table_01' in VEG:
        inst(VEG['side_table_01'], 0.9, 10.75, 0, 0.5)
        inst(VEG['side_table_01'], 3.1, 10.75, 0, 0.5)
    for x in (0.9, 3.1):
        caja('base_lampara', x - 0.05, x + 0.05, 10.7, 10.8, 0.5, 0.78, M['negro'], bisel=0)
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.15, radius2=0.11, depth=0.2, location=(x, 10.75, 0.86))
        bpy.context.active_object.data.materials.append(M['pantalla_luz'])
    caja('cojin_deco', 1.6, 2.4, 10.45, 10.6, 0.62, 0.86, M['tela_sofa'], bisel=0.05)
    ropero(0.06, 1.9, 8.36, 8.95)
    caja('alfombra', 1.0, 3.0, 8.8, 9.3, 0, 0.012, M['alfombra'], bisel=0)

    # ── baño principal (4.2..6 x 8.3..11)
    lavatorio(5.4, 5.94, 8.5, 9.2)
    inodoro(5.65, 9.8, math.pi / 2)
    ducha(4.3, 5.3, 10.0, 10.94)


def cuadro(M, caja, eje, pos, centro, z, ancho, alto, color):
    """Cuadro colgado: marco negro y lienzo de color. eje='x' cuelga de un muro
    en x=pos (centro en y); eje='y' cuelga de un muro en y=pos (centro en x)."""
    import bpy
    nombre = f'lienzo_{color}'
    lienzo = bpy.data.materials.get(nombre)
    if lienzo is None:
        import edificio as E
        lienzo = E.material(nombre, E.hex_rgb(color), 0.9, ruido=0.8)
    if eje == 'x':
        caja('marco_cuadro', pos - 0.03, pos, centro - ancho / 2, centro + ancho / 2, z - alto / 2, z + alto / 2, M['negro'], bisel=0)
        caja('lienzo', pos - 0.035, pos - 0.03, centro - ancho / 2 + 0.04, centro + ancho / 2 - 0.04, z - alto / 2 + 0.04, z + alto / 2 - 0.04, lienzo, bisel=0)
    else:
        caja('marco_cuadro', centro - ancho / 2, centro + ancho / 2, pos - 0.03, pos, z - alto / 2, z + alto / 2, M['negro'], bisel=0)
        caja('lienzo', centro - ancho / 2 + 0.04, centro + ancho / 2 - 0.04, pos - 0.035, pos - 0.03, z - alto / 2 + 0.04, z + alto / 2 - 0.04, lienzo, bisel=0)


def luces(L, bpy):
    """Una luz de techo por ambiente, cálida, con potencia según el área."""
    for _, nombre, x0, y0, x1, y1, _ in L['ambientes']:
        area = (x1 - x0) * (y1 - y0)
        luz = bpy.data.lights.new('techo', 'AREA')
        luz.energy = 7 * area
        luz.size = 0.5
        luz.color = (1.0, 0.86, 0.72)
        ob = bpy.data.objects.new('techo', luz)
        ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, ALTO - 0.02)
        bpy.context.collection.objects.link(ob)


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
    # entra por el ventanal de fachada (y=0) desde arriba a la izquierda
    ob.rotation_euler = (math.radians(55), 0, math.radians(200))
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
    s.view_settings.exposure = -0.6 if modo == '360' else 0.0
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
