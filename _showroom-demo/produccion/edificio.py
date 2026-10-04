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
    # versiones verticales para celular (1080x1920): misma cámara, lente más
    # abierto para que el edificio entre entero en una pantalla parada
    # Cenital del barrio SIN el edificio: va debajo de la planta de piso en la
    # web. Marco amplio (x -30..44,4 m, y -26..44 m) para que cubra la pantalla
    # aun con el edificio entero encuadrado. En coordenadas normalizadas de la
    # planta: [-2,0833, -1,0, 3,0833, 2,1818]; ese marco lo declara
    # datos/edificio.js.
    'planta_contexto': dict(orto=True, centro_xy=(7.2, 9.0), escala=74.4),
    # Azotea vista desde arriba, encuadre exacto al rectángulo del edificio
    # (renderizar a 1440x2200): es la planta del piso «azotea» en la web.
    'planta_azotea': dict(orto=True, centro_xy=(7.2, 11.0), escala=22.0),
    # Portada: toma fija desde la azotea de enfrente, a media altura del
    # edificio, verticales rectas (lens shift). Es el timelapse día-noche.
    'portada':       dict(pos=(-2.0, -38.0, 13.8), giro=-13.0, focal=33, centro=10.6),
    'portada_movil': dict(pos=(-2.0, -38.0, 13.8), giro=-13.0, focal=26, centro=10.9),
    'movil_frente':   dict(pos=(7.2, -27.0, 1.6), giro=0.0, focal=30, centro=10.5),
    'movil_diag_izq': dict(pos=(-12.0, -22.5, 1.6), giro=-36.0, focal=27, centro=10.5),
    'movil_diag_der': dict(pos=(29.0, -26.0, 1.6), giro=38.0, focal=27, centro=10.5),
    'movil_aerea':    dict(pos=(-22.0, -40.0, 27.0), giro=-30.0, focal=27, inclinacion=24.0),
}


# Vista desde cada piso: cámara justo afuera del ventanal de la sala, a la
# altura de los ojos de ese piso. Frente = hacia la avenida (dptos 01 y 02);
# fondo = hacia el patio posterior (03 y 04). Alimenta la pestaña «Vista» de la
# ficha y el exterior que se ve por la ventana en los panoramas 360.
for _n in range(2, 7):
    _z = PARAM['h_piso1'] + (_n - 2) * PARAM['h_piso'] + 1.5
    VISTAS[f'vista_frente_p{_n}'] = dict(pos=(3.0, -1.5, _z), giro=180.0, focal=16, centro=_z)
    VISTAS[f'vista_fondo_p{_n}'] = dict(pos=(3.0, PARAM['fondo'] + 0.6, _z), giro=0.0, focal=16, centro=_z)


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
    p.add_argument('--noche', action='store_true', help='hora azul con luces encendidas')
    p.add_argument('--fantasma', action='store_true', help='vecinos inmediatos en blanco translúcido')
    # giro 360: N cuadros alrededor del edificio en una sola sesión de Blender
    p.add_argument('--orbita', type=int, default=0, help='cantidad de cuadros del giro (0 = render normal)')
    p.add_argument('--orbita-dir', default='giro')
    p.add_argument('--orbita-radio', type=float, default=54.0)
    p.add_argument('--orbita-alto', type=float, default=14.5)
    p.add_argument('--orbita-mira', type=float, default=9.0, help='altura del punto al que mira la cámara')
    p.add_argument('--orbita-focal', type=float, default=34.0)
    p.add_argument('--solo-franjas', action='store_true', help='escribir franjas.json del giro sin renderizar')
    p.add_argument('--timelapse', default='', help='estados separados por coma (dia,atardecer,crepusculo,noche): una imagen por estado, misma escena')
    p.add_argument('--timelapse-dir', default='timelapse')
    p.add_argument('--capas', action='store_true', help='timelapse en capas: primer plano sin cielo + cielo ancho aparte')
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


def rugosidad(m, a, b):
    """Remapea la rugosidad del material (o la fija si no tiene mapa): pista
    mojada de noche, porcelanato pulido en los interiores."""
    nt = m.node_tree
    bsdf = nt.nodes.get('Principled BSDF')
    enlace = next((l for l in nt.links if l.to_socket == bsdf.inputs['Roughness']), None)
    if enlace is None:
        bsdf.inputs['Roughness'].default_value = (a + b) / 2
        return m
    rango = nt.nodes.new('ShaderNodeMapRange')
    rango.inputs['To Min'].default_value = a
    rango.inputs['To Max'].default_value = b
    nt.links.new(enlace.from_socket, rango.inputs['Value'])
    nt.links.new(rango.outputs['Result'], bsdf.inputs['Roughness'])
    return m


def emisivo(nombre, color, fuerza):
    """Superficie que emite luz (ventana encendida, letrero)."""
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Emission Color'].default_value = color
    bsdf.inputs['Emission Strength'].default_value = fuerza
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


# Mientras se arma el barrio, las cajas no son objetos sino geometría que se
# acumula por material (y por lote en los vecinos inmediatos, que el modo
# fantasma necesita aparte). Cientos de casas como miles de objetos tardaban
# 14 minutos en armarse; como un puñado de mallas, segundos.
LOTE = None
GRUPO = 'barrio'
# (x, y, radio): nada alto se coloca aquí (la cámara de portada está encima)
DESPEJE = [(-2.0, -38.0, 7.0)]


def despejado(x, y):
    return all((x - a) ** 2 + (y - b) ** 2 > r * r for a, b, r in DESPEJE)


def acumular(v, f, mat):
    d = LOTE.setdefault((mat.name, GRUPO), {'v': [], 'f': [], 'mat': mat})
    o = len(d['v'])
    d['v'].extend(v)
    d['f'].extend(tuple(i + o for i in cara) for cara in f)


def volcar_lote():
    for (nombre, grupo), d in LOTE.items():
        me = bpy.data.meshes.new(f'{grupo}_{nombre}')
        me.from_pydata(d['v'], [], d['f'])
        me.update()
        ob = bpy.data.objects.new(f'{grupo}_{nombre}', me)
        ob.data.materials.append(d['mat'])
        bpy.context.collection.objects.link(ob)


def cilindro_lote(x, y, z0, z1, r, mat, lados=20):
    """Cilindro (tanque de agua) como geometría del lote."""
    v, f = [], []
    for k in range(lados):
        a = 2 * math.pi * k / lados
        v += [(x + r * math.cos(a), y + r * math.sin(a), z0), (x + r * math.cos(a), y + r * math.sin(a), z1)]
    for k in range(lados):
        a, b = 2 * k, 2 * ((k + 1) % lados)
        f.append((a, b, b + 1, a + 1))
    f.append(tuple(2 * k + 1 for k in range(lados)))
    f.append(tuple(2 * k for k in reversed(range(lados))))
    acumular(v, f, mat)


def caja(nombre, x0, x1, y0, y1, z0, z1, mat, bisel=0.012):
    x0, x1 = sorted((x0, x1)); y0, y1 = sorted((y0, y1)); z0, z1 = sorted((z0, z1))
    v = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
         (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    if LOTE is not None:
        acumular(v, f, mat)
        return None
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

# Modo noche: hora azul, ventanas encendidas, alumbrado público. Lo fija main()
# desde --noche; con False todo se construye exactamente como de día.
NOCHE = False
# Mientras se arma el edificio (no el barrio): de noche cada ventana tiene un
# cuarto de verdad detrás, vaciado del volumen con un booleano. Sin eso el
# muro macizo tapaba el interior y las ventanas no se veían encendidas.
CUARTOS = False
CORTES = []
# Vecinos inmediatos como maqueta translúcida: en el giro 360 y en la variante
# de las vistas de calle que la web muestra al elegir un piso (así la franja
# del piso no cae sobre la casa de al lado, que tapa el costado).
FANTASMA = False


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
    rnd = random.Random(round(x0 * 37 + z0 * 101))
    cubierto = rnd.choice((0.0, 0.25, 0.35, 0.5, 0.65, 1.0))
    con_cuarto = NOCHE and CUARTOS and y > -0.3
    encendida = NOCHE and random.Random(round(x0 * 53 + z0 * 71)).random() < (0.86 if con_cuarto else 0.58)
    if con_cuarto:
        cuarto(x0, x1, z0, z1, y, M, encendida, rnd)
        cubierto = min(cubierto, 0.35)
    elif encendida:
        # casas del barrio: el muro de la casa tapa lo que queda detrás del
        # vidrio, así que la luz de la ventana va por delante de él
        caja('interior', x0, x1, y + 0.008 * s, y + 0.014 * s, z0, z1, M['interior_luz'], bisel=0)
    else:
        caja('interior', x0, x1, y + 0.05 * s, y + 0.06 * s, z0, z1, M['interior'], bisel=0)
    if cubierto:
        ancho = (x1 - x0) * cubierto
        if rnd.random() < 0.5:
            caja('cortina', x0, x0 + ancho, y + 0.035 * s, y + 0.045 * s, z0, z1, M['cortina_luz' if encendida else 'cortina'], bisel=0)
        else:
            caja('cortina', x1 - ancho, x1, y + 0.035 * s, y + 0.045 * s, z0, z1, M['cortina_luz' if encendida else 'cortina'], bisel=0)
    t = 0.05
    caja('marco', x0, x1, y, y + 0.06 * s, z0, z0 + t, M['marco'], bisel=0)
    caja('marco', x0, x1, y, y + 0.06 * s, z1 - t, z1, M['marco'], bisel=0)
    for i in range(hojas + 1):
        xm = x0 + (x1 - x0) * i / hojas
        caja('marco', xm - t / 2, xm + t / 2, y, y + 0.06 * s, z0, z1, M['marco'], bisel=0)


def cuarto(x0, x1, z0, z1, y, M, encendida, rnd):
    """Ambiente detrás de una ventana del edificio: el hueco (que luego se
    resta del volumen), un plafón encendido, muro de fondo cálido y la silueta
    de un mueble. Es lo que hace que de noche la fachada se lea habitada."""
    P = PARAM
    h1, hp = P['h_piso1'], P['h_piso']
    zf = h1 + int((z0 - h1) / hp) * hp if z0 >= h1 else 0.0
    zt = zf + hp - 0.06
    xa, xb = max(0.45, x0 - 0.35), min(P['frente'] - 0.45, x1 + 0.35)
    fondo = 3.0
    corte = caja('corte', xa, xb, -0.25, fondo, zf + 0.02, zt, M['interior'], bisel=0)
    CORTES.append(corte)
    caja('cuarto_fondo', xa, xb, fondo - 0.05, fondo, zf, zt, M['cuarto'], bisel=0)
    caja('cuarto_piso', xa, xb, 0.0, fondo, zf, zf + 0.025, M['cuarto_piso'], bisel=0)
    ancho = rnd.uniform(1.2, 2.0)
    xm = rnd.uniform(xa + 0.3, max(xa + 0.31, xb - ancho - 0.3))
    caja('mueble_interior', xm, xm + ancho, fondo - 1.0, fondo - 0.1, zf, zf + 0.8, M['mueble_interior'], bisel=0.03)
    if rnd.random() < 0.5:
        caja('cuadro_interior', xm + 0.2, xm + ancho - 0.2, fondo - 0.07, fondo - 0.05, zf + 1.3, zf + 1.9, M['cuadro_interior'], bisel=0)
    if not encendida:
        return
    cx = (xa + xb) / 2
    bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.02, location=(cx, 1.3, zt - 0.01))
    bpy.context.active_object.data.materials.append(M['plafon_on'])
    luz = bpy.data.lights.new('cuarto', 'AREA')
    luz.shape = 'DISK'
    luz.size = 0.6
    luz.energy = rnd.uniform(130, 210)
    luz.color = (1.0, 0.52, 0.22)
    ob = bpy.data.objects.new('cuarto', luz)
    ob.location = (cx, 1.3, zt - 0.03)
    bpy.context.collection.objects.link(ob)


def vaciar_cuartos(cuerpo):
    """Resta del volumen del edificio los huecos de los cuartos."""
    if not CORTES:
        return
    col = bpy.data.collections.new('cortes')
    bpy.context.scene.collection.children.link(col)
    # la fachada posterior es la delantera reflejada: sus cuartos también se
    # vacían, si no de noche sus ventanas se verían ciegas en el giro
    D = PARAM['fondo']
    for c in list(CORTES):
        xs = [v.co.x for v in c.data.vertices]
        ys = [v.co.y for v in c.data.vertices]
        zs = [v.co.z for v in c.data.vertices]
        CORTES.append(caja('corte', min(xs), max(xs), D - max(ys), D - min(ys), min(zs), max(zs), c.data.materials[0], bisel=0))
    for c in CORTES:
        for u in list(c.users_collection):
            u.objects.unlink(c)
        col.objects.link(c)
        c.hide_render = True
        c.display_type = 'WIRE'
    mod = cuerpo.modifiers.new('cuartos', 'BOOLEAN')
    mod.operation = 'DIFFERENCE'
    mod.operand_type = 'COLLECTION'
    mod.collection = col
    for solver in ('MANIFOLD', 'EXACT', 'FLOAT', 'FAST'):
        try:
            mod.solver = solver
            break
        except TypeError:
            continue


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
    if NOCHE:
        luz = bpy.data.lights.new('downlight', 'SPOT')
        luz.energy = 90
        luz.spot_size = math.radians(100)
        luz.color = (1.0, 0.72, 0.42)
        ob = bpy.data.objects.new('downlight', luz)
        ob.location = ((x0 + x1) / 2, -v / 2, z0 + h - t - 0.06)
        bpy.context.collection.objects.link(ob)
    ancho_cel = 1.4
    if NOCHE:
        # bañador de luz desde el piso del balcón: raspa la celosía de abajo
        # hacia arriba, como en los renders nocturnos de la competencia
        xc = (x0 + t + ancho_cel / 2) if lado_celosia == 'izq' else (x1 - t - ancho_cel / 2)
        ras = bpy.data.lights.new('banador', 'SPOT')
        ras.energy = 140
        ras.spot_size = math.radians(40)
        ras.spot_blend = 0.6
        ras.shadow_soft_size = 0.03
        ras.color = (1.0, 0.8, 0.55)
        ob = bpy.data.objects.new('banador', ras)
        ob.location = (xc, -v + 0.22, z0 + t + 0.04)
        ob.rotation_euler = (math.radians(170), 0, 0)
        bpy.context.collection.objects.link(ob)
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

    global CUARTOS
    CUARTOS = True
    # cuerpo
    cuerpo = caja('cuerpo', 0, W, 0, D, 0, z_top, M['blanco'])
    caja('parapeto_azotea', -0.05, W + 0.05, -0.05, D + 0.05, z_top, z_top + 0.25, M['blanco'])

    xl0, xl1 = P['col_izq']
    xc0, xc1 = P['col_centro']
    xr0, xr1 = P['col_der']

    antes = set(bpy.data.objects)
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

    # fachada posterior (dptos. 03 y 04, hacia el patio): la delantera reflejada
    fachada = [o for o in bpy.data.objects if o not in antes and o not in CORTES]
    espejo_trasero(fachada, D)

    azotea(P, M, z_top)

    # piso 1 detrás del cerco: muro de ladrillo caravista visible sobre el cerco
    caja('zocalo', 0, W, -0.02, 0, 0, P['h_piso1'], M['ladrillo'], bisel=0)
    CUARTOS = False
    vaciar_cuartos(cuerpo)


def espejo_trasero(objs, D):
    """Fachada posterior: la misma composición de la delantera, reflejada hacia
    el patio. En el giro 360 el edificio se ve por los cuatro lados."""
    col = bpy.data.collections.new('fachada')
    for o in objs:
        col.objects.link(o)
    e = bpy.data.objects.new('fachada_posterior', None)
    e.instance_type = 'COLLECTION'
    e.instance_collection = col
    e.location = (0, D, 0)
    e.scale = (1, -1, 1)
    bpy.context.collection.objects.link(e)


def sombrilla(x, y, z, M):
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=1.3, radius2=0.05, depth=0.42, location=(x, y, z + 2.3))
    bpy.context.active_object.data.materials.append(M['lona'])
    caja('mastil', x - 0.02, x + 0.02, y - 0.02, y + 0.02, z, z + 2.2, M['acero'], bisel=0)


def azotea(P, M, z_top):
    """Azotea coherente con las plantas: caja de escalera y ascensor sobre el
    núcleo; al frente las terrazas privadas de los dptos. 601 y 602; atrás la
    terraza común con pérgola, comedor y parrilla; en medio el área técnica."""
    W, D = P['frente'], P['fondo']
    xc0, xc1 = P['col_centro']
    zt = z_top + 0.25
    baranda_vidrio(0.2, W - 0.2, 0.1, zt, M, alto=1.1)
    baranda_vidrio(0.2, W - 0.2, D - 0.1, zt, M, alto=1.1)
    caja('parapeto_lateral', 0, 0.2, 0, D, zt, zt + 1.1, M['blanco'])
    caja('parapeto_lateral', W - 0.2, W, 0, D, zt, zt + 1.1, M['blanco'])
    # caja de escalera y ascensor (misma huella que el núcleo de las plantas)
    caja('caja_escalera', xc0, xc1, 8.5, 13.8, zt, zt + 2.6, M['blanco'])
    caja('caja_escalera_techo', xc0 - 0.15, xc1 + 0.15, 8.35, 13.95, zt + 2.6, zt + 2.8, M['acento'])
    caja('cuarto_maquinas', xc0, xc1, 8.5, 10.4, zt + 2.8, zt + 3.7, M['blanco'])
    caja('puerta_azotea', xc0 + 0.6, xc1 - 0.6, 13.8, 13.86, zt, zt + 2.1, M['marco'], bisel=0)
    helecho = VEGETACION.get('fern_02')
    rnd = random.Random(61)
    # terrazas privadas al frente, separadas por un muro bajo con jardinera
    for xa, xb, xs in ((0.2, xc0 - 0.1, 3.2), (xc1 + 0.1, W - 0.2, 11.2)):
        caja('deck', xa, xb, 0.2, 7.9, zt, zt + 0.06, M['madera'], bisel=0)
        caja('jardinera_azotea', xa, xb, 7.9, 8.3, zt, zt + 0.85, M['acento'])
        if helecho:
            for k in range(int((xb - xa) / 0.5)):
                instancia(helecho, xa + 0.25 + k * 0.5, 8.1, zt + 0.82, alto=rnd.uniform(0.4, 0.6), giro=rnd.uniform(0, 6.28))
        sombrilla(xs, 3.6, zt + 0.06, M)
        for dx in (-0.9, 0.5):
            caja('tumbona', xs + dx, xs + dx + 0.65, 4.6, 6.5, zt + 0.06, zt + 0.42, M['lona'], bisel=0.04)
    for x in (xc0 - 0.1, xc1):
        caja('muro_terraza', x, x + 0.1, 0.2, 8.3, zt, zt + 1.6, M['blanco'])
    # área técnica: tanques elevados como en todo Chiclayo
    for tx in (1.6, 3.1):
        caja('base_tanque', tx - 0.65, tx + 0.65, 10.4, 11.7, zt, zt + 0.4, M['blanco'], bisel=0)
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.55, depth=1.2, location=(tx, 11.05, zt + 1.0))
        bpy.context.active_object.data.materials.append(M['tanque'])
    # terraza común al fondo
    caja('deck_comun', 0.2, W - 0.2, 14.2, D - 0.2, zt, zt + 0.06, M['madera'], bisel=0)
    px0, px1, py0, py1 = 0.8, 7.2, 15.2, 20.4
    for (x, y) in ((px0, py0), (px1 - 0.15, py0), (px0, py1 - 0.15), (px1 - 0.15, py1 - 0.15)):
        caja('pergola_poste', x, x + 0.15, y, y + 0.15, zt, zt + 2.6, M['madera'], bisel=0.01)
    for y in (py0, py1 - 0.15):
        caja('pergola_viga', px0, px1, y, y + 0.15, zt + 2.45, zt + 2.6, M['madera'], bisel=0.01)
    for k in range(int((px1 - px0) / 0.25)):
        x = px0 + 0.05 + k * 0.25
        caja('pergola', x, x + 0.06, py0, py1, zt + 2.6, zt + 2.7, M['madera'], bisel=0)
    caja('mesa_comun', 2.2, 5.8, 17.2, 18.3, zt + 0.7, zt + 0.76, M['madera'], bisel=0.01)
    for y in (16.7, 18.8):
        caja('banca', 2.3, 5.7, y - 0.18, y + 0.18, zt + 0.42, zt + 0.47, M['madera'], bisel=0.01)
    caja('parrilla', 11.5, 13.7, D - 1.5, D - 0.3, zt, zt + 0.95, M['ladrillo'], bisel=0.01)
    caja('parrilla_tope', 11.45, 13.75, D - 1.55, D - 0.25, zt + 0.95, zt + 1.0, M['concreto'], bisel=0)
    caja('chimenea', 12.3, 12.9, D - 1.1, D - 0.4, zt + 1.0, zt + 2.6, M['ladrillo'], bisel=0.01)
    sombrilla(10.0, 17.5, zt + 0.06, M)
    if helecho:
        for k in range(14):
            x = 0.6 + k * 0.95
            caja('maceta', x - 0.2, x + 0.2, D - 0.75, D - 0.35, zt, zt + 0.45, M['acento'], bisel=0.02)
            instancia(helecho, x, D - 0.55, zt + 0.42, alto=rnd.uniform(0.45, 0.7), giro=rnd.uniform(0, 6.28))
    if NOCHE:
        # guirnalda de focos sobre la terraza común
        for k in range(10):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.05, location=(px0 + 0.3 + k * 0.65, (py0 + py1) / 2, zt + 2.35))
            bpy.context.active_object.data.materials.append(M['led'])
        luz = bpy.data.lights.new('terraza', 'AREA')
        luz.size = 4.0
        luz.energy = 300
        luz.color = (1.0, 0.72, 0.42)
        ob = bpy.data.objects.new('terraza', luz)
        ob.location = ((px0 + px1) / 2, (py0 + py1) / 2, zt + 2.3)
        bpy.context.collection.objects.link(ob)


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
    if NOCHE:
        # tira LED bajo la viga del cerco y cochera encendida detrás del portón:
        # la luz se cuela entre los listones
        caja('led_cerco', -0.6, W + 0.6, y - 0.31, y - 0.29, h - 0.47, h - 0.45, M['led'], bisel=0)
        for xx, ancho_ in ((2.6, 5.0), (9.6, 8.0)):
            luz = bpy.data.lights.new('led_cerco', 'AREA')
            luz.shape = 'RECTANGLE'
            luz.size, luz.size_y = ancho_, 0.05
            luz.energy = 40 * ancho_
            luz.color = (1.0, 0.76, 0.5)
            ob = bpy.data.objects.new('led_cerco', luz)
            ob.location = (xx, y - 0.32, h - 0.48)
            bpy.context.collection.objects.link(ob)
        for xx in (3.3, 9.5):
            luz = bpy.data.lights.new('cochera', 'AREA')
            luz.size = 2.5
            luz.energy = 260
            luz.color = (1.0, 0.8, 0.58)
            ob = bpy.data.objects.new('cochera', luz)
            ob.location = (xx, y + 1.3, 2.4)
            bpy.context.collection.objects.link(ob)
    # nombre y numeración
    texto('LOS FAIQUES', W - 0.4, y - 0.31, h - 0.38, 0.36, M['marco'])
    texto('F-14', 5.25, y - 0.31, h - 0.95, 0.24, M['marco'])


def entorno(P, M):
    W, r = P['frente'], P['retiro']
    # Avenida con berma central, como las de Santa Victoria:
    # vereda | pista | berma | pista | vereda, y la manzana de enfrente.
    caja('vereda', -460, 470, -r - 3.2, -r, 0, 0.15, M['concreto'], bisel=0)
    caja('jardin_retiro', -0.6, W + 0.6, -r, 0, 0, 0.05, M['concreto'], bisel=0)
    caja('pista', -460, 470, -r - 11.5, -r - 3.2, -0.05, 0.0, M['asfalto'], bisel=0)
    caja('berma', -460, 470, -r - 15, -r - 11.5, 0, 0.18, M['grass'], bisel=0)
    caja('pista2', -460, 470, -r - 23.3, -r - 15, -0.05, 0.0, M['asfalto'], bisel=0)
    caja('vereda2', -460, 470, -r - 26.5, -r - 23.3, 0, 0.15, M['concreto'], bisel=0)
    caja('pista_posterior', -460, 470, 40, 48, -0.05, 0.0, M['asfalto'], bisel=0)
    caja('suelo', -900, 900, -900, 900, -0.06, -0.05, M['concreto'], bisel=0)
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

    if NOCHE:
        alumbrado(P, M)
    poblar(P, random.Random(23))

    # Sardineles: el borde de concreto que separa pista, berma y vereda.
    caja('sardinel', -460, 470, -r - 11.65, -r - 11.5, -0.05, 0.22, M['concreto'], bisel=0.01)
    caja('sardinel', -460, 470, -r - 3.35, -r - 3.2, -0.05, 0.2, M['concreto'], bisel=0.01)
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
    # Solo la fachada va tarrajeada y pintada; los costados y el fondo que
    # quedan a la vista son de ladrillo o de cemento, como en cualquier calle
    # de Chiclayo. Una caja de un solo color se leía como maqueta.
    lateral = mat if mat is M['ladrillo'] else (M['ladrillo'] if rnd.random() < 0.55 else M['cemento'])
    caja('casa', x0, x1, y0, y1, 0, h, lateral)
    e = 0.15
    if mira < 0:
        caja('fachada', x0, x1, y0 - 0.005, y0 + 0.02, 0, h + 0.9, mat, bisel=0)
    else:
        caja('fachada', x0, x1, y1 - 0.02, y1 + 0.005, 0, h + 0.9, mat, bisel=0)
    caja('parapeto', x0, x1, y0, y0 + e, h, h + 0.9, mat if mira > 0 else lateral, bisel=0)
    caja('parapeto', x0, x1, y1 - e, y1, h, h + 0.9, mat if mira < 0 else lateral, bisel=0)
    caja('parapeto', x0, x0 + e, y0, y1, h, h + 0.9, lateral, bisel=0)
    caja('parapeto', x1 - e, x1, y0, y1, h, h + 0.9, lateral, bisel=0)
    caja('azotea_casa', x0 + e, x1 - e, y0 + e, y1 - e, h, h + 0.02, M['concreto'], bisel=0)
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
                rejas(x0 + 2.6, min(x1 - 0.8, x0 + 5.0), z0 + 0.9, z0 + 2.2, yf, sv, M)
        else:
            n = 1 if ancho < 7.5 else 2
            paso = ancho / n
            for k in range(n):
                cx = x0 + (k + 0.5) * paso
                mitad = min(1.2, paso / 2 - 0.6) * rnd.uniform(0.75, 1.0)
                ventana(cx - mitad, cx + mitad, z0 + 0.9, z0 + 2.2, yf, M, hojas=2, s=sv)
    tx = rnd.uniform(x0 + 0.9, x1 - 0.9)
    ty = rnd.uniform(y0 + 1.5, y1 - 1.5)
    if rnd.random() < 0.8 and despejado(tx, ty):
        caja('base_tanque', tx - 0.7, tx + 0.7, ty - 0.7, ty + 0.7, h, h + 0.5, M['blanco'], bisel=0)
        if LOTE is not None:
            cilindro_lote(tx, ty, h + 0.5, h + 1.65, 0.55, M['tanque'])
        else:
            bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.55, depth=1.15, location=(tx, ty, h + 0.5 + 0.575))
            bpy.context.active_object.data.materials.append(M['tanque'])
    return h


def rejas(x0, x1, z0, z1, yf, s, M):
    """Reja de fierro delante de una ventana de primer piso."""
    y = yf - 0.06 * s
    caja('reja', x0 - 0.05, x1 + 0.05, y - 0.012, y + 0.012, z0 - 0.05, z0 - 0.02, M['marco'], bisel=0)
    caja('reja', x0 - 0.05, x1 + 0.05, y - 0.012, y + 0.012, z1 + 0.02, z1 + 0.05, M['marco'], bisel=0)
    n = max(3, int((x1 - x0) / 0.13))
    for k in range(n + 1):
        x = x0 + (x1 - x0) * k / n
        caja('reja', x - 0.008, x + 0.008, y - 0.008, y + 0.008, z0 - 0.05, z1 + 0.05, M['marco'], bisel=0)


def fila_casas(x_desde, x_hasta, y_fachada, mira, M, rnd, pisos_max=3, fondo=(16, 21), sueltos=0):
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
        global GRUPO
        GRUPO = f'vecino_{xa:.1f}' if len(lotes) < sueltos else 'barrio'
        h = casa(xa + 0.05, xb - 0.05, yf, rnd.uniform(*fondo), pisos, mat, M, rnd, mira)
        GRUPO = 'barrio'
        lotes.append((xa, xb, h))
        x += w * direccion
    return lotes


def barrio(P, M):
    W, r, D = P['frente'], P['retiro'], P['fondo']
    rnd = random.Random(14)
    z_top = P['h_piso1'] + P['pisos'] * P['h_piso'] + 0.25
    # nuestra vereda: los vecinos inmediatos fijan las medianeras
    global LOTE
    LOTE = {}
    izq = fila_casas(-0.7, -440, -r + 0.2, -1, M, rnd, sueltos=2)
    der = fila_casas(W + 0.7, 450, -r + 0.2, -1, M, rnd, sueltos=2)
    # Medianeras tarrajeadas con cada losa marcada en el color de acento, como en
    # Varú I: en el giro 360 los costados se ven enteros y un muro de ladrillo
    # de 17 m se leía a obra gris.
    lote, LOTE = LOTE, None
    caja('medianera_izq', -0.03, 0.0, 0.0, D, izq[0][2], z_top, M['blanco'], bisel=0)
    caja('medianera_der', W, W + 0.03, 0.0, D, der[0][2], z_top, M['blanco'], bisel=0)
    for i in range(P['pisos'] + 1):
        zl = P['h_piso1'] + i * P['h_piso']
        caja('losa_lateral', -0.08, 0.0, 0.0, D, zl - 0.09, zl + 0.09, M['acento'], bisel=0)
        caja('losa_lateral', W, W + 0.08, 0.0, D, zl - 0.09, zl + 0.09, M['acento'], bisel=0)
    # el marco de acento dobla la esquina: paños de 1,8 m al frente y al fondo
    for y0, y1 in ((0.0, 1.8), (D - 1.8, D)):
        caja('esquina_acento', -0.1, 0.0, y0, y1, P['h_piso1'], z_top, M['acento'], bisel=0)
        caja('esquina_acento', W, W + 0.1, y0, y1, P['h_piso1'], z_top, M['acento'], bisel=0)
    LOTE = lote
    # manzana de enfrente, mirando hacia nosotros
    fila_casas(-440, 450, -r - 26.5, 1, M, rnd, pisos_max=4)
    # manzana posterior: sus espaldas se ven por detrás del edificio
    fila_casas(-440, 450, 40, 1, M, rnd, pisos_max=3, fondo=(17, 20))
    # más allá, manzanas hasta el horizonte en los cuatro sentidos: desde el
    # dron y desde la azotea de enfrente el barrio no puede terminarse
    for y in (48, 88, 128, 168, 208):
        fila_casas(-440, 450, y, -1, M, rnd, pisos_max=3, fondo=(17, 20))
        fila_casas(-440, 450, y + 40 - 8, 1, M, rnd, pisos_max=3, fondo=(12, 14))
        caja('pista_fondo', -440, 450, y + 32, y + 40, -0.05, 0.0, M['asfalto'], bisel=0)
    for y in (-58, -98, -138, -178, -218):
        caja('pista_sur', -440, 450, y, y + 8, -0.05, 0.0, M['asfalto'], bisel=0)
        fila_casas(-440, 450, y, 1, M, rnd, pisos_max=3, fondo=(17, 20))
        fila_casas(-440, 450, y - 32, -1, M, rnd, pisos_max=3, fondo=(12, 14))
    ciudad_lejana(M, rnd)
    volcar_lote()
    LOTE = None
    if FANTASMA:
        # dos lotes por lado: desde el dron, el segundo vecino también tapa los pisos bajos
        fantasmas(izq[:2] + der[:2], P)
    arboleda(P, rnd)


def ciudad_lejana(M, rnd):
    """Anillo de manzanas simples más allá del barrio detallado: desde el dron
    el horizonte es ciudad, no el borde de un plano. Solo volúmenes, techos y
    tanques; a esa distancia el detalle no se ve."""
    tintes = [M['casas'][c] for c, _ in PALETA_CASAS] + [M['ladrillo'], M['cemento']]
    for _ in range(2600):
        a = rnd.uniform(0, 2 * math.pi)
        d = rnd.uniform(470, 950) if rnd.random() < 0.7 else rnd.uniform(260, 470)
        x, y = 7 + d * math.cos(a), 11 + d * math.sin(a)
        if -440 < x < 450 and -250 < y < 250:
            continue
        w, f = rnd.uniform(7, 12), rnd.uniform(12, 20)
        h = 0.3 + rnd.choice((1, 2, 2, 3, 3, 4)) * 2.7
        caja('lejana', x, x + w, y, y + f, 0, h, rnd.choice(tintes), bisel=0)
        if rnd.random() < 0.6:
            cilindro_lote(x + w / 2, y + f / 2, h, h + 1.1, 0.5, M['tanque'], lados=10)


def arboleda(P, rnd):
    """Árboles en todas las veredas y en los fondos de las manzanas. Chiclayo
    es verde desde arriba: sin esto el barrio se leía como maqueta de cajas."""
    ids = [i for i in ('island_tree_01', 'island_tree_03', 'jacaranda_tree', 'tree_small_02') if i in VEGETACION]
    if not ids:
        return
    # el ficus es EL árbol de las calles de Chiclayo: pesa el doble
    extra = [a for a in ('ficus', 'ficus', 'palmera_datil') if cargar_asset(a)]
    pool = [VEGETACION[i] for i in ids] + [ASSETS[a] for a in extra]
    W, D, r = P['frente'], P['fondo'], P['retiro']

    def libre(x, y):
        return not (-5 < x < W + 5 and -r - 4 < y < D + 4) and despejado(x, y)
    veredas = [-r - 1.9, -r - 24.8, 40.6, 47.4]
    for y in (48, 88, 128, 168, 208):
        veredas += [y + 31.4, y + 40.6]
    for y in (-58, -98, -138, -178, -218):
        veredas += [y - 0.6, y + 8.6]
    for y in veredas:
        x = -438 + rnd.uniform(0, 6)
        while x < 448:
            if libre(x, y) and rnd.random() < 0.85:
                instancia(rnd.choice(pool), x, y, 0.15, rnd.uniform(5.0, 9.0), rnd.uniform(0, 6.28))
            x += rnd.uniform(7, 11)
    # fondos de manzana: copas que asoman entre las azoteas
    for y in (19.5, 67.5, 107.5, 147.5, 187.5, 227.5, -50.5, -77.5, -117.5, -157.5, -197.5):
        for _ in range(120):
            x = rnd.uniform(-438, 448)
            if libre(x, y):
                instancia(rnd.choice(pool), x, y + rnd.uniform(-1.5, 1.5), 0.0, rnd.uniform(6, 11), rnd.uniform(0, 6.28))


# ── Modelos de Sketchfab (CC-BY, créditos en sketchfab/creditos.json) ──────
SKETCHFAB = RECURSOS / 'sketchfab'
ASSETS = {}


def importar(nombre):
    gltf = SKETCHFAB / nombre / 'scene.gltf'
    if not gltf.exists():
        return None
    antes = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(gltf))
    bpy.context.view_layer.update()
    return [o for o in bpy.data.objects if o not in antes]


def a_coleccion(nombre, objs):
    """Saca los objetos de la escena a una colección instanciable con su base
    centrada: devuelve (colección, alto, z mínima) como VEGETACION."""
    pts = [o.matrix_world @ Vector(c) for o in objs if o.type == 'MESH' for c in o.bound_box]
    col = bpy.data.collections.new(nombre)
    for o in objs:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        col.objects.link(o)
    cx = (max(q.x for q in pts) + min(q.x for q in pts)) / 2
    cy = (max(q.y for q in pts) + min(q.y for q in pts)) / 2
    col.instance_offset = (cx, cy, 0)
    zs = [q.z for q in pts]
    return (col, max(zs) - min(zs), min(zs))


def cargar_asset(nombre):
    if nombre not in ASSETS:
        objs = importar(nombre)
        ASSETS[nombre] = a_coleccion(nombre, objs) if objs else None
    return ASSETS[nombre]


def rumbo(objs):
    """Ángulo del eje largo (en planta) de un grupo de mallas."""
    import numpy as np
    pts = []
    for o in objs:
        if o.type == 'MESH':
            m = o.matrix_world
            vs = o.data.vertices
            paso = max(1, len(vs) // 400)
            pts += [(m @ vs[i].co)[:2] for i in range(0, len(vs), paso)]
    a = np.array(pts) - np.mean(pts, axis=0)
    w, v = np.linalg.eigh(a.T @ a)
    x, y = v[:, -1]
    return math.atan2(y, x)


def cargar_autos():
    """Autos para estacionar: el Yaris en cinco colores y los del pack separados
    uno por uno. Cada entrada: (colección, alto, z mínima, rumbo del modelo)."""
    if 'autos' in ASSETS:
        return ASSETS['autos']
    autos = []
    objs = importar('auto_yaris')
    if objs:
        cuerpo = next((m for m in bpy.data.materials if m.name.startswith('Whbody')), None)
        r0 = rumbo(objs)
        for k, color in enumerate(((1, 1, 1), (0.42, 0.43, 0.45), (0.05, 0.05, 0.055), (0.55, 0.04, 0.04), (0.08, 0.16, 0.4))):
            if k == 0:
                grupo = objs
            else:
                grupo = []
                mapa = {}
                for o in objs:
                    c = o.copy()
                    bpy.context.collection.objects.link(c)
                    mapa[o] = c
                    grupo.append(c)
                for o, c in mapa.items():
                    if o.parent in mapa:
                        c.parent = mapa[o.parent]
                if cuerpo:
                    tinte = cuerpo.copy()
                    b = tinte.node_tree.nodes.get('Principled BSDF')
                    enlace = b.inputs['Base Color'].links[0] if b.inputs['Base Color'].links else None
                    if enlace:
                        mx = tinte.node_tree.nodes.new('ShaderNodeMix')
                        mx.data_type = 'RGBA'
                        mx.blend_type = 'MULTIPLY'
                        enchufe(mx.inputs, 'Factor', 'VALUE').default_value = 1.0
                        enchufe(mx.inputs, 'B', 'RGBA').default_value = (*color, 1)
                        tinte.node_tree.links.new(enlace.from_socket, enchufe(mx.inputs, 'A', 'RGBA'))
                        tinte.node_tree.links.new(enchufe(mx.outputs, 'Result', 'RGBA'), b.inputs['Base Color'])
                    for c in grupo:
                        if c.type == 'MESH':
                            for slot in c.material_slots:
                                if slot.material == cuerpo:
                                    slot.link = 'OBJECT'
                                    slot.material = tinte
            bpy.context.view_layer.update()
            col, alto, zmin = a_coleccion(f'yaris_{k}', grupo)
            autos.append((col, alto, zmin, r0, 1.46))
    objs = importar('auto_pack')
    if objs:
        mallas = [o for o in objs if o.type == 'MESH']
        centros = {o: (o.matrix_world @ Vector([sum(c[i] for c in o.bound_box) / 8 for i in range(3)])) for o in mallas}
        grupos = []
        for o in mallas:
            c = centros[o]
            g = next((g for g in grupos if any((c - centros[x]).length < 1.9 for x in g)), None)
            (g.append(o) if g else grupos.append([o]))
        for k, g in enumerate(grupos):
            if len(g) < 2:
                continue
            r0 = rumbo(g)
            col, alto, zmin = a_coleccion(f'auto_{k}', g)
            autos.append((col, alto, zmin, r0, 1.5))
        sobrantes = [o for o in objs if o.users_collection and o.users_collection[0] == bpy.context.collection]
        for o in sobrantes:
            if o.type == 'MESH':
                bpy.data.objects.remove(o, do_unlink=True)
    ASSETS['autos'] = autos
    return autos


def estacionar(auto, x, y, sentido):
    """Auto con su eje largo a lo largo de x (sentido +1 o -1)."""
    col, alto_m, zmin, r0, alto = auto
    e = instancia((col, alto_m, zmin), x, y, 0.0, alto, giro=(0 if sentido > 0 else math.pi) - r0)
    return e


def poblar(P, rnd):
    """Autos estacionados, mototaxis, gente en la vereda y palmeras en la
    berma: lo que hace que una calle se lea como calle de Chiclayo."""
    r, W = P['retiro'], P['frente']
    autos = cargar_autos()
    if autos:
        carriles = [(-r - 4.3, 1), (-r - 22.2, -1), (41.3, 1), (46.7, -1), (-51.3, 1), (-56.7, -1), (81.3, 1), (86.7, -1)]
        for y, sentido in carriles:
            x = -150 + rnd.uniform(0, 8)
            while x < 160:
                cerca = abs(y) < 30
                libre_portada = not (4.0 < x < W + 1.5 and y > -r - 6)
                if libre_portada and rnd.random() < (0.55 if cerca else 0.35):
                    estacionar(rnd.choice(autos), x, y, sentido)
                x += rnd.uniform(5.5, 9.5)
    moto = cargar_asset('mototaxi')
    if moto:
        for x, y, g in ((-9.5, -r - 4.3, 0.0), (26.0, -r - 8.5, math.pi), (-24.0, -r - 18.5, 0.3)):
            instancia(moto, x, y, 0.0, 1.75, giro=g + math.pi / 2)
    gente = [a for a in ('persona_nathan', 'persona_sophia', 'persona_mei') if cargar_asset(a)]
    for (x, y, g), quien in zip(((3.4, -r - 1.6, math.radians(80)), (-4.2, -r - 2.2, math.radians(-95)),
                                 (18.5, -r - 1.4, math.radians(-90)), (9.0, -r - 24.8, math.radians(90)),
                                 (-14.0, -r - 1.8, math.radians(70))),
                                ['persona_nathan', 'persona_sophia', 'persona_mei', 'persona_nathan', 'persona_sophia']):
        if quien in gente:
            instancia(ASSETS[quien], x, y, 0.15, rnd.uniform(1.62, 1.8), giro=g)
    # palmeras en la berma de la avenida, alternando alturas
    palmas = [a for a in ('palmera4', 'palmera') if cargar_asset(a)]
    if palmas:
        for k, x in enumerate(range(-66, 90, 13)):
            if 2 < x < W - 2:
                continue
            a = palmas[k % len(palmas)]
            instancia(ASSETS[a], x + rnd.uniform(-1, 1), -r - 13.3, 0.18, rnd.uniform(9, 12) if a == 'palmera4' else rnd.uniform(6, 8), rnd.uniform(0, 6.28))


def fantasmas(lotes, P):
    """Vuelve maqueta translúcida todo lo que pertenece a los lotes vecinos."""
    m = bpy.data.materials.new('fantasma')
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (0.93, 0.94, 0.96, 1)
    b.inputs['Roughness'].default_value = 0.5
    b.inputs['Alpha'].default_value = 0.16
    for xa, xb, _ in lotes:
        for o in list(bpy.context.scene.objects):
            if o.type != 'MESH' or not o.name.startswith('vecino_'):
                continue
            bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
            cx = sum(q.x for q in bb) / 8
            cy = sum(q.y for q in bb) / 8
            if xa - 0.05 <= cx <= xb + 0.05 and -P['retiro'] - 0.6 <= cy <= P['fondo'] + 2:
                o.data.materials.clear()
                o.data.materials.append(m)
                o.visible_shadow = False


def alumbrado(P, M):
    """Postes con luz de sodio naranja, como en las avenidas de Chiclayo."""
    r = P['retiro']
    postes = [(x, y, b) for x in range(-90, 110, 26) for y, b in ((-r - 3.0, -1.6), (-r - 13.2, 1.6))]
    # calles de atrás y de adelante: la ciudad iluminada hasta el horizonte
    postes += [(x, y, b) for x in range(-150, 170, 30) for y, b in ((40.6, 1.4), (-58.6, -1.4), (79.4, 1.4))]
    for x, y, brazo in postes:
        if True:
            caja('poste', x - 0.08, x + 0.08, y - 0.08, y + 0.08, 0, 8.2, M['acero'], bisel=0)
            caja('brazo', x - 0.05, x + 0.05, min(y, y + brazo), max(y, y + brazo), 8.0, 8.1, M['acero'], bisel=0)
            caja('farol', x - 0.25, x + 0.25, y + brazo - 0.18, y + brazo + 0.18, 7.8, 8.0, M['farol'], bisel=0)
            luz = bpy.data.lights.new('sodio', 'POINT')
            luz.energy = 1700
            luz.shadow_soft_size = 0.3
            luz.color = (1.0, 0.62, 0.28)
            ob = bpy.data.objects.new('sodio', luz)
            ob.location = (x, y + brazo, 7.6)
            bpy.context.collection.objects.link(ob)


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
    M = {
        'blanco': material_tex('blanco', 'plastered_wall_04', tinte=(0.8, 0.8, 0.78, 1), escala=2.5, normal=0.3),
        'acento': material_tex('acento', 'plastered_wall_04', tinte=hex_rgb(acento), escala=2.5, normal=0.3),
        'vidrio': material('vidrio', (0.85, 0.92, 0.95, 1), 0.02, transmision=1.0),
        'interior': material('interior', (0.035, 0.03, 0.028, 1), 0.8),
        'interior_luz': emisivo('interior_luz', (1.0, 0.62, 0.32, 1), 1.3),
        'cortina_luz': emisivo('cortina_luz', (1.0, 0.7, 0.42, 1), 1.8),
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
        'cemento': material_tex('cemento', 'concrete_wall_008', tinte=(0.42, 0.4, 0.37, 1), escala=2.5, normal=0.5),
        'concreto': material_tex('concreto', 'concrete_pavement', escala=2.0, normal=0.6),
        'asfalto': material_tex('asfalto', 'asphalt_02', escala=3.0, normal=0.6),
        'grass': material('pasto', (0.03, 0.05, 0.015, 1), 0.95, ruido=0.7),
        'vecino1': material('vecino1', (0.62, 0.61, 0.58, 1), 0.9, ruido=0.3),
        'tanque': material('tanque', (0.012, 0.012, 0.012, 1), 0.45),
        'farol': emisivo('farol', (1.0, 0.6, 0.25, 1), 12.0),
        'casas': {c: material_tex(f'casa_{c}', 'plastered_wall_04', tinte=hex_rgb(c), escala=2.5, normal=0.35)
                  for c, _ in PALETA_CASAS},
        'vecino2': material('vecino2', (0.55, 0.53, 0.5, 1), 0.9, ruido=0.3),
        'cuarto': material('cuarto', (0.8, 0.7, 0.58, 1), 0.85),
        'cuarto_piso': material('cuarto_piso', (0.42, 0.33, 0.24, 1), 0.35),
        'mueble_interior': material('mueble_interior', (0.18, 0.16, 0.14, 1), 0.7),
        'cuadro_interior': material('cuadro_interior', (0.45, 0.3, 0.2, 1), 0.8),
        'plafon_on': emisivo('plafon_on', (1.0, 0.78, 0.5, 1), 18.0),
        'led': emisivo('led', (1.0, 0.75, 0.45, 1), 30.0),
    }
    if NOCHE:
        # pista y vereda recién regadas: el reflejo de las luces es la mitad
        # del efecto nocturno
        rugosidad(M['asfalto'], 0.02, 0.28)
        rugosidad(M['concreto'], 0.12, 0.5)
    return M


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
        sky.sun_elevation = math.radians(-3 if NOCHE else 34)
        sky.sun_rotation = math.radians(SOL_GIRO + 180)
    if hasattr(sky, 'air_density'):
        sky.air_density = 1.2
    bg = n.get('Background')
    bg.inputs['Strength'].default_value = 0.22 if NOCHE else 0.09
    # Sol físico: da las sombras duras de tarde que el cielo solo no produce.
    sol = bpy.data.lights.new('sol', 'SUN')
    sol.energy = 0.0 if NOCHE else 5.5
    sol.angle = math.radians(0.6)
    sol.color = (1.0, 0.93, 0.84)
    ob = bpy.data.objects.new('sol', sol)
    ob.rotation_euler = (math.radians(90 - 34), 0, math.radians(SOL_GIRO))
    bpy.context.collection.objects.link(ob)
    w.node_tree.links.new(sky.outputs['Color'], bg.inputs['Color'])
    hdri = RECURSOS / 'kloofendal_43d_clear_puresky' / 'kloofendal_43d_clear_puresky_4k.hdr'
    if NOCHE and (RECURSOS / 'qwantani_dusk_2_puresky' / 'qwantani_dusk_2_puresky_4k.hdr').exists():
        hdri = RECURSOS / 'qwantani_dusk_2_puresky' / 'qwantani_dusk_2_puresky_4k.hdr'
    if hdri.exists():
        # La cámara ve un cielo fotográfico; la luz sigue saliendo del cielo físico
        # y del sol, así no hay dos soles proyectando sombras distintas.
        env = n.new('ShaderNodeTexEnvironment')
        env.image = bpy.data.images.load(str(hdri))
        bg_foto = n.new('ShaderNodeBackground')
        bg_foto.inputs['Strength'].default_value = 0.42 if NOCHE else 1.5
        if NOCHE:
            # la hora azul de las fotos de Chiclayo es más saturada que el HDRI:
            # se tiñe conservando sus nubes
            tinte = n.new('ShaderNodeMix')
            tinte.data_type = 'RGBA'
            tinte.blend_type = 'MULTIPLY'
            enchufe(tinte.inputs, 'Factor', 'VALUE').default_value = 1.0
            enchufe(tinte.inputs, 'B', 'RGBA').default_value = (0.22, 0.36, 1.0, 1.0)
            w.node_tree.links.new(env.outputs['Color'], enchufe(tinte.inputs, 'A', 'RGBA'))
            w.node_tree.links.new(enchufe(tinte.outputs, 'Result', 'RGBA'), bg_foto.inputs['Color'])
        else:
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
    cam.lens = c.get('focal', 50)
    cam.sensor_fit = 'AUTO'
    ob = bpy.data.objects.new('cam', cam)
    bpy.context.collection.objects.link(ob)
    if c.get('orto'):
        cam.type = 'ORTHO'
        cam.ortho_scale = c['escala']
        ob.location = (*c['centro_xy'], 90.0)
        ob.rotation_euler = (0, 0, 0)
        bpy.context.scene.camera = ob
        return
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
    looks = ('AgX - High Contrast', 'High Contrast') if NOCHE else ()
    for look in looks + ('AgX - Medium High Contrast', 'Medium High Contrast', 'None'):
        try:
            s.view_settings.look = look
            break
        except TypeError:
            continue
    s.view_settings.exposure = 0.0 if NOCHE else -0.4
    s.render.filepath = a.out
    s.render.image_settings.file_format = 'PNG'


def rotulos_camara(s, cam):
    """Rectángulos (0-1, origen arriba a la izquierda) donde cae cada letrero
    del edificio en la imagen. El pase de realismo con IA deforma las letras;
    produccion/realismo.py repone el render original dentro de estos cuadros."""
    from bpy_extras.object_utils import world_to_camera_view
    cajas = []
    for o in s.objects:
        if not o.name.startswith('texto'):
            continue
        pts = [world_to_camera_view(s, cam, o.matrix_world @ Vector(c)) for c in o.bound_box]
        if any(p.z <= 0 for p in pts):
            continue
        xs = [p.x for p in pts]
        ys = [1 - p.y for p in pts]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        if x1 < 0 or x0 > 1 or y1 < 0 or y0 > 1:
            continue
        cajas.append([round(x0, 4), round(y0, 4), round(x1, 4), round(y1, 4)])
    return cajas


# Estados del timelapse: misma serie fotográfica (Qwantani) para atardecer,
# crepúsculo y noche; el día conserva el cielo físico con sol propio.
# rot: giro del HDRI (grados) para dejar su sol donde conviene a la toma.
ESTADOS = {
    'dia':        dict(hdri='kloofendal_48d_partly_cloudy_puresky', rot=180, luz='fisica', fuerza_cam=1.2, luces=0.0, exposicion=-0.4, mojado=0.0),
    'atardecer':  dict(hdri='qwantani_sunset_puresky', rot=40, luz='hdri', fuerza=0.35, luces=0.4, exposicion=0.0, mojado=0.2),
    'crepusculo': dict(hdri='qwantani_dusk_1_puresky', rot=40, luz='hdri', fuerza=0.11, luces=0.85, exposicion=0.2, mojado=0.7),
    'noche':      dict(hdri='qwantani_night_puresky', rot=180, luz='hdri', fuerza=0.05, luces=1.0, exposicion=0.3, mojado=1.0, tinte=(0.45, 0.6, 1.0)),
}


def cielo_estado(e):
    """Mundo y sol de un estado del timelapse."""
    w = bpy.data.worlds.new('cielo_' + e['hdri'])
    bpy.context.scene.world = w
    w.use_nodes = True
    n, l = w.node_tree.nodes, w.node_tree.links
    salida = n.get('World Output')
    bg = n.get('Background')
    coord = n.new('ShaderNodeTexCoord')
    mapeo = n.new('ShaderNodeMapping')
    mapeo.inputs['Rotation'].default_value = (0, 0, math.radians(e['rot']))
    l.new(coord.outputs['Generated'], mapeo.inputs['Vector'])
    env = n.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(str(RECURSOS / e['hdri'] / f"{e['hdri']}_4k.hdr"), check_existing=True)
    l.new(mapeo.outputs['Vector'], env.inputs['Vector'])
    color = env.outputs['Color']
    if e.get('tinte'):
        t = n.new('ShaderNodeMix')
        t.data_type = 'RGBA'
        t.blend_type = 'MULTIPLY'
        enchufe(t.inputs, 'Factor', 'VALUE').default_value = 1.0
        enchufe(t.inputs, 'B', 'RGBA').default_value = (*e['tinte'], 1.0)
        l.new(color, enchufe(t.inputs, 'A', 'RGBA'))
        color = enchufe(t.outputs, 'Result', 'RGBA')
    sol = bpy.data.objects.get('sol')
    if e['luz'] == 'fisica':
        # luz del cielo físico y del sol; la cámara ve el HDRI
        sky = n.new('ShaderNodeTexSky')
        for tipo in ('MULTIPLE_SCATTERING', 'SINGLE_SCATTERING', 'NISHITA'):
            try:
                sky.sky_type = tipo
                break
            except TypeError:
                continue
        if hasattr(sky, 'sun_elevation'):
            sky.sun_elevation = math.radians(30)
            sky.sun_rotation = math.radians(SOL_GIRO + 180)
        bg.inputs['Strength'].default_value = 0.09
        l.new(sky.outputs['Color'], bg.inputs['Color'])
        foto = n.new('ShaderNodeBackground')
        foto.inputs['Strength'].default_value = e['fuerza_cam']
        l.new(color, foto.inputs['Color'])
        rayo = n.new('ShaderNodeLightPath')
        mezcla = n.new('ShaderNodeMixShader')
        l.new(rayo.outputs['Is Camera Ray'], mezcla.inputs['Fac'])
        l.new(bg.outputs['Background'], mezcla.inputs[1])
        l.new(foto.outputs['Background'], mezcla.inputs[2])
        l.new(mezcla.outputs['Shader'], salida.inputs['Surface'])
        if sol:
            sol.data.energy = 5.0
            sol.rotation_euler = (math.radians(90 - 30), 0, math.radians(SOL_GIRO))
    else:
        bg.inputs['Strength'].default_value = e['fuerza']
        l.new(color, bg.inputs['Color'])
        if sol:
            sol.data.energy = 0.0


def cielo_solo(s, ruta, ancho=1.6):
    """Solo el cielo, desde la misma cámara pero `ancho` veces más abierto en
    horizontal: la capa que se desplaza detrás del edificio en la portada."""
    ocultos = [o for o in s.objects if o.type != 'CAMERA' and not o.hide_render]
    for o in ocultos:
        o.hide_render = True
    cam = s.camera.data
    lente, rx, fondo, muestras, sy = cam.lens, s.render.resolution_x, s.render.film_transparent, s.cycles.samples, cam.shift_y
    cam.lens = lente / ancho
    # el desplazamiento de lente es fracción del ancho: se corrige para que el
    # horizonte quede a la misma altura que en el primer plano
    cam.shift_y = sy / ancho
    s.render.resolution_x = int(rx * ancho)
    s.render.film_transparent = False
    s.cycles.samples = 16
    s.render.filepath = str(ruta)
    bpy.ops.render.render(write_still=True)
    cam.lens, s.render.resolution_x, s.render.film_transparent, s.cycles.samples, cam.shift_y = lente, rx, fondo, muestras, sy
    for o in ocultos:
        o.hide_render = False


def timelapse(a):
    """Una imagen por estado (día → noche) con la misma escena y la misma
    cámara: la portada las funde en bucle como un timelapse. Las luces y los
    emisivos se escalan por estado; la pista se moja al anochecer."""
    import json
    s = bpy.context.scene
    luces = [(o, o.data.energy) for o in s.objects if o.type == 'LIGHT' and o.name != 'sol']
    emisivos = []
    for m in bpy.data.materials:
        if not m.use_nodes:
            continue
        b = m.node_tree.nodes.get('Principled BSDF')
        if b and b.inputs['Emission Strength'].default_value > 0 and m.name != 'fantasma':
            emisivos.append((b, b.inputs['Emission Strength'].default_value))
    mojados = []
    for nombre in ('asfalto', 'concreto'):
        m = bpy.data.materials.get(nombre)
        r = m and next((x for x in m.node_tree.nodes if x.type == 'MAP_RANGE'), None)
        if r:
            mojados.append((r, r.inputs['To Min'].default_value, r.inputs['To Max'].default_value))
    salida = Path(a.timelapse_dir)
    salida.mkdir(parents=True, exist_ok=True)
    (salida / 'rotulos.json').write_text(json.dumps(rotulos_camara(s, s.camera)), encoding='utf8')
    for nombre in [x for x in a.timelapse.split(',') if x]:
        e = ESTADOS[nombre]
        cielo_estado(e)
        for o, base in luces:
            o.data.energy = base * e['luces']
        for b, base in emisivos:
            b.inputs['Emission Strength'].default_value = base * e['luces']
        for r, lo, hi in mojados:
            # seco: rugosidad de siempre; mojado: la del modo noche
            r.inputs['To Min'].default_value = 0.6 + (lo - 0.6) * e['mojado']
            r.inputs['To Max'].default_value = 1.0 + (hi - 1.0) * e['mojado']
        s.view_settings.exposure = e['exposicion']
        # primer plano con el cielo transparente: en la web el cielo va en su
        # propia capa, más ancha, que se desplaza (nubes que pasan, estrellas
        # que aparecen al anochecer)
        s.render.film_transparent = a.capas
        s.render.image_settings.color_mode = 'RGBA' if a.capas else 'RGB'
        s.render.filepath = str(salida / f'{nombre}.png')
        bpy.ops.render.render(write_still=True)
        if a.capas:
            cielo_solo(s, salida / f'{nombre}_cielo.png')
        print(f'ESTADO OK {nombre}', flush=True)
    print(f'TIMELAPSE OK -> {salida}')


def orbita(a):
    """Giro 360: la cámara da la vuelta al edificio a altura de dron y deja un
    cuadro cada 360/N grados, más las franjas de cada piso proyectadas con la
    misma cámara (franjas.json). La escena se arma una sola vez; los cuadros que
    ya existen se saltan, así un lote interrumpido se retoma."""
    import json
    sys.path.insert(0, str(Path(__file__).parent))
    import mascaras
    s = bpy.context.scene
    datos = bpy.data.cameras.new('orbita')
    datos.lens = a.orbita_focal
    datos.sensor_fit = 'AUTO'
    cam = bpy.data.objects.new('orbita', datos)
    bpy.context.collection.objects.link(cam)
    s.camera = cam
    s.render.use_persistent_data = True
    s.cycles.adaptive_threshold = 0.03
    cx, cy = PARAM['frente'] / 2, PARAM['fondo'] / 2
    mira = Vector((cx, cy, a.orbita_mira))
    salida = Path(a.orbita_dir)
    salida.mkdir(parents=True, exist_ok=True)
    poses = []
    for i in range(a.orbita):
        th = 2 * math.pi * i / a.orbita
        # vuelo de dron: bajo sobre la avenida (adelante, campo abierto) y más
        # alto atrás, donde las azoteas vecinas taparían la toma
        alto = a.orbita_alto + 9.5 * (1 - math.cos(th)) / 2
        pos = Vector((cx + a.orbita_radio * math.sin(th), cy - a.orbita_radio * math.cos(th), alto))
        poses.append((pos, (mira - pos).to_track_quat('-Z', 'Y').to_euler()))
    franjas, rotulos = [], []
    for pos, rot in poses:
        cam.location, cam.rotation_euler = pos, rot
        bpy.context.view_layer.update()
        franjas.append(mascaras.franjas_camara(s, cam))
        rotulos.append(rotulos_camara(s, cam))
    (salida / 'franjas.json').write_text(json.dumps(franjas), encoding='utf8')
    (salida / 'rotulos.json').write_text(json.dumps(rotulos), encoding='utf8')
    if a.solo_franjas:
        print(f'FRANJAS OK -> {salida}')
        return
    for i, (pos, rot) in enumerate(poses):
        f = salida / f'f{i:03d}.png'
        if f.exists():
            continue
        cam.location, cam.rotation_euler = pos, rot
        s.render.filepath = str(f)
        bpy.ops.render.render(write_still=True)
        print(f'CUADRO {i + 1}/{a.orbita}', flush=True)
    print(f'GIRO OK -> {salida}')


def main():
    global NOCHE, FANTASMA
    a = argumentos()
    NOCHE = a.noche or bool(a.timelapse)
    FANTASMA = a.fantasma
    limpiar()
    cargar_vegetacion(['grass_medium_01', 'fern_02', 'island_tree_01', 'island_tree_03', 'jacaranda_tree', 'tree_small_02'])
    M = materiales(a.acento)
    if a.vista != 'planta_contexto':
        edificio(PARAM, M)
    cerco(PARAM, M)
    entorno(PARAM, M)
    cielo()
    if a.orbita:
        render(a)
        orbita(a)
        return
    camara(a.vista)
    render(a)
    if a.timelapse:
        bpy.context.view_layer.update()
        timelapse(a)
        return
    bpy.context.view_layer.update()
    import json
    Path(str(a.out) + '.rotulos.json').write_text(json.dumps(rotulos_camara(bpy.context.scene, bpy.context.scene.camera)), encoding='utf8')
    if a.blend:
        bpy.ops.wm.save_as_mainfile(filepath=a.blend)
    bpy.ops.render.render(write_still=True)
    print(f'RENDER OK -> {a.out} (dispositivo: {bpy.context.scene.cycles.device})')


# Importable desde interior.py sin disparar el render del exterior.
if __name__ == '__main__':
    main()
