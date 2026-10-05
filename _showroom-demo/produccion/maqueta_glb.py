"""Exporta el edificio (sin barrio) como GLB liviano para ponerlo sobre los
tiles 3D de Google en la entrada desde el cielo.

    blender -b -P produccion/maqueta_glb.py -- --out assets/maqueta/edificio-v1.glb

El origen queda en el centro de la planta, al nivel del suelo; los ejes son los
del modelo (x = ancho de fachada, y = fondo, la fachada mira a -y). Texturas a
512 px y malla comprimida con Draco: a la distancia de la entrada no se nota y
el archivo baja de decenas de megas a unos pocos.
"""
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).resolve().parent))
import edificio as E  # noqa: E402


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    salida = Path(argv[argv.index('--out') + 1] if '--out' in argv else 'edificio.glb').resolve()
    lado = int(argv[argv.index('--lado') + 1]) if '--lado' in argv else 512
    E.limpiar()
    M = E.materiales('1c2c72')
    E.edificio(E.PARAM, M)
    E.cerco(E.PARAM, M)
    bpy.context.view_layer.update()

    # centro de la planta en el origen
    cx, cy = E.PARAM['frente'] / 2, E.PARAM['fondo'] / 2
    for o in bpy.context.scene.objects:
        if o.parent is None:
            o.location.x -= cx
            o.location.y -= cy
    # fuera luces, cámaras y vacíos que no aportan al modelo
    for o in list(bpy.context.scene.objects):
        if o.type not in {'MESH', 'CURVE', 'EMPTY'}:
            bpy.data.objects.remove(o, do_unlink=True)

    # Las texturas del render se proyectan por coordenadas de objeto, sin UV; el
    # glTF necesita UV o el visor no compila el material. Proyección de cubo con
    # el mismo tamaño de mosaico que usa material_tex (2 m), por objeto.
    import bmesh
    for o in bpy.context.scene.objects:
        if o.type != 'MESH' or o.data.uv_layers:
            continue
        bm = bmesh.new()
        bm.from_mesh(o.data)
        uv = bm.loops.layers.uv.new('UVMap')
        for cara in bm.faces:
            n = cara.normal
            eje = max(range(3), key=lambda i: abs(n[i]))
            for lazo in cara.loops:
                v = o.matrix_world @ lazo.vert.co
                u, w = [(v.y, v.z), (v.x, v.z), (v.x, v.y)][eje]
                lazo[uv].uv = (u / 2.0, w / 2.0)
        bm.to_mesh(o.data)
        bm.free()

    # texturas chicas: a esta distancia el detalle de 2k no se ve
    for img in bpy.data.images:
        if img.size[0] > lado and img.has_data:
            img.scale(lado, max(1, round(img.size[1] * lado / img.size[0])))

    salida.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(salida), export_format='GLB', export_apply=True,
        export_image_format='JPEG', export_jpeg_quality=80,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
        export_lights=False, export_cameras=False, export_extras=False,
    )
    print(f'MAQUETA OK -> {salida} ({salida.stat().st_size / 1e6:.1f} MB)')


main()
