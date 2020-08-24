# Ecrituredom.com


## Format des visuels

Les largeurs utilisées.

| format      | largeur max. | usages |
|-------------|--------------|--------|
| 1/3         | 458px        | Aggrégat d'index, sidebar |
| 2/3         | 949px        | Couverture article avec sidebar |
| 1/1         | 1440px       | Couverture article |
| full        | 1920px       | Pleine page |
| bandeau     | 1920px       | Couverture pleine largeur |

Les ratios.

| format   | ratio | usages |
|----------|-------|--------|
| full     | 1:2   | page d'accueil, pleine page |
| bandeau  | 1:3   | couverture |
| standard | 4:3   | illustration d'article |


## Scripts NPM

Cycle pre CI :

 - Linter (validation)

Cycle CI :

 - build
 - test unitaire
 - test d'intégration
 - push de dev

Cycle CD :

 - push de production (avec tag de version)
 - Review (process via platefome Gitlab ou Github)
 - Staging (deploiement sur serveur de démonstration)
 - Review (modification de marqueur pour passage en production)
 - Production (deploiement sur serveur d production)

Note : cf. process Gitlab pour les phase de reviews et de deploiement.
Prevoir de rendre optionnel les reviews et la phase de démonstration.
https://docs.npmjs.com/misc/scripts

### Build
Construction de base sans optimisation.

### Serveur local
Serveur + observeur

https://github.com/remy/nodemon/wiki/Events#states
osascript -e 'display notification "http://localhost:3000" with title "Nodemon" subtitle "Serveur local démarré" sound name "Purr"'

### Linter (pre CI) validate
Contôle de la qualité d'écriture du code HTML, CSS et JS

https://github.com/theenadayalank/lint-prepush
https://eslint.org/
https://github.com/CSSLint/csslint
https://htmllint.github.io/
https://github.com/htmlhint/HTMLHint#local-installation-and-usage

Note : ne pas appliquer à build, seulement au code versionné.

### Optimisation (pre CD)
Tâches d'optimisation sur le HTML, CSS, JS et médias (images, audio, vidéo et fontes).

### Validate (pre CD)
Validation du respect des standards. Validate après optimisation.

Note : cette tâche est externalisé et peut se faire avant l'optimisation. S'assurer que l'optimisation ne dégrade pas le code.

### Test (pre CD)
Tests unitaires et tests d'optimisations.

### Developpement
Build + serveur et watcher (equivalent de serve + lint)

~~~
npm start
~~~

### Production
Pousse le code local vers le dépôt distant, avec un arquer de déploiement.

https://docs.gitlab.com/ee/ci/yaml/README.html#onlyexcept-basic

Option : Contrôler que la dernière version de tag ou commit est diffèrente de la dernière mise en ligne.

### Notes

Exemple de script de paquet NPM pour la gestion dev et prod : 
~~~
"scripts": {
  "build": "node build && npm-run-all build:*",
  "build:css": "postcss --config ./postcss.config.js assets/css/style.css --output build/assets/css/style.css",
  "build:styleguide": "npm-run kss --source assets/css --destination build/styleguide --title 'Dominique Duprey' --markup true --homepage ../../assets/css/README.md --css /assets/css/style.css",
  "build:image": "node ./build_scripts/images.js && imagemin build/medias/uploads/* --out-dir=build/medias/uploads",
  "build:html": "html-minifier --input-dir build --output-dir build --file-ext html --collapse-boolean-attributes --collapse-inline-tag-whitespace --collapse-whitespace --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-redundant-attributes",
  "watch": "nodemon --delay 2500ms --exec 'npm run development && npm run server:reload' --ext css,js,mustache,md --watch templates --watch assets --watch content",
  "server": "browser-sync start --server 'build' --no-open",
  "server:reload": "browser-sync reload --port 3000 --files=\".*.css,*.html\"",
  "start": "npm run build && npm-run-all --parallel server watch",
  "deploy": "npm run production"
},
~~~
