# DOLLAR$ SOURCING

## Le projet

Application de gestion pour une activité d'intermédiaire de sourcing.
Massif (le propriétaire) est basé en Chine, achète en gros à des fournisseurs
locaux et revend à des clients français rencontrés sur TikTok et Snapchat.

Flux type : un client demande un produit sur WhatsApp (souvent avec une photo)
→ Massif demande le prix au fournisseur → il ajoute sa marge → le client paie
→ Massif achète et expédie via un transitaire. **Les prix annoncés au client
incluent toujours la livraison** : il n'y a pas de ligne transport séparée.

Objectif à terme : en faire un SaaS payant par abonnement.

## Fichiers

- `index.html` — application pro (Massif et ses invités)
- `client.html` — portail client, accessible par lien personnel (bilingue lui aussi,
  langue détectée depuis le navigateur, bascule FR/EN mémorisée)
- `functions/api/ai.js` — proxy serveur vers l'API Anthropic sur Cloudflare
  Pages (garde la clé cachée). Répond à `/api/ai`, le chemin se déduit de
  l'emplacement du fichier.
- `netlify/functions/ai.js` — le même proxy, version Netlify, gardé en secours.
  L'app choisit le bon chemin d'après le nom de domaine : `/.netlify/functions/ai`
  sur `*.netlify.app`, `/api/ai` partout ailleurs.
- `firestore-rules.txt` — règles de sécurité. On l'ouvre, on sélectionne tout,
  on colle dans la console Firebase (Firestore Database → Règles → Publier).
  Publier des règles ne coûte aucun déploiement Netlify, et la console garde
  l'historique des versions : on peut revenir en arrière en deux clics.

### Qui a le droit de quoi, dans les règles

`request.auth != null` **ne suffit pas** : n'importe quel compte Google peut se
connecter à Firebase. Les règles vérifient donc l'adresse — le propriétaire en
dur, et les invités relus dans `settings/access`, la même liste que celle du
bouton « Accès ». Elles exigent en plus une adresse vérifiée.

Le cloisonnement multi-utilisateur est appliqué **par la base, pas seulement par
l'interface** : `isMine()` et `claimingMine()` imposent qu'on ne modifie que ses
propres commandes et clients, et qu'on ne crée rien au nom d'un autre. Les
fournisseurs sont partagés en lecture et en modification, mais seul leur
créateur — ou le propriétaire — peut les supprimer. La création de demandes
clients, seule écriture publique, est validée (produit non vide et borné,
quantité entière et bornée) : c'est le garde-fou contre l'abus.

Seul le propriétaire modifie la liste d'accès, et la mémoire de l'assistant
lui est réservée.

### Ce que les règles autorisent, et ce que ça coûte

Le portail client n'est jamais connecté à Firebase : il s'identifie avec son
lien (id + token) et son code à 6 chiffres, vérifiés dans le navigateur.
Firestore le voit donc comme un visiteur anonyme.

**Le piège qui a coûté une soirée** : le portail ne demande pas une commande par
son identifiant, il fait une **requête** (« toutes celles dont le clientId est le
mien »). Une requête relève de `list`, jamais de `get`. Des règles qui ouvrent
`get` mais réservent `list` à l'équipe donnent donc un portail vide, sans la
moindre erreur visible. `orders` et `pendingOrders` ont besoin de `list` ouvert.

**Conséquence à connaître** : un document de commande brut contient le prix
d'achat et la marge, et une fiche client contient son code d'accès et son
adresse. L'interface ne les montre jamais au client, mais qui connaît la
structure de la base peut les lire. Le correctif propre, à faire avant tout
passage payant : recopier une version publique de chaque commande (produit,
statut, prix client, acompte, expédition, photo) dans une collection à part, et
refermer `orders` complètement. Une demi-journée.
- `netlify.toml` — n'existe que pour éviter les builds inutiles (voir piège 7)
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` —
  ce qu'il faut pour qu'« Ajouter à l'écran d'accueil » installe une vraie app :
  fenêtre propre sans barre de navigateur, icône, nom. **`client.html` n'a
  volontairement pas de manifeste** : son lien porte l'identifiant et le jeton du
  client, et une adresse de départ fixe les effacerait. Les balises iOS lui
  suffisent.

Tout est en HTML/CSS/JS pur, un seul fichier par app, sans build ni framework.
**Ne pas introduire de build, de bundler ou de framework** : la simplicité de
déploiement est un choix assumé.

## Architecture

- **Backend** : Firebase Firestore (projet `dollar-sourcing`)
- **Auth** : Google Sign-In. Propriétaire = `dollars.sourcing@gmail.com`
- **Hébergement** : Cloudflare Pages, déploiement depuis GitHub.
  Le plan gratuit y autorise 500 constructions par mois et l'usage commercial,
  là où Netlify plafonnait à une vingtaine de mises en production — c'est ce
  qui a motivé le déménagement. `netlify/functions/ai.js` et `netlify.toml`
  sont conservés : le site Netlify reste servable en secours.
- **IA** : API Anthropic via la fonction Netlify, modèle `claude-sonnet-5`

### Multi-utilisateur
Chaque document porte un `ownerId`. Commandes, clients et demandes sont
**privés par utilisateur**. Les **fournisseurs sont partagés** entre tous les
comptes autorisés (seul le créateur peut supprimer le sien).
Les invités sont gérés dans `settings/access` (liste d'emails), modifiable
uniquement par le propriétaire via le bouton « Accès ».
L'assistant IA est **réservé au propriétaire** (c'est sa clé API qui paie).

### Portail client
Lien de la forme `client.html?id=CLIENT_ID&token=TOKEN` + code d'accès à
6 chiffres. **Créer un client rouvre aussitôt sa fiche** sur un bandeau
« Profil créé », avec son lien, son code et le bouton WhatsApp sous la main —
sans ça il fallait ressortir de la liste et rouvrir le client pour les
retrouver. Le message d'invitation (`waLinkMessage`) accueille, donne le lien
et le code, et explique comment ajouter l'espace à l'écran d'accueil. Le client peut envoyer une demande avec photo ; elle arrive dans
l'onglet « Demandes » du vendeur, qui la valide en fixant ses prix.
**Le client ne voit jamais les coûts d'achat ni les marges.**

Ses commandes terminées (livrées ou annulées) ne disparaissent jamais toutes
seules : le client les range lui-même avec un bouton, et elles rejoignent un
bloc « Historique » replié d'où il peut les ressortir. Ce tri vit dans son
navigateur (`ds_client_archived_<id>`), pas dans la base : c'est une préférence
d'affichage, elle ne justifie pas d'ouvrir une écriture publique. Contrepartie
assumée : depuis un autre appareil, son rangement ne le suit pas.

À sa toute première visite, le client est accueilli par une carte qui explique
l'espace : lien personnel protégé par son code, programme de fidélité (1 € = 1
Dollar), et proposition d'activer Face ID pour les fois suivantes (seulement si
l'appareil le permet et que ce n'est pas déjà fait). Elle se ferme d'un bouton et
ne revient plus (`ds_client_welcomed_<id>` en localStorage).

Les clients **déjà venus** n'ont jamais vu cet accueil parler des Dollars : ils
reçoivent une annonce dédiée, une seule fois (`ds_client_dollars_intro_<id>`),
avec un bouton qui les emmène directement dans la boutique.

Une troisième carte ferme la file : **« Mets-le sur ton écran d'accueil »**
(`ds_client_install_<id>`). Elle explique le geste, parce qu'un client qui
installe l'app la garde. Trois cas, et ils ne se ressemblent pas : Android
propose un vrai bouton via `beforeinstallprompt`, iOS oblige à décrire un geste
dans une interface qui n'est pas la nôtre (Partager → Sur l'écran d'accueil),
et une app déjà lancée en `display-mode: standalone` ne demande évidemment rien.

**Jamais deux cartes à la fois.** Chacune ne s'affiche que si les précédentes
ont été vues, et fermer l'une déclenche le rendu de la suivante. Un nouveau
client a l'annonce Dollars marquée comme vue d'avance, puisque sa carte de
bienvenue en parle déjà : il voit donc bienvenue, puis installation.

C'est un espace personnel, pas un formulaire : accueil par son prénom selon
l'heure, compteurs (en cours / livrées / en attente), et pour chaque commande
une frise des six étapes (demande reçue → devis → payé → commandé → expédié →
livré) avec l'étape courante mise en valeur. Il y voit aussi son prix total
(livraison incluse), ce qu'il a déjà réglé, ce qu'il reste à régler, ses
photos, et le bloc expédition dès qu'une information existe.

Le bloc expédition lit `carrier` / `forwarder`, `tracking` / `trackingNumber`,
`eta` / `estimatedDelivery` sur la commande, saisis dans la fiche commande côté
vendeur (section « Expédition », visible seulement sur une commande existante).
Il apparaît dès qu'une de ces informations existe, et se complète tout seul.

La date estimée est stockée en ISO (`AAAA-MM-JJ`) et affichée dans la langue du
client ; une valeur libre (« mi-octobre ») reste affichée telle quelle. Elle est
toujours accompagnée de la mention qu'il s'agit d'une estimation : **ne jamais
la présenter comme une promesse.**

Dès qu'un numéro de suivi existe, le client a un bouton « Suivre mon colis » qui
ouvre la page publique 17TRACK (`t.17track.net`), laquelle agrège la plupart des
transporteurs chinois. Aucun compte, aucune clé, aucun coût : c'est le seul lien
en dur autorisé, parce qu'il pointe un service tiers et non notre propre app.

### Dates de parcours

Chaque commande porte une carte `statusAt` : une date par étape franchie
(`statusAt.paye`, `statusAt.expedie`...), écrite à chaque changement de statut,
d'où qu'il vienne — flèche du stepper, enregistrement de la fiche, annulation,
assistant IA. L'écriture utilise un **chemin pointé** (`statusAt.expedie`) pour
ne toucher que cette clé et préserver les autres dates.

Les commandes créées avant n'ont pas d'historique : on n'invente aucune date,
l'affichage ne montre que ce qui existe. Ces dates alimentent la fiche client
et, plus tard, le calcul des délais réels par transitaire pour pré-remplir la
livraison estimée.

### Programme de fidélité — les Dollars

Chaque client cumule des **Dollars**, la monnaie interne, et les échange contre
des coupons de remise dans une boutique en libre-service de son espace.

**Ce programme n'est pas un remerciement, c'est un tri.** Il sert à avantager
les meilleurs clients et ceux qui commandent en gros, pas l'acheteur de passage.
Barème requalifié le 3 septembre 2026 après un premier jet calibré pour du
détail, **à ne pas modifier à la légère** : dévaluer des Dollars déjà accumulés
se voit et se paie en confiance. La requalification a pu se faire sans dégât
parce qu'il n'y avait encore que des clients de test — ce ne sera plus vrai.

| Dollars | Coupon | Valable dès | Ce qu'on rend | Remise au minimum |
|---|---|---|---|---|
| 400 | 16 € | 300 € d'achat | 4 % | 5,3 % |
| 1 000 | 55 € | 400 € d'achat | 5,5 % | 13,8 % |
| 2 000 | 130 € | 900 € d'achat | 6,5 % | 14,4 % |
| 3 500 | 260 € | 1 800 € d'achat | 7,4 % | 14,4 % |
| 5 000 | 450 € | 3 000 € d'achat | 9 % | 15 % |

**Deux leviers, et ils tirent dans le même sens.** Le taux passe de 4 % à 9 % :
la patience rapporte plus du double. Et le minimum d'achat de chaque coupon met
les gros paliers **hors de portée d'un acheteur au détail** — un client qui
commande à 400 € n'utilisera jamais le coupon à 450 €, quoi qu'il accumule.
Ce n'est pas un effet de bord, c'est le mécanisme.

Aucune remise ne dépasse **15 % du total** de la commande où elle s'applique :
sans ça, un coupon gagné sur une grosse commande viendrait ruiner la marge d'une
petite. C'est cette règle qui fixe les minimums, et donc qui plafonne la valeur
du plus gros coupon à ce qu'une commande réelle peut absorber. Le jour où les
paniers montent, on peut ajouter un palier au-dessus ; **ajouter, jamais
resserrer**.

Un coupon **déjà accordé fige ses conditions** (`dollars`, `value`, `min` sont
recopiés dans la fiche du client) : changer le barème ne dévalue rien
rétroactivement. Une demande d'échange encore en attente, elle, référence un
palier qui peut avoir disparu — `grantCoupon()` retombe alors sur la valeur
portée par la demande, pour honorer ce que le client avait sous les yeux.

**Les six règles :**

1. **Un Dollar par euro réellement payé**, crédité au passage à « Livré ». Une
   commande annulée ne rapporte rien — et **rend le coupon** qu'elle portait :
   le client n'a rien payé, il serait injuste de le lui brûler.
2. **Les Dollars se gagnent sur le montant après remise** — sinon la cagnotte
   s'auto-alimenterait sur de l'argent jamais dépensé.
3. **Un seul coupon par commande.**
4. **Pas d'expiration.** Un client qui perd ses points ne retient que ça.
5. **Ni transférable, ni convertible en euros** : uniquement une remise sur un
   achat futur. C'est ce qui garde le programme du côté du geste commercial et
   non de la monnaie électronique — décisif tant qu'il n'y a pas de SIRET.
6. **Le vendeur valide chaque échange.** Le client choisit librement dans la
   boutique, l'échange arrive dans l'onglet « Demandes », rien ne sort sans un
   geste du vendeur.

### Ce que le programme coûte vraiment

La question s'est posée : un client qui enchaîne les petites commandes pour
encaisser le coupon d'entrée, est-ce une fuite ? **Non, et c'est l'inverse.**

Le coût est **borné par construction**, pour trois raisons qui s'empilent : un
coupon s'achète en Dollars, les Dollars ne viennent que d'argent réellement
payé, et ils se gagnent **après** remise — la cagnotte ne se nourrit donc jamais
d'elle-même. Un palier qui rend `r` ne peut pas coûter plus de `r / (1 + r)` du
chiffre d'affaires brut, quoi que fasse le client :

| Palier | Ce qu'on rend | Coût maximum du CA |
|---|---|---|
| 400 | 4 % | 3,85 % |
| 1 000 | 5,5 % | 5,21 % |
| 2 000 | 6,5 % | 6,10 % |
| 3 500 | 7,4 % | 6,91 % |
| 5 000 | 9 % | 8,26 % |

Simulé sur 400 commandes avec un client rationnel (il prend à chaque fois le
meilleur coupon qu'il peut utiliser) : **3,8 % du CA** pour celui qui commande à
300 €, **8,2 %** pour celui qui commande à 3 000 € et thésaurise. Le « spammeur »
de petites commandes est donc le client **le moins cher** du programme, et le
gros client patient le plus cher — ce qui est exactement l'intention.

**Il n'y a donc aucun plafond d'utilisation à ajouter** : le plafond est déjà là,
il est mathématique. Le seul vrai levier reste le taux du haut du barème.

**Un Dollar ne coûte rien, un coupon coûte de vrais euros.** La confusion est
facile et elle a été faite : émettre des Dollars, c'est écrire un nombre dans
une base. La dépense arrive quand le coupon est *utilisé* — le client verse
284 € au lieu de 300 €, et les 16 € manquants n'arrivent jamais sur le compte.
La monnaie fictive, c'est le marketing ; le coupon, c'est la facture. C'est ce
décalage qui fait la force du programme (annoncer « 2 000 Dollars » coûte 130 €),
mais il ne rend pas le programme gratuit.

À marge ×3 sur le prix d'usine, le programme se paie tout seul dès qu'il fait
grossir le volume de **5 à 10 %**. Sur la pire commande possible (3 000 € avec
le coupon de 450 €), il reste 77 % de la marge.

**Le compteur de l'onglet Statistiques existe pour une raison précise** : le coût
est visible et chiffré en euros, le bénéfice est invisible — on ne voit jamais
le client qui est resté. Sans rapprochement, un programme rentable finit par
être arrêté au ressenti. Le bloc met donc côte à côte les remises accordées, la
dette (coupons dus + Dollars en circulation au meilleur taux du barème) et le
rythme de commande des clients avec coupon face à ceux sans. Le rythme est
**normalisé par l'ancienneté** — sinon un client arrivé la semaine dernière
paraîtrait plus fidèle qu'un ancien — et **aucun verdict n'est affiché sous
3 clients de chaque côté** : en dessous, l'écart n'est que du bruit.

**Le solde ne se stocke jamais** : il se recalcule à partir des commandes
livrées moins les coupons accordés. Rien à maintenir, rien qui dérive, et une
commande corrigée met le solde à jour toute seule. **Un coupon est consommé**
dès qu'une commande porte son `couponId` — là encore rien à marquer.

Ce que ça donne dans les données : `orders.discount` et `orders.couponId` pour
la remise appliquée, `clients.coupons[]` pour les coupons accordés. La remise
entre dans tous les calculs d'argent via `orderNetPrice()` — marge, reste à
régler, chiffre d'affaires, statistiques : une remise sort de la poche du
vendeur, elle doit se voir partout.

L'échange passe par `pendingOrders` avec `type:'coupon'` : c'est la seule
écriture publique, et elle est déjà validée par les règles. Le document porte
un `product` et un `qty` factices pour satisfaire cette validation. Le solde du
client est **revérifié au moment d'accorder**, jamais seulement à l'affichage.

La monnaie reprend l'identité de l'icône de l'app : dégradé vert (orange en
thème sombre) et glyphe `$`, classe `.ds-coin`. En mode discret, le solde d'un
client se cache comme les marges : il révèle ce qu'il a dépensé.

### Corbeille
Les suppressions sont douces (`deletedAt`), restaurables 30 jours, avec un
bouton « Annuler » immédiat dans le toast. Purge automatique au-delà.

## Design — règles à respecter

- **Thème clair** : fond blanc, vert (`#2eb35c`), gris nardo. **Jamais de noir pur.**
- **Thème sombre** : noir, orange Brabus (`#ff7a1a`), gris nardo.
- Bascule automatique selon l'heure, avec choix manuel mémorisé.
- **Le rouge est réservé au danger** (suppression, marge négative). Les actions
  destructives sont les seules en bouton plein.
- **Ambre** (`--warn`) uniquement pour les soldes clients impayés.
- **Mode discret** : un bouton dans l'en-tête pour montrer l'app — ou la filmer
  — sans montrer ce qu'elle rapporte. Deux niveaux, et la distinction compte :
  les montants « neutres » (prix client, CA, panier moyen) sont **floutés** ;
  tout ce qui trahit le modèle — marges, prix d'achat, à encaisser, soldes dus —
  porte la classe `.private` et **disparaît**. Un flou à côté du mot « Marge »
  en dit déjà trop et attire l'œil : pour une vidéo, il faut que ça n'existe pas
  à l'écran. Choix mémorisé, bouton allumé tant que le mode est actif. Les noms,
  produits, statuts, dates et compteurs restent lisibles.

  **Le piège du flou oublié** : la classe `.margin` (comme `.badge-due`) est
  seulement *floutée* par défaut ; c'est le balisage `.private` posé à côté qui
  la fait disparaître. Oublier le `.private` sur une occurrence donne un rendu
  qui a l'air protégé et ne l'est pas — la liste des clients a vécu ça, elle
  affichait la marge générée et le solde dû en flou. **À chaque nouvel affichage
  d'un montant, vérifier lequel des deux niveaux s'applique**, et ne jamais se
  fier au fait que « ça a l'air flouté ». Quand un élément `.private` laisse un
  trou (le badge « doit X € » d'une fiche client), un `.only-discreet` prend sa
  place : visible seulement en mode discret, il évite la carte nue.
- Effet tactile « liquid glass » sur tout élément cliquable : enfoncement,
  onde depuis le point de contact, rebond au relâchement.
- Finitions : bordures 0.5px, chiffres tabulaires, flou avec saturation,
  ombres en deux couches, respect des zones sûres (encoche).
- Interface bilingue FR/EN via l'objet `I18N`. **Toute nouvelle chaîne doit
  exister dans les deux langues**, sinon l'app affiche la clé brute.
  `client.html` a désormais son propre `I18N` : même règle.

### Le mouvement

Le mouvement doit donner envie d'utiliser l'app, **jamais la ralentir**.

- **Zones de travail = instantané.** Aucune animation d'entrée sur les listes
  (commandes, clients, fournisseurs, demandes), les formulaires, le clavier de
  code. On y vient pour agir, pas pour regarder.
- **Zones de respiration = soignées.** Écran d'ouverture, accueil invité,
  tableau de bord, portail client : c'est là qu'on peut se lâcher.
- Le tableau de bord : chiffres qui comptent depuis zéro (une seule fois, à
  l'arrivée), cartes révélées en montant au défilement (`.reveal` +
  IntersectionObserver), passage d'un onglet à l'autre qui glisse (`.view-in`,
  la direction suit l'ordre des onglets), fond en dégradé qui respire sur 28 s.
- **Le portail client a son ouverture à lui.** Après le code, un rideau plein
  écran : la pièce `$` de l'app éclot avec son halo, un reflet la balaie, le
  prénom du client monte, la marque se pose. Puis il se lève et l'app entre.
  Point clé : le rideau s'affiche **par-dessus** l'app déjà montée, et
  `listenOrders()` part avant lui — l'ouverture ne fait donc pas attendre, elle
  **couvre** le chargement Firestore qui a lieu à cet instant. Sans elle, le
  client regardait une page nue se peupler. Le calque est retiré du flux
  (`display:none`) une fois effacé, sinon il mangerait tous les touchers.
- **Le portail client est la zone la plus travaillée**, parce que c'est la
  vitrine : c'est là que le client décide s'il reste. Compteurs du résumé et
  solde en Dollars qui montent depuis zéro, cartes et paliers de la boutique en
  cascade (`stagger()`, plafonnée à cinq éléments — au-delà un retard ne
  s'admire plus, il se subit), frise qui se dessine point par point derrière la
  ligne, halo du solde qui respire, reflet qui balaie la pièce.

  Trois règles apprises en le construisant. **Un compteur ne se rejoue jamais**
  (`summaryCounted`, `dollarsCounted`) : la première fois c'est un plaisir, la
  dixième une attente. **La frise ne s'anime qu'au moment où la carte devient
  visible** — déclenchée dans `fillTracks()`, pas au rendu, sinon elle se
  dessine derrière l'écran et le client ne voit rien. Et **une seule chose
  bouge en boucle par écran** : dans la boutique, seul le palier accessible
  respire, ce qui envoie l'œil exactement là où on veut. Cinq pièces qui
  brillent en même temps, ce n'est pas du luxe, c'est un sapin de Noël.

  Piège technique : l'étape courante de la frise porte un `transform:scale(1.45)`
  qu'une animation d'entrée écraserait. Le repos passe donc par une variable
  (`--pop`) que le `to:` du keyframe réutilise.

  **L'ambiance et le cadre.** Trois masses de lumière dérivent en fond de page
  (`#aurora`, transform seul, `contain:strict`), avec **trois durées premières
  entre elles** (34 s, 46 s, 58 s) : des durées égales donneraient un battement
  mécanique qu'on repère immédiatement. Quand le grand en-tête sort de l'écran,
  une **barre compacte** prend le relais avec le prénom et le solde en Dollars ;
  elle est pilotée par un IntersectionObserver sur une sentinelle, **jamais par
  un écouteur de défilement** — le navigateur prévient, on ne l'interroge pas à
  chaque pixel. Pendant le chargement, un **squelette qui scintille** remplace le
  mot « chargement » : il donne la forme de ce qui arrive, donc l'attente paraît
  plus courte et le vide ne ressemble plus à une panne.

  **La pastille des onglets glisse** au lieu de sauter d'un onglet à l'autre.
  Piège : `--fill` n'est qu'à 10 % d'opacité, la pastille passait donc en
  fantôme vert sous les onglets inactifs. Ils sont devenus opaques — fond de
  page plus la même teinte en `::before` — donc exactement la couleur perçue
  d'avant, sans transparence. La pastille se recale à la bascule, **au
  changement de langue** (les libellés anglais n'ont pas la même largeur) et au
  redimensionnement.

  **Ce qui donne l'impression que ça a coûté cher, ce n'est pas la quantité de
  mouvement — c'est la matière et l'arrivée.** Deux lumières lentes dérivent
  derrière le prénom (`.hello-aura`, transform seulement, donc composé par le
  GPU), et un reflet balaie chaque carte à son apparition : c'est ce qui fait
  lire la surface comme du verre plutôt que comme un rectangle. Une page où
  tout bouge tout le temps ne fait pas riche, elle fait bon marché.
- **`prefers-reduced-motion` partout.** Attention : accélérer une animation
  infinie la fait clignoter — il faut la couper (`animation:none`), pas la
  raccourcir. Les blocs `@media (prefers-reduced-motion:reduce)` des deux
  fichiers listent nommément les animations infinies à neutraliser.

## Pièges déjà rencontrés — ne pas les refaire

1. **iOS force le mode sombre.** Il faut `<meta name="color-scheme" content="only light">`
   (ordre des mots important), `color-scheme:only light` en CSS, un `#bgfill`
   fixe, et des styles inline sur `html` et `body` mis à jour au changement de thème.
2. **Un seul moteur de reconnaissance vocale.** Deux instances simultanées
   font planter Safari. Le bouton micro ouvre le mode vocal, il n'écoute pas lui-même.
3. **Voix sur iOS** : le « final » n'arrive presque jamais — il faut accepter le
   texte provisoire. La reconnaissance et la synthèse exigent un geste utilisateur
   direct (appui maintenu sur la sphère). Ne jamais relancer l'écoute sans délai :
   une relance immédiate crée une boucle infinie qui fige la page.
4. **Le PIN est par utilisateur** (`userSettings/{uid}`), pas dans `settings/`
   qui est réservé au propriétaire — sinon les invités ne peuvent pas créer le leur.
5. **Spécificité CSS** : une règle comme `.key span` peut écraser `.ripple`.
   L'onde de contact est un `<i>` avec un sélecteur prioritaire.
6. **Dans une rangée de boutons**, le bouton principal doit être `flex:1`,
   sinon il prend 100% et écrase le bouton « Annuler ».
7. **Crédits Netlify** : seul un **déploiement de production** en consomme
   (~15 crédits sur les 300 mensuels du plan gratuit, soit une vingtaine de mises
   en ligne par mois). Les **previews de PR et les déploiements de branche sont
   gratuits** : c'est là qu'il faut tester avant de fusionner. Deux comptes ont
   déjà été épuisés — **regrouper les modifications**, ne fusionner qu'une fois
   prêt. `netlify.toml` annule le build quand un commit ne touche qu'à la
   documentation.
8. **Les URLs se déduisent toutes seules** (`location.origin`) : ne jamais
   réintroduire d'adresse en dur, on a déjà changé d'hébergeur deux fois.
9. **Un écouteur Firestore sans gestion d'erreur laisse une page blanche.**
   Le portail client n'affichait rien quand la base refusait la lecture : pas de
   message, pas d'erreur visible, juste du vide. Tout `onSnapshot` doit avoir
   son second argument, et l'écran doit distinguer trois états : en cours de
   chargement, vide, et accès refusé.
10. **Une lecture unique (`.get()`) n'est pas un écouteur.** La fiche du client
   était lue une seule fois, à l'ouverture du portail, pour vérifier son lien.
   Le vendeur accordait un coupon, Firestore était à jour, le côté vendeur
   aussi — mais la page du client gardait la fiche d'avant : son solde ne
   baissait pas et son coupon n'apparaissait pas tant qu'il ne rechargeait pas
   tout. La fiche est désormais **écoutée en direct** après l'entrée
   (`listenClientDoc()`), le `.get()` initial ne servant plus qu'à ouvrir la
   porte. Règle : **toute donnée que l'autre côté peut modifier doit être
   écoutée, jamais lue une fois.** Le rendu du solde n'est rappelé que si
   l'onglet Dollars est ouvert, sinon le compteur se consommerait hors écran et
   ne monterait plus quand le client y arrive.
11. **Le portail client n'est pas connecté à Firebase.** Il s'identifie avec le
   lien (id + token) et le code à 6 chiffres, vérifiés dans le navigateur.
   Firestore le voit comme un visiteur anonyme : toute lecture dont il a besoin
   (`clients` par id, `orders`, `pendingOrders`) doit rester ouverte dans les
   règles, sinon le client ne voit plus ses commandes. Voir la note de sécurité
   en bas de `firestore-rules.txt`.
12. **Le lien 17TRACK passe le numéro dans un fragment** (`#nums=`). Un navigateur
   ne recharge pas la page quand seul le fragment change : rouvrir le lien avec
   un autre numéro **dans le même onglet** laisse l'ancien colis à l'écran. Le
   bouton du portail ouvre un nouvel onglet, donc pas de souci en usage normal —
   mais si un client tape deux suivis à la suite depuis un navigateur intégré
   (Snap, TikTok) qui réutilise le même onglet, il pourrait revoir le premier
   colis. À vérifier en vrai ; le correctif serait de passer le numéro aussi en
   paramètre de requête (`?nums=`) pour forcer une vraie navigation.

## Assistant IA

Répond en JSON strict. Types : `question`, `confirm`, `execute`, `answer`,
`translate`, `draft`, `brief`. Actions : création et modification de clients,
commandes, fournisseurs, changement de statut.
Il reçoit un instantané des données réelles et une mémoire persistante
(`settings/assistantMemory`) qu'il enrichit via un champ `remember`.
Il sait lire une photo, une conversation WhatsApp collée, et un formulaire
client rempli ligne par ligne.

## Fait

Commandes, clients, fournisseurs (avec marques et modèles), statistiques,
demandes clients, thèmes clair/sombre, bilingue, connexion Google, verrou PIN
et biométrie, multi-utilisateur, corbeille, mode hors ligne, assistant IA
(texte, vocal, photo), portail client avec photo, autocomplétion d'adresses
françaises, suivi des acomptes, photos au format d'origine avec ouverture en
plein écran, écran d'ouverture animé, mouvement du tableau de bord, écran
d'accueil des comptes invités, portail client repensé (frise de suivi,
montants, expédition, bilingue), suivi d'expédition (transitaire, numéro,
date estimée) avec lien de suivi côté client, dates de parcours par commande,
historique par client dans sa fiche, archivage volontaire côté client,
mode discret qui masque montants et marges, programme de fidélité complet
(Dollars, boutique de coupons, échanges validés par le vendeur, remise sur la
commande), annonce du programme aux clients, compteur de rentabilité de la
fidélité dans les statistiques.

## À faire

- Délais réels par transitaire (moyenne calculée sur `statusAt`) pour
  pré-remplir la date de livraison estimée
- Photo dans la fiche fournisseur
- Dupliquer une commande
- Alerte sur les devis sans réponse depuis plusieurs jours
- Plus tard : abonnement payant, inscription autonome

## Volontairement écarté

Facturation légale, mentions obligatoires, numérotation de factures :
Massif n'est pas encore immatriculé. **Ne rien construire là-dessus** tant
qu'il n'a pas de SIRET.

API de suivi automatique (17TRACK, TrackingMore, AfterShip) : écartée pour
l'instant. À faible volume on paie le ticket d'entrée, pas les colis (~110 €/an
chez 17TRACK, dont le quota expire à 12 mois), et rien ne garantit que le
transitaire du moment soit couvert. Le lien 17TRACK donne déjà la position
réelle au client sans dépendance ni clé. À rouvrir seulement si le volume le
justifie, et après avoir testé la couverture avec les numéros gratuits.

## Méthode de travail

Massif préfère **discuter avant d'implémenter**. Présenter le plan, laisser
choisir, puis construire. Vérifier systématiquement le code produit
(syntaxe, équilibre du HTML, parité des traductions) avant de livrer.
