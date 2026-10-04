"""Pase de realismo por lote: cuadros del giro 360 y vistas de calle.

  ~/tools/ia-render/venv/Scripts/python produccion/lote_realismo.py RENDERS SALIDA

RENDERS tiene giro/{dia,dia-movil,noche,noche-movil}/fNNN.png (+ rotulos.json)
y calle/*.png (+ .rotulos.json). Todos los cuadros del giro usan la misma
semilla y la misma fuerza: así un cuadro no «hierve» respecto del siguiente.
Lo ya procesado se salta, el lote se puede retomar.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import realismo as R  # noqa: E402

R.PROMPTS.setdefault('aerea-noche', (
    'aerial drone night photography of a modern boutique residential apartment building in Chiclayo, Peru, blue hour, '
    'deep blue sky, warm interior lights glowing through every window, rooftop terrace with string lights, surrounding '
    'low-rise neighborhood with street lights, photorealistic, long exposure, DJI Mavic 3, sharp, high detail'))


def main():
    renders, salida = Path(sys.argv[1]), Path(sys.argv[2])
    solo = sys.argv[3] if len(sys.argv) > 3 else ''
    trabajos = []
    for modo, tipo in (('dia', 'aerea'), ('dia-movil', 'aerea'), ('noche', 'aerea-noche'), ('noche-movil', 'aerea-noche')):
        d = renders / 'giro' / modo
        if not d.exists():
            continue
        rot = json.loads((d / 'rotulos.json').read_text()) if (d / 'rotulos.json').exists() else []
        for f in sorted(d.glob('f*.png')):
            k = int(f.stem[1:])
            trabajos.append((f, salida / 'giro' / modo / f'{f.stem}.jpg', tipo, 0.42, 0.85, 28, 1600, rot[k] if k < len(rot) else [],
                             (1.25, 0.72) if modo.startswith('noche') else None))
    for f in sorted((renders / 'calle').glob('*.png')):
        tipo = 'exterior-noche' if f.name.startswith('noche') else 'exterior-dia'
        trabajos.append((f, salida / 'calle' / f'{f.stem}.jpg', tipo, 0.5, 0.8, 36, 1792, None, None))
    trabajos = [t for t in trabajos if solo in str(t[0]) and not t[1].exists()]
    print(f'{len(trabajos)} imágenes por procesar', flush=True)
    for i, (ent, sal, tipo, fuerza, control, pasos, lado, rot, gan) in enumerate(trabajos):
        R.realzar(ent, sal, tipo, fuerza, control, pasos, 7, lado, '', rot, gan)
        print(f'IA {i + 1}/{len(trabajos)} {sal.relative_to(salida)}', flush=True)
    print('LOTE IA OK', flush=True)


if __name__ == '__main__':
    main()
