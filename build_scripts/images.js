/**
 *
 * Coding style :
 *  - https://docs.npmjs.com/misc/coding-style
 *  - https://github.com/RisingStack/node-style-guide
 *  - https://blog.risingstack.com/node-js-best-practices/
 *  - http://sideeffect.kr/popularconvention/#javascript
 *  - https://standardjs.com/rules-fr.html **
 *  - https://github.com/rwaldron/idiomatic.js
 *  - https://google.github.io/styleguide/jsguide.html
 */
const Picset = require('./libs/picset.js');

const ri = new Picset('./build');

// const ri = Picset('./build');
ri.presets(    {
  'setname': {
    'densities': [],
    'widths': [],
    'srcset': {
      'ratios': [], // aka densities
      'widths': []
    },
    'sizes': '', // queries
    'sources': [
      {
        'densities': [],
        'widths': [],
        'match': '',
        'query': ''
      }
    ]
  },
  // Densité seulement (density)
  'default': {
    'srcset': [587],
    // 'srcset': [300, 377],
    // 'sizes': '(max-width: 720px) 300px,100vw'
  },
  'aside': {
    'srcset': [338]
  },
  'cover': {
    'srcset': [312, 666, 1220, 1440],
    'sizes': '(max-width: 360px) 312px, (max-width: 720px) 666px, (max-width: 1280px) 1220px, 100vw'
  },
  'full': {
    'srcset': [360, 720, 1280, 1440, 1920],
    // 'sizes': '(max-width:360px) 360px, (max-width:720px) 720px, 100vw'
  },
  // Résolutions et tailles (width descriptor)
  'example-article': {
    'srcset': [300, 860, 1440],
    'sizes': '(max-width: 320px) 300px, (max-width: 1024px) 860px, 100vw',
  },
  // Résolution et densité
  // /!\ Attention, il n'est pas utile de mixer les deux!
  // cf https://developer.mozilla.org/fr/docs/Web/HTML/Element/img#attr-srcset
  'example-cover': {
    'srcset': [300, 860, 1440, 1920],
    // 'srcset': ['1.5x', '2x', 300, 860, 1440],
    // 'srcset': {
    //   'densities': [1.5, 2, 3],
    //   'widths': [300, 860, 1440],
    // },
    // Conditions de tailles
    'sizes': '(max-width: 320px) 300px, (max-width: 1024px) 860px, 100vw',
  },
  // Direction artistique seule
  'example-art': {
    'sources': [ // ajoute <pictue> et <source> (directives)
      {
        'match': '@desktop', // essai de trouver <original-image-name>@desktop.<ext>
        'srcset': [100, '1.5x', '2x'], // avec variantes de densités // d'ont do that
        'media': 'min-width: 990px', // definir `media`
      },
      {
        'match': '@tablet', // essai de trouver <original-image-name>@tablet.<ext>
        'srcset': ['2x'], // avec variantes de densités
        'media': 'min-width: 750px', // definir `media`
      }
    ]
  },
  // Résolutions, densités, tailles et direction artistique
  'example-fullwidth': {
    'srcset': ['1.5x', '2x', 320, 640, 1024],
    'sizes': '(max-width: 320px) 320px, (max-width: 640px) 640px, 100vw',
    // pour la direction artistique
    'sources': [ // ajoute <pictue> et <source> (directives)
      {
        'match': '@desktop', // essai de trouver <original-image-name>@desktop.<ext>
        'srcset': [100, '1.5x', '2x'], // avec variantes de densités
        'media': 'min-width: 990px', // definir `media`
      },
      {
        'match': '@tablet', // essai de trouver <original-image-name>@desktop.<ext>
        'srcset': ['2x'], // avec variantes de densités
        'media': 'min-width: 750px', // definir `media`
      },
      // defaut, s'applique à <original-image-name>.<ext>
      {
        'srcset': 200,
        'media': 'min-width: 800px',
      }
    ]
  },
  'article-bis': {
    'srcset': [320, 640, 800],
    'sizes': '(max-width: 320px) 320px, (max-width: 1024px) 640px, 100vw',
  },
  'example': {
    'srcset': [100, 200, 300], // widths
    'sizes': '(max-width: 480px) 100vw, (max-width: 900px) 33vw, 245px'
  }
});

/*
<picture>
<source
  srcset="
    [image-name]@desktop.png,
    [image-name]@desktop_100.png 100px,
    [image-name]@desktop_2x.png 2x,
    [image-name]@desktop_1.5x.png 1.5x
  "
  media="(min-width: 990px)">
<source
  srcset="
    [image-name]@tablet.png,
    [image-name]@tablet_2x.png 2x,
  "
  media="(min-width: 750px)">
<img
  srcset="
    [image-name]@mobile.png,
    [image-name]@mobile_1.5x.png 1.5x
    [image-name]@mobile_2x.png 2x
    [image-name]@mobile_320.png 320px
    [image-name]@mobile_640.png 640px
    [image-name]@mobile_1024.png 1024px
  "
  src="[image-name]@mobile.png"
  sizes="
    (max-width: 320px) 320px,
    (max-width: 640px) 640px,
    100vw
  "
  alt="Image description">
</picture>
*/

ri.process();
