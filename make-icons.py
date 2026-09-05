#!/usr/bin/env python3
"""Regénère les icônes de l'app à partir de icon-source.png.

    pip install pillow && python3 make-icons.py

Deux pièges, tous deux invisibles tant que l'app n'est pas installée :

1. **Une icône transparente est composée sur du noir par iOS.** Les coins
   arrondis de la tuile laisseraient donc quatre angles noirs. On prolonge
   chaque ligne et chaque colonne par sa couleur de bord : le vert y est déjà
   le bon, dégradé compris, et le carré devient plein.

2. **iOS applique SON masque arrondi par-dessus**, au même rayon que celui déjà
   dessiné dans l'image. Le liseré de l'ancien arrondi resterait visible juste
   à l'intérieur du masque. Le léger agrandissement (ZOOM) le pousse hors champ
   sans rogner le dessin.
"""
from PIL import Image

SOURCE = 'icon-source.png'
ZOOM   = 1.12
SIZES  = [('icon-512.png', 512), ('icon-192.png', 192), ('apple-touch-icon.png', 180)]

im = Image.open(SOURCE).convert('RGBA')
# L'image d'origine porte une marge transparente et une ombre portée : une icône
# d'application n'en a que faire, les systèmes posent la leur.
alpha = im.split()[3]
im = im.crop(alpha.point(lambda v: 255 if v > 200 else 0).getbbox())

w, h = im.size
S = max(w, h)
sq = Image.new('RGBA', (S, S), (0, 0, 0, 0))
sq.paste(im, ((S - w) // 2, (S - h) // 2))
px = sq.load()

def extend_cols():
    for x in range(S):
        ys = [y for y in range(S) if px[x, y][3] > 128]
        if not ys: continue
        t, b = ys[0], ys[-1]
        ct, cb = px[x, t][:3], px[x, b][:3]
        for y in range(0, t):    px[x, y] = ct + (255,)
        for y in range(b + 1, S): px[x, y] = cb + (255,)

def extend_rows():
    for y in range(S):
        xs = [x for x in range(S) if px[x, y][3] > 128]
        if not xs: continue
        l, r = xs[0], xs[-1]
        cl, cr = px[l, y][:3], px[r, y][:3]
        for x in range(0, l):    px[x, y] = cl + (255,)
        for x in range(r + 1, S): px[x, y] = cr + (255,)

extend_cols()
extend_rows()

big = sq.convert('RGB').resize((int(S * ZOOM), int(S * ZOOM)), Image.LANCZOS)
off = (big.width - S) // 2
flat = big.crop((off, off, off + S, off + S))

for name, size in SIZES:
    flat.resize((size, size), Image.LANCZOS).save(name, optimize=True)
    print(name, size)
