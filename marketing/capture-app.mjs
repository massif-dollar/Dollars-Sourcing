import { chromium } from 'playwright';
import fs from 'fs';
const mock = fs.readFileSync('fbmock.js','utf8');
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs=[];
async function page(seed){
  const p = await b.newPage({ viewport:{width:390,height:844}, locale:'fr-FR', deviceScaleFactor:3 });
  p.on('pageerror', e=>errs.push(String(e).slice(0,140)));
  await p.route('**/firebasejs/**', r=>r.fulfill({ contentType:'application/javascript',
    body: mock + '\n;(function(){' + (seed||'') + '})();' }));
  return p;
}
const SEED = `
  window.__store.set('clients/c1', { name:'Thomas Petit', firstname:'Thomas', token:'tok', accessCode:'123456',
    coupons:[{id:'cp1',dollars:400,value:16,min:300,at:Date.now()}] });
  window.__store.set('publicOrders/o1', { ownerId:'u1', clientId:'c1', product:'Sacoche cuir Milano', qty:2,
    unitPrice:390, discount:0, couponId:'', paidAmount:780, status:'expedie',
    statusAt:{nouveau:Date.now()-9*86400000, devis:Date.now()-8*86400000, paye:Date.now()-7*86400000, commande:Date.now()-6*86400000, expedie:Date.now()-3*86400000}, ref:'RA83', note:'',
    carrier:'YunExpress', tracking:'LP00123456789CN', eta:'2026-09-20', photo:'', photoType:'',
    createdAt: Date.now()-3*86400000, deletedAt:null });
  window.__store.set('publicOrders/o2', { ownerId:'u1', clientId:'c1', product:'Baskets running', qty:1,
    unitPrice:230, discount:0, couponId:'', paidAmount:230, status:'livre', statusAt:{livre:Date.now()-14*86400000},
    ref:'7TPJ', note:'', carrier:'', tracking:'', eta:'', photo:'', photoType:'',
    createdAt: Date.now()-20*86400000, deletedAt:null });
  clientData = { id:'c1', name:'Thomas Petit', firstname:'Thomas',
                 coupons:[{id:'cp1',dollars:400,value:16,min:300,at:Date.now()}] };
`;
async function portal(tab, file, extra){
  const p = await page(SEED);
  await p.goto('file:///home/user/Dollars-Sourcing/client.html?id=c1&token=tok');
  await p.evaluate(async ({seed, tab, extra})=>{
    applyTheme('dark');
    document.getElementById('codeScreen').style.display='none';
    document.getElementById('app').style.display='block';
    const cur=document.getElementById('portalCurtain'); if(cur) cur.style.display='none';
    ['clientWelcome','dollarsIntro','installCard'].forEach(id=>{ const e=document.getElementById(id); if(e) e.style.display='none'; });
    listenOrders();
    await new Promise(x=>setTimeout(x,350));
    switchTab(tab);
    document.querySelectorAll('.reveal').forEach(e=>e.classList.add('revealed'));
    if(extra) eval(extra);
  }, {seed:SEED, tab, extra: extra||''});
  await p.waitForTimeout(1500);
  await p.screenshot({ path:'shots/'+file });
  await p.close();
}
// 1. l'écran de code (le lien perso protégé)
{
  const p = await page(SEED);
  await p.goto('file:///home/user/Dollars-Sourcing/client.html?id=c1&token=tok');
  await p.waitForTimeout(500);
  await p.evaluate(()=>{ applyTheme('dark');
    // trois chiffres tapés : le clavier se montre en cours d'usage
    ['1','2','3'].forEach(d=>{ const k=[...document.querySelectorAll('.code-key')].find(e=>e.textContent.trim()===d); if(k) k.click(); });
  });
  await p.waitForTimeout(900);
  await p.screenshot({ path:'shots/code.png' });
  await p.close();
}
await portal('order',   'demande.png');
await portal('history', 'suivi.png');
await portal('dollars', 'dollarz.png');
console.log('captures :', fs.readdirSync('shots').join(', '));
console.log('errors:', errs.slice(0,4));
await b.close();
