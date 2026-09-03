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
- `netlify/functions/ai.js` — proxy serveur vers l'API Anthropic (garde la clé cachée)
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
- **Hébergement** : Netlify, déploiement depuis GitHub
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
6 chiffres. Le client peut envoyer une demande avec photo ; elle arrive dans
l'onglet « Demandes » du vendeur, qui la valide en fixant ses prix.
**Le client ne voit jamais les coûts d'achat ni les marges.**

Ses commandes terminées (livrées ou annulées) ne disparaissent jamais toutes
seules : le client les range lui-même avec un bouton, et elles rejoignent un
bloc « Historique » replié d'où il peut les ressortir. Ce tri vit dans son
navigateur (`ds_client_archived_<id>`), pas dans la base : c'est une préférence
d'affichage, elle ne justifie pas d'ouvrir une écriture publique. Contrepartie
assumée : depuis un autre appareil, son rangement ne le suit pas.

À sa toute première visite, le client est accueilli par une carte qui explique
l'espace : lien personnel protégé par son code, et proposition d'activer Face ID
pour les fois suivantes (seulement si l'appareil le permet et que ce n'est pas
déjà fait). Elle se ferme d'un bouton et ne revient plus (`ds_client_welcomed_<id>`
en localStorage).

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
- **Mode discret** : un bouton dans l'en-tête floute tous les montants pour
  montrer l'app sans montrer ce qu'elle rapporte. Le floutage passe par des
  sélecteurs de conteneurs (`html[data-discreet="1"] .margin`, `.kpi.money
  .value`, `#marginPreview`...) et non par une classe posée sur chaque nombre :
  un montant ajouté plus tard dans l'un de ces blocs est couvert sans y penser.
  Choix mémorisé. Les noms, produits, statuts et compteurs restent lisibles.
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
10. **Le portail client n'est pas connecté à Firebase.** Il s'identifie avec le
   lien (id + token) et le code à 6 chiffres, vérifiés dans le navigateur.
   Firestore le voit comme un visiteur anonyme : toute lecture dont il a besoin
   (`clients` par id, `orders`, `pendingOrders`) doit rester ouverte dans les
   règles, sinon le client ne voit plus ses commandes. Voir la note de sécurité
   en bas de `firestore-rules.txt`.
11. **Le lien 17TRACK passe le numéro dans un fragment** (`#nums=`). Un navigateur
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
mode discret qui floute les montants.

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
