#!/usr/bin/env python3
"""Segunda pasada: aplica el efecto a fotos de propiedad ya presentes en el
demo (profesionales, ya licenciadas). Recorta con rembg y compone el preview."""
import io, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFont
from rembg import remove, new_session

A = "_inmobiliaria-demo/assets"
OUT = "_inmobiliaria-demo/_herocand"
os.makedirs(OUT, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SRC = ["prop-cabana", "prop-casa-clasica", "prop-casa-minimalista"]


def grade(im):
    # ya son fotos de atardecer: gradación suave + leve calidez
    im = ImageEnhance.Brightness(im).enhance(0.88)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    im = ImageEnhance.Color(im).enhance(1.06)
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * 1.03)))
    b = b.point(lambda v: int(v * 0.98))
    return Image.merge("RGB", (r, g, b))


def compose(plate, cutout, baseline, W=920):
    ar = plate.height / plate.width
    H = int(W * ar)
    base = plate.resize((W, H), Image.LANCZOS).convert("RGBA")
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    font = ImageFont.truetype(FONT, int(W * 0.20))
    word = "NORVIA"
    tb = d.textbbox((0, 0), word, font=font)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    d.text(((W - tw) // 2 - tb[0], int(H * baseline) - th - tb[1]),
           word, font=font, fill=(247, 241, 229, 210))
    base = Image.alpha_composite(base, layer)
    base = Image.alpha_composite(base, cutout.resize((W, H), Image.LANCZOS))
    # scrim inferior
    sc = Image.new("L", (1, H), 0)
    for y in range(H):
        t = max(0.0, (y / H - 0.5) / 0.5)
        sc.putpixel((0, y), int(210 * t * t))
    dark = Image.new("RGBA", (W, H), (8, 10, 13, 255))
    dark.putalpha(sc.resize((W, H)))
    return Image.alpha_composite(base, dark).convert("RGB")


def main():
    session = new_session("u2net")
    cells = []
    for name in SRC:
        im = Image.open(f"{A}/{name}.webp").convert("RGB")
        plate = grade(im)
        cut = remove(im, session=session)
        cut = cut if isinstance(cut, Image.Image) else Image.open(io.BytesIO(cut))
        cut = cut.convert("RGBA")
        plate.save(f"{OUT}/local-{name}-plate.webp", quality=84, method=6)
        cut.save(f"{OUT}/local-{name}-house.webp", quality=84, method=6)
        comp = compose(plate, cut, 0.56)
        comp.save(f"{OUT}/local-{name}-compose.webp", quality=86, method=6)
        cells.append((name, comp))
        print(f"OK {name}")

    # contact sheet vertical
    W = 900
    thumbs = []
    for name, c in cells:
        ch = int(W * c.height / c.width)
        c = c.resize((W, ch))
        bar = Image.new("RGB", (W, 34), (176, 36, 255))
        ImageDraw.Draw(bar).text((10, 5), name, fill=(255, 255, 255),
                                 font=ImageFont.truetype(FONT, 20))
        cell = Image.new("RGB", (W, ch + 34), (12, 14, 17))
        cell.paste(bar, (0, 0)); cell.paste(c, (0, 34))
        thumbs.append(cell)
    H = sum(t.height for t in thumbs) + 12 * (len(thumbs) + 1)
    sheet = Image.new("RGB", (W + 24, H), (6, 8, 10))
    y = 12
    for t in thumbs:
        sheet.paste(t, (12, y)); y += t.height + 12
    sheet.save(f"{OUT}/local-contact.webp", quality=88, method=6)
    print("contact listo")


if __name__ == "__main__":
    main()
