/**
 * Note :
 * à placer dans un module `build_scrips/generator.js`
 * le module doit expoer une seule méthode `generator.build()`
 * celle-ci pex lancer une exception qui doit être interceptée :
 * ~~~
 * try {
 *  generator.build();
 * } catch(err) {
 *  // do thinks width error
 * }
 * ~~~
 */
var Metalsmith    = require('metalsmith');
var markdown      = require('metalsmith-markdown');
var layouts       = require('metalsmith-layouts');
var permalinks    = require('metalsmith-permalinks');
var slug          = require('metalsmith-slug');
var collections   = require('metalsmith-collections');
var assets        = require('metalsmith-assets');
var ignore        = require('metalsmith-ignore');
var dateFormatter = require('metalsmith-date-formatter');
var move_remove   = require('metalsmith-move-remove');
// Utiliser Markdown dans le front-matter
var dataMarkdown  = require('metalsmith-data-markdown');
var {report}      = require('metalsmith-debug-ui');
/**
 * #Environnement
 *
 * Les variables d'environnement sont d'écrite ici en "dur".
 *
 * Il s'agit d'une méthode simple pour des valeurs pouvant se
 * contenter d'une sécurité minimum (pour de meilleurs
 * solutions cf. : https://riptutorial.com/node-js/example/10101/setting-node-env--production-)
 *
 * Définir l'environement de production :
 *
 * ~~~
 * export NODE_ENV=production
 * ~~~
 *
 * Détecter l'environnement Node :
 *
 * ~~~
 * if (process.env.NODE_ENV === 'production') {}
 * ~~~
 *
 */

 Metalsmith(__dirname)
  .metadata({
    site: {
      title: "Atelier d'écriture de Dominique Duprey",
      description: "EcritureDom.com est le site web de l'écrivain et animateur d'ateliers Dominique Duprey.",
      color: '#cf767c',
      url: function() {
        if (process.env.NODE_ENV === 'production')
        {
          return "http://ecrituredom.com/";
        }

        return "http://localhost:3000/";
      },
      lang: "fr",
      generator: "Metalsmith",
      current_year: function() {
        return new Date().getFullYear();
      },
      navigation: {
        main: [
          {link: {
            name: "Ateliers",
            src: 'ateliers'
          }},
          {link: {
            name: "Livres",
            src: "livres",
          }},
          {link: {
            name: "À propos",
            src: 'a-propos',
          }}
        ],
        social: {
          links: [
            {link : {
              name: "Facebook",
              src: 'https://www.facebook.com/dominique.duprey.ecrivain',
              icon: {
                viewbox: '0 0 16 14',
                data: 'M11.336 1q0.273 0 0.469 0.195t0.195 0.469v10.672q0 0.273-0.195 0.469t-0.469 0.195h-3.055v-4.648h1.555l0.234-1.812h-1.789v-1.156q0-0.438 0.184-0.656t0.715-0.219l0.953-0.008v-1.617q-0.492-0.070-1.391-0.070-1.062 0-1.699 0.625t-0.637 1.766v1.336h-1.563v1.812h1.563v4.648h-5.742q-0.273 0-0.469-0.195t-0.195-0.469v-10.672q0-0.273 0.195-0.469t0.469-0.195h10.672z'
              }
            }},
            {link: {
              name: "Contact",
              src: 'a-propos#contact',
              icon: {
                viewbox: '0 0 14 14',
                data: 'M14 5.547v6.203q0 0.516-0.367 0.883t-0.883 0.367h-11.5q-0.516 0-0.883-0.367t-0.367-0.883v-6.203q0.344 0.383 0.789 0.68 2.828 1.922 3.883 2.695 0.445 0.328 0.723 0.512t0.738 0.375 0.859 0.191h0.016q0.398 0 0.859-0.191t0.738-0.375 0.723-0.512q1.328-0.961 3.891-2.695 0.445-0.305 0.781-0.68zM14 3.25q0 0.617-0.383 1.18t-0.953 0.961q-2.937 2.039-3.656 2.539-0.078 0.055-0.332 0.238t-0.422 0.297-0.406 0.254-0.449 0.211-0.391 0.070h-0.016q-0.18 0-0.391-0.070t-0.449-0.211-0.406-0.254-0.422-0.297-0.332-0.238q-0.711-0.5-2.047-1.426t-1.602-1.113q-0.484-0.328-0.914-0.902t-0.43-1.066q0-0.609 0.324-1.016t0.926-0.406h11.5q0.508 0 0.879 0.367t0.371 0.883z'
              }
            }}
          ],
        },
        miscellaneous: {
          links: [
            {link: {
              name: "Mentions légales",
              src: 'mentions-legales'
            }}
          ]
        },
      },
      styles: [
        {style: {
          src: 'assets/css/style.css',
          media: 'screen',
        },
      }]
    }
  })
  .source('./content')
  .destination('./build')
  .clean(true)
  .use(ignore([
    '**/.DS_Store',
    '.git/**',
    'README.md',
  ]))
  .use(collections({
    livres: {
      pattern: 'livres/**/*.md',
      sortBy: 'publish_date',
      reverse: true,
      metadata: {
        name: "Livres",
        description: "Les livres."
      }
    },
    ateliers: {
      pattern: 'ateliers/**/*.md',
      sortBy: 'date',
      reverse: true,
      metadata: {
        name: "Ateliers",
        description: "Les ateliers."
      }
    },
    links: {
      pattern: 'liens/**/*.md',
      metadata: {
        name: "Partenaires artistiques",
        description: "Un grand merci aux personnes suivantes qui ont participé avec talent à l'élaboration de ces projets : "
      }
    }
  }))
  .use(assets({
    source: './assets',
    destination: './assets',
  }))
  .use(report('All'))
  .use(markdown())
  .use(dateFormatter({
    dates: [
      {
        key: 'publish_date',
        format: 'DD MMMM YYYY',
        locale: 'fr'
      }
    ]
  }))
  .use(permalinks({
    relative: false,
  }))
  .use(slug({
    lower: true,
  }))
  .use(layouts({
    engine: 'mustache',
    pattern: '**/*.html',
    directory: './templates',
    partials: './templates/partials',
    default: 'default.mustache',
  }))
  .use(dataMarkdown({
    marked: {
      gmf: true,
      smartypants: false,
      breaks: false,
      mangle: true
    },
    removeAttributeAfterwards: true
  }))
  .use(move_remove({
    remove: [
      '^(ateliers\/)(.+)(?<!ateliers\/index.html)$',
      '^(liens\/)(.+)(?<!liens\/index.html)$',
      '^(livres\/)(.+)(?<!livres\/index.html)$',
    ]
  }))
  .build(function(err, files){
    if (err) { throw err; }
  })
