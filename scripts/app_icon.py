#!/usr/bin/env python3
"""Erzeugt App-Icon und Startbildschirm (Splash) für die iPhone-App.

Aufruf aus dem Projektordner:  python3 scripts/app_icon.py

Schreibt nach assets/:
  icon-1024.png      App-Store-Icon, ohne Transparenz, ohne runde Ecken (iOS maskiert selbst)
  icon-512.png, icon-180.png, favicon-32.png, favicon.ico   daraus abgeleitet
  splash-2732.png    Startbildschirm hell, quadratisch, Motiv mittig (Capacitor-Standard)
  splash-2732-dark.png   dieselbe Fläche für den Dunkelmodus

Braucht Pillow und fontTools mit brotli (für die woff2-Schriften aus fonts/).
"""

import io
import math
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

WURZEL = Path(__file__).resolve().parent.parent
ASSETS = WURZEL / 'assets'

INK = (20, 20, 20)
PAPER = (251, 248, 241)
WHITE = (255, 255, 255)
RED = (215, 38, 30)
YELLOW = (255, 210, 63)
DUNKEL = (24, 23, 20)


def schrift_laden(woff2: Path) -> bytes:
    """woff2 → TTF-Bytes, damit Pillow die Schrift lesen kann."""
    f = TTFont(str(woff2))
    f.flavor = None
    puffer = io.BytesIO()
    f.save(puffer)
    return puffer.getvalue()


DELA = schrift_laden(WURZEL / 'fonts' / 'DelaGothicOne-400-05d100.woff2')


def font(daten: bytes, groesse: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(io.BytesIO(daten), groesse)


def rasterpunkte(bild: Image.Image, farbe, alpha: int, raster: int, radius: int):
    """Halbton-Punkte wie der App-Hintergrund."""
    ebene = Image.new('RGBA', bild.size, (0, 0, 0, 0))
    z = ImageDraw.Draw(ebene)
    for y in range(raster // 2, bild.height, raster):
        for x in range(raster // 2, bild.width, raster):
            z.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*farbe, alpha))
    bild.alpha_composite(ebene)


def speedlines(bild: Image.Image, mitte, innen: int, aussen: int, farbe, alpha: int, anzahl=48):
    """Strahlen aus der Mitte, nach außen hin kräftiger."""
    ebene = Image.new('RGBA', bild.size, (0, 0, 0, 0))
    z = ImageDraw.Draw(ebene)
    cx, cy = mitte
    for i in range(anzahl):
        a = i / anzahl * math.tau
        b = 0.012
        weit = aussen * 1.6
        z.polygon([
            (cx + math.cos(a) * innen, cy + math.sin(a) * innen),
            (cx + math.cos(a - b) * weit, cy + math.sin(a - b) * weit),
            (cx + math.cos(a + b) * weit, cy + math.sin(a + b) * weit),
        ], fill=(*farbe, alpha))
    # Zur Mitte hin ausblenden
    maske = Image.new('L', bild.size, 0)
    mz = ImageDraw.Draw(maske)
    schritte = 40
    for s in range(schritte, 0, -1):
        r = innen + (aussen - innen) * s / schritte
        mz.ellipse((cx - r * 1.6, cy - r * 1.6, cx + r * 1.6, cy + r * 1.6), fill=int(255 * s / schritte))
    ebene.putalpha(Image.eval(ebene.getchannel('A'), lambda v: v))
    ebene = Image.composite(ebene, Image.new('RGBA', bild.size, (0, 0, 0, 0)), maske)
    bild.alpha_composite(ebene)


def maskottchen(name: str, hoehe: int) -> Image.Image:
    """Freigestelltes Maskottchen auf Zielhöhe, auf den sichtbaren Bereich beschnitten.
    Für „entschlossen“ liegt eine 2160er-Fassung bereit (Higgsfield-Upscale, Alpha vom Original)."""
    gross = ASSETS / 'maskottchen-2160.webp'
    quelle = gross if name == 'entschlossen' and gross.exists() else ASSETS / 'stimmung' / f'{name}.webp'
    bild = Image.open(quelle).convert('RGBA')
    bild = bild.crop(bild.getbbox())
    faktor = hoehe / bild.height
    return bild.resize((round(bild.width * faktor), hoehe), Image.LANCZOS)


def text_mit_rand(z: ImageDraw.ImageDraw, pos, text, schrift, fuellung, rand=None, randbreite=0, anker='la'):
    if rand and randbreite:
        z.text(pos, text, font=schrift, fill=rand, stroke_width=randbreite, stroke_fill=rand, anchor=anker)
    z.text(pos, text, font=schrift, fill=fuellung, anchor=anker)


def logo(ziel: Image.Image, mitte, skala: float, dunkel=False):
    """SENPAI auf hellem Block, QUIZ als roter, leicht gedrehter Kasten. Höhe etwa 330 × skala."""
    cx, cy = mitte
    tinte = WHITE if dunkel else INK
    # SENPAI
    f1 = font(DELA, int(150 * skala))
    z = ImageDraw.Draw(ziel)
    breite = z.textlength('SENPAI', font=f1)
    if not dunkel:
        z.rectangle((cx - breite / 2 - 20 * skala, cy - 190 * skala, cx + breite / 2 + 20 * skala, cy - 20 * skala), fill=WHITE)
    z.text((cx, cy - 105 * skala), 'SENPAI', font=f1, fill=tinte, anchor='mm')
    # QUIZ, gedreht
    f2 = font(DELA, int(122 * skala))
    qb = int(z.textlength('QUIZ', font=f2) + 70 * skala)
    qh = int(146 * skala)
    rand = int(9 * skala)
    kasten = Image.new('RGBA', (qb + rand * 2 + 40, qh + rand * 2 + 40), (0, 0, 0, 0))
    kz = ImageDraw.Draw(kasten)
    kz.rounded_rectangle((20, 20, 20 + qb + rand * 2, 20 + qh + rand * 2), radius=int(14 * skala), fill=tinte)
    kz.rounded_rectangle((20 + rand, 20 + rand, 20 + rand + qb, 20 + rand + qh), radius=int(10 * skala), fill=RED)
    kz.text((kasten.width / 2, kasten.height / 2 + 4 * skala), 'QUIZ', font=f2, fill=WHITE, anchor='mm')
    kasten = kasten.rotate(4, resample=Image.BICUBIC, expand=True)
    ziel.alpha_composite(kasten, (int(cx - kasten.width / 2), int(cy + 90 * skala - kasten.height / 2)))


def icon() -> Image.Image:
    g = 1024
    bild = Image.new('RGBA', (g, g), (*RED, 255))
    rasterpunkte(bild, INK, 34, 44, 6)
    speedlines(bild, (512, 560), 330, 620, YELLOW, 110)
    z = ImageDraw.Draw(bild)
    # gelbe Scheibe mit Tusche-Rand und hartem Schatten
    cx, cy, r = 512, 548, 392
    z.ellipse((cx - r + 22, cy - r + 22, cx + r + 22, cy + r + 22), fill=INK)
    z.ellipse((cx - r, cy - r, cx + r, cy + r), fill=YELLOW, outline=INK, width=18)
    m = maskottchen('entschlossen', 760)
    bild.alpha_composite(m, (int(cx - m.width / 2), int(cy - m.height / 2 + 30)))
    return bild.convert('RGB')


def splash(dunkel: bool) -> Image.Image:
    g = 2732
    hintergrund = DUNKEL if dunkel else PAPER
    bild = Image.new('RGBA', (g, g), (*hintergrund, 255))
    rasterpunkte(bild, WHITE if dunkel else INK, 22 if dunkel else 26, 44, 5)
    cx, cy = g // 2, g // 2
    # Sichtbarer Streifen auf schmalen iPhones: etwa 1260 Pixel breit, deshalb bleibt alles innerhalb von 1100
    logo(bild, (cx, cy - 400), 1.35, dunkel)
    m = maskottchen('entschlossen', 780)
    bild.alpha_composite(m, (int(cx - m.width / 2), cy - 40))
    return bild.convert('RGB')


def main():
    ic = icon()
    ic.save(ASSETS / 'icon-1024.png', optimize=True)
    ic.resize((512, 512), Image.LANCZOS).quantize(256, method=Image.Quantize.MEDIANCUT).save(ASSETS / 'icon-512.png', optimize=True)
    ic.resize((180, 180), Image.LANCZOS).save(ASSETS / 'icon-180.png', optimize=True)
    klein = ic.resize((32, 32), Image.LANCZOS)
    klein.save(ASSETS / 'favicon-32.png', optimize=True)
    ic.save(ASSETS / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    splash(False).save(ASSETS / 'splash-2732.png', optimize=True)
    splash(True).save(ASSETS / 'splash-2732-dark.png', optimize=True)
    for name in ['icon-1024.png', 'icon-512.png', 'icon-180.png', 'favicon-32.png', 'favicon.ico', 'splash-2732.png', 'splash-2732-dark.png']:
        print(f'{name:22} {(ASSETS / name).stat().st_size / 1024:7.0f} KB')


if __name__ == '__main__':
    main()
