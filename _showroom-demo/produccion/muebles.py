"""Muebles y vestido de los interiores (Blender 5.2, Cycles).

Ronda de acabado de oct-2026. La vara son los renders de Domaria: muebles
actuales de líneas suaves, telas y maderas con textura real, luminarias que se
ven encendidas (plafones, tira LED, lámparas), cortinas de lino y objetos
encima de cada superficie. Poly Haven casi no tiene mobiliario moderno, así que
sofá, sillas, cama, cocina y baño se modelan aquí; de Poly Haven salen las
telas, la madera y los accesorios (jarrones, plantas, colgante, canasta).

Todo se arma dentro de los ambientes de LAYOUTS (interior.py): planta
amoblada, panoramas y piso completo siguen saliendo del mismo layout.
"""

import math
import random

import bpy
from mathutils import Vector

import edificio as E

ALTO = 2.6
PIEZAS = {}


# ── Materiales ───────────────────────────────────────────────────────────────

rugosidad = E.rugosidad


def tela_translucida(nombre, color, transparencia=0.35):
    """Visillo de lino: deja pasar la luz y se ve la trama a contraluz."""
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    for x in list(n):
        if x.type == 'BSDF_PRINCIPLED':
            n.remove(x)
    salida = n.get('Material Output')
    dif = n.new('ShaderNodeBsdfDiffuse')
    tra = n.new('ShaderNodeBsdfTranslucent')
    hueco = n.new('ShaderNodeBsdfTransparent')
    color_ = color
    ruta = E.RECURSOS / 'rough_linen' / 'rough_linen_diff_2k.jpg'
    if ruta.exists():
        coord = n.new('ShaderNodeTexCoord')
        tex = n.new('ShaderNodeTexImage')
        tex.image = bpy.data.images.load(str(ruta), check_existing=True)
        tex.projection = 'BOX'
        mapeo = n.new('ShaderNodeMapping')
        mapeo.inputs['Scale'].default_value = (3, 3, 3)
        l.new(coord.outputs['Object'], mapeo.inputs['Vector'])
        l.new(mapeo.outputs['Vector'], tex.inputs['Vector'])
        bn = n.new('ShaderNodeRGBToBW')
        l.new(tex.outputs['Color'], bn.inputs['Color'])
        mix = n.new('ShaderNodeMix')
        mix.data_type = 'RGBA'
        mix.blend_type = 'MULTIPLY'
        E.enchufe(mix.inputs, 'Factor', 'VALUE').default_value = 0.5
        E.enchufe(mix.inputs, 'A', 'RGBA').default_value = color
        l.new(bn.outputs['Val'], E.enchufe(mix.inputs, 'B', 'RGBA'))
        color_ = E.enchufe(mix.outputs, 'Result', 'RGBA')
    for s in (dif, tra):
        if isinstance(color_, tuple):
            s.inputs['Color'].default_value = color_
        else:
            l.new(color_, s.inputs['Color'])
    m1 = n.new('ShaderNodeMixShader')
    m1.inputs['Fac'].default_value = 0.55
    l.new(dif.outputs['BSDF'], m1.inputs[1])
    l.new(tra.outputs['BSDF'], m1.inputs[2])
    m2 = n.new('ShaderNodeMixShader')
    m2.inputs['Fac'].default_value = transparencia
    l.new(m1.outputs['Shader'], m2.inputs[1])
    l.new(hueco.outputs['BSDF'], m2.inputs[2])
    l.new(m2.outputs['Shader'], salida.inputs['Surface'])
    return m


def lienzo(nombre, colores, escala=1.4, semilla=0.0):
    """Cuadro abstracto de bandas suaves en tierra, arena y salvia: la clase de
    lámina que viste cualquier depa de muestra. Sale de nodos, sin imágenes."""
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    bsdf = n.get('Principled BSDF')
    bsdf.inputs['Roughness'].default_value = 0.85
    coord = n.new('ShaderNodeTexCoord')
    mapeo = n.new('ShaderNodeMapping')
    mapeo.inputs['Location'].default_value = (semilla, semilla * 0.7, 0)
    mapeo.inputs['Scale'].default_value = (escala, escala, escala)
    l.new(coord.outputs['Object'], mapeo.inputs['Vector'])
    onda = n.new('ShaderNodeTexWave')
    onda.inputs['Scale'].default_value = 0.9
    onda.inputs['Distortion'].default_value = 6.0
    onda.inputs['Detail'].default_value = 1.5
    l.new(mapeo.outputs['Vector'], onda.inputs['Vector'])
    rampa = n.new('ShaderNodeValToRGB')
    rampa.color_ramp.interpolation = 'CONSTANT'
    els = rampa.color_ramp.elements
    els[0].color = E.hex_rgb(colores[0])
    els[1].position = 0.4
    els[1].color = E.hex_rgb(colores[1])
    for i, c in enumerate(colores[2:]):
        e = els.new(0.6 + 0.18 * i)
        e.color = E.hex_rgb(c)
    l.new(onda.outputs['Fac'], rampa.inputs['Fac'])
    l.new(rampa.outputs['Color'], bsdf.inputs['Base Color'])
    return m


def materiales():
    tex, mat = E.material_tex, E.material
    M = {
        'pared': rugosidad(tex('pared', 'plastered_wall_04', tinte=E.hex_rgb('f1eee8'), escala=3.0, normal=0.05), 0.7, 0.9),
        'techo': mat('techo', E.hex_rgb('f4f2ee'), 0.9),
        # porcelanato claro y pulido: el reflejo de las luces en el piso es la
        # mitad del aspecto de «depa nuevo»
        'porcelanato': rugosidad(tex('porcelanato', 'large_floor_tiles_02', tinte=E.hex_rgb('ece8e1'), escala=1.8, normal=0.15), 0.06, 0.22),
        'ceramico': rugosidad(tex('ceramico', 'grey_tiles', tinte=E.hex_rgb('d9dadb'), escala=1.0, normal=0.3), 0.1, 0.3),
        'enchape': rugosidad(tex('enchape', 'interior_tiles', tinte=E.hex_rgb('eeece8'), escala=1.2, normal=0.3), 0.05, 0.2),
        'laminado': rugosidad(tex('laminado', 'laminate_floor_02', tinte=E.hex_rgb('d8bd96'), escala=2.0, normal=0.25), 0.25, 0.45),
        'roble': rugosidad(tex('roble', 'oak_veneer_01', tinte=E.hex_rgb('c8b292'), escala=1.0, normal=0.2), 0.3, 0.5),
        'roble_oscuro': rugosidad(tex('roble_oscuro', 'oak_veneer_01', tinte=E.hex_rgb('8c7158'), escala=1.0, normal=0.2), 0.3, 0.5),
        'marmol': rugosidad(tex('marmol', 'marble_01', escala=1.2, normal=0.05), 0.05, 0.12),
        'cuarzo': rugosidad(tex('cuarzo', 'marble_01', tinte=E.hex_rgb('f3f1ec'), escala=1.6, normal=0.05), 0.05, 0.15),
        'boucle': rugosidad(tex('boucle', 'wool_boucle', tinte=E.hex_rgb('c9c4bb'), escala=0.35, normal=0.8), 0.85, 1.0),
        'boucle_gris': rugosidad(tex('boucle_gris', 'wool_boucle', tinte=E.hex_rgb('9b9790'), escala=0.35, normal=0.8), 0.85, 1.0),
        'lino_blanco': rugosidad(tex('lino_blanco', 'rough_linen', tinte=E.hex_rgb('f2f0ea'), escala=0.5, normal=0.5), 0.8, 1.0),
        'lino_arena': rugosidad(tex('lino_arena', 'rough_linen', tinte=E.hex_rgb('cdb89a'), escala=0.5, normal=0.5), 0.8, 1.0),
        'lino_salvia': rugosidad(tex('lino_salvia', 'rough_linen', tinte=E.hex_rgb('8e9a84'), escala=0.5, normal=0.5), 0.8, 1.0),
        'lino_terracota': rugosidad(tex('lino_terracota', 'rough_linen', tinte=E.hex_rgb('b4704c'), escala=0.5, normal=0.5), 0.8, 1.0),
        'lino_gris': rugosidad(tex('lino_gris', 'rough_linen', tinte=E.hex_rgb('7d7a75'), escala=0.5, normal=0.5), 0.8, 1.0),
        'cuerda': rugosidad(tex('cuerda', 'rough_linen', tinte=E.hex_rgb('c8b28c'), escala=0.25, normal=1.0), 0.9, 1.0),
        'alfombra': rugosidad(tex('alfombra', 'curly_teddy_natural', tinte=E.hex_rgb('e2dccf'), escala=0.6, normal=1.0), 0.9, 1.0),
        'toalla': rugosidad(tex('toalla', 'terry_cloth', tinte=E.hex_rgb('ece8df'), escala=0.4, normal=0.8), 0.9, 1.0),
        'visillo': tela_translucida('visillo', E.hex_rgb('f3efe6')),
        'pantalla': tela_translucida('pantalla', E.hex_rgb('efe6d6'), transparencia=0.0),
        'blanco_mate': mat('blanco_mate', E.hex_rgb('f2f1ee'), 0.45),
        'blanco_brillo': mat('blanco_brillo', E.hex_rgb('f4f3f1'), 0.15),
        'loza': mat('loza', E.hex_rgb('f7f7f5'), 0.06),
        'negro': mat('negro', (0.012, 0.012, 0.012, 1), 0.35),
        'negro_mate': mat('negro_mate', (0.02, 0.02, 0.02, 1), 0.7),
        'acero': mat('acero', (0.8, 0.8, 0.8, 1), 0.22, metal=1.0),
        'acero_cepillado': mat('acero_cepillado', (0.52, 0.52, 0.53, 1), 0.3, metal=1.0),
        'laton': mat('laton', E.hex_rgb('c9a46a'), 0.3, metal=1.0),
        'vidrio': mat('vidrio', (0.95, 0.97, 0.98, 1), 0.01, transmision=1.0),
        'espejo': mat('espejo', (0.95, 0.95, 0.95, 1), 0.01, metal=1.0),
        'pantalla_tv': mat('pantalla_tv', (0.005, 0.005, 0.006, 1), 0.08),
        'ceramica': mat('ceramica', E.hex_rgb('e9e4da'), 0.3),
        'ceramica_tierra': mat('ceramica_tierra', E.hex_rgb('a8774f'), 0.5),
        'naranja': mat('naranja', E.hex_rgb('e08a2c'), 0.35),
        'verde_hoja': mat('verde_hoja', E.hex_rgb('3f6b35'), 0.5),
        'luz_plafon': E.emisivo('luz_plafon', (1.0, 0.9, 0.78, 1), 9.0),
        'luz_led': E.emisivo('luz_led', (1.0, 0.78, 0.5, 1), 14.0),
        'arte_1': lienzo('arte_1', ['e9dfcf', 'c98f68', '8e9a84', 'd9c3a3'], 1.2, 0.3),
        'arte_2': lienzo('arte_2', ['efe8dc', 'b9a58a', '6f7c69', 'e0cdb0'], 1.6, 2.1),
        'arte_3': lienzo('arte_3', ['f1ece3', 'a96f50', 'e3d3bb', '3e3a35'], 1.0, 5.7),
    }
    return M


# ── Geometría ────────────────────────────────────────────────────────────────

def suavizar(ob):
    for p in ob.data.polygons:
        p.use_smooth = True


def bloque(nombre, x0, x1, y0, y1, z0, z1, m, r=0.015, seg=3, suave=0):
    """Caja de cantos redondeados. Con `suave`, además subdivide: así quedan
    los cojines, el colchón y el tapiz, que no tienen ninguna arista viva."""
    ob = E.caja(nombre, x0, x1, y0, y1, z0, z1, m, bisel=0)
    menor = min(abs(x1 - x0), abs(y1 - y0), abs(z1 - z0))
    if r > 0 and menor > 0.004:
        b = ob.modifiers.new('bisel', 'BEVEL')
        b.width = min(r, menor * 0.48)
        b.segments = seg
        b.limit_method = 'NONE'
        b.harden_normals = not suave
    if suave:
        s = ob.modifiers.new('suave', 'SUBSURF')
        s.levels = s.render_levels = suave
    suavizar(ob)
    return ob


def cilindro(nombre, x, y, z0, z1, r, m, r_arriba=None, lados=32, tapas=True):
    if r_arriba is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=lados, radius=r, depth=z1 - z0,
                                            location=(x, y, (z0 + z1) / 2),
                                            end_fill_type='NGON' if tapas else 'NOTHING')
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=lados, radius1=r, radius2=r_arriba, depth=z1 - z0,
                                        location=(x, y, (z0 + z1) / 2),
                                        end_fill_type='NGON' if tapas else 'NOTHING')
    ob = bpy.context.active_object
    ob.name = nombre
    ob.data.materials.append(m)
    suavizar(ob)
    return ob


def esfera(nombre, x, y, z, escala, m):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1, location=(x, y, z))
    ob = bpy.context.active_object
    ob.name = nombre
    ob.scale = escala
    ob.data.materials.append(m)
    suavizar(ob)
    return ob


def tubo(nombre, puntos, radio, m):
    """Tubo por puntos (curva Bézier con manijas automáticas): respaldos curvos,
    patas abiertas, griferías."""
    cu = bpy.data.curves.new(nombre, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radio
    cu.bevel_resolution = 4
    cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(puntos) - 1)
    for p, co in zip(sp.bezier_points, puntos):
        p.co = co
        p.handle_left_type = p.handle_right_type = 'AUTO'
    ob = bpy.data.objects.new(nombre, cu)
    ob.data.materials.append(m)
    bpy.context.collection.objects.link(ob)
    return ob


def almohadon(nombre, x, y, z, ancho, alto, grosor, m, giro=0.0, inclinacion=0.0):
    """Almohadón relleno: caja redondeada y subdividida, ladeada a gusto."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z))
    ob = bpy.context.active_object
    ob.name = nombre
    ob.scale = (ancho, grosor, alto)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    b = ob.modifiers.new('bisel', 'BEVEL')
    b.width = grosor * 0.45
    b.segments = 2
    s = ob.modifiers.new('suave', 'SUBSURF')
    s.levels = s.render_levels = 2
    ob.rotation_euler = (inclinacion, 0, giro)
    ob.data.materials.append(m)
    suavizar(ob)
    return ob


def grupo(nombre, objetos, x, y, giro=0.0, z=0.0):
    """Arma una pieza en coordenadas locales (centrada en el origen) y la ubica.
    Convención: el frente de la pieza mira hacia -y local."""
    g = bpy.data.objects.new(nombre, None)
    bpy.context.collection.objects.link(g)
    for o in objetos:
        o.parent = g
    g.location = (x, y, z)
    g.rotation_euler = (0, 0, giro)
    return g


def luz(tipo, x, y, z, energia, color=(1.0, 0.86, 0.7), tam=0.1, forma=None, tam_y=None):
    li = bpy.data.lights.new('luz', tipo)
    li.energy = energia
    li.color = color
    if tipo == 'AREA':
        li.shape = forma or 'DISK'
        li.size = tam
        if tam_y:
            li.size_y = tam_y
    elif tipo in ('POINT', 'SPOT'):
        li.shadow_soft_size = tam
    ob = bpy.data.objects.new('luz', li)
    ob.location = (x, y, z)
    bpy.context.collection.objects.link(ob)
    return ob


def cargar_pieza(id_):
    """Accesorio de Poly Haven. Algunos archivos traen varias variantes una al
    lado de otra (las plantas); se queda la más grande para no plantar una fila."""
    if id_ in PIEZAS:
        return PIEZAS[id_]
    gltf = E.RECURSOS / id_ / f'{id_}_2k.gltf'
    if not gltf.exists():
        PIEZAS[id_] = None
        return None
    antes = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(gltf))
    nuevos = [o for o in bpy.data.objects if o not in antes]
    raices = [o for o in nuevos if o.parent is None or o.parent not in nuevos]

    def caja_de(o):
        objs = [o] + [c for c in o.children_recursive]
        pts = [c.matrix_world @ Vector(v) for c in objs if c.type == 'MESH' for v in c.bound_box]
        return pts
    if len(raices) > 1:
        def volumen(o):
            pts = caja_de(o)
            if not pts:
                return 0
            d = [max(p[i] for p in pts) - min(p[i] for p in pts) for i in range(3)]
            return d[0] * d[1] * d[2]
        elegida = max(raices, key=volumen)
        for o in raices:
            if o is not elegida:
                for c in [o] + list(o.children_recursive):
                    bpy.data.objects.remove(c, do_unlink=True)
        raices = [elegida]
    bpy.context.view_layer.update()
    vivos = [o for o in bpy.data.objects if o not in antes]
    col = bpy.data.collections.new(id_)
    for o in vivos:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        col.objects.link(o)
    pts = [o.matrix_world @ Vector(v) for o in vivos if o.type == 'MESH' for v in o.bound_box]
    cx = (max(p.x for p in pts) + min(p.x for p in pts)) / 2
    cy = (max(p.y for p in pts) + min(p.y for p in pts)) / 2
    col.instance_offset = (cx, cy, 0)
    zs = [p.z for p in pts]
    PIEZAS[id_] = (col, max(zs) - min(zs), min(zs))
    return PIEZAS[id_]


def pieza(id_, x, y, z, alto, giro=0.0):
    p = cargar_pieza(id_)
    if p:
        return E.instancia(p, x, y, z, alto, giro)
    return None


# ── Muebles ──────────────────────────────────────────────────────────────────

def sofa(M, x, y, ancho, giro=0.0, prof=0.92):
    """Sofá de tres cuerpos en bouclé claro, con brazos rectos y cojines
    sueltos. Local: respaldo en +y, asiento hacia -y."""
    o, w = [], ancho / 2
    o.append(bloque('sofa_base', -w, w, -prof / 2, prof / 2, 0.1, 0.36, M['boucle'], r=0.03))
    o.append(bloque('sofa_respaldo', -w, w, prof / 2 - 0.2, prof / 2, 0.36, 0.72, M['boucle'], r=0.05, suave=1))
    for s in (-1, 1):
        o.append(bloque('sofa_brazo', s * w - (0.16 if s > 0 else 0), s * w + (0 if s > 0 else 0.16),
                        -prof / 2, prof / 2, 0.1, 0.62, M['boucle'], r=0.06, suave=1))
    n = 3 if ancho > 1.9 else 2
    paso = (ancho - 0.32) / n
    for i in range(n):
        xa = -w + 0.16 + i * paso
        o.append(bloque('cojin_asiento', xa + 0.01, xa + paso - 0.01, -prof / 2 + 0.01, prof / 2 - 0.2, 0.36, 0.5,
                        M['boucle'], r=0.06, suave=2))
        o.append(bloque('cojin_respaldo', xa + 0.015, xa + paso - 0.015, prof / 2 - 0.4, prof / 2 - 0.2, 0.48, 0.88,
                        M['boucle'], r=0.08, suave=2))
    for sx in (-1, 1):
        for sy in (-1, 1):
            o.append(cilindro('sofa_pata', sx * (w - 0.08), sy * (prof / 2 - 0.08), 0, 0.1, 0.022, M['roble_oscuro'], r_arriba=0.028, lados=16))
    o.append(almohadon('almohadon', -w + 0.42, prof / 2 - 0.42, 0.68, 0.44, 0.42, 0.14, M['lino_terracota'], giro=math.radians(8), inclinacion=math.radians(-14)))
    o.append(almohadon('almohadon', -w + 0.78, prof / 2 - 0.44, 0.66, 0.4, 0.38, 0.13, M['lino_salvia'], giro=math.radians(-6), inclinacion=math.radians(-12)))
    o.append(almohadon('almohadon', w - 0.42, prof / 2 - 0.42, 0.68, 0.44, 0.42, 0.14, M['lino_arena'], giro=math.radians(-9), inclinacion=math.radians(-14)))
    # manta doblada sobre el brazo
    o.append(bloque('manta', w - 0.16, w + 0.01, -0.25, 0.2, 0.6, 0.64, M['lino_gris'], r=0.02, suave=1))
    o.append(bloque('manta', w + 0.0, w + 0.03, -0.25, 0.2, 0.3, 0.64, M['lino_gris'], r=0.012, suave=1))
    return grupo('sofa', o, x, y, giro)


def silla_y(M, x, y, giro=0.0):
    """Silla de comedor de roble con asiento de cuerda y respaldo curvo."""
    o = []
    for sx in (-1, 1):
        o.append(cilindro('pata', sx * 0.2, -0.19, 0, 0.44, 0.017, M['roble'], r_arriba=0.014, lados=16))
        o.append(tubo('pata_tras', [(sx * 0.19, 0.18, 0), (sx * 0.2, 0.19, 0.45), (sx * 0.2, 0.15, 0.72)], 0.016, M['roble']))
    o.append(bloque('asiento', -0.22, 0.22, -0.22, 0.2, 0.43, 0.47, M['cuerda'], r=0.02, suave=1))
    o.append(bloque('bastidor', -0.23, 0.23, -0.23, 0.21, 0.41, 0.43, M['roble'], r=0.008))
    o.append(tubo('respaldo', [(-0.21, 0.13, 0.72), (-0.12, 0.22, 0.74), (0.0, 0.25, 0.745), (0.12, 0.22, 0.74), (0.21, 0.13, 0.72)], 0.02, M['roble']))
    o.append(bloque('respaldo_y', -0.05, 0.05, 0.19, 0.215, 0.47, 0.73, M['roble'], r=0.01))
    return grupo('silla', o, x, y, giro)


def mesa_redonda(M, x, y, r=0.55):
    o = [cilindro('tablero', 0, 0, 0.72, 0.755, r, M['roble'], lados=64),
         cilindro('pedestal', 0, 0, 0.04, 0.72, 0.055, M['negro_mate'], r_arriba=0.045),
         cilindro('base', 0, 0, 0, 0.035, 0.26, M['negro_mate'], lados=48)]
    return grupo('mesa', o, x, y)


def mesa_centro(M, x, y):
    o = [cilindro('tablero', 0, 0, 0.36, 0.4, 0.42, M['roble'], lados=64),
         cilindro('repisa', 0, 0, 0.06, 0.08, 0.36, M['roble'], lados=64)]
    for k in range(3):
        a = k * 2 * math.pi / 3 + 0.3
        o.append(cilindro('pata', 0.33 * math.cos(a), 0.33 * math.sin(a), 0, 0.36, 0.018, M['negro_mate'], lados=12))
    # libros, bandeja y jarrón
    for i, (m, h) in enumerate((('lino_salvia', 0.035), ('lino_arena', 0.03), ('blanco_mate', 0.028))):
        z = 0.4 + sum(hh for _, hh in (('', 0.035), ('', 0.03), ('', 0.028))[:i])
        o.append(bloque('libro', -0.3 + i * 0.012, -0.06 - i * 0.01, -0.12, 0.08 - i * 0.012, z, z + h, M[m], r=0.004))
    o.append(cilindro('bandeja', 0.15, 0.05, 0.4, 0.42, 0.14, M['roble_oscuro'], lados=48))
    o.append(esfera('fruta', 0.13, 0.04, 0.455, (0.035, 0.035, 0.035), M['naranja']))
    o.append(esfera('fruta', 0.18, 0.08, 0.455, (0.035, 0.035, 0.035), M['naranja']))
    g = grupo('mesa_centro', o, x, y)
    pieza('ceramic_vase_01', x - 0.17, y - 0.02, 0.493, 0.22)
    return g


def taburete(M, x, y, giro=0.0):
    """Taburete de barra: asiento de cáscara blanca, patas de roble abiertas y
    aro de acero para los pies."""
    o = [esfera('asiento', 0, 0, 0.74, (0.21, 0.2, 0.05), M['blanco_mate'])]
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        o.append(tubo('pata', [(0.2 * math.cos(a), 0.2 * math.sin(a), 0), (0.1 * math.cos(a), 0.1 * math.sin(a), 0.72)], 0.015, M['roble']))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.155, minor_radius=0.007, location=(0, 0, 0.27))
    aro = bpy.context.active_object
    aro.data.materials.append(M['acero'])
    o.append(aro)
    return grupo('taburete', o, x, y, giro)


def lampara_pie(M, x, y):
    o = []
    for k in range(3):
        a = k * 2 * math.pi / 3
        o.append(tubo('pata', [(0.24 * math.cos(a), 0.24 * math.sin(a), 0), (0.03 * math.cos(a), 0.03 * math.sin(a), 1.38)], 0.012, M['roble']))
    o.append(cilindro('pantalla', 0, 0, 1.36, 1.68, 0.24, M['pantalla'], r_arriba=0.2, lados=48, tapas=False))
    g = grupo('lampara_pie', o, x, y)
    luz('POINT', x, y, 1.52, 28, tam=0.06)
    return g


def lampara_mesa(M, x, y, z):
    o = [esfera('base', 0, 0, 0.09, (0.075, 0.075, 0.09), M['ceramica']),
         cilindro('tallo', 0, 0, 0.17, 0.3, 0.008, M['laton'], lados=12),
         cilindro('pantalla', 0, 0, 0.27, 0.45, 0.14, M['pantalla'], r_arriba=0.11, lados=40, tapas=False)]
    g = grupo('lampara', o, x, y, z=z)
    luz('POINT', x, y, z + 0.36, 9, tam=0.04)
    return g


def aparador(M, x, y, ancho, prof=0.42, alto=0.52, giro=0.0, m=None):
    """Aparador de roble con puertas a ras y patas negras. Local: frente a -y."""
    m = m or M['roble']
    w = ancho / 2
    o = [bloque('aparador', -w, w, -prof / 2, prof / 2, 0.14, alto, m, r=0.008)]
    n = max(2, round(ancho / 0.6))
    paso = ancho / n
    for i in range(n):
        xa = -w + i * paso
        o.append(bloque('puerta', xa + 0.004, xa + paso - 0.004, -prof / 2 - 0.006, -prof / 2, 0.15, alto - 0.01, m, r=0.004))
    for sx in (-1, 1):
        for sy in (-1, 1):
            o.append(cilindro('pata', sx * (w - 0.06), sy * (prof / 2 - 0.06), 0, 0.14, 0.012, M['negro_mate'], lados=12))
    return grupo('aparador', o, x, y, giro)


def tv(M, x, y, z, ancho=1.23, giro=0.0):
    alto = ancho * 0.5625
    o = [bloque('tv', -ancho / 2, ancho / 2, -0.015, 0.015, z, z + alto, M['negro'], r=0.004),
         bloque('pantalla', -ancho / 2 + 0.008, ancho / 2 - 0.008, -0.0165, -0.015, z + 0.008, z + alto - 0.008, M['pantalla_tv'], r=0)]
    return grupo('tv', o, x, y, giro)


def cuadro(M, x, y, z, ancho, alto, arte, giro=0.0, marco='roble'):
    """Cuadro colgado con marco delgado y paspartú. Local: cara a -y, pegado al
    muro por detrás (y=0)."""
    o = [bloque('marco', -ancho / 2, ancho / 2, -0.03, 0, z - alto / 2, z + alto / 2, M[marco], r=0.004),
         bloque('paspartu', -ancho / 2 + 0.025, ancho / 2 - 0.025, -0.032, -0.03, z - alto / 2 + 0.025, z + alto / 2 - 0.025, M['blanco_mate'], r=0),
         bloque('lamina', -ancho / 2 + 0.08, ancho / 2 - 0.08, -0.034, -0.032, z - alto / 2 + 0.08, z + alto / 2 - 0.08, M[arte], r=0)]
    return grupo('cuadro', o, x, y, giro)


def alfombra(M, x0, x1, y0, y1):
    return bloque('alfombra', x0, x1, y0, y1, 0, 0.018, M['alfombra'], r=0.05, seg=4)


def cortina(M, a0, a1, fijo, z0=0.0, z1=ALTO - 0.04, eje='x', pliegues=6.5, amp=0.035):
    """Cortina de lino de onda, del riel al piso. eje='x': corre a lo largo de x
    en y=fijo; eje='y': a lo largo de y en x=fijo."""
    n = int(abs(a1 - a0) * 48) + 2
    verts, caras = [], []
    for i in range(n):
        t = i / (n - 1)
        u = a0 + (a1 - a0) * t
        off = amp * math.sin(2 * math.pi * pliegues * (u - a0))
        for z in (z0, z1):
            verts.append((u, fijo + off, z) if eje == 'x' else (fijo + off, u, z))
    for i in range(n - 1):
        caras.append((2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1))
    me = bpy.data.meshes.new('cortina')
    me.from_pydata(verts, [], caras)
    me.update()
    ob = bpy.data.objects.new('cortina', me)
    ob.data.materials.append(M['visillo'])
    bpy.context.collection.objects.link(ob)
    suavizar(ob)
    so = ob.modifiers.new('grosor', 'SOLIDIFY')
    so.thickness = 0.003
    # riel
    if eje == 'x':
        E.caja('riel', min(a0, a1) - 0.05, max(a0, a1) + 0.05, fijo - 0.015, fijo + 0.015, ALTO - 0.04, ALTO - 0.01, M['negro_mate'], bisel=0)
    else:
        E.caja('riel', fijo - 0.015, fijo + 0.015, min(a0, a1) - 0.05, max(a0, a1) + 0.05, ALTO - 0.04, ALTO - 0.01, M['negro_mate'], bisel=0)
    return ob


def plafon(M, x, y, r=0.17, energia=40):
    """Plafón redondo adosado al techo, como los de los renders de Domaria: se
    ve encendido y es la luz principal del ambiente."""
    cilindro('plafon', x, y, ALTO - 0.055, ALTO, r, M['negro_mate'], lados=48)
    cilindro('difusor', x, y, ALTO - 0.058, ALTO - 0.054, r - 0.012, M['luz_plafon'], lados=48)
    luz('AREA', x, y, ALTO - 0.065, energia, tam=2 * r - 0.03)


def cama(M, x, y, ancho, largo=2.0, giro=0.0):
    """Cama tapizada con cabecera alta acolchada, edredón de lino que cae por
    los lados, pie de cama y almohadas. Local: cabecera en +y."""
    o, w = [], ancho / 2
    y_cab = largo / 2
    o.append(bloque('base', -w - 0.03, w + 0.03, -y_cab - 0.03, y_cab, 0.06, 0.34, M['boucle_gris'], r=0.03, suave=1))
    o.append(bloque('colchon', -w, w, -y_cab, y_cab - 0.02, 0.34, 0.56, M['lino_blanco'], r=0.05, suave=2))
    # edredón: cubre desde un cuarto del largo y cae por los lados
    o.append(bloque('edredon', -w - 0.05, w + 0.05, -y_cab - 0.05, y_cab - largo * 0.28, 0.32, 0.6, M['lino_blanco'], r=0.04, suave=1))
    # pie de cama en gris
    o.append(bloque('pie_cama', -w - 0.065, w + 0.065, -y_cab - 0.06, -y_cab + 0.42, 0.3, 0.615, M['lino_gris'], r=0.035, suave=1))
    # cabecera de paneles verticales acolchados
    n = max(3, round(ancho / 0.38))
    paso = (ancho + 0.24) / n
    for i in range(n):
        xa = -w - 0.12 + i * paso
        o.append(bloque('cabecera', xa + 0.006, xa + paso - 0.006, y_cab + 0.02, y_cab + 0.12, 0.3, 1.25, M['boucle'], r=0.04, suave=2))
    # almohadas: dos grandes atrás, dos decorativas delante
    k = 2 if ancho > 1.2 else 1
    for i in range(k):
        cx = -w + (i + 0.5) * ancho / k
        o.append(almohadon('almohada', cx, y_cab - 0.22, 0.7, ancho / k - 0.1, 0.4, 0.16, M['lino_blanco'], inclinacion=math.radians(-18)))
        o.append(almohadon('cojin', cx + (0.04 if i else -0.04), y_cab - 0.4, 0.69, 0.42, 0.36, 0.13,
                           M['lino_terracota' if i else 'lino_arena'], giro=math.radians(6 if i else -5), inclinacion=math.radians(-12)))
    return grupo('cama', o, x, y, giro)


def velador(M, x, y, giro=0.0, lampara=True):
    """Velador flotante de roble con cajón, lámpara y un par de libros."""
    o = [bloque('velador', -0.24, 0.24, -0.19, 0.19, 0.3, 0.52, M['roble'], r=0.01),
         bloque('cajon', -0.235, 0.235, -0.196, -0.19, 0.32, 0.5, M['roble'], r=0.004),
         bloque('libro', -0.18, 0.02, -0.12, 0.08, 0.52, 0.545, M['lino_salvia'], r=0.003)]
    g = grupo('velador', o, x, y, giro)
    if lampara:
        dx, dy = math.cos(giro) * 0.1, math.sin(giro) * 0.1
        lampara_mesa(M, x + dx, y + dy, 0.52)
    return g


def ropero(M, x0, x1, y0, y1, frente='-y'):
    """Ropero empotrado blanco con puertas batientes y tiradores negros."""
    bloque('ropero', x0, x1, y0, y1, 0, 2.4, M['blanco_mate'], r=0.006)
    largo = (x1 - x0) if frente in ('-y', '+y') else (y1 - y0)
    n = max(2, round(largo / 0.5))
    paso = largo / n
    for i in range(n):
        a = i * paso
        if frente in ('-y', '+y'):
            yy = y0 if frente == '-y' else y1
            s = -1 if frente == '-y' else 1
            bloque('puerta', x0 + a + 0.003, x0 + a + paso - 0.003, yy, yy + s * 0.008, 0.02, 2.38, M['blanco_mate'], r=0.003)
            xt = x0 + a + (paso - 0.05 if i % 2 == 0 else 0.05)
            bloque('tirador', xt - 0.006, xt + 0.006, yy + s * 0.008, yy + s * 0.03, 0.9, 1.3, M['negro'], r=0.003)
        else:
            xx = x0 if frente == '-x' else x1
            s = -1 if frente == '-x' else 1
            bloque('puerta', xx, xx + s * 0.008, y0 + a + 0.003, y0 + a + paso - 0.003, 0.02, 2.38, M['blanco_mate'], r=0.003)
            yt = y0 + a + (paso - 0.05 if i % 2 == 0 else 0.05)
            bloque('tirador', xx + s * 0.008, xx + s * 0.03, yt - 0.006, yt + 0.006, 0.9, 1.3, M['negro'], r=0.003)


def inodoro(M, x, y, giro=0.0):
    o = [bloque('taza', -0.18, 0.18, -0.3, 0.1, 0.0, 0.4, M['loza'], r=0.12, suave=1),
         bloque('asiento', -0.185, 0.185, -0.31, 0.1, 0.4, 0.43, M['loza'], r=0.06, suave=1),
         bloque('tanque', -0.19, 0.19, 0.08, 0.26, 0.4, 0.8, M['loza'], r=0.04, suave=1),
         cilindro('pulsador', 0, 0.17, 0.8, 0.81, 0.025, M['acero'], lados=24)]
    return grupo('inodoro', o, x, y, giro)


def lavatorio(M, x, y, ancho=0.6, giro=0.0):
    """Mueble flotante de roble, ovalín blanco sobrepuesto, grifería negra y
    espejo redondo con luz por detrás. Local: muro en +y."""
    w = ancho / 2
    o = [bloque('mueble', -w, w, -0.24, 0.24, 0.5, 0.82, M['roble'], r=0.008),
         bloque('tope', -w - 0.01, w + 0.01, -0.25, 0.24, 0.82, 0.84, M['cuarzo'], r=0.004),
         esfera('ovalin', 0, -0.02, 0.89, (0.2, 0.15, 0.06), M['loza']),
         tubo('grifo', [(0, 0.16, 0.84), (0, 0.16, 1.02), (0, 0.08, 1.06), (0, 0.02, 1.02)], 0.011, M['negro'])]
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.33, depth=0.01, location=(0, 0.22, 1.55), rotation=(math.radians(90), 0, 0))
    esp = bpy.context.active_object
    esp.data.materials.append(M['espejo'])
    o.append(esp)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.345, depth=0.008, location=(0, 0.232, 1.55), rotation=(math.radians(90), 0, 0))
    halo = bpy.context.active_object
    halo.data.materials.append(M['luz_led'])
    o.append(halo)
    o.append(bloque('toalla', w + 0.03, w + 0.06, -0.15, 0.15, 0.55, 0.95, M['toalla'], r=0.012, suave=1))
    return grupo('lavatorio', o, x, y, giro)


def ducha(M, x0, x1, y0, y1, puerta_en='y0'):
    bloque('plato', x0, x1, y0, y1, 0, 0.03, M['loza'], r=0.01)
    if puerta_en == 'y0':
        E.caja('mampara', x0, x1, y0 - 0.005, y0 + 0.005, 0.03, 2.0, M['vidrio'], bisel=0)
        E.caja('perfil', x0, x1, y0 - 0.012, y0 + 0.012, 1.98, 2.0, M['negro'], bisel=0)
        E.caja('perfil', (x0 + x1) / 2 - 0.01, (x0 + x1) / 2 + 0.01, y0 - 0.012, y0 + 0.012, 0.03, 2.0, M['negro'], bisel=0)
    cilindro('rociador', (x0 + x1) / 2, y1 - 0.25, 2.05, 2.07, 0.12, M['negro'], lados=32)
    tubo('brazo', [((x0 + x1) / 2, y1, 2.15), ((x0 + x1) / 2, y1 - 0.25, 2.12)], 0.01, M['negro'])


def enchapar(M, x0, x1, y0, y1, vanos=(), alto=2.1):
    """Enchape de las cuatro caras interiores de un baño, sin tapar la puerta.
    vanos: (lado, desde, hasta) con lado en x0/x1/y0/y1 y medidas absolutas."""
    e = 0.065
    for lado in ('x0', 'x1', 'y0', 'y1'):
        if lado in ('x0', 'x1'):
            xx = x0 + e if lado == 'x0' else x1 - e
            a, b = y0 + e, y1 - e
        else:
            yy = y0 + e if lado == 'y0' else y1 - e
            a, b = x0 + e, x1 - e
        cortes = [a]
        for l_, d, h in vanos:
            if l_ == lado:
                cortes += [d, h]
        cortes.append(b)
        for i in range(0, len(cortes), 2):
            p, q = cortes[i], cortes[i + 1]
            if q - p < 0.01:
                continue
            if lado in ('x0', 'x1'):
                s = 1 if lado == 'x0' else -1
                E.caja('enchape', xx, xx + s * 0.008, p, q, 0.0, alto, M['enchape'], bisel=0)
            else:
                s = 1 if lado == 'y0' else -1
                E.caja('enchape', p, q, yy, yy + s * 0.008, 0.0, alto, M['enchape'], bisel=0)


def cocina(M):
    """Cocina en L de LAYOUT_A (0..2.8 x 3.8..6.0): muebles bajos de roble,
    tope de cuarzo, repisa flotante con tira LED, campana negra, refrigeradora
    de dos puertas y la barra abierta a la sala."""
    r, s = M['roble'], M['cuarzo']
    # muebles bajos con zócalo negro y puertas a ras
    bloque('zocalo', 0.1, 0.66, 4.0, 5.9, 0, 0.1, M['negro_mate'], r=0)
    bloque('zocalo', 0.66, 2.06, 5.34, 5.9, 0, 0.1, M['negro_mate'], r=0)
    bloque('casco', 0.06, 0.66, 4.0, 5.94, 0.1, 0.88, r, r=0.004)
    bloque('casco', 0.66, 2.1, 5.34, 5.94, 0.1, 0.88, r, r=0.004)
    for i in range(4):
        ya = 4.0 + i * 0.485
        bloque('puerta', 0.66, 0.672, ya + 0.003, ya + 0.482, 0.12, 0.86, r, r=0.003)
    for i in range(3):
        xa = 0.66 + i * 0.48
        bloque('puerta', xa + 0.003, xa + 0.477, 5.328, 5.34, 0.12, 0.86, r, r=0.003)
    bloque('tope', 0.04, 0.68, 3.98, 5.96, 0.88, 0.92, s, r=0.004)
    bloque('tope', 0.68, 2.12, 5.32, 5.96, 0.88, 0.92, s, r=0.004)
    # salpicadero de cuarzo hasta la repisa
    E.caja('salpicadero', 0.06, 0.075, 4.0, 5.94, 0.92, 1.5, M['marmol'], bisel=0)
    E.caja('salpicadero', 0.66, 2.1, 5.925, 5.94, 0.92, 1.62, M['marmol'], bisel=0)
    # alacenas altas blancas a los lados de la campana
    for xa, xb in ((0.68, 1.0), (1.58, 2.1)):
        bloque('alacena', xa, xb, 5.6, 5.94, 1.62, 2.35, M['blanco_mate'], r=0.004)
        bloque('alacena_puerta', xa + 0.003, xb - 0.003, 5.594, 5.6, 1.625, 2.345, M['blanco_mate'], r=0.003)
    # repisa flotante con tira LED debajo
    bloque('repisa', 0.06, 0.32, 4.0, 5.94, 1.5, 1.54, r, r=0.004)
    E.caja('led', 0.24, 0.26, 4.02, 5.92, 1.495, 1.5, M['luz_led'], bisel=0)
    luz('AREA', 0.25, 4.97, 1.49, 20, forma='RECTANGLE', tam=0.04, tam_y=1.9)
    # lavadero y grifo
    E.caja('poza', 0.16, 0.56, 4.25, 4.85, 0.9, 0.925, M['acero_cepillado'], bisel=0)
    tubo('grifo', [(0.1, 4.55, 0.92), (0.1, 4.55, 1.28), (0.2, 4.55, 1.34), (0.32, 4.55, 1.25)], 0.012, M['acero'])
    # cocina vitrocerámica y campana chimenea negra
    E.caja('vitro', 0.98, 1.6, 5.42, 5.9, 0.92, 0.926, M['pantalla_tv'], bisel=0)
    bloque('campana', 1.04, 1.54, 5.5, 5.94, 1.62, 1.72, M['negro'], r=0.004)
    bloque('chimenea', 1.17, 1.41, 5.66, 5.94, 1.72, ALTO, M['negro'], r=0.004)
    # refrigeradora de dos puertas
    bloque('refri', 2.12, 2.76, 5.26, 5.94, 0, 1.85, M['acero_cepillado'], r=0.02)
    E.caja('refri_junta', 2.438, 2.442, 5.255, 5.26, 0.02, 1.83, M['negro'], bisel=0)
    for xx in (2.41, 2.47):
        bloque('tirador', xx - 0.008, xx + 0.008, 5.22, 5.255, 0.8, 1.5, M['acero'], r=0.006)
    # barra abierta a la sala, con tope de cuarzo en cascada
    bloque('barra', 0.15, 2.6, 3.55, 3.95, 0, 1.0, M['blanco_mate'], r=0.006)
    bloque('barra_tope', 0.1, 2.65, 3.42, 3.98, 1.0, 1.04, s, r=0.006)
    bloque('barra_cascada', 2.61, 2.65, 3.42, 3.98, 0, 1.0, s, r=0.004)
    # vestido: tabla, frutero, frascos, plantita y jarra
    bloque('tabla', 0.2, 0.5, 5.05, 5.4, 0.92, 0.94, M['roble_oscuro'], r=0.01)
    cilindro('frutero', 1.2, 3.72, 1.04, 1.1, 0.13, M['ceramica'], r_arriba=0.15, lados=48)
    for (fx, fy) in ((1.16, 3.7), (1.24, 3.75), (1.2, 3.66)):
        esfera('fruta', fx, fy, 1.13, (0.04, 0.04, 0.04), M['naranja'])
    for k in range(3):
        cilindro('frasco', 0.16, 4.3 + k * 0.13, 1.54, 1.68 + 0.02 * k, 0.045, M['vidrio'], lados=24)
        cilindro('tapa', 0.16, 4.3 + k * 0.13, 1.68 + 0.02 * k, 1.7 + 0.02 * k, 0.046, M['roble'], lados=24)
    pieza('ceramic_vase_02', 0.17, 5.6, 1.54, 0.2)
    pieza('calathea_orbifolia_01', 0.19, 5.25, 1.54, 0.3)


def pozo_de_luz(M, L, piso=True):
    """Lo que se ve por las ventanas de la medianera (x=0): un pozo de luz de
    1,6 m con muro claro enfrente, jardineras con arbustos y cielo arriba. Es
    como se iluminan los ambientes de fondo en los edificios de Chiclayo, y es
    lo que muestra el render de Domaria por la ventana del comedor."""
    F = L['fondo']
    E.caja('pozo_muro', -1.9, -1.6, -0.6, F + 0.6, -6, ALTO + 6, M['pared'], bisel=0)
    E.caja('pozo_fondo', -1.6, 0, -0.6, F + 0.6, -6.1, -6, M['pared'], bisel=0)
    for x0, y0, x1, y1, g, vanos in L['muros']:
        if x0 == 0 and x1 == 0:
            for d, h, tipo in vanos:
                if tipo != 'ventana':
                    continue
                ya, yb = y0 + d, y0 + h
                bloque('jardinera', -0.55, -0.13, ya - 0.05, yb + 0.05, 0.55, 0.95, M['blanco_mate'], r=0.01)
                n = max(2, int((yb - ya) / 0.35))
                for k in range(n):
                    yy = ya + (k + 0.5) * (yb - ya) / n
                    pieza('shrub_02', -0.34, yy, 0.93, random.Random(int(yy * 100)).uniform(0.5, 0.75), giro=k * 1.7)


def hall(M, L):
    """Hall del piso detrás de la puerta de entrada (x=6): sin él, la puerta
    abierta daba al cielo. Piso, muro con la puerta del ascensor y luz."""
    W = L['ancho']
    E.caja('hall_piso', W + 0.1, W + 2.6, -0.5, L['fondo'] + 0.5, -0.02, 0.0, M['porcelanato'], bisel=0)
    E.caja('hall_muro', W + 2.6, W + 2.8, -0.5, L['fondo'] + 0.5, 0, ALTO, M['pared'], bisel=0)
    E.caja('hall_techo', W, W + 2.8, -0.5, L['fondo'] + 0.5, ALTO, ALTO + 0.1, M['techo'], bisel=0)
    E.caja('ascensor', W + 2.58, W + 2.6, 2.55, 3.65, 0, 2.15, M['acero_cepillado'], bisel=0)
    E.caja('ascensor_marco', W + 2.57, W + 2.6, 2.5, 3.7, 2.15, 2.25, M['acero'], bisel=0)
    plafon(M, W + 1.3, 3.1, r=0.13, energia=25)
    pieza('potted_plant_04', W + 2.3, 1.6, 0, 0.9)


def amoblar(L, tipo, M):
    """Muebles por ambiente con las coordenadas de LAYOUT_A (el B comparte
    estructura; cambia el dormitorio 3 por un estudio)."""
    # ── sala-comedor (0..6 x 0..3.8): ventanal en y=0, entrada en x=6
    sofa(M, 4.5, 0.72, 2.2, giro=math.pi)            # respaldo al ventanal, mira a la TV
    alfombra(M, 3.35, 5.65, 1.25, 3.05)
    mesa_centro(M, 4.5, 2.05)
    aparador(M, 4.9, 3.52, 1.6, prof=0.4, giro=0)
    tv(M, 4.9, 3.72, 1.05, ancho=1.23, giro=0)
    pieza('ceramic_vase_03', 4.35, 3.52, 0.52, 0.34)
    pieza('wicker_basket_01', 5.45, 3.52, 0.52, 0.12)
    lampara_pie(M, 5.6, 0.45)
    pieza('potted_plant_02', 0.32, 0.38, 0, 1.25)
    mesa_redonda(M, 1.35, 1.75)
    for (dx, dy, g) in ((0, -0.62, 0), (0, 0.62, math.pi), (-0.62, 0, -math.pi / 2), (0.62, 0, math.pi / 2)):
        silla_y(M, 1.35 + dx, 1.75 + dy, g)
    pieza('ceramic_vase_02', 1.35, 1.75, 0.755, 0.24)
    pieza('modern_ceiling_lamp_01', 1.35, 1.75, 1.75, ALTO - 1.75)
    luz('POINT', 1.35, 1.75, 1.82, 18, tam=0.08)
    cuadro(M, 5.9, 1.25, 1.6, 0.9, 0.65, 'arte_1', giro=-math.pi / 2)
    cuadro(M, 0.125, 2.95, 1.6, 0.5, 0.7, 'arte_2', giro=math.pi / 2, marco='negro')
    cortina(M, 0.45, 1.35, 0.17, eje='x')
    cortina(M, 4.65, 5.55, 0.17, eje='x')
    cortina(M, 0.45, 0.95, 0.15, eje='y', pliegues=7)
    cortina(M, 1.9, 2.35, 0.15, eje='y', pliegues=7)
    for xx in (0.6, 1.3, 2.0):
        taburete(M, xx, 3.18)

    cocina(M)

    # ── baño 2 (3.8..6 x 3.8..6)
    enchapar(M, 3.8, 6.0, 3.8, 6.0, vanos=[('x0', 4.15, 4.85)])
    lavatorio(M, 5.66, 4.35, ancho=0.6, giro=-math.pi / 2)
    inodoro(M, 5.62, 5.3, giro=-math.pi / 2)
    ducha(M, 3.88, 4.95, 5.0, 5.92)

    # ── dormitorio 2 (0..2.8 x 6..8.3): cama de plaza y media, cabecera en x=0
    cama(M, 1.195, 6.85, 1.05, largo=1.9, giro=math.pi / 2)
    velador(M, 0.32, 7.68, giro=math.pi / 2)
    ropero(M, 1.3, 2.72, 7.72, 8.24, frente='-y')
    cortina(M, 6.5, 6.85, 0.15, eje='y', pliegues=7)

    # ── dormitorio 3 / estudio (3.8..6 x 6..8.3)
    if tipo == 'A':
        cama(M, 4.855, 7.55, 1.0, largo=1.85, giro=-math.pi / 2)
        ropero(M, 4.95, 5.92, 6.06, 6.6, frente='+y')
    else:
        bloque('escritorio', 4.4, 5.92, 6.08, 6.72, 0.73, 0.76, M['roble'], r=0.006)
        for xx in (4.45, 5.87):
            bloque('pata', xx - 0.02, xx + 0.02, 6.12, 6.68, 0, 0.73, M['negro_mate'], r=0.004)
        silla_y(M, 5.15, 6.95, math.pi)
        bloque('estante', 3.88, 4.22, 6.8, 8.22, 0, 1.9, M['roble'], r=0.006)
        pieza('anthurium_botany_01', 5.75, 6.25, 0.76, 0.32)
        lampara_mesa(M, 4.6, 6.3, 0.76)

    # ── dormitorio principal (0..4.2 x 8.3..11): cama queen, cabecera en y=11
    cama(M, 2.0, 9.78, 1.6, giro=0)
    for xx in (0.82, 3.18):
        velador(M, xx, 10.7, giro=0)
    ropero(M, 0.13, 1.05, 8.36, 8.92, frente='+y')
    alfombra(M, 0.95, 3.05, 8.45, 10.0)
    cuadro(M, 2.0, 10.9, 1.78, 1.2, 0.5, 'arte_3', giro=0)
    cortina(M, 8.85, 9.15, 0.15, eje='y', pliegues=7)
    cortina(M, 10.15, 10.5, 0.15, eje='y', pliegues=7)
    pieza('standing_picture_frame_01', 3.3, 10.65, 0.52, 0.25, giro=math.pi)

    # ── baño principal (4.2..6 x 8.3..11)
    enchapar(M, 4.2, 6.0, 8.3, 11.0, vanos=[('x0', 8.65, 9.35)])
    lavatorio(M, 5.66, 8.85, ancho=0.6, giro=-math.pi / 2)
    inodoro(M, 5.62, 9.75, giro=-math.pi / 2)
    ducha(M, 4.3, 5.35, 10.0, 10.88)


def luces(L, M):
    """Plafones encendidos, con potencia según el ambiente."""
    for id_, _, x0, y0, x1, y1, _ in L['ambientes']:
        area = (x1 - x0) * (y1 - y0)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if id_ == 'sala':
            plafon(M, 4.5, 1.9, energia=70)
        elif id_ == 'pasillo':
            plafon(M, cx, 5.0, r=0.13, energia=18)
            plafon(M, cx, 7.3, r=0.13, energia=18)
        else:
            plafon(M, cx, cy, r=0.15 if area < 6 else 0.17, energia=min(80, 13 * area))
