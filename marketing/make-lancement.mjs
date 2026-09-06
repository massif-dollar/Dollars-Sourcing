import { chromium } from 'playwright';
import fs from 'fs';
const b64 = f => fs.readFileSync(f).toString('base64');
const SG7 = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const SG6 = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2');
const IN4 = b64('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2');
const IN5 = b64('node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2');
const IN6 = b64('node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2');
const shot = f => 'data:image/png;base64,' + b64('shots/'+f);

const FONTS = `
@font-face{font-family:'SG';font-weight:700;src:url(data:font/woff2;base64,${SG7}) format('woff2');}
@font-face{font-family:'SG';font-weight:600;src:url(data:font/woff2;base64,${SG6}) format('woff2');}
@font-face{font-family:'IN';font-weight:400;src:url(data:font/woff2;base64,${IN4}) format('woff2');}
@font-face{font-family:'IN';font-weight:500;src:url(data:font/woff2;base64,${IN5}) format('woff2');}
@font-face{font-family:'IN';font-weight:600;src:url(data:font/woff2;base64,${IN6}) format('woff2');}`;

// Noir + orange Brabus : la palette du thème sombre de l'app. C'est ce qui
// ressort le mieux dans un fil TikTok, et ça prépare l'œil à ce qu'il verra
// en ouvrant son espace.
const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#0a0a0b}
/* Zone sûre TikTok : le bas de l'écran est mangé par la légende et les boutons,
   la droite par la colonne d'icônes. Rien d'important ne descend sous 1620 px,
   et le contenu reste calé à gauche. */
.slide{position:relative;width:1080px;height:1920px;overflow:hidden;background:#0a0a0b;
  display:flex;flex-direction:column;padding:104px 78px 300px}
.glow{position:absolute;border-radius:50%;filter:blur(130px);pointer-events:none}
.g1{width:900px;height:900px;top:-380px;left:-260px;background:radial-gradient(circle,rgba(255,122,26,.34),transparent 66%)}
.g2{width:760px;height:760px;bottom:-300px;right:-220px;background:radial-gradient(circle,rgba(255,122,26,.22),transparent 68%)}
.g3{width:640px;height:640px;top:44%;left:56%;background:radial-gradient(circle,rgba(142,142,138,.13),transparent 70%)}
.grid{position:absolute;inset:0;opacity:.55;
  background-image:linear-gradient(rgba(142,142,138,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(142,142,138,.055) 1px,transparent 1px);
  background-size:72px 72px;-webkit-mask-image:radial-gradient(120% 80% at 50% 30%,#000 18%,transparent 74%)}

.top{position:relative;display:flex;align-items:center;gap:20px;margin-bottom:56px}
.chip{width:60px;height:60px;border-radius:18px;flex-shrink:0;position:relative;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(155deg,#ffb066,#ff7a1a 56%,#c9540a);
  box-shadow:0 10px 26px rgba(255,122,26,.30)}
.chip::after{content:'';position:absolute;inset:0;border-radius:18px;
  background:linear-gradient(160deg,rgba(255,255,255,.42),rgba(255,255,255,.05) 44%,transparent 66%)}
.chip span{position:relative;z-index:1;color:#fff;font-family:'SG';font-weight:700;font-size:34px;letter-spacing:-.04em}
.brand{font-family:'SG';font-weight:700;font-size:25px;letter-spacing:.16em;color:#7c7d76;text-transform:uppercase}
.step{margin-left:auto;font-family:'SG';font-weight:700;font-size:25px;letter-spacing:.14em;color:#ff7a1a}

.head{position:relative}
h1{font-family:'SG';font-weight:700;font-size:88px;line-height:1.02;letter-spacing:-.045em;color:#fff}
h1 em{font-style:normal;color:#ff7a1a}
h1.small{font-size:72px}
.lead{margin-top:30px;font-family:'IN';font-size:37px;font-weight:400;line-height:1.4;
  letter-spacing:-.015em;color:#a9aaa4;max-width:880px}
.lead b{color:#f3f2ef;font-weight:600}

.stage{position:relative;flex:1;display:flex;align-items:center;justify-content:center;margin-top:52px}
.phone{position:relative;width:520px;border-radius:56px;padding:12px;flex-shrink:0;
  background:linear-gradient(160deg,#4a4a4d,#141416 62%);
  box-shadow:0 60px 120px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.10),
             0 0 140px rgba(255,122,26,.18)}
.phone::before{content:'';position:absolute;inset:-90px;z-index:-1;border-radius:50%;
  background:radial-gradient(circle,rgba(255,122,26,.16),transparent 66%);filter:blur(50px)}
.phone img{display:block;width:100%;border-radius:45px}
.phone.tall img{height:950px;object-fit:cover;object-position:top}
.phone::after{content:'';position:absolute;left:50%;top:26px;transform:translateX(-50%);
  width:132px;height:30px;border-radius:100px;background:#0a0a0b}

.pts{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;gap:46px;margin-top:44px}
.pt{display:flex;align-items:flex-start;gap:24px;font-family:'IN';font-size:40px;font-weight:500;
  letter-spacing:-.015em;color:#e8e8e4;line-height:1.3}
.pt i{display:block;flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#ff7a1a;margin-top:16px}

.foot{position:relative;margin-top:auto;padding-top:44px;display:flex;align-items:center;gap:18px}
.tag{display:inline-flex;align-items:center;gap:15px;padding:22px 38px;border-radius:100px;
  border:1px solid rgba(255,122,26,.36);background:rgba(255,122,26,.10);
  font-family:'IN';font-size:32px;font-weight:600;letter-spacing:-.01em;color:#ffb066}
.tag i{display:block;width:13px;height:13px;border-radius:50%;background:#ff7a1a;flex-shrink:0}
.cta{width:100%;padding:34px;border-radius:26px;text-align:center;
  background:linear-gradient(162deg,#ffb066,#ff7a1a 72%);
  box-shadow:0 22px 48px rgba(255,122,26,.28);
  font-family:'SG';font-size:40px;font-weight:700;color:#1c0d00;letter-spacing:-.02em}
.hero-mark{position:relative;display:flex;flex-direction:column;align-items:center;gap:44px}
.hero-tile{width:250px;height:250px;border-radius:70px;position:relative;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(155deg,#ffb066,#ff7a1a 56%,#c9540a);
  box-shadow:0 40px 90px rgba(255,122,26,.34)}
.hero-tile::after{content:'';position:absolute;inset:0;border-radius:70px;
  background:linear-gradient(160deg,rgba(255,255,255,.44),rgba(255,255,255,.06) 44%,transparent 66%)}
.hero-tile span{position:relative;z-index:1;color:#fff;font-family:'SG';font-weight:700;font-size:148px;letter-spacing:-.05em}
`;

const shell = (inner) => `<!doctype html><meta charset="utf-8"><style>${FONTS}${CSS}</style>${inner}`;
const frame = (n, body) => `<div class="slide">
  <span class="glow g1"></span><span class="glow g2"></span><span class="glow g3"></span><span class="grid"></span>
  <div class="top"><div class="chip"><span>$</span></div><div class="brand">Dollar$ Sourcing</div>${n?`<div class="step">${n}</div>`:''}</div>
  ${body}
</div>`;

const slides = [
// ---------- 1. l'accroche ----------
['01-accroche', frame('', `
  <div class="stage" style="flex-direction:column;justify-content:center;gap:70px;margin-top:0">
    <div class="hero-mark"><div class="hero-tile"><span>$</span></div></div>
    <div class="head" style="text-align:center">
      <h1>Tu commandes.<br>Je m'occupe<br>de <em>tout le reste</em>.</h1>
      <div class="lead" style="margin:34px auto 0;text-align:center">
        Sourcing en Chine, négociation, achat, expédition.<br>Toi, tu suis tout depuis ton téléphone.</div>
    </div>
  </div>
  <div class="foot" style="justify-content:center"><div class="tag"><i></i>6 étapes, et ton colis arrive</div></div>`)],

// ---------- 2. ton espace ----------
['02-espace', frame('ÉTAPE 1', `
  <div class="head"><h1 class="small">Tu reçois<br><em>ton lien perso</em></h1>
    <div class="lead">Un lien rien qu'à toi, protégé par <b>un code à 6 chiffres</b>. Tu l'ajoutes à ton écran d'accueil : tu as ton application.</div></div>
  <div class="stage"><div class="phone tall"><img src="${shot('code.png')}"></div></div>`)],

// ---------- 3. tu demandes ----------
['03-demande', frame('ÉTAPE 2', `
  <div class="head"><h1 class="small">Tu envoies<br><em>ta demande</em></h1>
    <div class="lead">Le produit, la quantité, <b>une photo</b> si tu en as une. Deux clics, c'est parti — pas besoin de m'écrire.</div></div>
  <div class="stage"><div class="phone tall"><img src="${shot('demande.png')}"></div></div>`)],

// ---------- 4. le prix ----------
['04-prix', frame('ÉTAPE 3', `
  <div class="head"><h1>Je te donne<br><em>ton prix</em></h1>
    <div class="lead">Un seul chiffre, <b>livraison comprise</b>. Pas de frais de port qui tombent à la fin, pas de douane surprise.</div></div>
  <div class="pts">
    <div class="pt"><i></i>Le prix que tu vois est le prix que tu paies</div>
    <div class="pt"><i></i>Tu peux payer en deux fois : acompte puis solde</div>
    <div class="pt"><i></i>Tu vois toujours ce qu'il te reste à régler</div>
  </div>
  <div class="foot"><div class="tag"><i></i>Aucun frais caché</div></div>`)],

// ---------- 5. j'achète et j'expédie ----------
['05-achat', frame('ÉTAPE 4', `
  <div class="head"><h1 class="small">J'achète<br>et <em>j'expédie</em></h1>
    <div class="lead">Je suis <b>sur place, en Chine</b>. J'achète en direct au fournisseur, je vérifie, j'emballe et je confie au transitaire.</div></div>
  <div class="pts">
    <div class="pt"><i></i>Acheté en direct, sans intermédiaire de plus</div>
    <div class="pt"><i></i>Chaque colis porte sa référence, écrite à la main</div>
    <div class="pt"><i></i>Tu es prévenu à chaque étape franchie</div>
  </div>
  <div class="foot"><div class="tag"><i></i>Marché de gros, prix de gros</div></div>`)],

// ---------- 6. le suivi ----------
['06-suivi', frame('ÉTAPE 5', `
  <div class="head"><h1 class="small">Tu suis<br><em>ton colis</em></h1>
    <div class="lead">Six étapes, en direct. Transitaire, numéro de suivi, <b>date estimée</b>. Tu n'as plus à demander où ça en est.</div></div>
  <div class="stage"><div class="phone tall"><img src="${shot('suivi.png')}"></div></div>`)],

// ---------- 7. les Dollarz ----------
['07-dollarz', frame('ÉTAPE 6', `
  <div class="head"><h1 class="small">Tu gagnes<br>des <em>Dollarz</em></h1>
    <div class="lead"><b>1 € dépensé = 1 Dollarz.</b> Tu les échanges contre de vraies remises. Plus tu attends, plus ça rapporte.</div></div>
  <div class="stage"><div class="phone tall"><img src="${shot('dollarz.png')}"></div></div>`)],

// ---------- 8. l'appel ----------
['08-cta', frame('', `
  <div class="stage" style="flex-direction:column;justify-content:center;gap:56px;margin-top:0">
    <div class="hero-mark"><div class="hero-tile"><span>$</span></div></div>
    <div class="head" style="text-align:center">
      <h1>Dis-moi ce<br>que tu cherches.</h1>
      <div class="lead" style="margin:34px auto 0;text-align:center">
        Écris-moi le produit. Je te réponds avec un prix,<br>livraison comprise. Ton espace est créé dans la foulée.</div>
    </div>
  </div>
  <div class="foot" style="flex-direction:column;gap:26px">
    <div class="cta">Écris-moi en message privé</div>
    <div class="tag" style="align-self:center"><i></i>Ton espace client offert dès la 1re commande</div>
  </div>`)]
];

const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
fs.mkdirSync('promo', { recursive:true });
for(const [name, html] of slides){
  const p = await b.newPage({ viewport:{width:1080,height:1920}, deviceScaleFactor:1 });
  await p.setContent(shell(html));
  await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({ path:'promo/'+name+'.png' });
  await p.close();
  console.log(name);
}
await b.close();
