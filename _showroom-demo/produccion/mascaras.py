"""Franjas de piso sobre los renders exteriores.

Proyecta la caja de cada piso del edificio procedural con la misma cámara que
produjo cada render (VISTAS de edificio.py) y guarda el contorno en coordenadas
de imagen normalizadas (0-1, origen arriba a la izquierda). Así la franja que
se ilumina en la web calza exacta sobre la fachada: sale de la geometría, no
de un dibujo a mano.

  blender -b -P mascaras.py -- --out mascaras.json
No renderiza nada: solo arma las cámaras, tarda segundos.
"""

import json
import sys
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).parent))
import edificio as E  # noqa: E402

# vista del render -> (ancho, alto) con que se produjo
CAMARAS = {
    'web_frente': (1920, 1080), 'web_diag_izq': (1920, 1080), 'web_diag_der': (1920, 1080), 'web_aerea': (1920, 1080),
    'movil_frente': (1080, 1920), 'movil_diag_izq': (1080, 1920), 'movil_diag_der': (1080, 1920), 'movil_aerea': (1080, 1920),
}


def pisos(P):
    """id de piso -> (z0, z1). El piso 1 queda detrás del cerco; la azotea es
    la franja de terrazas sobre el último piso."""
    out = {'1': (0.0, P['h_piso1'])}
    for i in range(P['pisos']):
        z0 = P['h_piso1'] + i * P['h_piso']
        out[str(i + 2)] = (z0, z0 + P['h_piso'])
    z_top = P['h_piso1'] + P['pisos'] * P['h_piso']
    out['azotea'] = (z_top, z_top + 2.8)
    return out


def envolvente(puntos):
    """Envolvente convexa (Andrew) de puntos 2D."""
    pts = sorted(set(puntos))
    if len(pts) < 3:
        return pts

    def cruz(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    inf, sup = [], []
    for p in pts:
        while len(inf) >= 2 and cruz(inf[-2], inf[-1], p) <= 0:
            inf.pop()
        inf.append(p)
    for p in reversed(pts):
        while len(sup) >= 2 and cruz(sup[-2], sup[-1], p) <= 0:
            sup.pop()
        sup.append(p)
    return inf[:-1] + sup[:-1]


def franjas_camara(s, cam):
    """Contorno de cada piso visto desde `cam` (coordenadas de imagen 0-1)."""
    P = E.PARAM
    W, D, v = P['frente'], P['fondo'], P['vuelo']
    ojo = cam.matrix_world.translation
    yf = -v / 2       # plano de fachada (entre el muro y el vuelo de los balcones)
    yb = D + v / 2    # la posterior es la delantera reflejada
    # caras verticales del edificio: (normal, esquinas en planta)
    caras = [((0, -1, 0), [(0, yf), (W, yf)]), ((-1, 0, 0), [(0, yf), (0, yb)]),
             ((1, 0, 0), [(W, yf), (W, yb)]), ((0, 1, 0), [(0, yb), (W, yb)])]
    franjas = {}
    for pid, (z0, z1) in pisos(P).items():
        esquinas = []
        for n, planta in caras:
            cx = sum(p[0] for p in planta) / 2
            cy = sum(p[1] for p in planta) / 2
            # solo las caras que miran a la cámara
            if n[0] * (ojo.x - cx) + n[1] * (ojo.y - cy) <= 0:
                continue
            esquinas += [Vector((x, y, z)) for x, y in planta for z in (z0, z1)]
        proy = [world_to_camera_view(s, cam, c) for c in esquinas]
        pts = [(round(p.x, 4), round(1 - p.y, 4)) for p in proy if p.z > 0]
        franjas[pid] = [[x, y] for x, y in envolvente(pts)]
    return franjas


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    salida = argv[argv.index('--out') + 1] if '--out' in argv else 'mascaras.json'
    resultado = {}
    for vista, (ancho, alto) in CAMARAS.items():
        E.limpiar()
        E.camara(vista)
        s = bpy.context.scene
        s.render.resolution_x, s.render.resolution_y = ancho, alto
        bpy.context.view_layer.update()
        resultado[vista] = franjas_camara(s, s.camera)
    Path(salida).write_text(json.dumps(resultado, indent=1), encoding='utf8')
    print(f'MASCARAS OK -> {salida}')


if __name__ == '__main__':
    main()
