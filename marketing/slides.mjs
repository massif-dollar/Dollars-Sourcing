// Le contenu et l'apparence des affiches de lancement, en un seul endroit.
// `make-lancement.mjs` en tire les images fixes, `make-video.mjs` la vidéo :
// un texte corrigé ici l'est dans les deux, ce qui est tout l'intérêt.
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
/* L'affiche d'accroche est la seule qui parle à quelqu'un qui ne sait pas
   encore de quoi il s'agit. Cette étiquette dit le sujet en trois mots, avant
   le titre : sans elle, « fournisseur » et « revendre » ne raccrochent qu'un
   spectateur déjà dans le métier. */
.kick{display:inline-block;margin-bottom:26px;padding:11px 26px;border-radius:100px;
  border:1px solid rgba(46,179,92,.34);background:rgba(46,179,92,.10);
  font-family:'SG';font-weight:700;font-size:24px;letter-spacing:.11em;
  text-transform:uppercase;color:#1e8a44}
h1{font-family:'SG';font-weight:700;font-size:88px;line-height:1.02;letter-spacing:-.045em;color:#2b302c}
h1 em{font-style:normal;color:#2eb35c}
h1.small{font-size:72px}
.lead{margin-top:30px;font-family:'IN';font-size:37px;font-weight:400;line-height:1.4;
  letter-spacing:-.015em;color:#5f645e;max-width:880px}
.lead b{color:#2b302c;font-weight:600}

.stage{position:relative;flex:1;display:flex;align-items:center;justify-content:center;margin-top:52px}
/* Les affiches 1 et 8 centrent leur bloc sans passer par .stage : à
   l'animation, un parent et ses enfants qui bougent tous les deux se
   composent, et le titre partirait deux fois plus loin. */
.center{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:stretch}
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
/* Les affiches qui portent l'opposition ont moins de place : le téléphone
   descend d'un cran plutôt que de rogner ce qui se lit. */
.phone.mid{width:396px}
.phone.mid img{height:690px;object-fit:cover;object-position:top}
/* Une capture coupée en plein milieu d'un bouton a l'air d'un bug, pas d'un
   cadrage. Cette affiche-là se coupe 42 px plus haut, juste au-dessus. */
.phone.mid.cut img{height:648px}
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
/* La comparaison, sur CHAQUE affiche.
 *
 * Première version : une ligne grise avec une croix, une ligne verte avec une
 * coche. Testée sur quelqu'un qui découvrait — il n'a pas vu que c'était un
 * avant/après. Il a lu deux phrases, sans comprendre qu'elles s'opposaient.
 *
 * La leçon : une couleur ne dit rien à qui ne connaît pas le code. Le vert veut
 * dire « bien » pour celui qui a fabriqué l'image, pas pour celui qui la
 * découvre en une seconde et demie entre deux vidéos. IL FAUT L'ÉCRIRE.
 *
 * D'où trois choses ajoutées, et aucune n'est décorative :
 *   — deux étiquettes en toutes lettres, SANS MOI et AVEC MOI ;
 *   — une flèche entre les deux, posée à cheval, qui dit qu'on passe de l'un
 *     à l'autre au lieu de simplement les poser côte à côte ;
 *   — deux surfaces différentes : le « sans » est un creux gris et plat, le
 *     « avec » est une carte blanche qui décolle. La hiérarchie se voit avant
 *     même qu'on lise. */
.cmp{position:relative;margin-top:32px;display:flex;flex-direction:column;align-items:stretch}
.cmp-side{border-radius:34px;padding:26px 32px 30px}
.cmp-side.no{background:rgba(120,120,114,.075);border:1px solid rgba(120,120,114,.18)}
.cmp-side.yes{background:#fff;border:1px solid rgba(46,179,92,.34);
  box-shadow:0 28px 62px rgba(70,74,68,.14), 0 8px 20px rgba(70,74,68,.06)}
.cmp-tag{display:inline-flex;align-items:center;gap:13px;padding:9px 26px 9px 10px;border-radius:100px;
  font-family:'SG';font-weight:700;font-size:25px;letter-spacing:.11em;text-transform:uppercase}
.cmp-side.no .cmp-tag{background:rgba(120,120,114,.17);color:#7f847d}
.cmp-side.yes .cmp-tag{background:#2eb35c;color:#fff;box-shadow:0 10px 24px rgba(46,179,92,.34)}
.cmp-tag i{flex-shrink:0;width:38px;height:38px;border-radius:50%;font-style:normal;font-size:22px;
  display:flex;align-items:center;justify-content:center}
.cmp-side.no .cmp-tag i{background:rgba(255,255,255,.62);color:#7f847d}
.cmp-side.yes .cmp-tag i{background:rgba(255,255,255,.26);color:#fff}
.cmp-txt{margin-top:19px;font-family:'IN';font-size:35px;font-weight:500;line-height:1.27;letter-spacing:-.015em}
.cmp-side.no .cmp-txt{color:#8d928c}
.cmp-side.yes .cmp-txt{color:#2b302c}
/* Le détail qui compte est surligné, pas seulement mis en gras : sur un
   téléphone tenu à bout de bras, un gras ne se distingue plus. */
.cmp-side.yes .cmp-txt b{font-weight:700;color:#1e8a44;padding:0 8px;border-radius:5px;
  background:linear-gradient(180deg,transparent 54%,rgba(46,179,92,.30) 54%)}
/* À cheval sur les deux surfaces, avec un anneau à la couleur de la page :
   c'est ce qui transforme deux blocs posés l'un sous l'autre en un passage
   de l'un à l'autre. */
.cmp-arrow{position:relative;z-index:2;align-self:center;margin:-17px 0;
  width:70px;height:70px;border-radius:50%;background:#2eb35c;color:#fff;
  display:flex;align-items:center;justify-content:center;font-family:'SG';font-weight:700;font-size:36px;
  box-shadow:0 14px 30px rgba(46,179,92,.38), 0 0 0 11px #fbfcfa}

/* Le chiffre qui décide, à la taille où il se lit sans lire. */
.big{display:flex;align-items:center;gap:30px;margin-top:8px}
.big u{text-decoration:none;flex-shrink:0;font-family:'SG';font-weight:700;font-size:132px;
  line-height:.92;letter-spacing:-.055em;color:#2eb35c}
.big span{font-family:'IN';font-size:33px;font-weight:400;color:#5f645e;line-height:1.28;letter-spacing:-.01em}
.big span b{color:#2b302c;font-weight:600}
.hero-mark{position:relative;display:flex;flex-direction:column;align-items:center;gap:44px}
.hero-tile{width:250px;height:250px;border-radius:70px;position:relative;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(155deg,#5fe08c,#2eb35c 56%,#1e8a44);
  box-shadow:0 40px 90px rgba(46,179,92,.36)}
.hero-tile::after{content:'';position:absolute;inset:0;border-radius:70px;
  background:linear-gradient(160deg,rgba(255,255,255,.55),rgba(255,255,255,.10) 44%,transparent 66%)}
.hero-tile span{position:relative;z-index:1;color:#fff;font-family:'SG';font-weight:700;font-size:148px;letter-spacing:-.05em}
`;


// Le mouvement de la vidéo. Il n'est PAS dans le CSS des affiches : une image
// fixe doit se rendre à son état final, pas au premier instant d'une entrée.
// shell(html, true) l'ajoute, shell(html) ne l'ajoute pas.
//
// Un seul principe : les éléments arrivent dans l'ordre où on doit les lire —
// le titre, puis le problème, puis la solution, puis la preuve. C'est l'ordre
// qui explique, pas l'effet. Rien ne rebondit, rien ne tourne.
export const ANIM = `
/* Le mouvement de la vidéo. Il n'est PAS dans le CSS des affiches : une image
 * fixe doit se rendre à son état final, pas au premier instant d'une entrée.
 * shell(html, true) l'ajoute, shell(html) ne l'ajoute pas.
 *
 * Langage repris du montage éditorial : rien n'apparaît en fondu, tout se
 * DÉVOILE derrière une arête nette. L'œil suit un bord qui avance, ce qui est
 * bien plus lisible qu'une opacité qui monte — et c'est ce qui distingue un
 * montage travaillé d'un diaporama.
 *
 * Tout passe par clip-path : aucune balise n'est touchée, donc les images fixes
 * restent identiques au pixel près. Vérifié octet par octet.
 *
 * Deux directions, et elles ont un sens : le TITRE se dévoile par le bas, comme
 * une ligne qu'on pose ; tout le reste part de la GAUCHE, dans le sens de la
 * lecture. Mélanger les deux au hasard donnerait du désordre. */
@keyframes upMask{
  from{ clip-path:inset(0 0 104% 0); transform:translateY(16px); }
  to  { clip-path:inset(0 0 -2% 0);  transform:none; }
}
@keyframes leftWipe{
  from{ clip-path:inset(0 102% 0 0); }
  to  { clip-path:inset(0 -2% 0 0); }
}
@keyframes riseMask{
  from{ clip-path:inset(14% 0 0 0); transform:translateY(30px) scale(.985); opacity:0; }
  to  { clip-path:inset(-2% 0 0 0); transform:none; opacity:1; }
}
@keyframes fadein{from{opacity:0}to{opacity:1}}
@keyframes pop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:none}}
/* Le surlignage se TRACE de gauche à droite, comme au marqueur. */
@keyframes draw{from{background-size:0 100%}to{background-size:100% 100%}}
/* Les masses de lumière dérivent pendant toute l'affiche : sans elles, une
   image arrêtée après son entrée a l'air d'un arrêt sur image. */
@keyframes drift{from{transform:translate3d(0,0,0)}to{transform:translate3d(18px,-30px,0)}}

/* Sortie exponentielle, courte et décidée : le mouvement éditorial n'accompagne
   pas, il pose. Une entrée molle sur un fil social se lit comme un ralenti. */
.top{animation:fadein .42s ease-out both}
.head h1{animation:upMask .60s cubic-bezier(.16,1,.3,1) both;animation-delay:.10s}
.head .kick,.head .lead{animation:leftWipe .52s cubic-bezier(.16,1,.3,1) both;animation-delay:.42s}
.cmp-side.no{animation:leftWipe .46s cubic-bezier(.16,1,.3,1) both;animation-delay:.62s}
/* La flèche arrive SEULE, entre les deux : ce temps mort est ce qui fait
   comprendre qu'on passe de l'un à l'autre. */
.cmp-arrow{animation:pop .38s cubic-bezier(.3,1.05,.4,1) both;animation-delay:.92s}
.cmp-side.yes{animation:leftWipe .46s cubic-bezier(.16,1,.3,1) both;animation-delay:1.06s}
.cmp-side.yes .cmp-txt b{background-repeat:no-repeat;animation:draw .46s cubic-bezier(.3,.8,.4,1) both;animation-delay:1.44s}
.stage{animation:riseMask .64s cubic-bezier(.16,1,.3,1) both;animation-delay:1.34s}
.foot{animation:leftWipe .5s cubic-bezier(.16,1,.3,1) both;animation-delay:1.66s}
.glow{animation:drift 8s ease-in-out infinite alternate}
.g2{animation-duration:11s;animation-direction:alternate-reverse}
.g3{animation-duration:13s}
`;

export const shell = (inner, anim) =>
  `<!doctype html><meta charset="utf-8"><style>${FONTS}${CSS}${anim ? ANIM : ''}</style>${inner}`;
const frame = (n, body) => `<div class="slide">
  <span class="glow g1"></span><span class="glow g2"></span><span class="glow g3"></span><span class="grid"></span>
  <div class="top"><div class="chip"><span>$</span></div><div class="brand">Dollar$ Sourcing</div>${n?`<div class="step">${n}</div>`:''}</div>
  ${body}
</div>`;

// On parle à des REVENDEURS, pas à des particuliers : ce n'est pas « ton colis »
// mais « ton stock », pas « ce que tu paies » mais « ton prix d'achat ». Un
// revendeur n'achète pas un objet, il achète une marge.
export const slides = [
// ---------- 1. l'accroche ----------
['01-accroche', frame('', `
  <div class="center">
    <div class="head">
      <div class="kick">Sourcing Chine · pour revendeurs</div>
      <h1 class="small">Fini les fournisseurs<br><em>inconnus</em> sur WhatsApp.</h1>
      <div class="lead">Je suis <b>en Chine</b>. Je te trouve le produit, je te donne
        ton prix livré, et tu suis chaque commande depuis <b>ton espace</b>.</div>
    </div>
    <div class="cmp">
      <div class="cmp-side no"><div class="cmp-tag"><i>✕</i>Sans moi</div>
        <div class="cmp-txt">Un compte inconnu, un virement, et tu croises les doigts</div></div>
      <div class="cmp-arrow">↓</div>
      <div class="cmp-side yes"><div class="cmp-tag"><i>✓</i>Avec moi</div>
        <div class="cmp-txt">Un vrai fournisseur, <b>ton espace, ton suivi</b></div></div>
    </div>
  </div>
  <div class="foot"><div class="tag"><i></i>Sourcing, achat, expédition — toi, tu vends</div></div>`)],

// ---------- 2. l'accès ----------
['02-espace', frame('ÉTAPE 1', `
  <div class="head"><h1 class="small">Tu reçois<br><em>ton accès pro</em></h1></div>
  <div class="cmp">
    <div class="cmp-side no"><div class="cmp-tag"><i>✕</i>Sans moi</div>
      <div class="cmp-txt">Une conversation qui se perd dans le fil</div></div>
    <div class="cmp-arrow">↓</div>
    <div class="cmp-side yes"><div class="cmp-tag"><i>✓</i>Avec moi</div>
      <div class="cmp-txt">Ton espace à toi, <b>ton code à 6 chiffres</b></div></div>
  </div>
  <div class="stage"><div class="phone mid"><img src="${shot('code.png')}"></div></div>`)],

// ---------- 3. la demande ----------
['03-demande', frame('ÉTAPE 2', `
  <div class="head"><h1 class="small">Tu demandes<br><em>ton produit</em></h1></div>
  <div class="cmp">
    <div class="cmp-side no"><div class="cmp-tag"><i>✕</i>Sans moi</div>
      <div class="cmp-txt">« T'as ça ? »… puis plus de nouvelles</div></div>
    <div class="cmp-arrow">↓</div>
    <div class="cmp-side yes"><div class="cmp-tag"><i>✓</i>Avec moi</div>
      <div class="cmp-txt">Ta demande avec photo, <b>reçue et datée</b></div></div>
  </div>
  <div class="stage"><div class="phone mid cut"><img src="${shot('demande.png')}"></div></div>`)],

// ---------- 4. le prix ----------
['04-prix', frame('ÉTAPE 3', `
  <div class="head"><h1 class="small">Je te donne<br><em>ton prix d'achat</em></h1></div>
  <div class="cmp">
    <div class="cmp-side no"><div class="cmp-tag"><i>✕</i>Sans moi</div>
      <div class="cmp-txt">Un prix annoncé, puis des frais qui s'ajoutent</div></div>
    <div class="cmp-arrow">↓</div>
    <div class="cmp-side yes"><div class="cmp-tag"><i>✓</i>Avec moi</div>
      <div class="cmp-txt">Un seul chiffre, <b>livraison comprise</b></div></div>
  </div>
  <div class="stage card-stage"><div class="card">
    <div class="card-top"><div class="card-kicker">Sacoche cuir Milano · 20 pièces</div>
      <div class="card-badge">Livraison incluse</div></div>
    <div class="row">Prix à la pièce<b>29 €</b></div>
    <div class="row">Livraison jusqu'à chez toi<b>incluse</b></div>
    <div class="rule"></div>
    <div class="big"><u>580 €</u><span>et c'est tout.<br><b>Rien ne s'ajoute à l'arrivée.</b></span></div>
  </div></div>
  <div class="foot"><div class="tag"><i></i>Ni frais de port, ni douane surprise</div></div>`)],

// ---------- 5. je suis en Chine ----------
['05-achat', frame('ÉTAPE 4', `
  <div class="head"><h1 class="small">Je suis<br><em>en Chine</em></h1></div>
  <div class="cmp">
    <div class="cmp-side no"><div class="cmp-tag"><i>✕</i>Sans moi</div>
      <div class="cmp-txt">Le prix du grossiste, déjà repris trois fois</div></div>
    <div class="cmp-arrow">↓</div>
    <div class="cmp-side yes"><div class="cmp-tag"><i>✓</i>Avec moi</div>
      <div class="cmp-txt"><b>Le prix de la source</b>, directement</div></div>
  </div>
  <div class="stage card-stage"><div class="card">
    <div class="card-top"><div class="card-kicker">Ce que ça te fait</div></div>
    <div class="row">Ton prix d'achat<b>29 €</b></div>
    <div class="row">Ta revente en France<b>89 €</b></div>
    <div class="rule"></div>
    <div class="big"><u>×3</u><span>minimum à la revente.<br><b>60 € de marge la pièce</b>, soit 1 200 € sur les 20.</span></div>
  </div></div>
  <div class="foot"><div class="tag"><i></i>Plus tu prends, plus ça descend</div></div>`)],

// ---------- 6. le suivi ----------
['06-suivi', frame('ÉTAPE 5', `
  <div class="head"><h1 class="small">Tu suis<br><em>ton stock</em></h1></div>
  <div class="cmp">
    <div class="cmp-side no"><div class="cmp-tag"><i>✕</i>Sans moi</div>
      <div class="cmp-txt">Tu paies, tu attends, tu relances</div></div>
    <div class="cmp-arrow">↓</div>
    <div class="cmp-side yes"><div class="cmp-tag"><i>✓</i>Avec moi</div>
      <div class="cmp-txt">Six étapes en direct, <b>numéro de suivi</b></div></div>
  </div>
  <div class="stage"><div class="phone mid"><img src="${shot('suivi.png')}"></div></div>`)],

// ---------- 7. les Dollarz ----------
['07-dollarz', frame('ÉTAPE 6', `
  <div class="head"><h1 class="small">Plus tu commandes,<br>plus tu <em>gagnes</em></h1></div>
  <div class="cmp">
    <div class="cmp-side no"><div class="cmp-tag"><i>✕</i>Sans moi</div>
      <div class="cmp-txt">Fidèle ou pas, le même prix pour tout le monde</div></div>
    <div class="cmp-arrow">↓</div>
    <div class="cmp-side yes"><div class="cmp-tag"><i>✓</i>Avec moi</div>
      <div class="cmp-txt"><b>1 € = 1 Dollarz</b>, échangeable en remises</div></div>
  </div>
  <div class="stage"><div class="phone mid"><img src="${shot('dollarz.png')}"></div></div>`)],

// ---------- 8. l'appel ----------
['08-cta', frame('', `
  <div class="center">
  <div class="head" style="text-align:center">
    <div class="hero-mark" style="margin-bottom:44px"><div class="hero-tile"><span>$</span></div></div>
    <h1>Dis-moi ce que<br>tu veux <em>revendre</em>.</h1></div>
  <div class="cmp">
    <div class="cmp-side no"><div class="cmp-tag"><i>✕</i>Sans moi</div>
      <div class="cmp-txt">Chercher, comparer, croiser les doigts</div></div>
    <div class="cmp-arrow">↓</div>
    <div class="cmp-side yes"><div class="cmp-tag"><i>✓</i>Avec moi</div>
      <div class="cmp-txt">Un message. <b>Ton prix, ton accès.</b></div></div>
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

