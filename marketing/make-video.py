# Monte le carrousel de lancement en une vidéo 9:16 pour TikTok et Snap.
#   pip install imageio-ffmpeg  (il embarque son propre ffmpeg statique)
#   python3 make-video.py
# Volontairement MUETTE : TikTok et Snap veulent qu'on ajoute leur son depuis
# l'app — c'est ce qui pousse la vidéo dans l'algorithme, et ça évite un
# signalement pour les droits. Un son incrusté dans le fichier fait les deux
# erreurs à la fois.
import imageio_ffmpeg, subprocess, os
FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lancement') + os.sep
slides = ['01-accroche','02-espace','03-demande','04-prix','05-achat','06-suivi','07-dollarz','08-cta']
HOLD, XF, FPS = 3.4, 0.40, 30
FR = int(HOLD*FPS)
BG = '0xfbfcfa'   # le fond des visuels : on fond au blanc cassé, pas au noir

cmd = [FF, '-y']
for s in slides:
    cmd += ['-loop','1','-framerate',str(FPS),'-t',str(HOLD),'-i',SRC+s+'.png']

# Zoom lent, alterné d'une slide à l'autre : zoompan cadre dans la source 2160
# et sort en 1080, donc on ne fait jamais qu'AGRANDIR une image déjà deux fois
# plus grande que la sortie — le texte reste net de bout en bout.
parts = []
for i in range(len(slides)):
    z = (f"'min(1+0.030*on/{FR-1},1.030)'" if i % 2 == 0
         else f"'max(1.030-0.030*on/{FR-1},1)'")
    parts.append(
        # d=1 est capital : zoompan sort d images PAR image reçue. Avec d=FR sur
        # un flux de FR images, on obtenait FR x FR images par slide — six minutes
        # de vidéo au lieu de vingt-quatre secondes.
        f"[{i}:v]zoompan=z={z}:d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        f":s=1080x1920:fps={FPS},setsar=1[v{i}]")

prev, L = 'v0', HOLD
for k in range(1, len(slides)):
    off = round(L - XF, 3)
    out = f'x{k}'
    # Glissement, pas fondu enchaîné : sur des slides de TEXTE, un fondu
    # superpose deux titres pendant une demi-seconde et ne se lit plus.
    # Le glissement garde chaque texte net, et imite le geste de balayer
    # le carrousel — c'est le même contenu, dans le même ordre.
    parts.append(f"[{prev}][v{k}]xfade=transition=slideleft:duration={XF}:offset={off}[{out}]")
    prev, L = out, L + HOLD - XF

parts.append(f"[{prev}]fade=t=in:st=0:d=0.45:color={BG},"
             f"fade=t=out:st={round(L-0.6,3)}:d=0.6:color={BG}[vout]")

cmd += ['-filter_complex', ';'.join(parts), '-map','[vout]',
        '-c:v','libx264','-profile:v','high','-preset','slow','-crf','16',
        '-pix_fmt','yuv420p','-movflags','+faststart','-r',str(FPS),
        'dollars-sourcing.mp4']
print('durée visée :', round(L,2), 's')
r = subprocess.run(cmd, capture_output=True, text=True)
print(r.stderr[-1200:] if r.returncode else 'OK')
