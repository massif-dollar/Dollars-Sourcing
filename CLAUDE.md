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

- `suivi-commandes.html` — application pro (Massif et ses invités)
- `client.html` — portail client, accessible par lien personnel
- `netlify/functions/ai.js` — proxy serveur vers l'API Anthropic (garde la clé cachée)
- `firestore-rules.txt` — règles de sécurité à copier dans la console Firebase

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
- Effet tactile « liquid glass » sur tout élément cliquable : enfoncement,
  onde depuis le point de contact, rebond au relâchement.
- Finitions : bordures 0.5px, chiffres tabulaires, flou avec saturation,
  ombres en deux couches, respect des zones sûres (encoche).
- Interface bilingue FR/EN via l'objet `I18N`. **Toute nouvelle chaîne doit
  exister dans les deux langues**, sinon l'app affiche la clé brute.

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
7. **Crédits Netlify** : chaque déploiement en consomme. Deux comptes ont déjà
   été épuisés. **Regrouper les modifications**, ne déployer qu'une fois par session.
8. **Les URLs se déduisent toutes seules** (`location.origin`) : ne jamais
   réintroduire d'adresse en dur, on a déjà changé d'hébergeur deux fois.

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
françaises, suivi des acomptes.

## À faire

- Suivi d'expédition structuré (transitaire, numéro de suivi, date estimée)
- Photo dans la fiche fournisseur
- Dupliquer une commande
- Alerte sur les devis sans réponse depuis plusieurs jours
- Écran d'accueil pour les comptes invités
- Plus tard : abonnement payant, inscription autonome

## Volontairement écarté

Facturation légale, mentions obligatoires, numérotation de factures :
Massif n'est pas encore immatriculé. **Ne rien construire là-dessus** tant
qu'il n'a pas de SIRET.

## Méthode de travail

Massif préfère **discuter avant d'implémenter**. Présenter le plan, laisser
choisir, puis construire. Vérifier systématiquement le code produit
(syntaxe, équilibre du HTML, parité des traductions) avant de livrer.
