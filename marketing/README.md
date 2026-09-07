# Visuels de lancement — TikTok / Snapchat

Huit images **2160 × 3840** (9:16, qualité 4K) qui racontent le parcours d'une commande chez
DOLLAR$ SOURCING. Elles se publient en carrousel, dans l'ordre des noms de
fichiers.

| | Ce qu'elle dit | Ce qu'elle montre |
|---|---|---|
| `01-accroche` | « Tu revends. Moi je te fournis depuis la Chine. » | la marque |
| `02-espace` | l'accès pro + le code à 6 chiffres | l'écran de code, en vrai |
| `03-demande` | dis-moi ce que tu veux, je trouve la source | le formulaire du portail |
| `04-prix` | ton prix d'achat, livraison comprise | trois promesses |
| `05-achat` | je suis en Chine, de quoi faire ×3 à la revente | trois promesses |
| `06-suivi` | tu suis ton stock, tu sais quand réapprovisionner | la frise et le bloc expédition |
| `07-dollarz` | plus tu commandes, plus tu gagnes | la boutique de coupons |
| `08-cta` | « Dis-moi ce que tu veux revendre » | l'appel à écrire |

## Trois choix qui ne sont pas décoratifs

**Ce sont de vraies captures de l'app**, pas des maquettes : `capture-app.mjs`
ouvre `client.html` avec une base Firestore en mémoire et photographie quatre
écrans. Une maquette dessinée se repère, et elle ne prouve rien.

**Zone sûre TikTok.** Le bas de l'écran est mangé par la légende et les boutons,
la droite par la colonne d'icônes. Rien d'important ne descend donc sous
1620 px, et le texte reste calé à gauche.

**Thème clair — blanc cassé et vert `#2eb35c`.** Jamais de noir pur, c'est la
règle de la palette. Et sur un fil social où presque tout est sombre, le blanc
tranche davantage. Le cadre du téléphone est graphite : sans lui, une capture
d'app claire se noierait dans la page.

**Rendu ×2.** La mise en page est écrite en 1080 × 1920 et photographiée au
double, ce qui donne du 2160 × 3840 net — pas une image agrandie après coup.

## Les regénérer

Depuis un dossier qui contient `node_modules/@fontsource/space-grotesk` et
`@fontsource/inter` (les polices s'embarquent en base64, Google Fonts n'étant
pas joignable partout — voir `CLAUDE.md`) :

    node capture-app.mjs     # refait les 4 captures dans shots/
    node make-lancement.mjs  # compose les 9 images dans promo/
    node make-video.mjs      # monte les 8 premières en vidéo 9:16

Le contenu et l'apparence des affiches vivent dans **`slides.mjs`**, importé par
les deux autres : un texte corrigé là l'est dans l'image *et* dans la vidéo.
C'était l'inverse avant, et c'est exactement comme ça qu'une affiche finit par
dire autre chose que la vidéo qui la reprend.

Les textes sont dans `slides.mjs`, un tableau `slides` : une ligne par image,
on lit et on modifie directement.

## `00-exemple-carton` — une illustration, pas une photo

Aucune photo réelle n'existe pour l'instant. Cette image montre ce qu'on sait
faire à la place : **une scène dessinée en CSS**, à la palette, avec la
référence tracée dans une vraie écriture manuscrite (`@fontsource/caveat`).

Elle est honnête sur ce qu'elle est — un dessin — et c'est justement sa limite :
**une illustration ne prouve rien.** Une photo d'un vrai carton avec un vrai
marqueur vaudrait dix fois cette image. Elle se regénère avec
`node make-illustration.mjs`.


## Chaque affiche porte l'opposition

Le carrousel ne décrit plus, il oppose. Sur chacune des huit, deux lignes
remplacent le paragraphe d'explication : ce qui se passe **sans** lui (gris,
croix), ce qui se passe **avec** (vert, coche). Une phrase de prose demande
trois secondes qu'on n'a pas sur un fil social ; deux lignes opposées se lisent
en une demie.

Trois règles tiennent le module :

- **Le « sans » ne porte aucun vert.** Le vert est la marque : s'il apparaît des
  deux côtés, l'opposition ne dit plus rien. Le gris nardo tient le rôle.
- **Le détail qui compte est surligné, pas seulement mis en gras.** Sur un
  téléphone tenu à bout de bras, un gras ne se distingue plus d'un texte normal —
  d'où le fond vert au trait, qui se voit avant même d'être lu.
- **Un seul chiffre par affiche, à la taille où il se lit sans lire** (`.big`) :
  `580 €` sur le prix, `×3` sur la marge. Deux gros chiffres sur la même image
  s'annulent.

Les affiches à capture d'écran (`.phone.mid`) ont un téléphone d'un cran plus
petit que les anciennes : l'opposition a pris la place du paragraphe, pas celle
de ce qui se lit.

## `09-avant-apres` — un post à part, pas la neuvième du carrousel

Le carrousel montre comment ça marche. Celle-ci montre **pourquoi ça change
quelque chose** : en haut, trois messages envoyés sans réponse et « Vu à 23:41 » ;
en bas, la commande, sa référence et son suivi.

Deux règles s'y appliquent, et elles ne sont pas décoratives :

- **Le « avant » n'a aucun vert.** Le vert est la marque. S'il apparaît des deux
  côtés, la comparaison ne dit plus rien — c'est le gris nardo qui tient le rôle
  du « sans toi ».
- **Le « avant », ce n'est pas un autre intermédiaire.** Ce serait admettre qu'on
  en est un. C'est l'achat à l'aveugle à un compte inconnu : la différence n'est
  pas la personne, c'est qu'il y a un espace, une référence et un suivi.

Le bas ne promet pas « fini les arnaques » — une garantie qu'on ne peut pas
tenir se retourne au premier colis en retard. Il montre ce qui la remplace :
*« Tu vois où est ton argent, à chaque étape. »* C'est vérifiable, donc ça tient.

## La vidéo

`node make-video.mjs` monte les **huit premières** affiches (pas la 9) en
1080×1920, 30 i/s, ~24 s : 3,4 s par affiche, glissement latéral de 0,4 s,
ouverture et fermeture sur le fond de la palette. Il lui faut un ffmpeg — celui
du système, celui désigné par `$FFMPEG`, ou `pip install imageio-ffmpeg` qui en
embarque un statique.

### Le mouvement est joué dans le navigateur, pas fabriqué dans ffmpeg

Le premier montage se contentait d'un zoom lent sur des images fixes. Ça bouge,
mais ça n'explique rien : le spectateur reçoit toute l'affiche d'un coup et lit
ce qu'il veut, dans l'ordre qu'il veut.

Le mouvement qu'on veut n'est pas un mouvement d'**image**, c'est un mouvement
d'**éléments** : le titre, puis le problème, puis la solution, puis la preuve.
C'est l'ordre d'arrivée qui explique — l'effet ne fait rien tout seul. Et seul
le navigateur sait où sont ces éléments, d'où la capture image par image.

Trois choses à savoir sur ce procédé :

- **Le CSS d'animation n'est pas dans celui des affiches.** Une image fixe doit
  se rendre à son état final, pas au premier instant d'une entrée :
  `shell(html, true)` ajoute `ANIM`, `shell(html)` ne l'ajoute pas.
- **La capture est déterministe.** Toutes les animations sont mises en pause et
  leur `currentTime` posé à la main pour chaque image. Rien ne dépend de la
  vitesse de la machine, et deux rendus donnent le même fichier — l'inverse
  d'une capture d'écran en temps réel, qui saute des images dès que la machine
  travaille.
- **On capture à 1080 de large, la taille finale.** Le texte est rendu à cette
  taille, jamais redimensionné après coup.

Le seul moment appuyé est le **surlignage vert qui se trace** de gauche à
droite, comme au marqueur, et il tombe sur le mot qui compte. Le reste ne fait
que monter de vingt pixels en s'éclaircissant. Les masses de lumière du fond
dérivent pendant toute l'affiche : sans elles, une image arrêtée après son
entrée a l'air d'un arrêt sur image.

### Deux pièges déjà payés

- **`zoompan` sort `d` images PAR image reçue.** Avec `d=102` sur un flux de
  102 images, on obtient 102 × 102 images par affiche — six minutes de vidéo au
  lieu de vingt-quatre secondes. (Le zoom a depuis disparu : l'animation des
  éléments le remplace, et les deux ensemble se gênaient.)
- **Pas de fondu enchaîné sur des affiches de texte.** Pendant la demi-seconde
  de fondu, deux titres se superposent et plus rien ne se lit. Le glissement
  garde chaque texte net, et imite le geste de balayer le carrousel.

Le fichier `.mp4` n'est pas versionné : il se refait en une commande, et un
binaire de 10 Mo n'a rien à faire dans un dépôt qui se déploie à chaque commit.
