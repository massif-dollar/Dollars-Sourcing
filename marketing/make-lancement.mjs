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

// Thème clair de l'app : fond blanc cassé, vert #2eb35c, gris nardo.
// Jamais de noir pur — c'est la règle de la palette, et sur un fil social le
// blanc tranche d'autant plus que tout le monde poste sombre.
const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#fbfcfa}
/* Zone sûre TikTok : le bas de l'écran est mangé par la légende et les boutons,
   la droite par la colonne d'icônes. Rien d'important ne descend sous 1620 px,
   et le contenu reste calé à gauche. */
.slide{position:relative;width:1080px;height:1920px;overflow:hidden;background:#fbfcfa;
  display:flex;flex-direction:column;padding:104px 78px 300px}
.glow{position:absolute;border-radius:50%;filter:blur(130px);pointer-events:none}
.g1{width:900px;height:900px;top:-380px;left:-260px;background:radial-gradient(circle,rgba(46,179,92,.30),transparent 66%)}
.g2{width:760px;height:760px;bottom:-300px;right:-220px;background:radial-gradient(circle,rgba(46,179,92,.20),transparent 68%)}
.g3{width:640px;height:640px;top:44%;left:56%;background:radial-gradient(circle,rgba(142,142,138,.18),transparent 70%)}
.grid{position:absolute;inset:0;opacity:.8;
  background-image:linear-gradient(rgba(120,120,114,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(120,120,114,.07) 1px,transparent 1px);
  background-size:72px 72px;-webkit-mask-image:radial-gradient(120% 80% at 50% 30%,#000 18%,transparent 74%)}

.top{position:relative;display:flex;align-items:center;gap:20px;margin-bottom:56px}
.chip{width:60px;height:60px;border-radius:18px;flex-shrink:0;position:relative;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(155deg,#5fe08c,#2eb35c 56%,#1e8a44);
  box-shadow:0 10px 26px rgba(46,179,92,.34)}
.chip::after{content:'';position:absolute;inset:0;border-radius:18px;
  background:linear-gradient(160deg,rgba(255,255,255,.55),rgba(255,255,255,.08) 44%,transparent 66%)}
.chip span{position:relative;z-index:1;color:#fff;font-family:'SG';font-weight:700;font-size:34px;letter-spacing:-.04em}
.brand{font-family:'SG';font-weight:700;font-size:25px;letter-spacing:.16em;color:#8d918a;text-transform:uppercase}
.step{margin-left:auto;font-family:'SG';font-weight:700;font-size:25px;letter-spacing:.14em;color:#1e8a44}

.head{position:relative}
h1{font-family:'SG';font-weight:700;font-size:88px;line-height:1.02;letter-spacing:-.045em;color:#2b302c}
h1 em{font-style:normal;color:#2eb35c}
h1.small{font-size:72px}
.lead{margin-top:30px;font-family:'IN';font-size:37px;font-weight:400;line-height:1.4;
  letter-spacing:-.015em;color:#5f645e;max-width:880px}
.lead b{color:#2b302c;font-weight:600}

.stage{position:relative;flex:1;display:flex;align-items:center;justify-content:center;margin-top:52px}
/* Cadre graphite sur fond clair : sans lui, une capture d'app claire se noierait
   dans la page. L'ombre fait le reste du décollement. */
.phone{position:relative;width:520px;border-radius:56px;padding:12px;flex-shrink:0;
  background:linear-gradient(160deg,#5b5f5a,#2b302c 62%);
  box-shadow:0 50px 100px rgba(70,74,68,.30), 0 12px 30px rgba(70,74,68,.16),
             0 0 0 1px rgba(255,255,255,.30) inset}
.phone::before{content:'';position:absolute;inset:-90px;z-index:-1;border-radius:50%;
  background:radial-gradient(circle,rgba(46,179,92,.16),transparent 66%);filter:blur(50px)}
.phone img{display:block;width:100%;border-radius:45px}
.phone.tall img{height:950px;object-fit:cover;object-position:top}
.phone::after{content:'';position:absolute;left:50%;top:26px;transform:translateX(-50%);
  width:132px;height:30px;border-radius:100px;background:#2b302c}

.pts{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;gap:46px;margin-top:44px}
.pt{display:flex;align-items:flex-start;gap:24px;font-family:'IN';font-size:40px;font-weight:500;
  letter-spacing:-.015em;color:#2b302c;line-height:1.3}
.pt i{display:block;flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#2eb35c;margin-top:16px}

.foot{position:relative;margin-top:auto;padding-top:44px;display:flex;align-items:center;gap:18px}
.tag{display:inline-flex;align-items:center;gap:15px;padding:22px 38px;border-radius:100px;
  border:1px solid rgba(46,179,92,.38);background:rgba(46,179,92,.10);
  font-family:'IN';font-size:32px;font-weight:600;letter-spacing:-.01em;color:#1e8a44}
.tag i{display:block;width:13px;height:13px;border-radius:50%;background:#2eb35c;flex-shrink:0}
.cta{width:100%;padding:34px;border-radius:26px;text-align:center;
  background:linear-gradient(162deg,#5fe08c,#2eb35c 72%);
  box-shadow:0 22px 48px rgba(46,179,92,.32);
  font-family:'SG';font-size:40px;font-weight:700;color:#fff;letter-spacing:-.02em}
/* Les slides sans capture avaient un trou au milieu : une liste centrée dans
   un espace vide ne fait pas un visuel. On y met une vraie carte, dans la
   matière des cartes de l'app — surface blanche, bordure fine, ombre en deux
   couches, chiffres tabulaires. */
.stage.card-stage{align-items:center}
.card{position:relative;width:100%;background:#fff;border-radius:46px;padding:58px 56px;
  border:1px solid rgba(120,120,114,.16);
  box-shadow:0 44px 96px rgba(70,74,68,.16), 0 12px 28px rgba(70,74,68,.08)}
.card::before{content:'';position:absolute;inset:-70px;z-index:-1;border-radius:50%;
  background:radial-gradient(circle,rgba(46,179,92,.15),transparent 66%);filter:blur(50px)}
.card-top{display:flex;align-items:center;gap:20px;margin-bottom:34px}
.card-kicker{font-family:'SG';font-weight:700;font-size:24px;letter-spacing:.14em;
  text-transform:uppercase;color:#9aa09a}
.card-badge{margin-left:auto;padding:14px 26px;border-radius:100px;
  background:rgba(46,179,92,.12);border:1px solid rgba(46,179,92,.34);
  font-family:'IN';font-weight:600;font-size:25px;letter-spacing:-.01em;color:#1e8a44}
.card-title{font-family:'SG';font-weight:700;font-size:52px;letter-spacing:-.035em;color:#2b302c}
.card-sub{margin-top:12px;font-family:'IN';font-size:31px;font-weight:400;color:#7c817b}
.rule{height:1px;background:rgba(120,120,114,.18);margin:40px 0}
.row{display:flex;align-items:baseline;gap:24px;padding:17px 0;
  font-family:'IN';font-size:35px;font-weight:400;color:#5f645e;letter-spacing:-.01em}
.row b{margin-left:auto;font-weight:600;color:#2b302c;font-size:38px;
  font-variant-numeric:tabular-nums;white-space:nowrap}
.row.hi{font-size:37px;color:#2b302c;font-weight:500}
.row.hi b{color:#2eb35c;font-family:'SG';font-weight:700;font-size:52px;letter-spacing:-.03em}
.mult{margin-left:20px;padding:10px 24px;border-radius:100px;background:#2eb35c;
  font-family:'SG';font-weight:700;font-size:32px;color:#fff;letter-spacing:-.02em;
  box-shadow:0 12px 26px rgba(46,179,92,.34)}
.checks{margin-top:38px;display:flex;flex-direction:column;gap:22px}
.ck{display:flex;align-items:flex-start;gap:18px;font-family:'IN';font-size:29px;
  font-weight:500;color:#5f645e;line-height:1.32;letter-spacing:-.01em}
.ck s{flex-shrink:0;width:34px;height:34px;border-radius:50%;text-decoration:none;
  background:rgba(46,179,92,.14);color:#1e8a44;font-size:21px;font-weight:700;
  display:flex;align-items:center;justify-content:center;margin-top:3px}
/* Avant / après. Règle de la palette appliquée à la persuasion : le « avant »
   n'a AUCUN vert. Le vert, c'est la marque — s'il apparaît des deux côtés, la
   comparaison ne dit plus rien. Le gris nardo tient le rôle du « sans toi ». */
.duo{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;gap:22px;margin-top:38px}
.half{position:relative;border-radius:40px;padding:38px 40px}
.half.before{background:rgba(120,120,114,.075);border:1px solid rgba(120,120,114,.18)}
.half.after{background:#fff;border:1px solid rgba(46,179,92,.32);
  box-shadow:0 34px 76px rgba(70,74,68,.15), 0 10px 24px rgba(70,74,68,.07)}
.half-k{font-family:'SG';font-weight:700;font-size:24px;letter-spacing:.15em;text-transform:uppercase}
.before .half-k{color:#a0a5a0}
.after .half-k{color:#1e8a44}
.half-t{margin-top:12px;font-family:'SG';font-weight:700;font-size:47px;letter-spacing:-.035em}
.before .half-t{color:#8d928c}
.after .half-t{color:#2b302c}
.half-l{margin-top:20px;font-family:'IN';font-size:29px;font-weight:500;line-height:1.32;letter-spacing:-.01em}
.before .half-l{color:#8d928c}
.after .half-l{color:#5f645e}
.after .half-l b{color:#2b302c;font-weight:600}

/* Le « avant » : trois messages envoyés, aucune réponse. C'est le visuel qui
   fait tout le travail — personne n'a besoin qu'on lui explique ce silence. */
.chat{margin-top:24px;display:flex;flex-direction:column;align-items:flex-end;gap:12px}
.bub{max-width:78%;padding:18px 26px;border-radius:26px 26px 9px 26px;
  background:rgba(120,120,114,.15);font-family:'IN';font-size:28px;color:#82877f;letter-spacing:-.01em}
.seen{font-family:'IN';font-size:22px;color:#aeb3ad;margin-top:2px}

/* L'« après » : la même attente, mais répondue par l'écran. */
.mini{margin-top:24px;border-radius:26px;padding:28px 30px;
  background:rgba(46,179,92,.07);border:1px solid rgba(46,179,92,.22)}
.mini-h{display:flex;align-items:center;gap:18px;
  font-family:'IN';font-weight:600;font-size:30px;color:#2b302c;letter-spacing:-.01em}
.mini-h u{margin-left:auto;text-decoration:none;flex-shrink:0;padding:9px 20px;border-radius:100px;
  background:rgba(46,179,92,.14);font-family:'SG';font-weight:700;font-size:25px;color:#1e8a44}
.track{margin-top:26px;display:flex;align-items:center}
.track i{display:block;width:20px;height:20px;border-radius:50%;flex-shrink:0;
  background:#fff;border:3px solid rgba(46,179,92,.30)}
.track i.on{background:#2eb35c;border-color:#2eb35c}
.track i.now{width:28px;height:28px;box-shadow:0 0 0 8px rgba(46,179,92,.16)}
.track s{display:block;flex:1;height:5px;text-decoration:none;background:rgba(46,179,92,.22)}
.track s.on{background:#2eb35c}
.mini-f{margin-top:22px;font-family:'IN';font-size:27px;color:#5f645e;letter-spacing:-.01em}
.mini-f b{color:#1e8a44;font-weight:600}
.hero-mark{position:relative;display:flex;flex-direction:column;align-items:center;gap:44px}
.hero-tile{width:250px;height:250px;border-radius:70px;position:relative;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(155deg,#5fe08c,#2eb35c 56%,#1e8a44);
  box-shadow:0 40px 90px rgba(46,179,92,.36)}
.hero-tile::after{content:'';position:absolute;inset:0;border-radius:70px;
  background:linear-gradient(160deg,rgba(255,255,255,.55),rgba(255,255,255,.10) 44%,transparent 66%)}
.hero-tile span{position:relative;z-index:1;color:#fff;font-family:'SG';font-weight:700;font-size:148px;letter-spacing:-.05em}
`;

const shell = (inner) => `<!doctype html><meta charset="utf-8"><style>${FONTS}${CSS}</style>${inner}`;
const frame = (n, body) => `<div class="slide">
  <span class="glow g1"></span><span class="glow g2"></span><span class="glow g3"></span><span class="grid"></span>
  <div class="top"><div class="chip"><span>$</span></div><div class="brand">Dollar$ Sourcing</div>${n?`<div class="step">${n}</div>`:''}</div>
  ${body}
</div>`;

// On parle à des REVENDEURS, pas à des particuliers : ce n'est pas « ton colis »
// mais « ton stock », pas « ce que tu paies » mais « ton prix d'achat ». Un
// revendeur n'achète pas un objet, il achète une marge.
const slides = [
// ---------- 1. l'accroche ----------
['01-accroche', frame('', `
  <div class="stage" style="flex-direction:column;justify-content:center;gap:70px;margin-top:0">
    <div class="hero-mark"><div class="hero-tile"><span>$</span></div></div>
    <div class="head" style="text-align:center">
      <h1>Tu revends.<br>Moi je te <em>fournis</em><br>depuis la Chine.</h1>
      <div class="lead" style="margin:34px auto 0;text-align:center">
        Sourcing, négociation, achat, expédition.<br>Toi, tu n'as plus qu'à vendre.</div>
    </div>
  </div>
  <div class="foot" style="justify-content:center"><div class="tag"><i></i>6 étapes, et ton stock arrive</div></div>`)],

// ---------- 2. ton espace ----------
['02-espace', frame('ÉTAPE 1', `
  <div class="head"><h1 class="small">Tu reçois<br><em>ton accès pro</em></h1>
    <div class="lead">Un espace rien qu'à toi, protégé par <b>un code à 6 chiffres</b>. Tes commandes, tes prix, ton suivi — à ajouter sur ton écran d'accueil.</div></div>
  <div class="stage"><div class="phone tall"><img src="${shot('code.png')}"></div></div>`)],

// ---------- 3. tu demandes ----------
['03-demande', frame('ÉTAPE 2', `
  <div class="head"><h1 class="small">Tu me dis<br><em>ce que tu veux</em></h1>
    <div class="lead">Le produit, la quantité, <b>une photo</b> si tu en as une. Je trouve la source. Et on en discute en direct quand tu veux.</div></div>
  <div class="stage"><div class="phone tall"><img src="${shot('demande.png')}"></div></div>`)],

// ---------- 4. le prix ----------
['04-prix', frame('ÉTAPE 3', `
  <div class="head"><h1 class="small">Je te donne<br><em>ton prix d'achat</em></h1>
    <div class="lead">Un seul chiffre, <b>livraison comprise</b>. Tu calcules ta marge dessus, et rien ne bouge à l'arrivée.</div></div>
  <div class="stage card-stage"><div class="card">
    <div class="card-top"><div class="card-kicker">Ton prix</div>
      <div class="card-badge">Livraison incluse</div></div>
    <div class="card-title">Sacoche cuir Milano</div>
    <div class="card-sub">20 pièces</div>
    <div class="rule"></div>
    <div class="row">Prix à la pièce<b>29 €</b></div>
    <div class="row hi">Total à régler<b>580 €</b></div>
    <div class="checks">
      <div class="ck"><s>✓</s>Photos et détails du produit avant que tu valides</div>
      <div class="ck"><s>✓</s>Le prix que tu vois est le prix que tu paies</div>
    </div>
  </div></div>
  <div class="foot"><div class="tag"><i></i>Ni frais de port, ni douane surprise</div></div>`)],

// ---------- 5. je suis en Chine ----------
['05-achat', frame('ÉTAPE 4', `
  <div class="head"><h1 class="small">Je suis<br><em>en Chine</em></h1>
    <div class="lead">Je te fournis <b>au meilleur prix</b>, de quoi te faire un <b>minimum ×3</b> à la revente en France.</div></div>
  <div class="stage card-stage"><div class="card">
    <div class="card-top"><div class="card-kicker">Ce que ça te fait</div></div>
    <div class="row">Ton prix d'achat<b>29 €</b></div>
    <div class="row">Ta revente en France<b>89 €</b></div>
    <div class="rule"></div>
    <div class="row hi">Ta marge, par pièce<b>+ 60 €</b><span class="mult">×3</span></div>
    <div class="checks">
      <div class="ck"><s>✓</s>Le prix de la source, pas le prix du grossiste</div>
      <div class="ck"><s>✓</s>Du volume : plus tu prends, plus ça descend</div>
    </div>
  </div></div>
  <div class="foot"><div class="tag"><i></i>Marché de gros, prix de gros</div></div>`)],

// ---------- 6. le suivi ----------
['06-suivi', frame('ÉTAPE 5', `
  <div class="head"><h1 class="small">Tu suis<br><em>ton stock</em></h1>
    <div class="lead">Six étapes, en direct. Transitaire, numéro de suivi, <b>date estimée</b> — tu sais quand réapprovisionner.</div></div>
  <div class="stage"><div class="phone tall"><img src="${shot('suivi.png')}"></div></div>`)],

// ---------- 7. les Dollarz ----------
['07-dollarz', frame('ÉTAPE 6', `
  <div class="head"><h1 class="small">Plus tu commandes,<br>plus tu <em>gagnes</em></h1>
    <div class="lead"><b>1 € dépensé = 1 Dollarz</b>, échangeable contre de vraies remises. Les gros paliers sont faits pour ceux qui achètent en gros.</div></div>
  <div class="stage"><div class="phone tall"><img src="${shot('dollarz.png')}"></div></div>`)],

// ---------- 8. l'appel ----------
['08-cta', frame('', `
  <div class="stage" style="flex-direction:column;justify-content:center;gap:56px;margin-top:0">
    <div class="hero-mark"><div class="hero-tile"><span>$</span></div></div>
    <div class="head" style="text-align:center">
      <h1>Dis-moi ce que<br>tu veux revendre.</h1>
      <div class="lead" style="margin:34px auto 0;text-align:center">
        Écris-moi le produit. Je te réponds avec ton prix<br>d'achat, livraison comprise. On en discute sur<br>WhatsApp, et ton accès est créé dans la foulée.</div>
    </div>
  </div>
  <div class="foot" style="flex-direction:column;gap:26px">
    <div class="cta">Écris-moi en message privé</div>
    <div class="tag" style="align-self:center"><i></i>Accès pro offert dès la 1re commande</div>
  </div>`)],

// ---------- 9. avant / après (post à part, pas dans le carrousel) ----------
// Le « avant », ce n'est PAS un autre intermédiaire : ce serait admettre qu'on
// en est un. C'est l'achat à l'aveugle à un compte inconnu. La différence n'est
// pas la personne, c'est qu'il y a un espace, une référence et un suivi.
['09-avant-apres', frame('AVANT / APRÈS', `
  <div class="head"><h1 class="small">Fini<br><em>les relances</em></h1></div>
  <div class="duo">
    <div class="half before">
      <div class="half-k">Sans espace client</div>
      <div class="half-t">Tu paies. Puis tu attends.</div>
      <div class="chat">
        <div class="bub">C'est bon, j'ai envoyé 👍</div>
        <div class="bub">Tu l'as reçu ?</div>
        <div class="bub">Alors ? 🙏</div>
        <div class="seen">Vu à 23:41</div>
      </div>
      <div class="half-l">Aucune preuve, aucun suivi. C'est toi qui relances, à chaque fois.</div>
    </div>
    <div class="half after">
      <div class="half-k">Avec ton espace</div>
      <div class="half-t">Tu ouvres. Tu vois.</div>
      <div class="mini">
        <div class="mini-h">Sacoche cuir Milano × 20<u>#A7F3</u></div>
        <div class="track"><i class="on"></i><s class="on"></s><i class="on"></i><s class="on"></s><i class="on"></i><s class="on"></s><i class="on"></i><s class="on"></s><i class="on now"></i><s></s><i></i></div>
        <div class="mini-f">Expédié le 3 septembre — <b>suivi LP00123456789CN</b></div>
      </div>
      <div class="half-l">Ton prix fixé, ta référence sur le carton, ton suivi en direct. <b>Tu vois où est ton argent, à chaque étape.</b></div>
    </div>
  </div>`)]
];

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
