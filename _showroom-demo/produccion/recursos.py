r"""Descarga los recursos de terceros que usa la producción.

Todos son de Poly Haven, licencia CC0 (dominio público): uso comercial libre,
sin atribución obligatoria. https://polyhaven.com/license

Los archivos van a una caché FUERA del repo (pesan cientos de MB y se pueden
volver a bajar). Lo que se versiona es esta lista: qué se usa y de dónde sale.

  python recursos.py            # baja lo que falte
  set SHOWROOM_RECURSOS=D:\cache  (opcional) cambia la carpeta de caché
"""

import hashlib
import json
import os
import sys
import urllib.request
from pathlib import Path

CACHE = Path(os.environ.get('SHOWROOM_RECURSOS', Path.home() / 'tools' / 'recursos-showroom'))
API = 'https://api.polyhaven.com/files/'

# id de Poly Haven -> (tipo, resolución, para qué)
RECURSOS = {
    # Cielo despejado de tarde. El sol lo pone una lámpara alineada.
    'kloofendal_43d_clear_puresky': ('hdri', '4k', 'cielo de fondo y luz ambiente'),
    # Árboles de copa ancha y tronco torcido: lo más cercano al algarrobo y
    # al faique del bosque seco de Lambayeque.
    'island_tree_01': ('modelo', '2k', 'árbol tipo faique en la berma'),
    'island_tree_03': ('modelo', '2k', 'árbol tipo algarrobo, fondo'),
    'jacaranda_tree': ('modelo', '2k', 'árbol de vereda'),
    'tree_small_02': ('modelo', '2k', 'árbol joven en la berma'),
    'fern_02': ('modelo', '2k', 'helechos colgantes de las jardineras'),
    'grass_medium_01': ('modelo', '2k', 'pasto de la berma'),
    'potted_plant_01': ('modelo', '2k', 'macetas de terrazas e interiores'),
    # Interiores (muebles modernos; sofás, camas, cocina y baños son procedurales)
    'modern_coffee_table_01': ('modelo', '2k', 'mesa de centro'),
    'modern_arm_chair_01': ('modelo', '2k', 'sillón de sala'),
    'modern_wooden_cabinet': ('modelo', '2k', 'mueble de TV'),
    'side_table_01': ('modelo', '2k', 'mesas de noche'),
    'potted_plant_02': ('modelo', '2k', 'planta de interior'),
    'potted_plant_04': ('modelo', '2k', 'planta de interior'),
    'large_floor_tiles_02': ('textura', '2k', 'porcelanato de sala y cocina'),
    'grey_tiles': ('textura', '2k', 'cerámico de baños'),
    'laminate_floor_02': ('textura', '2k', 'piso laminado de dormitorios'),
    'wood_table_001': ('textura', '2k', 'madera de muebles y puertas'),
    'marble_01': ('textura', '2k', 'encimera de cocina'),
    # Superficies
    'plastered_wall_04': ('textura', '2k', 'tarrajeo pintado de fachada'),
    'concrete_pavement': ('textura', '2k', 'vereda'),
    'asphalt_02': ('textura', '2k', 'pista'),
    'red_brick_03': ('textura', '2k', 'ladrillo caravista del piso 1'),
    'grass_concrete_pavement': ('textura', '2k', 'piso de cochera'),
    # Ronda de acabado (oct-2026): la vara son los renders de Domaria.
    # Noche: hora azul con nubes (la cámara lo ve; la luz sigue saliendo del cielo físico).
    'qwantani_dusk_2_puresky': ('hdri', '4k', 'cielo de hora azul'),
    # Timelapse de la portada: misma serie fotográfica a distintas horas, así
    # el paso del día a la noche es coherente (luz y cielo del mismo lugar).
    'qwantani_sunset_puresky': ('hdri', '4k', 'atardecer'),
    'kloofendal_48d_partly_cloudy_puresky': ('hdri', '4k', 'día con nubes'),
    'concrete_wall_008': ('textura', '2k', 'muros laterales de cemento de las casas'),
    'qwantani_dusk_1_puresky': ('hdri', '4k', 'crepúsculo'),
    'qwantani_night_puresky': ('hdri', '4k', 'noche con estrellas'),
    # Telas y maderas reales para los muebles procedurales.
    'wool_boucle': ('textura', '2k', 'tapiz del sofá'),
    'rough_linen': ('textura', '2k', 'cortinas, cojines y ropa de cama'),
    'curly_teddy_natural': ('textura', '2k', 'alfombra de pelo'),
    'oak_veneer_01': ('textura', '2k', 'enchapado de roble claro: muebles de cocina, aparador, mesa'),
    'terry_cloth': ('textura', '2k', 'toallas'),
    'interior_tiles': ('textura', '2k', 'enchape de baño'),
    # Accesorios que sí calzan con un departamento actual.
    'modern_ceiling_lamp_01': ('modelo', '2k', 'colgante del comedor'),
    'ceramic_vase_01': ('modelo', '2k', 'jarrón'),
    'ceramic_vase_02': ('modelo', '2k', 'jarrón'),
    'ceramic_vase_03': ('modelo', '2k', 'jarrón alto'),
    'standing_picture_frame_01': ('modelo', '2k', 'cuadro apoyado'),
    'calathea_orbifolia_01': ('modelo', '2k', 'planta de interior'),
    'anthurium_botany_01': ('modelo', '2k', 'planta de interior'),
    'wicker_basket_01': ('modelo', '2k', 'canasta'),
    'shrub_02': ('modelo', '2k', 'arbustos del pozo de luz'),
}

MAPAS_TEXTURA = ('Diffuse', 'nor_gl', 'Rough')


def bajar(url, destino, md5=None):
    destino.parent.mkdir(parents=True, exist_ok=True)
    if destino.exists() and (md5 is None or hashlib.md5(destino.read_bytes()).hexdigest() == md5):
        return False
    req = urllib.request.Request(url, headers={'User-Agent': 'dak-showroom/1.0'})
    with urllib.request.urlopen(req) as r:
        destino.write_bytes(r.read())
    if md5 and hashlib.md5(destino.read_bytes()).hexdigest() != md5:
        raise RuntimeError(f'md5 no coincide: {destino}')
    return True


def info(id_):
    with urllib.request.urlopen(urllib.request.Request(API + id_, headers={'User-Agent': 'dak-showroom/1.0'})) as r:
        return json.load(r)


def main():
    nuevos = 0
    for id_, (tipo, res, _) in RECURSOS.items():
        d = info(id_)
        carpeta = CACHE / id_
        if tipo == 'hdri':
            f = d['hdri'][res]['hdr']
            nuevos += bajar(f['url'], carpeta / Path(f['url']).name, f.get('md5'))
        elif tipo == 'modelo':
            g = d['gltf'][res]['gltf']
            nuevos += bajar(g['url'], carpeta / Path(g['url']).name, g.get('md5'))
            for rel, inc in g['include'].items():
                nuevos += bajar(inc['url'], carpeta / rel, inc.get('md5'))
        else:
            for mapa in MAPAS_TEXTURA:
                f = d[mapa][res]['jpg']
                nuevos += bajar(f['url'], carpeta / Path(f['url']).name, f.get('md5'))
        print(f'  ok  {id_}')
    print(f'{nuevos} archivos nuevos en {CACHE}')


if __name__ == '__main__':
    sys.exit(main())
