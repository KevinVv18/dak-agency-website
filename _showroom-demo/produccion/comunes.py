"""Planta del piso 1: recepción, hall del ascensor, depósitos y cocheras.

Render cenital encuadrado exacto al rectángulo del edificio (14,4 x 22 m,
100 px/m, avenida abajo), igual que el piso típico: los polígonos de
datos/edificio.js calzan sin ajuste. La azotea sale de edificio.py con la
vista `planta_azotea`, de la misma escena que el giro 360.

  blender -b -P produccion/comunes.py -- --out piso1.png
"""

import math
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).parent))
import edificio as E  # noqa: E402
import muebles as MB  # noqa: E402

W, D = E.PARAM['frente'], E.PARAM['fondo']
N0, N1 = E.PARAM['col_centro']
H = 2.2  # corte de muros

# Estacionamientos: (número, x0, y0, x1, y1, auto o None)
COCHERAS = [
    ('E-01', 11.6, 0.6, 14.15, 6.0, 'blanco'),
    ('E-02', 11.6, 6.2, 14.15, 11.6, 'gris'),
    ('E-03', 11.6, 11.8, 14.15, 17.2, None),
    ('E-04', 3.4, 14.3, 8.4, 16.8, 'rojo'),
    ('E-05', 3.4, 17.0, 8.4, 19.5, 'negro'),
    ('E-06', 3.4, 19.7, 8.4, 21.85, None),
]


def muro(x0, y0, x1, y1, M, g=0.15):
    if abs(x1 - x0) > abs(y1 - y0):
        E.caja('muro', x0, x1, y0 - g / 2, y0 + g / 2, 0, H, M['pared'], bisel=0)
    else:
        E.caja('muro', x0 - g / 2, x0 + g / 2, y0, y1, 0, H, M['pared'], bisel=0)


def auto(M, x0, y0, x1, y1, color):
    """Auto visto desde arriba: carrocería redondeada, techo y parabrisas."""
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    largo_x = (x1 - x0) > (y1 - y0)
    L, A = 4.4, 1.82
    lx, ly = (L, A) if largo_x else (A, L)
    pintura = E.material(f'auto_{color}', {'blanco': (0.85, 0.86, 0.87, 1), 'gris': (0.32, 0.33, 0.35, 1),
                                           'rojo': (0.45, 0.04, 0.04, 1), 'negro': (0.02, 0.02, 0.025, 1)}[color], 0.18, metal=0.4)
    MB.bloque('auto', cx - lx / 2, cx + lx / 2, cy - ly / 2, cy + ly / 2, 0.15, 1.05, pintura, r=0.35, suave=1)
    tx, ty = (lx * 0.48, ly * 0.82) if largo_x else (lx * 0.82, ly * 0.48)
    MB.bloque('cabina', cx - tx / 2, cx + tx / 2, cy - ty / 2, cy + ty / 2, 1.0, 1.45, M['pantalla_tv'], r=0.25, suave=1)
    rx, ry = (lx * 0.3, ly * 0.78) if largo_x else (lx * 0.78, ly * 0.3)
    MB.bloque('techo', cx - rx / 2, cx + rx / 2, cy - ry / 2, cy + ry / 2, 1.42, 1.5, pintura, r=0.12, suave=1)


def rotulo_piso(texto, x, y, tam, m, giro=0.0):
    cu = bpy.data.curves.new('rotulo', 'FONT')
    cu.body = texto
    cu.size = tam
    cu.align_x = 'CENTER'
    cu.align_y = 'CENTER'
    ob = bpy.data.objects.new('rotulo', cu)
    ob.location = (x, y, 0.012)
    ob.rotation_euler = (0, 0, giro)
    ob.data.materials.append(m)
    bpy.context.collection.objects.link(ob)


def construir(M):
    pintura_blanca = E.emisivo('pintura_piso', (0.95, 0.95, 0.92, 1), 0.6)
    concreto = M['concreto_piso']
    # pisos
    E.caja('piso_lobby', 0, N0, 0, 8.4, -0.02, 0.0, M['porcelanato'], bisel=0)
    E.caja('piso_hall', N0, N1, 0, 14.0, -0.02, 0.0, M['porcelanato'], bisel=0)
    E.caja('piso_servicio', 0, N0, 8.4, 14.0, -0.02, 0.0, M['ceramico'], bisel=0)
    E.caja('piso_cochera', N1, W, 0, D, -0.02, 0.0, concreto, bisel=0)
    E.caja('piso_cochera', 0, N1, 14.0, D, -0.02, 0.0, concreto, bisel=0)
    # muros perimetrales (frente con mampara del lobby y vano de la cochera)
    g = 0.25
    E.caja('muro', 0, W, D - g, D, 0, H, M['pared'], bisel=0)
    E.caja('muro', 0, g, 0, D, 0, H, M['pared'], bisel=0)
    E.caja('muro', W - g, W, 0, D, 0, H, M['pared'], bisel=0)
    E.caja('muro', 0, 0.6, 0, g, 0, H, M['pared'], bisel=0)
    E.caja('muro', 5.2, N1 + 0.1, 0, g, 0, H, M['pared'], bisel=0)
    E.caja('mampara_lobby', 0.6, 5.2, 0.08, 0.14, 0, H, M['vidrio'], bisel=0)
    for x in (0.6, 2.13, 3.67, 5.2):
        E.caja('perfil', x - 0.02, x + 0.02, 0.05, 0.17, 0, H, M['negro'], bisel=0)
    # tabiques
    muro(0, 8.4, N0, 8.4, M)                      # lobby | servicio
    muro(N0, 0.25, N0, 6.2, M)                    # lobby | hall (con pase)
    muro(N1, 0.25, N1, 2.6, M)                    # hall | cochera (puerta en 2,6-3,6)
    muro(N1, 3.6, N1, 14.0, M)
    muro(0, 14.0, N0, 14.0, M)
    muro(N0, 14.0, N1, 14.0, M)
    muro(N0, 8.4, N0, 14.0, M)
    for y in (10.2, 12.1):
        muro(0, y, N0, y, M, g=0.12)
    # núcleo: ascensor y escalera, igual que en el piso típico
    E.caja('ascensor', N0 + 0.25, N0 + 1.45, 8.7, 10.3, 0, H, M['gris_mueble'], bisel=0.01)
    E.caja('ascensor_puerta', N0 + 1.45, N0 + 1.5, 9.0, 10.0, 0, 2.1, M['acero'], bisel=0)
    for k in range(12):
        y = 10.8 + k * 0.25
        E.caja('peldaño', N0 + 0.2, N1 - 0.2, y, y + 0.25, 0, 0.17 * (k + 1), M['pared'], bisel=0.005)
    E.caja('baranda_escalera', N0 + 1.18, N0 + 1.22, 10.8, 13.8, 0, H, M['negro'], bisel=0)
    # lobby: counter de recepción, sala de espera, casilleros y plantas
    MB.bloque('counter', 1.0, 3.6, 6.6, 7.3, 0, 1.05, M['roble'], r=0.02)
    MB.bloque('counter_tope', 0.95, 3.65, 6.55, 7.35, 1.05, 1.09, M['cuarzo'], r=0.01)
    MB.silla_y(M, 2.3, 7.7, math.pi)
    MB.alfombra(M, 1.2, 4.6, 1.5, 4.2)
    MB.sofa(M, 2.9, 1.15, 2.0, giro=math.pi)
    MB.mesa_centro(M, 2.9, 2.55)
    for x in (1.5, 4.3):
        MB.pieza('modern_arm_chair_01', x, 3.7, 0, 0.85, giro=math.radians(90))
    E.caja('casilleros', 0.25, 0.65, 2.2, 5.6, 0, 1.6, M['roble_oscuro'], bisel=0.01)
    for (x, y) in ((0.75, 0.75), (5.0, 0.75), (5.1, 7.9)):
        MB.pieza('potted_plant_02', x, y, 0, 1.2)
    MB.plafon(M, 2.9, 3.5, r=0.2, energia=60)
    # cocheras: líneas pintadas, número y auto
    for num, x0, y0, x1, y1, color in COCHERAS:
        for (a0, b0, a1, b1) in ((x0, y0, x1, y0 + 0.08), (x0, y1 - 0.08, x1, y1), (x0, y0, x0 + 0.08, y1), (x1 - 0.08, y0, x1, y1)):
            E.caja('linea', a0, a1, b0, b1, 0.0, 0.005, pintura_blanca, bisel=0)
        largo_x = (x1 - x0) > (y1 - y0)
        tx, ty = ((x0 + 0.7, (y0 + y1) / 2) if largo_x else ((x0 + x1) / 2, y0 + 0.7))
        rotulo_piso(num, tx, ty, 0.42, pintura_blanca, giro=math.radians(90) if largo_x else 0.0)
        if color:
            auto(M, x0, y0, x1, y1, color)
    # flechas de circulación en el pasadizo
    for y in (3.0, 9.0, 15.0):
        E.caja('flecha', 9.8, 10.0, y - 0.6, y + 0.3, 0.0, 0.005, pintura_blanca, bisel=0)
        bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=0.45, radius2=0, depth=0.005, location=(9.9, y + 0.5, 0.003), rotation=(0, 0, math.radians(90)))
        bpy.context.active_object.data.materials.append(pintura_blanca)
    # bicicletero
    for k in range(5):
        E.caja('bici', 12.0 + k * 0.42, 12.0 + k * 0.42 + 0.06, 18.0, 19.8, 0, 0.9, M['negro'], bisel=0)


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    salida = argv[argv.index('--out') + 1] if '--out' in argv else 'piso1.png'
    muestras = int(argv[argv.index('--muestras') + 1]) if '--muestras' in argv else 192
    E.limpiar()
    E.cargar_vegetacion(['potted_plant_02'])
    M = MB.materiales()
    M.update({
        'gris_mueble': E.material('gris_mueble', (0.18, 0.18, 0.19, 1), 0.4),
        'concreto_piso': MB.rugosidad(E.material_tex('concreto_piso', 'concrete_pavement', tinte=E.hex_rgb('b9b6b0'), escala=2.0, normal=0.4), 0.4, 0.7),
    })
    construir(M)
    # luz de día cenital suave, como las plantas típicas
    w = bpy.data.worlds.new('mundo')
    bpy.context.scene.world = w
    w.use_nodes = True
    w.node_tree.nodes.get('Background').inputs['Strength'].default_value = 1.6
    sol = bpy.data.lights.new('sol', 'SUN')
    sol.energy = 3.2
    sol.angle = math.radians(1.0)
    ob = bpy.data.objects.new('sol', sol)
    ob.rotation_euler = (math.radians(55), 0, math.radians(200))
    bpy.context.collection.objects.link(ob)
    cam = bpy.data.cameras.new('cam')
    cam.type = 'ORTHO'
    cam.ortho_scale = max(W, D)
    co = bpy.data.objects.new('cam', cam)
    co.location = (W / 2, D / 2, 30)
    bpy.context.collection.objects.link(co)
    s = bpy.context.scene
    s.camera = co
    s.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'OPTIX'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == 'OPTIX'
    s.cycles.device = 'GPU'
    s.cycles.samples = muestras
    s.cycles.use_denoising = True
    s.render.resolution_x = int(W * 100)
    s.render.resolution_y = int(D * 100)
    s.render.film_transparent = True
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    s.view_settings.look = 'AgX - Medium High Contrast'
    s.view_settings.exposure = 0.4
    s.render.filepath = salida
    bpy.ops.render.render(write_still=True)
    print(f'RENDER OK -> {salida}')


main()
