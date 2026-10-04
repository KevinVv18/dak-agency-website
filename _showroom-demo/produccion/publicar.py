"""Convierte los renders finales (con su pase de realismo) en assets web.

  python produccion/publicar.py RENDERS IA --version 2

- giro/{modo}/fNNN.jpg  -> assets/giro/{modo}-vN/fNNN.webp
- franjas de los cuadros -> datos/giro.json (las de noche son las mismas cámaras)
- calle/*.jpg           -> assets/exterior/<vista>-<modo>[-movil][-fantasma]-vN.webp
- planta_piso1.png / planta_azotea.png -> assets/plantas/{piso1,azotea}-vN.webp

Reemplazar una imagen publicada exige un nombre nuevo (el .htaccess cachea
por meses): por eso todo lleva la versión en el nombre.
"""

import argparse
import json
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
VISTAS = {'frente': 'frente', 'diag_izq': 'diagonal-izq', 'diag_der': 'diagonal-der'}


def webp(src, dst, calidad=84):
    dst.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(src)
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGB')
    im.save(dst, quality=calidad, method=6)


def main():
    a = argparse.ArgumentParser()
    a.add_argument('renders')
    a.add_argument('ia')
    a.add_argument('--version', default='2')
    x = a.parse_args()
    renders, ia, v = Path(x.renders), Path(x.ia), x.version
    hechos = 0
    # giro 360
    giro = {}
    for modo in ('dia', 'dia-movil', 'noche', 'noche-movil'):
        cuadros = sorted((ia / 'giro' / modo).glob('f*.jpg'))
        if not cuadros:
            continue
        for f in cuadros:
            webp(f, RAIZ / 'assets' / 'giro' / f'{modo}-v{v}' / f'{f.stem}.webp', 80)
            hechos += 1
        giro[modo] = len(cuadros)
    fr = {}
    for modo, clave in (('dia', 'franjas'), ('dia-movil', 'franjasMovil')):
        p = renders / 'giro' / modo / 'franjas.json'
        if p.exists():
            fr[clave] = json.loads(p.read_text())
    if fr:
        (RAIZ / 'datos' / 'giro.json').write_text(json.dumps(fr), encoding='utf8')
    # vistas de calle
    for f in sorted((ia / 'calle').glob('*.jpg')):
        partes = f.stem.split('_')            # dia_web_diag_izq[_fantasma]
        modo, formato = partes[0], partes[1]
        fantasma = partes[-1] == 'fantasma'
        vista = '_'.join(partes[2:-1] if fantasma else partes[2:])
        nombre = f"{VISTAS[vista]}-{modo}{'-movil' if formato == 'movil' else ''}{'-fantasma' if fantasma else ''}-v{v}.webp"
        webp(f, RAIZ / 'assets' / 'exterior' / nombre)
        hechos += 1
    # plantas de piso 1 y azotea
    for src, nombre in (('planta_piso1.png', 'piso1'), ('planta_azotea.png', 'azotea')):
        if (renders / src).exists():
            webp(renders / src, RAIZ / 'assets' / 'plantas' / f'{nombre}-v{v}.webp', 88)
            hechos += 1
    print(f'PUBLICADO: {hechos} imágenes · giro {giro}')


if __name__ == '__main__':
    main()
