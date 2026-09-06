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
    node make-lancement.mjs  # compose les 8 images dans promo/

Les textes sont dans `make-lancement.mjs`, un tableau `slides` : une ligne par
image, on lit et on modifie directement.

## `00-exemple-carton` — une illustration, pas une photo

Aucune photo réelle n'existe pour l'instant. Cette image montre ce qu'on sait
faire à la place : **une scène dessinée en CSS**, à la palette, avec la
référence tracée dans une vraie écriture manuscrite (`@fontsource/caveat`).

Elle est honnête sur ce qu'elle est — un dessin — et c'est justement sa limite :
**une illustration ne prouve rien.** Une photo d'un vrai carton avec un vrai
marqueur vaudrait dix fois cette image. Elle se regénère avec
`node make-illustration.mjs`.
