#!/usr/bin/env python3
"""Genera candidatos de hero para el demo inmobiliario.

Por cada foto candidata (villa/casa moderna al atardecer, buscada en Openverse
sin API key) produce:
  - {i}-plate.webp   : foto graduada (look atardecer) — capa de fondo
  - {i}-house.webp   : recorte con alfa (rembg) — capa que tapa las letras
  - {i}-compose.webp : preview del efecto (NORVIA detrás de la casa)
y una hoja de contactos contact.webp + credits.json.
"""
import io, json, os, sys
import requests
from PIL import Image, ImageEnhance, ImageDraw, ImageFont, ImageFilter
from rembg import remove, new_session

OUT = "_inmobiliaria-demo/_herocand"
os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "DAK-Agency-demo-asset-bot/1.0 (contact: marketing@dakagency.net)"}
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

QUERIES = [
    "modern house dusk exterior lights",
    "luxury villa twilight pool",
    "contemporary home evening facade",
    "modern architecture house night",
    "villa sunset reflection water",
    "modern mansion blue hour",
]


def openverse_candidates(limit=26):
    seen, out = set(), []
    for q in QUERIES:
        try:
            r = requests.get(
                "https://api.openverse.org/v1/images/",
                params={
                    "q": q, "license_type": "commercial", "aspect_ratio": "wide",
                    "size": "large", "page_size": 12, "mature": "false",
                },
                headers=UA, timeout=30,
            )
            r.raise_for_status()
            for it in r.json().get("results", []):
                u = it.get("url")
                if not u or u in seen:
                    continue
                seen.add(u)
                out.append(it)
                if len(out) >= limit:
                    return out
        except Exception as e:
            print(f"  query '{q}' fallo: {e}")
    return out


def fetch_image(url):
    try:
        r = requests.get(url, headers=UA, timeout=45, stream=True)
        r.raise_for_status()
        ct = r.headers.get("content-type", "")
        if "image" not in ct:
            return None
        im = Image.open(io.BytesIO(r.content)).convert("RGB")
        return im
    except Exception as e:
        print(f"  descarga fallo: {e}")
        return None


def grade(im):
    """Look atardecer: baja exposicion, sube contraste/saturacion, calienta."""
    im = ImageEnhance.Brightness(im).enhance(0.78)
    im = ImageEnhance.Contrast(im).enhance(1.10)
    im = ImageEnhance.Color(im).enhance(1.12)
    # calidez sutil en todo el cuadro
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * 1.05)))
    b = b.point(lambda v: int(v * 0.97))
    return Image.merge("RGB", (r, g, b))


def compose_preview(plate, cutout, W=920):
    ar = plate.height / plate.width
    H = int(W * ar)
    base = plate.resize((W, H), Image.LANCZOS).convert("RGBA")

    # NORVIA detras
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    try:
        font = ImageFont.truetype(FONT_PATH, int(W * 0.205))
    except Exception:
        font = ImageFont.load_default()
    word = "NORVIA"
    tb = d.textbbox((0, 0), word, font=font)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    tx = (W - tw) // 2 - tb[0]
    ty = int(H * 0.60) - th - tb[1]  # baseline ~60% alto
    d.text((tx, ty), word, font=font, fill=(246, 240, 228, 205))
    base = Image.alpha_composite(base, layer)

    # casa encima
    cut = cutout.resize((W, H), Image.LANCZOS)
    base = Image.alpha_composite(base, cut)

    # scrim inferior
    scrim = Image.new("L", (1, H), 0)
    for y in range(H):
        t = max(0.0, (y / H - 0.55) / 0.45)
        scrim.putpixel((0, y), int(200 * t * t))
    scrim = scrim.resize((W, H))
    dark = Image.new("RGBA", (W, H), (8, 10, 13, 255))
    dark.putalpha(scrim)
    base = Image.alpha_composite(base, dark)
    return base.convert("RGB")


def main():
    cands = openverse_candidates()
    print(f"Openverse devolvio {len(cands)} candidatos")
    session = new_session("u2net")
    kept, credits = [], []
    idx = 0
    for it in cands:
        if idx >= 10:
            break
        im = fetch_image(it["url"])
        if im is None:
            continue
        w, h = im.size
        ar = w / h
        if w < 1500 or not (1.3 <= ar <= 2.05):
            print(f"  descartado por tamaño/aspecto {w}x{h}")
            continue
        # normaliza a ancho 1760
        tw = 1760
        im = im.resize((tw, int(tw * h / w)), Image.LANCZOS)
        plate = grade(im)
        try:
            cut_bytes = remove(im, session=session)
            cutout = cut_bytes if isinstance(cut_bytes, Image.Image) else Image.open(io.BytesIO(cut_bytes))
            cutout = cutout.convert("RGBA")
        except Exception as e:
            print(f"  rembg fallo: {e}")
            continue
        plate.save(f"{OUT}/{idx}-plate.webp", quality=82, method=6)
        cutout.save(f"{OUT}/{idx}-house.webp", quality=82, method=6)
        compose_preview(plate, cutout).save(f"{OUT}/{idx}-compose.webp", quality=85, method=6)
        credits.append({
            "index": idx,
            "title": it.get("title"),
            "creator": it.get("creator"),
            "license": f"{it.get('license','')} {it.get('license_version','')}".strip(),
            "source": it.get("source"),
            "landing": it.get("foreign_landing_url"),
        })
        print(f"  [{idx}] OK  {it.get('creator')} — {it.get('license')}")
        kept.append(idx)
        idx += 1

    if not kept:
        print("NO se generó ningún candidato")
        sys.exit(1)

    # hoja de contactos
    thumbs = []
    cw = 560
    for i in kept:
        c = Image.open(f"{OUT}/{i}-compose.webp").convert("RGB")
        ch = int(cw * c.height / c.width)
        c = c.resize((cw, ch), Image.LANCZOS)
        bar = Image.new("RGB", (cw, 34), (176, 36, 255))
        db = ImageDraw.Draw(bar)
        try:
            f = ImageFont.truetype(FONT_PATH, 22)
        except Exception:
            f = ImageFont.load_default()
        db.text((10, 4), f"#{i}", font=f, fill=(255, 255, 255))
        cell = Image.new("RGB", (cw, ch + 34), (12, 14, 17))
        cell.paste(bar, (0, 0))
        cell.paste(c, (0, 34))
        thumbs.append(cell)

    cols = 2
    rows = (len(thumbs) + cols - 1) // cols
    cellw = cw
    cellh = max(t.height for t in thumbs)
    sheet = Image.new("RGB", (cols * cellw + (cols + 1) * 12, rows * cellh + (rows + 1) * 12), (6, 8, 10))
    for n, t in enumerate(thumbs):
        r_, c_ = divmod(n, cols)
        sheet.paste(t, (12 + c_ * (cellw + 12), 12 + r_ * (cellh + 12)))
    sheet.save(f"{OUT}/contact.webp", quality=86, method=6)

    with open(f"{OUT}/credits.json", "w") as f:
        json.dump(credits, f, ensure_ascii=False, indent=2)
    print(f"Listo: {len(kept)} candidatos -> {OUT}")


if __name__ == "__main__":
    main()
