// Les images fixes du carrousel, une par affiche, en 2160 x 3840.
//   node make-lancement.mjs
import { chromium } from 'playwright';
import fs from 'fs';
import { shell, slides } from './slides.mjs';

const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
fs.mkdirSync('promo', { recursive:true });
for(const [name, html] of slides){
  const p = await b.newPage({ viewport:{width:1080,height:1920}, deviceScaleFactor:2 });
  await p.setContent(shell(html));
  await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({ path:'promo/'+name+'.png' });
  await p.close();
  console.log(name);
}
await b.close();
