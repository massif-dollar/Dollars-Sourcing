# Le décodeur de QR de WeChat, en WebAssembly

C'est **l'algorithme du scanner de WeChat lui-même**. Tencent l'a ouvert dans
`opencv_contrib/modules/wechat_qrcode` ; ce dossier en est le portage
WebAssembly (`qr-scanner-wechat`, MIT). Deux réseaux de neurones : un détecteur
(SSD sur une ossature MobileNetV2) qui trouve le code dans l'image, et un modèle
de super-résolution (QRSR) qui l'agrandit quand il est trop petit — c'est
exactement ce qui manquait à jsQR.

## Pourquoi il est ici et pas sur un CDN

**La Chine.** cdnjs, jsdelivr et unpkg y sont bloqués ou capricieux, et c'est
précisément là que Massif s'en sert. Servi depuis notre propre domaine, il
arrive si l'app arrive. Le fichier est **entièrement autonome** : les quatre
modèles sont embarqués en base64 dans `wasm.mjs`, il ne va rien chercher
ailleurs — vérifié, aucune URL externe dedans.

## Ce qu'il change, mesuré sur les vraies captures de Massif

| l'image | jsQR (7 tailles × 3 cadrages) | WeChat |
|---|---|---|
| QR en plein écran, de près | oui | oui |
| tenu à bout de bras (351 px) | oui | oui |
| **tenu loin (210 px)** | **non** | **oui, 91 ms** |
| **loin et flou (327 px)** | **non** | **oui, 102 ms** |
| de travers, sombre, flou | oui | oui |

Partout où les deux lisent, ils lisent la même chose : aucun faux positif.

## Comment il est utilisé

**jsQR reste la base, celui-ci est le renfort.** jsQR fait 40 Ko et démarre
tout de suite ; ce dossier fait 6,2 Mo (~2,5 Mo compressés) et se charge en
arrière-plan. Si le chargement échoue, **le scanner marche exactement comme
avant** — c'est la règle qui autorise une dépendance dans une app qui n'en a
presque pas.

## Le mettre à jour

    npm pack qr-scanner-wechat
    tar xzf qr-scanner-wechat-*.tgz
    cp package/dist/index.mjs vendor/wechat-qr/index.js
    cp package/dist/wasm.mjs  vendor/wechat-qr/wasm.js
    sed -i "s|'./wasm.mjs'|'./wasm.js'|g" vendor/wechat-qr/index.js

**Le renommage en `.js` n'est pas cosmétique** : tous les hébergeurs servent
`.js` en `text/javascript`, et un `.mjs` servi en `application/octet-stream`
ferait échouer l'import sans autre symptôme qu'un scanner redevenu ordinaire.
Un risque gratuit à supprimer.

Les deux fichiers vont **ensemble** : `index.js` fait un `import('./wasm.js')`
relatif. Ne pas les séparer.

## Licences

Ce portage : MIT (Anthony Fu) — voir `LICENSE`.
Le module OpenCV et les modèles de Tencent : Apache 2.0.
Les deux autorisent l'usage commercial, ce qui compte pour la suite en SaaS.
