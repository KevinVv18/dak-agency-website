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
import os
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector

# Caché de recursos CC0 que baja recursos.py. Si falta un recurso, el script
# cae a una versión procedural en vez de fallar.
RECURSOS = Path(os.environ.get('SHOWROOM_RECURSOS', Path.home() / 'tools' / 'recursos-showroom'))

# ── Parámetros ───────────────────────────────────────────────────────────────

PARAM = {
    'frente': 14.4,        # ancho de fachada (m)
    'fondo': 22.0,         # profundidad del cuerpo (m); la planta de la web usa lo mismo
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
    # x, y, z de cámara; giro en planta (grados); focal (mm); centro vertical del
    # encuadre (m) para el lens shift; inclinación hacia abajo (grados) solo en
    # tomas aéreas, donde las verticales convergen como en una toma de dron.
    'frente':   dict(pos=(7.2, -24.0, 1.6), giro=0.0, focal=32, centro=10.5),
    'diagonal': dict(pos=(-9.5, -21.0, 1.6), giro=-38.0, focal=30, centro=10.0),
    # paradas del exterior en la web (renderizar a 16:9)
    'web_frente':   dict(pos=(7.2, -27.0, 1.6), giro=0.0, focal=24, centro=10.0),
    'web_diag_izq': dict(pos=(-12.0, -22.5, 1.6), giro=-36.0, focal=24, centro=10.0),
    'web_diag_der': dict(pos=(29.0, -26.0, 1.6), giro=38.0, focal=24, centro=10.0),
    'web_aerea':    dict(pos=(-22.0, -40.0, 27.0), giro=-30.0, focal=28, inclinacion=24.0),
}


def argumentos():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument('--vista', default='frente', choices=list(VISTAS.keys()))
    p.add_argument('--acento', default='1c2c72', help='hex sin #')
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


def enchufe(sockets, nombre, tipo):
    """El nodo Mix tiene varias entradas con el mismo nombre, una por tipo."""
    return next(x for x in sockets if x.name == nombre and x.type == tipo)


def material_tex(nombre, id_, tinte=None, escala=2.0, normal=0.5):
    """Material con mapas reales (color, rugosidad, normal) en proyección de caja.

    Con `tinte`, la textura aporta solo la variación de luminancia y el color lo
    pone el tinte: así el mismo tarrajeo sirve para el blanco y para el acento.
    """
    def ruta(mapa):
        return RECURSOS / id_ / f'{id_}_{mapa}_2k.jpg'
    if not ruta('diff').exists():
        return material(nombre, tinte or (0.5, 0.5, 0.5, 1), 0.85, ruido=0.3)
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    bsdf = n.get('Principled BSDF')
    coord = n.new('ShaderNodeTexCoord')
    mapeo = n.new('ShaderNodeMapping')
    mapeo.inputs['Scale'].default_value = (1 / escala,) * 3
    l.new(coord.outputs['Object'], mapeo.inputs['Vector'])

    def imagen(mapa, color=True):
        t = n.new('ShaderNodeTexImage')
        t.image = bpy.data.images.load(str(ruta(mapa)), check_existing=True)
        if not color:
            t.image.colorspace_settings.name = 'Non-Color'
        t.projection = 'BOX'
        t.projection_blend = 0.3
        l.new(mapeo.outputs['Vector'], t.inputs['Vector'])
        return t

    dif = imagen('diff')
    if tinte:
        bn = n.new('ShaderNodeRGBToBW')
        l.new(dif.outputs['Color'], bn.inputs['Color'])
        rango = n.new('ShaderNodeMapRange')
        rango.inputs['From Min'].default_value = 0.25
        rango.inputs['From Max'].default_value = 0.75
        rango.inputs['To Min'].default_value = 0.82
        rango.inputs['To Max'].default_value = 1.04
        l.new(bn.outputs['Val'], rango.inputs['Value'])
        mezcla = n.new('ShaderNodeMix')
        mezcla.data_type = 'RGBA'
        mezcla.blend_type = 'MULTIPLY'
        enchufe(mezcla.inputs, 'Factor', 'VALUE').default_value = 1.0
        enchufe(mezcla.inputs, 'A', 'RGBA').default_value = tinte
        l.new(rango.outputs['Result'], enchufe(mezcla.inputs, 'B', 'RGBA'))
        l.new(enchufe(mezcla.outputs, 'Result', 'RGBA'), bsdf.inputs['Base Color'])
    else:
        l.new(dif.outputs['Color'], bsdf.inputs['Base Color'])
    rug = imagen('rough', False)
    l.new(rug.outputs['Color'], bsdf.inputs['Roughness'])
    nor = imagen('nor_gl', False)
    nm = n.new('ShaderNodeNormalMap')
    nm.inputs['Strength'].default_value = normal
    l.new(nor.outputs['Color'], nm.inputs['Color'])
    l.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    return m


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
        enchufe(mix.inputs, 'A', 'RGBA').default_value = color
        enchufe(mix.inputs, 'B', 'RGBA').default_value = tuple(c * 0.86 for c in color[:3]) + (1.0,)
        lt = m.node_tree.links
        lt.new(tex.outputs['Fac'], enchufe(mix.inputs, 'Factor', 'VALUE'))
        lt.new(enchufe(mix.outputs, 'Result', 'RGBA'), bsdf.inputs['Base Color'])
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


# ── Vegetación (modelos CC0 de Poly Haven) ──────────────────────────────────

VEGETACION = {}


def cargar_vegetacion(ids):
    """Importa cada modelo una vez a una colección fuera de escena; luego se
    instancia, así veinte helechos cuestan lo mismo en memoria que uno."""
    for id_ in ids:
        gltf = RECURSOS / id_ / f'{id_}_2k.gltf'
        if not gltf.exists():
            continue
        antes = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=str(gltf))
        nuevos = [o for o in bpy.data.objects if o not in antes]
        col = bpy.data.collections.new(id_)
        for o in nuevos:
            for c in list(o.users_collection):
                c.objects.unlink(o)
            col.objects.link(o)
        bpy.context.view_layer.update()
        zs = [(o.matrix_world @ Vector(v)).z for o in nuevos if o.type == 'MESH' for v in o.bound_box]
        VEGETACION[id_] = (col, max(zs) - min(zs), min(zs))


def instancia(veg, x, y, z, alto, giro=0.0):
    col, alto_modelo, base = veg
    e = bpy.data.objects.new(col.name, None)
    e.instance_type = 'COLLECTION'
    e.instance_collection = col
    k = alto / alto_modelo
    e.scale = (k, k, k)
    e.location = (x, y, z - base * k)
    e.rotation_euler = (0, 0, giro)
    bpy.context.collection.objects.link(e)
    return e


# ── Piezas ───────────────────────────────────────────────────────────────────

def ventana(x0, x1, z0, z1, y, M, hojas=2, s=1):
    """Vano con marco negro, vidrio que refleja y, detrás, un interior en penumbra
    con cortinas a medio correr: lo que hace que una fachada se vea habitada."""
    caja('vidrio', x0, x1, y + 0.02 * s, y + 0.03 * s, z0, z1, M['vidrio'], bisel=0)
    caja('interior', x0, x1, y + 0.05 * s, y + 0.06 * s, z0, z1, M['interior'], bisel=0)
    rnd = random.Random(round(x0 * 37 + z0 * 101))
    cubierto = rnd.choice((0.0, 0.25, 0.35, 0.5, 0.65, 1.0))
    if cubierto:
        ancho = (x1 - x0) * cubierto
        if rnd.random() < 0.5:
            caja('cortina', x0, x0 + ancho, y + 0.035 * s, y + 0.045 * s, z0, z1, M['cortina'], bisel=0)
        else:
            caja('cortina', x1 - ancho, x1, y + 0.035 * s, y + 0.045 * s, z0, z1, M['cortina'], bisel=0)
    t = 0.05
    caja('marco', x0, x1, y, y + 0.06 * s, z0, z0 + t, M['marco'], bisel=0)
    caja('marco', x0, x1, y, y + 0.06 * s, z1 - t, z1, M['marco'], bisel=0)
    for i in range(hojas + 1):
        xm = x0 + (x1 - x0) * i / hojas
        caja('marco', xm - t / 2, xm + t / 2, y, y + 0.06 * s, z0, z1, M['marco'], bisel=0)


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
    rnd = random.Random(int(x0 * 100 + z * 10))
    helecho = VEGETACION.get('fern_02')
    if helecho:
        # Helechos reales: unos erguidos y otros volcados hacia afuera, que cuelgan.
        for i in range(int((x1 - x0) / 0.4)):
            x = x0 + 0.22 + i * 0.4 + rnd.uniform(-0.05, 0.05)
            instancia(helecho, x, y - 0.22, z + 0.3, alto=rnd.uniform(0.32, 0.45), giro=rnd.uniform(0, 6.28))
            colgante = instancia(helecho, x + 0.08, y - 0.42, z + 0.28, alto=rnd.uniform(0.38, 0.52), giro=rnd.uniform(0, 6.28))
            colgante.rotation_euler.x = math.radians(rnd.uniform(70, 110))
        return
    for i in range(int((x1 - x0) / 0.07)):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=rnd.uniform(0.12, 0.22),
                                              location=(rnd.uniform(x0 + 0.1, x1 - 0.1), y - rnd.uniform(0.15, 0.4),
                                                        z + 0.35 + rnd.uniform(-0.05, 0.12)))
        ob = bpy.context.active_object
        ob.scale = (1.0, 0.8, rnd.uniform(0.7, 1.4))
        ob.data.materials.append(M['follaje'])
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
    # Avenida con berma central, como las de Santa Victoria:
    # vereda | pista | berma | pista | vereda, y la manzana de enfrente.
    caja('vereda', -90, 100, -r - 3.2, -r, 0, 0.15, M['concreto'], bisel=0)
    caja('jardin_retiro', -0.6, W + 0.6, -r, 0, 0, 0.05, M['concreto'], bisel=0)
    caja('pista', -90, 100, -r - 11.5, -r - 3.2, -0.05, 0.0, M['asfalto'], bisel=0)
    caja('berma', -90, 100, -r - 15, -r - 11.5, 0, 0.18, M['grass'], bisel=0)
    caja('pista2', -90, 100, -r - 23.3, -r - 15, -0.05, 0.0, M['asfalto'], bisel=0)
    caja('vereda2', -90, 100, -r - 26.5, -r - 23.3, 0, 0.15, M['concreto'], bisel=0)
    caja('pista_posterior', -90, 100, 40, 48, -0.05, 0.0, M['asfalto'], bisel=0)
    caja('suelo', -160, 180, -160, 200, -0.06, -0.05, M['concreto'], bisel=0)
    barrio(P, M)

    # Árboles: faiques y algarrobos en la berma y al fondo, jacarandá en vereda.
    arboles = [
        ('island_tree_01', 0.8, -r - 13.4, 7.5, 0.4),      # primer plano, enmarca por la izquierda
        ('island_tree_01', 37.0, -r - 13.6, 8.0, 2.1),
        ('tree_small_02', 14.0, -r - 12.6, 4.5, 1.0),
        ('jacaranda_tree', -6.5, -r - 1.9, 6.5, 0.8),
        ('jacaranda_tree', W + 4.0, -r - 1.9, 6.0, 2.6),
        ('island_tree_03', -5.0, 19.0, 9.0, 0.3),
        ('island_tree_03', 22.0, 21.0, 10.0, 1.7),
        ('island_tree_01', 8.0, 27.0, 11.0, 4.0),
        ('jacaranda_tree', -22.0, -r - 24.8, 6.0, 1.3),
        ('jacaranda_tree', 3.0, -r - 24.8, 5.5, 3.3),
        ('island_tree_01', 30.0, -r - 13.3, 7.0, 5.0),
        ('island_tree_01', -25.0, -r - 13.3, 7.5, 2.4),
        ('tree_small_02', -38.0, -r - 1.9, 5.0, 0.2),
        ('tree_small_02', 42.0, -r - 1.9, 5.0, 1.9),
    ]
    for id_, x, y, alto, giro in arboles:
        if id_ in VEGETACION:
            instancia(VEGETACION[id_], x, y, 0.15 if y < 0 else 0.0, alto, giro)

    # Sardineles: el borde de concreto que separa pista, berma y vereda.
    caja('sardinel', -30, 40, -r - 11.65, -r - 11.5, -0.05, 0.22, M['concreto'], bisel=0.01)
    caja('sardinel', -30, 40, -r - 3.35, -r - 3.2, -0.05, 0.2, M['concreto'], bisel=0.01)
    pasto(-16, 32, -r - 15, -r - 11.65, 0.18)


# Colores de fachada que se ven en cualquier calle de Chiclayo (sRGB), con el
# peso que tienen en la calle: dominan el blanco, el hueso y el cemento; los
# colores vivos son minoría. Sin esto el barrio parece de juguete.
PALETA_CASAS = [
    ('e6dfd0', 5),   # blanco hueso
    ('d9d4c7', 4),   # blanco sucio
    ('a8a6a0', 4),   # gris cemento
    ('ddd0ad', 3),   # crema
    ('cfa874', 2),   # ocre
    ('d3a68e', 2),   # durazno
    ('a9bfae', 1),   # verde agua
    ('d8c07e', 1),   # amarillo maíz
    ('aec2cc', 1),   # celeste pálido
    ('c08a70', 1),   # terracota
]


def casa(x0, x1, y_fachada, fondo, pisos, mat, M, rnd, mira):
    """Casa limeña-norteña típica: caja tarrajeada, parapeto, ventanas, portón
    o puerta, y casi siempre un tanque de agua negro en la azotea.
    mira=-1: fachada hacia -y (cuerpo hacia +y); mira=+1: fachada hacia +y."""
    h = 0.3 + pisos * 2.7
    y0, y1 = (y_fachada, y_fachada + fondo) if mira < 0 else (y_fachada - fondo, y_fachada)
    caja('casa', x0, x1, y0, y1, 0, h, mat)
    e = 0.15
    caja('parapeto', x0, x1, y0, y0 + e, h, h + 0.9, mat, bisel=0)
    caja('parapeto', x0, x1, y1 - e, y1, h, h + 0.9, mat, bisel=0)
    caja('parapeto', x0, x0 + e, y0, y1, h, h + 0.9, mat, bisel=0)
    caja('parapeto', x1 - e, x1, y0, y1, h, h + 0.9, mat, bisel=0)
    yf = y_fachada - 0.03 if mira < 0 else y_fachada + 0.03
    sv = 1 if mira < 0 else -1
    ancho = x1 - x0
    for f in range(pisos):
        z0 = 0.3 + f * 2.7
        if f == 0:
            if ancho > 6.5 and rnd.random() < 0.6:
                # portón de cochera de plancha
                for k in range(10):
                    zz = 0.3 + k * 0.22
                    caja('porton', x0 + 0.6, x0 + 3.4, yf - 0.02 * sv, yf, zz, zz + 0.2, M['marco'], bisel=0)
                ventana(x0 + 4.2, min(x1 - 0.8, x0 + 6.6), z0 + 0.9, z0 + 2.2, yf, M, hojas=2, s=sv)
            else:
                caja('puerta', x0 + 0.8, x0 + 1.8, yf - 0.02 * sv, yf, 0.3, 2.4, M['marco'], bisel=0)
                ventana(x0 + 2.6, min(x1 - 0.8, x0 + 5.0), z0 + 0.9, z0 + 2.2, yf, M, hojas=2, s=sv)
        else:
            n = 1 if ancho < 7.5 else 2
            paso = ancho / n
            for k in range(n):
                cx = x0 + (k + 0.5) * paso
                mitad = min(1.2, paso / 2 - 0.6) * rnd.uniform(0.75, 1.0)
                ventana(cx - mitad, cx + mitad, z0 + 0.9, z0 + 2.2, yf, M, hojas=2, s=sv)
    if rnd.random() < 0.8:
        tx = rnd.uniform(x0 + 0.9, x1 - 0.9)
        ty = rnd.uniform(y0 + 1.5, y1 - 1.5)
        caja('base_tanque', tx - 0.7, tx + 0.7, ty - 0.7, ty + 0.7, h, h + 0.5, M['blanco'], bisel=0)
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.55, depth=1.15, location=(tx, ty, h + 0.5 + 0.575))
        bpy.context.active_object.data.materials.append(M['tanque'])
    return h


def fila_casas(x_desde, x_hasta, y_fachada, mira, M, rnd, pisos_max=3, fondo=(16, 21)):
    """Llena un tramo de manzana con lotes de 7 a 11 m. Devuelve la lista de
    (x0, x1, h) para que el edificio sepa cuánto miden sus vecinos."""
    lotes = []
    direccion = 1 if x_hasta > x_desde else -1
    x = x_desde
    while (x_hasta - x) * direccion > 4:
        w = rnd.uniform(7, 11)
        xa, xb = sorted((x, x + w * direccion))
        pisos = rnd.choices([1, 2, 3, 4], weights=[2, 5, 4, 1 if pisos_max >= 4 else 0])[0]
        pisos = min(pisos, pisos_max)
        tinte = rnd.choices([c for c, _ in PALETA_CASAS], weights=[w for _, w in PALETA_CASAS])[0]
        # ladrillo sin tarrajear: casas a medio terminar, muy comunes
        mat = M['ladrillo'] if rnd.random() < 0.22 else M['casas'][tinte]
        yf = y_fachada + rnd.uniform(-0.3, 0.3)
        h = casa(xa + 0.05, xb - 0.05, yf, rnd.uniform(*fondo), pisos, mat, M, rnd, mira)
        lotes.append((xa, xb, h))
        x += w * direccion
    return lotes


def barrio(P, M):
    W, r, D = P['frente'], P['retiro'], P['fondo']
    rnd = random.Random(14)
    z_top = P['h_piso1'] + P['pisos'] * P['h_piso'] + 0.25
    # nuestra vereda: los vecinos inmediatos fijan las medianeras
    izq = fila_casas(-0.7, -130, -r + 0.2, -1, M, rnd)
    der = fila_casas(W + 0.7, 140, -r + 0.2, -1, M, rnd)
    # Medianeras de ladrillo caravista: en Chiclayo el muro que queda por encima
    # del vecino casi nunca se tarrajea.
    caja('medianera_izq', -0.03, 0.0, 0.0, D, izq[0][2], z_top, M['ladrillo'], bisel=0)
    caja('medianera_der', W, W + 0.03, 0.0, D, der[0][2], z_top, M['ladrillo'], bisel=0)
    # manzana de enfrente, mirando hacia nosotros
    fila_casas(-130, 140, -r - 26.5, 1, M, rnd, pisos_max=4)
    # manzana posterior: sus espaldas se ven por detrás del edificio
    fila_casas(-130, 140, 40, 1, M, rnd, pisos_max=3, fondo=(17, 20))
    # más allá, manzanas hasta el horizonte de la toma aérea
    for y in (48, 88, 128):
        fila_casas(-130, 140, y, -1, M, rnd, pisos_max=3, fondo=(17, 20))
        fila_casas(-130, 140, y + 40 - 8, 1, M, rnd, pisos_max=3, fondo=(12, 14))
        caja('pista_fondo', -130, 140, y + 32, y + 40, -0.05, 0.0, M['asfalto'], bisel=0)


def pasto(x0, x1, y0, y1, z, por_m2=5):
    """Matas de pasto reales repartidas al azar; solo donde las ve la cámara."""
    veg = VEGETACION.get('grass_medium_01')
    if not veg:
        return
    rnd = random.Random(7)
    for _ in range(int((x1 - x0) * (y1 - y0) * por_m2)):
        instancia(veg, rnd.uniform(x0, x1), rnd.uniform(y0, y1), z, alto=rnd.uniform(0.18, 0.32), giro=rnd.uniform(0, 6.28))


# ── Escena ───────────────────────────────────────────────────────────────────

def materiales(acento):
    return {
        'blanco': material_tex('blanco', 'plastered_wall_04', tinte=(0.8, 0.8, 0.78, 1), escala=2.5, normal=0.3),
        'acento': material_tex('acento', 'plastered_wall_04', tinte=hex_rgb(acento), escala=2.5, normal=0.3),
        'vidrio': material('vidrio', (0.85, 0.92, 0.95, 1), 0.02, transmision=1.0),
        'interior': material('interior', (0.035, 0.03, 0.028, 1), 0.8),
        'cortina': material('cortina', (0.62, 0.6, 0.56, 1), 1.0, ruido=0.3),
        'vidrio_oscuro': material('vidrio_oscuro', (0.02, 0.025, 0.03, 1), 0.05, metal=0.0),
        'marco': material('marco', (0.015, 0.015, 0.015, 1), 0.4),
        'acero': material('acero', (0.8, 0.8, 0.8, 1), 0.25, metal=1.0),
        'bloque_claro': material('bloque_claro', (0.7, 0.7, 0.69, 1), 0.9),
        'bloque_gris': material('bloque_gris', (0.33, 0.33, 0.34, 1), 0.9),
        'follaje': material('follaje', (0.035, 0.12, 0.03, 1), 0.7, ruido=0.6),
        'luminaria': material('luminaria', (1, 1, 1, 1), 0.3),
        'madera': material('madera', (0.25, 0.12, 0.05, 1), 0.6),
        'lona': material('lona', (0.22, 0.18, 0.14, 1), 0.9),
        'ladrillo': material_tex('ladrillo', 'red_brick_03', escala=1.2, normal=0.8),
        'concreto': material_tex('concreto', 'concrete_pavement', escala=2.0, normal=0.6),
        'asfalto': material_tex('asfalto', 'asphalt_02', escala=3.0, normal=0.6),
        'grass': material('pasto', (0.03, 0.05, 0.015, 1), 0.95, ruido=0.7),
        'vecino1': material('vecino1', (0.62, 0.61, 0.58, 1), 0.9, ruido=0.3),
        'tanque': material('tanque', (0.012, 0.012, 0.012, 1), 0.45),
        'casas': {c: material_tex(f'casa_{c}', 'plastered_wall_04', tinte=hex_rgb(c), escala=2.5, normal=0.35)
                  for c, _ in PALETA_CASAS},
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
    hdri = RECURSOS / 'kloofendal_43d_clear_puresky' / 'kloofendal_43d_clear_puresky_4k.hdr'
    if hdri.exists():
        # La cámara ve un cielo fotográfico; la luz sigue saliendo del cielo físico
        # y del sol, así no hay dos soles proyectando sombras distintas.
        env = n.new('ShaderNodeTexEnvironment')
        env.image = bpy.data.images.load(str(hdri))
        bg_foto = n.new('ShaderNodeBackground')
        bg_foto.inputs['Strength'].default_value = 1.5
        w.node_tree.links.new(env.outputs['Color'], bg_foto.inputs['Color'])
        rayo = n.new('ShaderNodeLightPath')
        mezcla = n.new('ShaderNodeMixShader')
        salida = n.get('World Output')
        w.node_tree.links.new(rayo.outputs['Is Camera Ray'], mezcla.inputs['Fac'])
        w.node_tree.links.new(bg.outputs['Background'], mezcla.inputs[1])
        w.node_tree.links.new(bg_foto.outputs['Background'], mezcla.inputs[2])
        w.node_tree.links.new(mezcla.outputs['Shader'], salida.inputs['Surface'])


def camara(vista):
    c = VISTAS[vista]
    cam = bpy.data.cameras.new('cam')
    cam.lens = c['focal']
    cam.sensor_fit = 'AUTO'
    ob = bpy.data.objects.new('cam', cam)
    bpy.context.collection.objects.link(ob)
    ob.location = c['pos']
    # cámara a nivel (verticales rectas, como foto de arquitectura) y lens shift
    ob.rotation_euler = (math.radians(90 - c.get('inclinacion', 0.0)), 0, math.radians(c['giro']))
    if 'centro' in c:
        dist = math.hypot(c['pos'][0] - PARAM['frente'] / 2, c['pos'][1])
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
    cargar_vegetacion(['grass_medium_01', 'fern_02', 'island_tree_01', 'island_tree_03', 'jacaranda_tree', 'tree_small_02'])
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
