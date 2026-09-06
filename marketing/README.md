# Visuels de lancement — TikTok / Snapchat

Huit images **1080 × 1920** qui racontent le parcours d'une commande chez
DOLLAR$ SOURCING. Elles se publient en carrousel, dans l'ordre des noms de
fichiers.

| | Ce qu'elle dit | Ce qu'elle montre |
|---|---|---|
| `01-accroche` | « Tu commandes. Je m'occupe de tout le reste. » | la marque |
| `02-espace` | le lien personnel + le code à 6 chiffres | l'écran de code, en vrai |
| `03-demande` | la demande envoyée en deux clics, photo comprise | le formulaire du portail |
| `04-prix` | un seul prix, livraison comprise | trois promesses |
| `05-achat` | acheté sur place, emballé, confié au transitaire | trois promesses |
| `06-suivi` | les six étapes suivies en direct | la frise et le bloc expédition |
| `07-dollarz` | 1 € = 1 Dollarz, échangeable contre des remises | la boutique de coupons |
| `08-cta` | « Dis-moi ce que tu cherches » | l'appel à écrire |

## Trois choix qui ne sont pas décoratifs

**Ce sont de vraies captures de l'app**, pas des maquettes : `capture-app.mjs`
ouvre `client.html` avec une base Firestore en mémoire et photographie quatre
écrans. Une maquette dessinée se repère, et elle ne prouve rien.

**Zone sûre TikTok.** Le bas de l'écran est mangé par la légende et les boutons,
la droite par la colonne d'icônes. Rien d'important ne descend donc sous
1620 px, et le texte reste calé à gauche.

**Thème sombre.** C'est ce qui ressort le mieux dans un fil, et ça prépare l'œil
à ce que le client verra en ouvrant son espace — même noir, même orange.

## Les regénérer

Depuis un dossier qui contient `node_modules/@fontsource/space-grotesk` et
`@fontsource/inter` (les polices s'embarquent en base64, Google Fonts n'étant
pas joignable partout — voir `CLAUDE.md`) :

    node capture-app.mjs     # refait les 4 captures dans shots/
    node make-lancement.mjs  # compose les 8 images dans promo/

Les textes sont dans `make-lancement.mjs`, un tableau `slides` : une ligne par
image, on lit et on modifie directement.
