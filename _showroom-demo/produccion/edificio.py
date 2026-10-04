"""Edificio procedural para el showroom (Blender 5.2, Cycles).

Lenguaje de edificio boutique chiclayano: cerco con portón de cochera, cuerpo
blanco, balcones enmarcados en color de acento que alternan con parapetos,
franja central con jardineras, celosías de bloque y barandas de vidrio, azotea
con terrazas. Es la familia de proyectos del cliente que se quiere atraer; la
composición y la identidad son propias.

Todo sale de PARAM: cambiar pisos, frente o acento regenera el edificio entero.
Las mismas medidas alimentarán los polígonos de planta de la web.

Uso (sin abrir la interfaz):
  blender -b -P edificio.py -- --vista frente --acento 9c4a2f --out render.png
"""

import argparse
import math
import sys

import bpy

# ── Parámetros ───────────────────────────────────────────────────────────────

PARAM = {
    'frente': 14.4,        # ancho de fachada (m)
    'fondo': 18.0,         # profundidad del cuerpo (m)
    'h_piso1': 3.0,        # piso 1: recepción y cocheras
    'h_piso': 2.8,         # pisos típicos
    'pisos': 5,            # pisos de departamentos (2..6)
    'retiro': 2.5,         # retiro frontal hasta el cerco
    'vuelo': 1.2,          # cuánto sobresalen los balcones enmarcados
    'col_izq': (0.0, 6.0),
    'col_centro': (6.0, 8.4),
    'col_der': (8.4, 14.4),
}

# Giro del sol en planta: luz rasante desde la izquierda, para que balcones y
# marcos proyecten sombra sobre la fachada (con luz frontal todo se aplana).
SOL_GIRO = -52

VISTAS = {
    # x, y, z de cámara; giro en planta (grados); focal (mm); centro vertical del encuadre (m)
    'frente':   dict(pos=(7.2, -24.0, 1.6), giro=0.0, focal=32, centro=10.5),
    'diagonal': dict(pos=(-9.5, -21.0, 1.6), giro=-38.0, focal=30, centro=10.0),
}


def argumentos():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument('--vista', default='frente', choices=VISTAS.keys())
    p.add_argument('--acento', default='9c4a2f', help='hex sin #')
    p.add_argument('--out', default='//render.png')
    p.add_argument('--muestras', type=int, default=128)
    p.add_argument('--ancho', type=int, default=1080)
    p.add_argument('--alto', type=int, default=1350)
    p.add_argument('--blend', default='', help='guardar el .blend aquí')
    return p.parse_args(argv)


# ── Utilidades ───────────────────────────────────────────────────────────────

def hex_rgb(h):
    h = h.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    # a lineal, que es lo que esperan los nodos
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb) + (1.0,)


def limpiar():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(nombre, color, rugosidad=0.6, metal=0.0, transmision=0.0, ruido=0.0):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    n = m.node_tree.nodes
    bsdf = n.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = rugosidad
    bsdf.inputs['Metallic'].default_value = metal
    if transmision:
        bsdf.inputs['Transmission Weight'].default_value = transmision
        bsdf.inputs['IOR'].default_value = 1.45
    if ruido:
        # Variación sutil de tono para que el tarrajeo no se vea plástico.
        tex = n.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = 6.0
        tex.inputs['Detail'].default_value = 8.0
        mix = n.new('ShaderNodeMix')
        mix.data_type = 'RGBA'
        mix.inputs['Factor'].default_value = ruido
        mix.inputs['A'].default_value = color
        mix.inputs['B'].default_value = tuple(c * 0.86 for c in color[:3]) + (1.0,)
        lt = m.node_tree.links
        lt.new(tex.outputs['Fac'], mix.inputs['Factor'])
        lt.new(mix.outputs['Result'], bsdf.inputs['Base Color'])
        bump = n.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = 0.08
        lt.new(tex.outputs['Fac'], bump.inputs['Height'])
        lt.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return m


def caja(nombre, x0, x1, y0, y1, z0, z1, mat, bisel=0.012):
    x0, x1 = sorted((x0, x1)); y0, y1 = sorted((y0, y1)); z0, z1 = sorted((z0, z1))
    v = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
         (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    me = bpy.data.meshes.new(nombre)
    me.from_pydata(v, [], f)
    me.update()
    ob = bpy.data.objects.new(nombre, me)
    ob.data.materials.append(mat)
    bpy.context.collection.objects.link(ob)
    if bisel and min(x1 - x0, y1 - y0, z1 - z0) > bisel * 3:
        mod = ob.modifiers.new('bisel', 'BEVEL')
        mod.width = bisel
        mod.segments = 2
        mod.harden_normals = True
    return ob


def texto(cuerpo, x, y, z, tam, mat, extrusion=0.03):
    cu = bpy.data.curves.new('texto', 'FONT')
    cu.body = cuerpo
    cu.size = tam
    cu.extrude = extrusion
    cu.align_x = 'RIGHT'
    ob = bpy.data.objects.new('texto', cu)
    ob.location = (x, y, z)
    ob.rotation_euler = (math.radians(90), 0, 0)
    ob.data.materials.append(mat)
    bpy.context.collection.objects.link(ob)
    return ob


# ── Piezas ───────────────────────────────────────────────────────────────────

def ventana(x0, x1, z0, z1, y, M, hojas=2):
    """Vano con marco negro y vidrio oscuro, ligeramente hundido en el muro."""
    caja('vidrio', x0, x1, y + 0.02, y + 0.06, z0, z1, M['vidrio_oscuro'], bisel=0)
    t = 0.05
    caja('marco', x0, x1, y, y + 0.06, z0, z0 + t, M['marco'], bisel=0)
    caja('marco', x0, x1, y, y + 0.06, z1 - t, z1, M['marco'], bisel=0)
    for i in range(hojas + 1):
        xm = x0 + (x1 - x0) * i / hojas
        caja('marco', xm - t / 2, xm + t / 2, y, y + 0.06, z0, z1, M['marco'], bisel=0)


def baranda_vidrio(x0, x1, y, z, M, alto=1.0):
    caja('baranda', x0, x1, y - 0.01, y + 0.01, z, z + alto, M['vidrio'], bisel=0)
    n = max(2, int((x1 - x0) / 1.1) + 1)
    for i in range(n):
        xm = x0 + 0.05 + (x1 - x0 - 0.1) * i / (n - 1)
        caja('poste', xm - 0.02, xm + 0.02, y - 0.04, y, z, z + alto, M['acero'], bisel=0)
    caja('pasamanos', x0, x1, y - 0.04, y + 0.01, z + alto - 0.03, z + alto + 0.01, M['acero'], bisel=0)


def celosia(x0, x1, z0, z1, y, M):
    """Panel de bloques en dos tonos, trabado como en las celosías de fachada."""
    caja('celosia_fondo', x0, x1, y + 0.05, y + 0.1, z0, z1, M['blanco'], bisel=0)
    fila, bloque = 0.18, 0.55
    filas = int((z1 - z0) / fila)
    for r in range(filas):
        zz = z0 + r * fila + 0.03
        desfase = (r % 2) * bloque / 2
        x = x0 + 0.04 - desfase
        k = 0
        while x < x1 - 0.04:
            xa, xb = max(x, x0 + 0.04), min(x + bloque - 0.06, x1 - 0.04)
            if xb - xa > 0.08:
                mat = M['bloque_claro'] if (k + r) % 3 else M['bloque_gris']
                caja('bloque', xa, xb, y - 0.04, y + 0.05, zz, zz + fila - 0.06, mat, bisel=0.005)
            x += bloque
            k += 1


def jardinera(x0, x1, z, y, M):
    caja('jardinera', x0, x1, y - 0.45, y, z, z + 0.35, M['acento'])
    # Follaje: grupo de esferas irregulares, suficiente para leer «verde vivo» a distancia.
    import random
    rnd = random.Random(int(x0 * 100 + z * 10))
    for i in range(int((x1 - x0) / 0.07)):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=rnd.uniform(0.12, 0.22),
                                              location=(rnd.uniform(x0 + 0.1, x1 - 0.1), y - rnd.uniform(0.15, 0.4),
                                                        z + 0.35 + rnd.uniform(-0.05, 0.12)))
        ob = bpy.context.active_object
        ob.scale = (1.0, 0.8, rnd.uniform(0.7, 1.4))
        ob.data.materials.append(M['follaje'])
        # algunas cuelgan por delante de la jardinera
        if i % 2 == 0:
            ob.location.z -= rnd.uniform(0.2, 0.55)
            ob.scale.z *= 1.6


def balcon_enmarcado(x0, x1, z0, P, M, lado_celosia='izq'):
    """Marco en acento que sobresale, con baranda de vidrio y celosía a un lado."""
    v, h, t = P['vuelo'], P['h_piso'], 0.22
    caja('marco_sup', x0, x1, -v, 0, z0 + h - t, z0 + h, M['acento'])
    caja('marco_inf', x0, x1, -v, 0, z0, z0 + t, M['acento'])
    caja('marco_izq', x0, x0 + t, -v, 0, z0, z0 + h, M['acento'])
    caja('marco_der', x1 - t, x1, -v, 0, z0, z0 + h, M['acento'])
    # cielo raso blanco con luminaria
    caja('cielo', x0 + t, x1 - t, -v + 0.02, 0, z0 + h - t - 0.02, z0 + h - t, M['blanco'], bisel=0)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.02, location=((x0 + x1) / 2, -v / 2, z0 + h - t - 0.03))
    bpy.context.active_object.data.materials.append(M['luminaria'])
    ancho_cel = 1.4
    if lado_celosia == 'izq':
        celosia(x0 + t, x0 + t + ancho_cel, z0 + t, z0 + h - t, -v + 0.05, M)
        vx0, vx1 = x0 + t + ancho_cel + 0.25, x1 - t - 0.25
    else:
        celosia(x1 - t - ancho_cel, x1 - t, z0 + t, z0 + h - t, -v + 0.05, M)
        vx0, vx1 = x0 + t + 0.25, x1 - t - ancho_cel - 0.25
    ventana(vx0, vx1, z0 + t + 0.02, z0 + h - t - 0.15, -0.03, M, hojas=3)
    baranda_vidrio(x0 + t + (ancho_cel if lado_celosia == 'izq' else 0), x1 - t - (0 if lado_celosia == 'izq' else ancho_cel),
                   -v + 0.08, z0 + t, M)


def piso_parapeto(x0, x1, z0, P, M, lado_acento='der'):
    """Ventana con parapeto blanco volado y paño macizo en acento."""
    h = P['h_piso']
    ancho_acento = 1.1
    if lado_acento == 'der':
        caja('pano_acento', x1 - ancho_acento, x1, -P['vuelo'], 0, z0, z0 + h, M['acento'])
        px0, px1 = x0 + 0.5, x1 - ancho_acento
    else:
        caja('pano_acento', x0, x0 + ancho_acento, -P['vuelo'], 0, z0, z0 + h, M['acento'])
        px0, px1 = x0 + ancho_acento, x1 - 0.5
    caja('parapeto', px0, px1, -0.9, 0, z0, z0 + 0.95, M['blanco'])
    ventana(px0 + 0.3, px1 - 0.3, z0 + 0.95, z0 + h - 0.35, -0.03, M, hojas=3)


# ── Edificio ─────────────────────────────────────────────────────────────────

def edificio(P, M):
    W, D = P['frente'], P['fondo']
    z_top = P['h_piso1'] + P['pisos'] * P['h_piso']

    # cuerpo
    caja('cuerpo', 0, W, 0, D, 0, z_top, M['blanco'])
    caja('parapeto_azotea', -0.05, W + 0.05, -0.05, D + 0.05, z_top, z_top + 0.25, M['blanco'])

    xl0, xl1 = P['col_izq']
    xc0, xc1 = P['col_centro']
    xr0, xr1 = P['col_der']

    for i in range(P['pisos']):
        z0 = P['h_piso1'] + i * P['h_piso']
        par = i % 2 == 0
        # columna izquierda: balcón en pisos 2, 4, 6; parapeto en 3, 5
        if par:
            balcon_enmarcado(xl0 + 0.4, xl1, z0, P, M, 'izq')
        else:
            piso_parapeto(xl0 + 0.4, xl1, z0, P, M, 'der')
        # columna derecha: fase opuesta
        if par and i != P['pisos'] - 1:
            piso_parapeto(xr0, xr1 - 0.4, z0, P, M, 'der')
        elif not par:
            balcon_enmarcado(xr0, xr1 - 0.4, z0, P, M, 'der')
        else:
            piso_parapeto(xr0, xr1 - 0.4, z0, P, M, 'der')
        # franja central: ventanas altas y jardinera
        ventana(xc0 + 0.45, xc1 - 0.45, z0 + 0.5, z0 + P['h_piso'] - 0.3, -0.62, M, hojas=2)
        jardinera(xc0 + 0.3, xc1 - 0.3, z0 + 0.05, -0.62, M)

    # marco vertical de la franja central
    zc0 = P['h_piso1']
    caja('franja_izq', xc0, xc0 + 0.3, -0.65, 0, zc0, z_top + 0.4, M['acento'])
    caja('franja_der', xc1 - 0.3, xc1, -0.65, 0, zc0, z_top + 0.4, M['acento'])
    caja('franja_sup', xc0, xc1, -0.65, 0, z_top + 0.1, z_top + 0.4, M['acento'])
    caja('franja_fondo', xc0 + 0.3, xc1 - 0.3, -0.66, -0.62, zc0, z_top, M['blanco'], bisel=0)

    # pilastras de acento en los extremos (amarran los marcos)
    caja('pilastra_izq', 0, 0.4, -P['vuelo'], 0, zc0, z_top, M['acento'])
    caja('pilastra_der', W - 0.4, W, -P['vuelo'], 0, zc0, z_top, M['acento'])

    # azotea: barandas, caja de escalera con pérgola, sombrillas
    zt = z_top + 0.25
    baranda_vidrio(0.2, W - 0.2, 0.1, zt, M, alto=1.1)
    caja('caja_escalera', 0.6, 4.6, 1.5, 5.5, zt, zt + 2.6, M['blanco'])
    caja('caja_escalera_techo', 0.4, 4.8, 1.3, 5.7, zt + 2.6, zt + 2.8, M['acento'])
    for k in range(14):
        x = 4.9 + k * 0.22
        caja('pergola', x, x + 0.06, 1.5, 4.5, zt + 2.45, zt + 2.55, M['madera'], bisel=0)
    for (x, y) in ((8.5, 2.8), (11.8, 3.2)):
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=1.4, radius2=0.05, depth=0.45, location=(x, y, zt + 2.3))
        bpy.context.active_object.data.materials.append(M['lona'])
        caja('mastil', x - 0.02, x + 0.02, y - 0.02, y + 0.02, zt, zt + 2.2, M['acero'], bisel=0)

    # piso 1 detrás del cerco: muro de ladrillo caravista visible sobre el cerco
    caja('zocalo', 0, W, -0.02, 0, 0, P['h_piso1'], M['ladrillo'], bisel=0)


def cerco(P, M):
    W, r = P['frente'], P['retiro']
    y = -r
    h = P['h_piso1'] - 0.1
    caja('cerco_base', -0.6, W + 0.6, y - 0.25, y, 0, 0.35, M['blanco'])
    caja('cerco_viga', -0.6, W + 0.6, y - 0.3, y, h - 0.45, h, M['blanco'])
    caja('cerco_pilar', -0.6, 0.2, y - 0.3, y, 0, h, M['blanco'])
    caja('cerco_pilar', 4.6, 5.4, y - 0.3, y, 0, h, M['blanco'])
    caja('cerco_pilar', W - 0.2, W + 0.6, y - 0.3, y, 0, h, M['blanco'])
    # puerta peatonal de vidrio
    ventana(2.2, 4.4, 0.35, h - 0.45, y - 0.12, M, hojas=2)
    # paño de rejas a la izquierda de la puerta
    for k in range(int((2.0 - 0.3) / 0.14)):
        zz = 0.45 + k * 0.14
    for k in range(14):
        zz = 0.45 + k * ((h - 1.0) / 14)
        caja('reja', 0.2, 2.1, y - 0.18, y - 0.12, zz, zz + 0.05, M['marco'], bisel=0)
    # portón de cochera: listones horizontales con luz entre ellos
    for k in range(18):
        zz = 0.4 + k * ((h - 0.9) / 18)
        caja('porton', 5.4, W - 0.2, y - 0.2, y - 0.14, zz, zz + 0.07, M['marco'], bisel=0)
    for xm in (5.4, 7.6, 9.8, 12.0, W - 0.25):
        caja('porton_parante', xm, xm + 0.06, y - 0.2, y - 0.12, 0.35, h - 0.45, M['marco'], bisel=0)
    # nombre y numeración
    texto('LOS FAIQUES', W - 0.4, y - 0.31, h - 0.38, 0.36, M['marco'])
    texto('F-14', 5.25, y - 0.31, h - 0.95, 0.24, M['marco'])


def entorno(P, M):
    W, r = P['frente'], P['retiro']
    caja('vereda', -30, 40, -r - 3.2, -r, 0, 0.15, M['concreto'], bisel=0)
    caja('jardin_retiro', -0.6, W + 0.6, -r, 0, 0, 0.05, M['concreto'], bisel=0)
    caja('pista', -30, 40, -r - 11.5, -r - 3.2, -0.05, 0.0, M['asfalto'], bisel=0)
    caja('berma', -30, 40, -r - 15, -r - 11.5, 0, 0.18, M['grass'], bisel=0)
    caja('suelo', -60, 80, -60, 60, -0.06, -0.05, M['concreto'], bisel=0)
    # vecinos: volúmenes simples, para que el edificio no flote en el vacío
    caja('vecino_izq', -10.0, -0.7, 0, 16, 0, 7.2, M['vecino1'])
    caja('vecino_izq_cerco', -10.0, -0.7, -r - 0.25, -r, 0, 2.6, M['vecino1'])
    caja('vecino_der', W + 0.7, W + 11, 2.0, 18, 0, 5.4, M['vecino2'])
    caja('vecino_der_cerco', W + 0.7, W + 11, -r - 0.25, -r, 0, 2.4, M['vecino2'])
    caja('fondo_alto', -8, 26, 22, 30, 0, 14, M['vecino1'])


# ── Escena ───────────────────────────────────────────────────────────────────

def materiales(acento):
    return {
        'blanco': material('blanco', (0.78, 0.78, 0.76, 1), 0.85, ruido=0.25),
        'acento': material('acento', hex_rgb(acento), 0.75, ruido=0.35),
        'vidrio': material('vidrio', (0.85, 0.92, 0.95, 1), 0.02, transmision=1.0),
        'vidrio_oscuro': material('vidrio_oscuro', (0.02, 0.025, 0.03, 1), 0.05, metal=0.0),
        'marco': material('marco', (0.015, 0.015, 0.015, 1), 0.4),
        'acero': material('acero', (0.8, 0.8, 0.8, 1), 0.25, metal=1.0),
        'bloque_claro': material('bloque_claro', (0.7, 0.7, 0.69, 1), 0.9),
        'bloque_gris': material('bloque_gris', (0.33, 0.33, 0.34, 1), 0.9),
        'follaje': material('follaje', (0.035, 0.12, 0.03, 1), 0.7, ruido=0.6),
        'luminaria': material('luminaria', (1, 1, 1, 1), 0.3),
        'madera': material('madera', (0.25, 0.12, 0.05, 1), 0.6),
        'lona': material('lona', (0.22, 0.18, 0.14, 1), 0.9),
        'ladrillo': material('ladrillo', (0.32, 0.11, 0.06, 1), 0.9, ruido=0.5),
        'concreto': material('concreto', (0.42, 0.42, 0.41, 1), 0.9, ruido=0.4),
        'asfalto': material('asfalto', (0.06, 0.06, 0.065, 1), 0.85, ruido=0.3),
        'grass': material('pasto', (0.04, 0.12, 0.025, 1), 0.9, ruido=0.6),
        'vecino1': material('vecino1', (0.62, 0.61, 0.58, 1), 0.9, ruido=0.3),
        'vecino2': material('vecino2', (0.55, 0.53, 0.5, 1), 0.9, ruido=0.3),
    }


def cielo():
    w = bpy.data.worlds.new('cielo')
    bpy.context.scene.world = w
    w.use_nodes = True
    n = w.node_tree.nodes
    sky = n.new('ShaderNodeTexSky')
    for tipo in ('MULTIPLE_SCATTERING', 'SINGLE_SCATTERING', 'NISHITA'):
        try:
            sky.sky_type = tipo
            break
        except TypeError:
            continue
    # Tarde de Chiclayo: sol bajo desde la izquierda-frente, cielo despejado.
    if hasattr(sky, 'sun_elevation'):
        sky.sun_elevation = math.radians(34)
        sky.sun_rotation = math.radians(SOL_GIRO + 180)
    if hasattr(sky, 'air_density'):
        sky.air_density = 1.2
    bg = n.get('Background')
    bg.inputs['Strength'].default_value = 0.09
    # Sol físico: da las sombras duras de tarde que el cielo solo no produce.
    sol = bpy.data.lights.new('sol', 'SUN')
    sol.energy = 5.5
    sol.angle = math.radians(0.6)
    sol.color = (1.0, 0.93, 0.84)
    ob = bpy.data.objects.new('sol', sol)
    ob.rotation_euler = (math.radians(90 - 34), 0, math.radians(SOL_GIRO))
    bpy.context.collection.objects.link(ob)
    w.node_tree.links.new(sky.outputs['Color'], bg.inputs['Color'])


def camara(vista):
    c = VISTAS[vista]
    cam = bpy.data.cameras.new('cam')
    cam.lens = c['focal']
    cam.sensor_fit = 'AUTO'
    ob = bpy.data.objects.new('cam', cam)
    bpy.context.collection.objects.link(ob)
    ob.location = c['pos']
    # cámara a nivel (verticales rectas, como foto de arquitectura) y lens shift
    ob.rotation_euler = (math.radians(90), 0, math.radians(c['giro']))
    dist = abs(c['pos'][1]) + 2
    cam.shift_y = (c['centro'] - c['pos'][2]) / dist * c['focal'] / 36
    bpy.context.scene.camera = ob


def render(a):
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
    s.render.resolution_x = a.ancho
    s.render.resolution_y = a.alto
    s.render.film_transparent = False
    for look in ('AgX - Medium High Contrast', 'Medium High Contrast', 'None'):
        try:
            s.view_settings.look = look
            break
        except TypeError:
            continue
    s.view_settings.exposure = -0.4
    s.render.filepath = a.out
    s.render.image_settings.file_format = 'PNG'


def main():
    a = argumentos()
    limpiar()
    M = materiales(a.acento)
    edificio(PARAM, M)
    cerco(PARAM, M)
    entorno(PARAM, M)
    cielo()
    camara(a.vista)
    render(a)
    if a.blend:
        bpy.ops.wm.save_as_mainfile(filepath=a.blend)
    bpy.ops.render.render(write_still=True)
    print(f'RENDER OK -> {a.out} (dispositivo: {bpy.context.scene.cycles.device})')


main()
