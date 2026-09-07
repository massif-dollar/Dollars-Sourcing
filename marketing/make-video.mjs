// La vidéo du carrousel, montée à partir des mêmes affiches que les images
// fixes (voir slides.mjs) mais jouées, image par image.
//
//   node make-video.mjs
//
// Il faut un ffmpeg. Au choix : celui du système, celui désigné par $FFMPEG,
// ou `pip install imageio-ffmpeg` qui en embarque un statique.
//
// Pourquoi capturer dans le navigateur plutôt que d'animer dans ffmpeg : le
// mouvement qu'on veut n'est pas un mouvement d'IMAGE (zoom, glissement) mais
// un mouvement d'ÉLÉMENTS — le titre, puis le problème, puis la solution,
// puis la preuve. Seul le navigateur sait où sont ces éléments.
//
// La capture est déterministe : on met en pause toutes les animations et on
// pose `currentTime` à la main pour chaque image. Rien ne dépend de la vitesse
// de la machine, et deux rendus donnent le même fichier.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { shell, slides } from './slides.mjs';

const FPS = 30, HOLD = 3.4, XF = 0.40;
const FRAMES = Math.round(HOLD * FPS);
const BG = '0xfbfcfa';                 // le fond des affiches, jamais du noir
const OUT = 'dollars-sourcing.mp4';
const DIR = 'frames';
// L'affiche 9 est un post autonome, elle n'entre pas dans le carrousel.
const used = slides.filter(([n]) => !n.startsWith('09'));

function ffmpeg(){
  if(process.env.FFMPEG) return process.env.FFMPEG;
  try{ execFileSync('ffmpeg', ['-version'], { stdio:'ignore' }); return 'ffmpeg'; }catch{}
  try{
    return execFileSync('python3',
      ['-c','import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'],
      { encoding:'utf8' }).trim();
  }catch{}
  throw new Error("ffmpeg introuvable : installe-le, ou `pip install imageio-ffmpeg`.");
}

fs.rmSync(DIR, { recursive:true, force:true });
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

for(const [i, [name, html]] of used.entries()){
  const dir = path.join(DIR, String(i).padStart(2,'0'));
  fs.mkdirSync(dir, { recursive:true });
  // Capture à la taille finale : le texte est rendu pour 1080 de large, il
  // n'est jamais redimensionné après coup.
  const p = await b.newPage({ viewport:{ width:1080, height:1920 }, deviceScaleFactor:1 });
  await p.setContent(shell(html, true));
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  for(let f = 0; f < FRAMES; f++){
    await p.evaluate(ms => document.getAnimations().forEach(a => { a.currentTime = ms; }),
                     (f / FPS) * 1000);
    await p.screenshot({ path: path.join(dir, String(f).padStart(4,'0') + '.png') });
  }
  await p.close();
  console.log(name, FRAMES + ' images');
}
await b.close();

// Assemblage. Glissement latéral et non fondu enchaîné : sur des affiches de
// TEXTE, un fondu superpose deux titres pendant une demi-seconde et plus rien
// ne se lit — et le glissement imite le geste de balayer le carrousel.
const args = ['-y'];
for(let i = 0; i < used.length; i++)
  args.push('-framerate', String(FPS), '-i', path.join(DIR, String(i).padStart(2,'0'), '%04d.png'));

const parts = [];
let prev = '0:v', L = HOLD;
for(let k = 1; k < used.length; k++){
  const out = 'x' + k;
  parts.push(`[${prev}][${k}:v]xfade=transition=slideleft:duration=${XF}:offset=${(L - XF).toFixed(3)}[${out}]`);
  prev = out; L += HOLD - XF;
}
parts.push(`[${prev}]fade=t=in:st=0:d=0.45:color=${BG},`
         + `fade=t=out:st=${(L - 0.6).toFixed(3)}:d=0.6:color=${BG},format=yuv420p[v]`);

args.push('-filter_complex', parts.join(';'), '-map', '[v]',
          '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '16',
          '-movflags', '+faststart', '-r', String(FPS), OUT);

console.log('assemblage — durée visée : ' + L.toFixed(2) + ' s');
execFileSync(ffmpeg(), args, { stdio:['ignore','ignore','pipe'] });
fs.rmSync(DIR, { recursive:true, force:true });
console.log(OUT);
