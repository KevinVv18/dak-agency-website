"""Pase de realismo con IA sobre los renders de Blender (local, gratis).

Es el mismo recurso que usan los renders de la competencia (archivos «-IA»):
el render base pasa por Stable Diffusion XL con un modelo fotorrealista, en
img2img con poca fuerza y un ControlNet de bordes que fija la geometría. Así
el edificio no se mueve de su sitio y las franjas de piso siguen calzando.

Corre en el entorno de ~/tools/ia-render (PyTorch + diffusers, GPU):
  ~/tools/ia-render/venv/Scripts/python produccion/realismo.py ENTRADA SALIDA --tipo exterior-dia

Modelos (en ~/tools/ia-render/modelos): RealVisXL V5.0, ControlNet canny SDXL y
el VAE corregido para fp16. Se bajan una vez con huggingface_hub.
"""

import argparse
import json
from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image

MODELOS = Path.home() / 'tools' / 'ia-render' / 'modelos'

NEGATIVO = ('cartoon, cgi, 3d render, video game, illustration, painting, drawing, plastic, toy, '
            'blurry, lowres, noise, distorted geometry, deformed, warped lines, text, letters, logo, watermark')

PROMPTS = {
    'exterior-dia': ('professional architectural photography of a modern boutique residential apartment building '
                     'in Chiclayo, Peru, smooth white plaster facade with deep blue painted frames, glass balcony railings, '
                     'hanging green plants, concrete sidewalk, street trees, warm afternoon sunlight, soft shadows, '
                     'clear blue sky, photorealistic, sharp focus, high detail, Canon EOS R5, 24mm lens'),
    'exterior-noche': ('professional architectural night photography of a modern boutique residential apartment building '
                       'in Chiclayo, Peru, blue hour, deep blue sky, warm interior lights glowing through the windows, '
                       'wall washer lights, wet asphalt reflecting the lights, street lamps, photorealistic, long exposure, '
                       'sharp focus, high detail, Canon EOS R5, 24mm lens'),
    'aerea': ('aerial drone photography of a modern boutique residential apartment building in Chiclayo, Peru, '
              'white plaster facade with deep blue frames, rooftop terrace with wooden pergola, surrounding low-rise '
              'neighborhood with flat roofs and black water tanks, warm afternoon sunlight, photorealistic, DJI Mavic 3, '
              'sharp, high detail'),
    'interior': ('professional interior photography of a modern apartment, white walls, light oak wood, linen curtains, '
                 'boucle sofa, warm ceiling lights, soft daylight from the window, photorealistic, sharp, high detail, '
                 'architectural digest, 16mm lens'),
}

_PIPE = None


def tubo():
    global _PIPE
    if _PIPE is None:
        from diffusers import (AutoencoderKL, ControlNetModel, DPMSolverMultistepScheduler,
                               StableDiffusionXLControlNetImg2ImgPipeline)
        cn = ControlNetModel.from_pretrained(MODELOS / 'cn-canny', torch_dtype=torch.float16, variant='fp16')
        vae = AutoencoderKL.from_pretrained(MODELOS / 'vae-fix', torch_dtype=torch.float16)
        p = StableDiffusionXLControlNetImg2ImgPipeline.from_pretrained(
            MODELOS / 'realvisxl5', controlnet=cn, vae=vae, torch_dtype=torch.float16, variant='fp16')
        p.scheduler = DPMSolverMultistepScheduler.from_config(p.scheduler.config, use_karras_sigmas=True)
        p.enable_model_cpu_offload()
        p.vae.enable_tiling()
        _PIPE = p
    return _PIPE


def bordes(img, bajo=60, alto=160):
    g = cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2GRAY)
    b = cv2.Canny(g, bajo, alto)
    return Image.fromarray(np.stack([b] * 3, -1))


def reponer(original, nueva, cajas, margen=0.006):
    """Pega el render original dentro de cada caja (letreros), con borde suave."""
    from PIL import ImageDraw, ImageFilter
    w, h = nueva.size
    mascara = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(mascara)
    for x0, y0, x1, y1 in cajas:
        d.rectangle([(x0 - margen) * w, (y0 - margen * 2) * h, (x1 + margen) * w, (y1 + margen * 2) * h], fill=255)
    mascara = mascara.filter(ImageFilter.GaussianBlur(3))
    return Image.composite(original, nueva, mascara)


def levantar(img, k=1.25, g=0.72):
    """Sube la exposición (ganancia y gamma): el giro nocturno sale oscuro en
    los costados y el barrio, y la IA no recupera lo que no ve."""
    a = np.clip(np.asarray(img).astype(np.float32) / 255 * k, 0, 1) ** g
    return Image.fromarray((a * 255).astype(np.uint8))


def realzar(entrada, salida, tipo='exterior-dia', fuerza=0.35, control=0.7, pasos=32, semilla=7, lado=1536, prompt_extra='', rotulos=None, ganancia=None):
    img = Image.open(entrada).convert('RGB')
    if ganancia:
        img = levantar(img, *ganancia)
    w0, h0 = img.size
    # SDXL trabaja mejor cerca de 1 MP y en múltiplos de 64; se vuelve al tamaño original al final
    k = lado / max(w0, h0)
    w, h = int(round(w0 * k / 64) * 64), int(round(h0 * k / 64) * 64)
    base = img.resize((w, h), Image.LANCZOS)
    p = tubo()
    out = p(prompt=PROMPTS[tipo] + (', ' + prompt_extra if prompt_extra else ''), negative_prompt=NEGATIVO,
            image=base, control_image=bordes(base), strength=fuerza, controlnet_conditioning_scale=control,
            num_inference_steps=pasos, guidance_scale=5.5,
            generator=torch.Generator('cuda').manual_seed(semilla)).images[0]
    out = out.resize((w0, h0), Image.LANCZOS)
    if rotulos is None:
        sidecar = Path(str(entrada) + '.rotulos.json')
        rotulos = json.loads(sidecar.read_text()) if sidecar.exists() else []
    if rotulos:
        out = reponer(img, out, rotulos)
    Path(salida).parent.mkdir(parents=True, exist_ok=True)
    out.save(salida, quality=95)
    return out


def main():
    a = argparse.ArgumentParser()
    a.add_argument('entrada')
    a.add_argument('salida')
    a.add_argument('--tipo', default='exterior-dia', choices=PROMPTS.keys())
    a.add_argument('--fuerza', type=float, default=0.35, help='cuánto se aparta del render (0-1)')
    a.add_argument('--control', type=float, default=0.7, help='cuánto manda la geometría del render')
    a.add_argument('--pasos', type=int, default=32)
    a.add_argument('--semilla', type=int, default=7)
    a.add_argument('--lado', type=int, default=1536)
    a.add_argument('--extra', default='', help='texto extra para el prompt')
    x = a.parse_args()
    realzar(x.entrada, x.salida, x.tipo, x.fuerza, x.control, x.pasos, x.semilla, x.lado, x.extra)
    print(f'REALISMO OK -> {x.salida}')


if __name__ == '__main__':
    main()
