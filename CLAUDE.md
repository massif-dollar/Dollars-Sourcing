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
- `formulaire.html` — la page où un client remplit ses informations avant sa
  première commande. **Cinq lignes, et ce sont exactement celles qu'on recopie
  sur le colis** : nom, adresse, code postal & ville, pays, téléphone. Ni plus —
  une ligne de trop, c'est un client qui abandonne — ni moins : une ligne qui
  manque, c'est un colis qui revient. Le pays est pré-rempli à France et reste
  le seul champ facultatif. Le pseudo réseau social et le WhatsApp n'y sont plus
  demandés : Massif les a déjà, c'est par là qu'il envoie le lien.
  Choisir une suggestion d'adresse remplit **la rue et la ligne code postal +
  ville d'un coup** : c'est tout l'intérêt d'avoir séparé les deux champs.
  Bilingue, thèmes, autocomplétion d'adresses françaises. **Elle n'écrit rien dans la base** : elle
  fabrique un message WhatsApp propre que le client envoie lui-même, et que
  l'assistant de l'app sait lire ligne par ligne. C'est ce qui la rend sans
  risque — ouvrir une écriture publique sur `clients` aurait demandé un tout
  autre garde-fou, et le seul temps gagné aurait été un copier-coller.
  Le destinataire peut être passé dans le lien (`?to=33…`) ; sans lui, WhatsApp
  s'ouvre sur le choix du contact avec le message déjà écrit — la conversation
  d'où vient le lien est en haut de la liste. Aucun numéro n'est écrit en dur.
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
- `og-client.png` — la bannière 1200×630 que WhatsApp, iMessage et Snapchat
  affichent au-dessus du lien du client. **Un message WhatsApp est du texte
  brut** : on ne peut pas y envoyer de HTML ni de gabarit, et **un aperçu de
  lien ne s'anime jamais** — c'est une image fixe, en format large, pas en 9:16.
  Les seules surfaces graphiques sont donc cet aperçu et le balisage propre à
  WhatsApp (`*gras*`, `_italique_`) dans le texte. La bannière porte la marque,
  « Bienvenue dans ton espace personnel » et **trois lignes qui disent à quoi
  sert le profil** — elle est la même pour tous : la personnaliser au prénom
  exigerait une fonction serveur devant tout le site, ce qui a été écarté.
  Le prénom vit donc dans le texte du message. Regénérable avec un rendu Chromium à cette taille ; les polices du
  projet s'installent depuis npm (`@fontsource/space-grotesk`, `@fontsource/inter`)
  et s'embarquent en base64, Google Fonts n'étant pas joignable partout.

- `og-form.png` — la bannière 1200×630 du lien de `formulaire.html`. Même
  famille que `og-client.png` (noir, orange Brabus, halos, grille) mais
  **composition inversée** et visuel de formulaire qui se remplit : deux liens
  qui afficheraient la même carte prêteraient à confusion. Régénérée par le
  même procédé, polices embarquées en base64.

  **Point non négociable à retenir** : WhatsApp n'affiche une bannière **que si
  le message contient un lien**. L'ancien « formulaire à remplir » était une
  liste de champs à recopier, donc du texte pur : aucune mise en forme n'aurait
  pu lui donner un aperçu. C'est la raison d'être de la page, pas un bonus.
- `icon-source.png` et `make-icons.py` — l'illustration d'origine et le script
  qui en tire les trois icônes (`python3 make-icons.py`, pillow requis). Deux
  pièges, invisibles tant que l'app n'est pas installée : **iOS compose une
  icône transparente sur du noir**, donc les coins arrondis de la tuile
  donneraient quatre angles noirs — chaque ligne et chaque colonne est
  prolongée par sa couleur de bord ; et **iOS applique son propre masque
  arrondi**, au même rayon que celui déjà dessiné, si bien que le liseré de
  l'ancien arrondi resterait visible juste à l'intérieur du masque — un léger
  agrandissement (12 %) le pousse hors champ sans rogner le dessin.
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

- **Backend** : Firebase Firestore (projet `dollars-sourcing`)
- **Auth** : Google Sign-In. **Deux adresses propriétaires** (`OWNER_EMAILS`
  dans `index.html`, `isOwner()` dans les règles) : `dollars.sourcing@gmail.com`,
  l'adresse de l'activité, et `chweirtzleryoyo@gmail.com`, l'adresse personnelle
  gardée **en secours**. Ce n'est pas du confort : la première a déjà été
  désactivée sans préavis (voir plus bas), et le propriétaire est le seul à
  pouvoir modifier la liste d'accès — perdre son adresse, c'est perdre l'app.
  Les deux listes doivent rester identiques ; l'une est dans le code, l'autre
  dans les règles, et une règle publiée ne se déploie pas avec le site.

  **Le 5 septembre 2026, Google a désactivé le compte `dollars.sourcing@gmail.com`**
  (motif : « créé ou utilisé avec plusieurs autres comptes », des comptes ayant
  servi à enchaîner les essais gratuits d'hébergement). Ce n'était pas seulement
  le compte : **le projet Firebase entier a été suspendu** — la base renvoyait
  `PERMISSION_DENIED: Consumer 'projects/dollar-sourcing' has been suspended`,
  donc l'app *et* les portails clients étaient à l'arrêt. Le projet a été
  reconstruit à l'identique sur un compte personnel ancien et légitime ; seules
  la configuration Firebase et l'adresse propriétaire ont changé, pas une ligne
  de fonctionnalité. Les données perdues n'étaient que des données de test.

  **Le compte a été rétabli sur recours quelques heures plus tard.** Le projet
  Firebase, lui, **reste sur le compte personnel** : c'est ce qui sépare
  désormais la propriété de la base de l'adresse de connexion. Si Google
  redésactivait l'adresse de l'activité, la base ne s'arrêterait plus — seule
  la connexion basculerait sur l'adresse de secours.

  **Trois leçons.** Le code sur GitHub est le vrai actif, il n'a rien risqué.
  L'app a un **bouton d'export** (icône dans l'en-tête, `exportData()`) qui
  télécharge commandes, clients et fournisseurs en JSON : **s'en servir
  régulièrement**, c'est la seule sauvegarde qui ne dépend pas de Google. Et à
  terme, une activité ne doit pas reposer sur un Gmail gratuit : un domaine
  avec une adresse professionnelle payante ne se fait pas désactiver par un
  algorithme sans recours.

  Les règles comparent désormais `request.auth.token.email.lower()` : Google
  peut renvoyer l'adresse avec la casse d'origine, et une majuscule aurait suffi
  à verrouiller le propriétaire dehors.
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
client voit donc **bienvenue, puis Dollars, puis installation**.

Piège corrigé : `renderDollarsIntro()` marquait l'annonce comme vue tant que
l'accueil était à l'écran, pour éviter la superposition. Résultat, un nouveau
client la perdait **définitivement** — alors que la carte de bienvenue ne dit
qu'une ligne sur le programme. On la masque désormais sans la consommer.

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

### Référence de commande

Chaque commande porte une **référence de quatre signes** (`#A7F3`) : c'est ce
qu'on écrit au marqueur sur le carton au moment de l'emballer. Le seul geste
manuel demandé, et il règle le problème du volume — un colis en main, on lit le
code, on le tape, on a le client, le produit et l'adresse.

L'alphabet écarte tout ce qui se confond quand c'est écrit à la main :
**ni O contre 0, ni I ou L contre 1**. Trente et un signes, quatre positions,
soit près d'un million de combinaisons.

`freshRef()` vérifie la référence contre **toutes celles déjà chargées**, y
compris les dérivées. Les commandes antérieures n'ont rien de stocké : leur
référence est **dérivée de leur identifiant** (`derivedRef`), donc stable à
chaque affichage sans écrire une ligne dans la base. **La même fonction existe
à l'identique dans `client.html`** — si l'une des deux change, le vendeur et le
client ne parleraient plus du même colis.

La **recherche des commandes couvre aussi la référence et le numéro de suivi** :
c'est l'autre moitié du problème. Un reçu de la poste dans la main, on tape le
numéro et on retrouve à qui on a envoyé.

Astuce sans code, à rappeler : sur iPhone, un appui long dans un champ de texte
propose « Scanner du texte » — le numéro de suivi se saisit à l'appareil photo
depuis l'étiquette, sans faute de frappe.

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

   **La règle disait « réellement payé », le code créditait le prix affiché.**
   Une commande livrée mais impayée rapportait donc des Dollars sur de l'argent
   jamais reçu. `dollarsEarned()` plafonne désormais à
   `min(paidAmount, orderNetPrice)` : un trop-perçu ne fabrique pas de points,
   et un solde réglé plus tard fait remonter le compte tout seul puisque le
   solde se recalcule. Même formule dans `client.html`.
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
- **`.btn-secondary` est rouge par défaut** (`color:var(--danger)`) : il sert
  d'abord à annuler et à supprimer. Le réutiliser pour une action anodine —
  « Tout réglé » à côté du champ « Déjà reçu » — impose donc de lui redonner
  `var(--accent)`, sinon le rouge ment sur ce que fait le bouton.
- Effet tactile « liquid glass » sur tout élément cliquable : enfoncement,
  onde depuis le point de contact, rebond au relâchement.
- Finitions : bordures 0.5px, chiffres tabulaires, flou avec saturation,
  ombres en deux couches, respect des zones sûres (encoche).
- Interface bilingue FR/EN via l'objet `I18N`. **Toute nouvelle chaîne doit
  exister dans les deux langues**, sinon l'app affiche la clé brute.
  `client.html` a désormais son propre `I18N` : même règle.

### La densité sur téléphone

L'app se consulte d'abord sur un iPhone, et elle y était mal agencée : sur un
écran de 844 px, **la première carte de commande arrivait à 509 px** — 60 % de
la hauteur passée en en-tête, trois commandes visibles. Le portail client était
à 36 %.

Tout se joue dans les blocs `@media (max-width:640px)` des deux fichiers. Ils ne
**masquent aucune fonction** : les sept boutons de l'en-tête sont tous là, les
quatre chiffres clés aussi. Ce qui a changé, c'est le vide.

- **L'en-tête** : la baseline « Sourcing & revente » disparaît (elle coûtait une
  ligne et ne disait rien), le titre passe à 21 px, et les sept actions passent
  d'une grille étirée en 42 px de haut à une rangée souple en 34 px. 103 → 67 px.
- **Les chiffres clés** passent **en ligne** dans l'onglet Commandes — libellé à
  gauche, montant à droite — au lieu de quatre demi-cartes empilées. 168 → 100 px.
  Le montant ne se coupe jamais : `white-space:nowrap` dessus, et c'est le
  libellé qui prend l'ellipse s'il le faut. **Cette mise en ligne est réservée à
  `#kpisMain`** : les libellés des statistiques (« Marge (période) ») sont trop
  longs pour tenir à côté d'un montant, ils gardent la disposition empilée, en
  version resserrée.
- **Les cartes** perdent du rembourrage, pas du texte, et l'écart passe de 9 à 7.
- **La fiche commande** garde des champs à la même hauteur — on les remplit au
  doigt — mais l'espace entre eux tombe de 14 à 11.

Résultat : **509 → 348 px** côté vendeur (quatre à cinq commandes visibles au
lieu de trois), **et le portail client à 301 px**. Rien ne descend sous 30 px de
zone tactile, c'est vérifié au navigateur.

Le portail, lui, est traité **plus doucement** : c'est la vitrine, l'accueil au
prénom, les compteurs et le mouvement restent entiers. On n'y a repris que le
vide entre les blocs.

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
   **Deux exceptions assumées**, toutes deux documentées sur place : le lien
   17TRACK, qui pointe un service tiers, et l'adresse de `og-client.png` dans
   les balises d'aperçu de `client.html`. Cette dernière est inévitable : les
   robots de WhatsApp et d'iMessage lisent le HTML brut sans exécuter le
   moindre JavaScript, et une image relative ne s'afficherait pas. C'est la
   ligne à corriger si le domaine change.
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
12. **Le champ `contact` n'est pas un numéro.** Il porte en priorité le pseudo
   réseau social (`social || phone || whatsapp`), parce qu'il sert d'abord à
   l'affichage. Le bouton WhatsApp s'en servait en n'en gardant que les
   chiffres : « massif13 » devenait le numéro « +13 », et WhatsApp répondait
   que le numéro n'existe pas. `waDigits()` lit désormais `whatsapp` puis
   `phone` avant `contact`, convertit un `06…` français en `336…` — WhatsApp
   n'accepte que l'international — et **refuse tout ce qui fait moins de
   8 chiffres**, ce qui n'est jamais un numéro mais le résidu d'un pseudo. Sans
   numéro exploitable, on ouvre WhatsApp sans destinataire avec un message qui
   l'explique, plutôt que d'appeler un numéro inventé.
13. **Un diagnostic posé sur une base morte ne vaut rien.** Le 5 septembre, la
   connexion renvoyait « The requested action is invalid » depuis
   `dollar-sourcing.firebaseapp.com`. On en a conclu que `signInWithPopup` était
   cassé sur iOS, et on l'a remplacé par `signInWithRedirect` — d'abord en mode
   installé, puis sur tout appareil Apple. **Deux corrections pour rien** : le
   projet Firebase était en fait suspendu par Google, et c'est lui qui répondait
   ce message. La fenêtre avait toujours fonctionné.

   Pire, le remplacement a introduit un vrai bug : **la redirection échoue en
   silence dans Safari**. Le domaine d'authentification n'est pas celui de
   l'app, Safari cloisonne son stockage, et le retour de Google ne rapporte
   aucune session — l'utilisateur revient sur l'écran de connexion sans la
   moindre erreur. La fenêtre est donc redevenue la méthode principale, la
   redirection ne servant que de repli quand la fenêtre est bloquée.

   **La leçon : avant de corriger, vérifier que le backend répond.** Un appel
   REST à Firestore aurait donné la réponse en dix secondes et évité deux
   déploiements inutiles.

   Ce qui reste acquis, en revanche : **l'écran de connexion affiche le code
   d'erreur Firebase entre crochets**. Une connexion qui échoue en silence ne
   laisse que des suppositions ; `auth/unauthorized-domain` se lit à voix haute
   au téléphone. Le retour de `getRedirectResult()` est lui aussi affiché.
   Et devant ce symptôme, vérifier **Authentication → Settings → Authorized
   domains**.

   Si la redirection devait un jour redevenir nécessaire, le correctif officiel
   est de servir `/__/auth/*` depuis notre propre domaine via une fonction
   Cloudflare, et de passer `authDomain` sur ce domaine — ce qui exige aussi
   d'ajouter l'URI de redirection dans la console Google Cloud.
14. **Un statut n'est pas un encaissement — mais dans ce métier, presque.**
   Le flux réel veut que le client paie *avant* que la commande soit passée :
   une commande arrivée à « Payé » ou au-delà est donc encaissée. L'app, elle,
   ne connaissait que le champ « Déjà reçu », jamais rempli quand on avance
   avec la flèche du stepper. Une commande livrée laissait donc une **dette
   fantôme** dans la fiche du client (« doit 750 € »), et ne rapportait
   **aucun Dollar** — ils suivent l'argent reçu depuis la correction de la
   règle 1. Les deux symptômes, une seule cause.

   On ne devine rien pour autant : **déduire le paiement du statut serait pire
   que le bug**, parce qu'un vrai solde impayé disparaîtrait en silence. C'est
   la question qui est posée — une seule fois, au passage à « Payé » ou au-delà,
   et seulement s'il reste quelque chose à encaisser (`askFullyPaid()`). C'est
   la réponse qui est écrite, jamais une hypothèse.

   Deux détails qui comptent : la question est posée **dans le délai groupé du
   stepper**, pas à chaque tap, sinon trois appuis rapides donneraient trois
   dialogues ; et quand la fiche est ouverte, le champ « Déjà reçu » doit être
   mis à jour **dans le DOM aussi**, sinon l'enregistrement suivant réécrirait
   l'ancien montant par-dessus. Un bouton **« Tout réglé »** à côté du champ
   solde une commande en un geste — c'est aussi le seul moyen de rattraper
   celles d'avant, qui ne repasseront jamais par la question.

   `showConfirm()` accepte désormais des libellés et perd son rouge sur demande :
   **le rouge est réservé au danger**, une question neutre prend l'accent. Les
   libellés reviennent d'eux-mêmes à leur clé de traduction quand on n'en passe
   pas, sinon un appel par défaut hériterait du texte du précédent.
15. **Le lien 17TRACK passe le numéro dans un fragment** (`#nums=`). Un navigateur
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
client rempli ligne par ligne. **Son invite décrit le format exact de
`formulaire.html`** (Nom / Adresse / Code postal & Ville / Pays / Téléphone) et
lui demande de regrouper les trois lignes d'adresse en une seule chaîne : c'est
elle qui sera recopiée sur le colis. Changer les champs du formulaire sans
changer cette invite, c'est se retrouver avec des fiches clients amputées.

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
référence de commande à écrire sur le carton avec recherche par référence et
par numéro de suivi,
page de formulaire client avec bannière propre et renvoi WhatsApp,
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
