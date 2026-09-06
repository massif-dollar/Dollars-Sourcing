import { chromium } from 'playwright';
import fs from 'fs';
const b64 = f => fs.readFileSync(f).toString('base64');
const SG7 = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const IN4 = b64('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2');
const IN6 = b64('node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2');
// Une écriture manuscrite pour la référence au marqueur : c'est le seul geste
// humain de toute la série, il ne doit pas être tapé à la machine.
const CAV = b64('node_modules/@fontsource/caveat/files/caveat-latin-700-normal.woff2');

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'SG';font-weight:700;src:url(data:font/woff2;base64,${SG7}) format('woff2');}
@font-face{font-family:'IN';font-weight:400;src:url(data:font/woff2;base64,${IN4}) format('woff2');}
@font-face{font-family:'IN';font-weight:600;src:url(data:font/woff2;base64,${IN6}) format('woff2');}
@font-face{font-family:'CAV';font-weight:700;src:url(data:font/woff2;base64,${CAV}) format('woff2');}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#fbfcfa}
.slide{position:relative;width:1080px;height:1920px;overflow:hidden;background:#fbfcfa;
  display:flex;flex-direction:column;padding:104px 78px 300px}
.glow{position:absolute;border-radius:50%;filter:blur(130px);pointer-events:none}
.g1{width:900px;height:900px;top:-380px;left:-260px;background:radial-gradient(circle,rgba(46,179,92,.30),transparent 66%)}
.g2{width:760px;height:760px;bottom:-260px;right:-220px;background:radial-gradient(circle,rgba(46,179,92,.20),transparent 68%)}
.grid{position:absolute;inset:0;opacity:.8;
  background-image:linear-gradient(rgba(120,120,114,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(120,120,114,.07) 1px,transparent 1px);
  background-size:72px 72px;-webkit-mask-image:radial-gradient(120% 80% at 50% 30%,#000 18%,transparent 74%)}
.top{position:relative;display:flex;align-items:center;gap:20px;margin-bottom:56px}
.chip{width:60px;height:60px;border-radius:18px;flex-shrink:0;position:relative;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(155deg,#5fe08c,#2eb35c 56%,#1e8a44);box-shadow:0 10px 26px rgba(46,179,92,.34)}
.chip::after{content:'';position:absolute;inset:0;border-radius:18px;background:linear-gradient(160deg,rgba(255,255,255,.55),rgba(255,255,255,.08) 44%,transparent 66%)}
.chip span{position:relative;z-index:1;color:#fff;font-family:'SG';font-weight:700;font-size:34px;letter-spacing:-.04em}
.brand{font-family:'SG';font-weight:700;font-size:25px;letter-spacing:.16em;color:#8d918a;text-transform:uppercase}
.step{margin-left:auto;font-family:'SG';font-weight:700;font-size:25px;letter-spacing:.14em;color:#1e8a44}
h1{font-family:'SG';font-weight:700;font-size:72px;line-height:1.02;letter-spacing:-.045em;color:#2b302c}
h1 em{font-style:normal;color:#2eb35c}
.lead{margin-top:30px;font-family:'IN';font-size:37px;font-weight:400;line-height:1.4;letter-spacing:-.015em;color:#5f645e;max-width:880px}
.lead b{color:#2b302c;font-weight:600}
.stage{position:relative;flex:1;display:flex;align-items:center;justify-content:center}
/* Le carton : deux faces en perspective, du kraft, un ruban, et la référence
   écrite au marqueur. Pas une photo — un dessin assumé, à la palette. */
.box{position:relative;width:620px;height:520px;transform:rotate(-3deg)}
.face-top{position:absolute;top:0;left:52px;width:516px;height:112px;
  background:linear-gradient(175deg,#e6d3b0,#d8c096);border-radius:8px 8px 0 0;
  transform:skewX(-24deg);box-shadow:inset 0 -8px 18px rgba(120,90,40,.18)}
.face-front{position:absolute;top:104px;left:0;width:620px;height:408px;border-radius:0 0 14px 14px;
  background:linear-gradient(160deg,#f0e2c6,#dcc59d 70%,#cbb185);
  box-shadow:0 50px 90px rgba(70,74,68,.26), inset 0 2px 0 rgba(255,255,255,.5)}
.tape{position:absolute;top:104px;left:262px;width:96px;height:408px;
  background:linear-gradient(90deg,rgba(180,150,100,.30),rgba(210,185,140,.55),rgba(180,150,100,.30))}
.mark{position:absolute;top:196px;left:62px;font-family:'CAV';font-weight:700;font-size:104px;
  color:#2b302c;transform:rotate(-4deg);opacity:.86}
.mark small{display:block;font-family:'IN';font-weight:600;font-size:26px;letter-spacing:.04em;
  color:#5f645e;transform:rotate(1deg);margin-top:2px;opacity:.9}
.stamp{position:absolute;bottom:56px;right:56px;padding:14px 26px;border-radius:100px;
  border:3px solid rgba(46,179,92,.55);color:#1e8a44;font-family:'SG';font-weight:700;
  font-size:28px;letter-spacing:.1em;transform:rotate(-6deg);opacity:.9}
.pts{position:relative;display:flex;flex-direction:column;gap:34px;margin-top:40px}
.pt{display:flex;align-items:flex-start;gap:24px;font-family:'IN';font-size:38px;font-weight:500;letter-spacing:-.015em;color:#2b302c;line-height:1.3}
.pt i{display:block;flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#2eb35c;margin-top:15px}
.foot{position:relative;margin-top:auto;padding-top:44px;display:flex}
.tag{display:inline-flex;align-items:center;gap:15px;padding:22px 38px;border-radius:100px;
  border:1px solid rgba(46,179,92,.38);background:rgba(46,179,92,.10);
  font-family:'IN';font-size:32px;font-weight:600;letter-spacing:-.01em;color:#1e8a44}
.tag i{display:block;width:13px;height:13px;border-radius:50%;background:#2eb35c;flex-shrink:0}
</style>
<div class="slide">
  <span class="glow g1"></span><span class="glow g2"></span><span class="grid"></span>
  <div class="top"><div class="chip"><span>$</span></div><div class="brand">Dollar$ Sourcing</div><div class="step">EXEMPLE</div></div>
  <div><h1>Chaque colis<br>porte <em>sa référence</em></h1>
    <div class="lead">Écrite au marqueur avant le départ. Un carton en main, <b>je sais pour qui il est</b> — et toi tu la retrouves dans ton espace.</div></div>
  <div class="stage">
    <div class="box">
      <div class="face-top"></div>
      <div class="face-front"></div>
      <div class="tape"></div>
      <div class="mark">#RA83<small>DOLLAR$ SOURCING</small></div>
      <div class="stamp">EXPÉDIÉ</div>
    </div>
  </div>
  <div class="foot"><div class="tag"><i></i>Dessiné, pas photographié</div></div>
</div>`;

const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:1080,height:1920}, deviceScaleFactor:2 });
await p.setContent(html);
await p.evaluate(()=>document.fonts.ready);
console.log('Caveat chargée :', await p.evaluate(()=>document.fonts.check('700 104px "CAV"')));
await p.screenshot({ path:'exemple-carton.png' });
await b.close();
