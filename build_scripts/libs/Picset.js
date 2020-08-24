/* eslint-disable padded-blocks */
/* eslint-disable dot-location */
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const fs = require('fs');
const path = require('path');
const jimp = require('jimp');
module.exports = Picset;

/**
 * Picset constructor
 *
 * @param {String} directory
 * @return void
 */

function Picset(directory) {
  if (! (this instanceof Picset)) {
    return new Picset(directory);
  }

  this._directory = path.resolve(directory);
}

/**
 * Definir / optenir les configurations
 *
 * @params {Object} presets
 * @return {Object or ResponsiveImages}
 */
Picset.prototype.presets = function presets(presets) {
  if ( ! arguments.length) {
    return this._presets;
  }

  this._presets = presets;
  return this;
};

/**
 * Traitement des fichiers
 *
 * @return {Boolean} done
 */
Picset.prototype.process = function process() {
  const files = this.scanFiles(this._directory, ['.html']);

  for (const file of files) {
    // Récupérer les fragments à traiter pour chaque fichier
    const dom = new JSDOM(fs.readFileSync(file, {encoding: 'utf8'}));
    const fragments = this.getFragments(dom.window.document);

    if (! fragments.length) {
      continue;
    }
    // Retailler les images et mettre à jour les fragments (async)
    Promise.all(fragments.map((fragment) => {
      // Récupérer l'url et les réglages de l'image
      const preset = this.presets()[fragment.getAttribute('data-responsive')];
      const element = fragment
        .getElementsByTagName('img')
        .item(0);
      const src = element.getAttribute('src');
      const sizes = {
        'ratio': false,
        'sizes': []
      };
      // Density only
      sizes.ratio = true;
      sizes.sizes = preset;

      // Others
      if (! Array.isArray(preset)) {
        sizes.ratio = false;
        sizes.sizes = preset['srcset'];
      }

      return this.sources(src, sizes)
        .then((sources) => {
          this.updateFragment(element, sources, preset['sizes']);
          fragment.removeAttribute('data-responsive');
        } );
    } ))
      .then(() => {
        // Sauvegarder le nouveu DOM
        this.saveFile(file, dom);
      } )
      .catch((err) => {
        console.error(err.stack);
      } );
  }
};

Picset.prototype.saveFile = function saveFile(file, dom) {
  fs.writeFileSync(
    file,
    dom.serialize(),
    {
      'encoding': 'utf8',
      'flag': 'w'
    }
  );
};

Picset.prototype.updateFragment = function updateFragment(element, sources, sizes) {
  // Modification du DOM selon les sources
  element.setAttribute(
    'src',
    sources[0].src
  );
  element.setAttribute(
    'srcset',
    sources.reduce((result, value) => {
      if (result === null) {
        return value.src + ' ' + value.suffix;
      }
      return result + ', ' + value.src + ' ' + value.suffix;
    }, null)
  );

  if (sizes) {
    element.setAttribute(
      'sizes',
      sizes
    );
  }
};

/**
 * Récupérer les fragments
 *
 * @param {HTMLDOM} document
 * @return {Array}
 */
Picset.prototype.getFragments = function getFragments(document) {
  const fragments = document.getElementsByTagName('figure');

  return Array.from(fragments).filter(fragment => {

    const src = this.extractImageSrc(fragment);

    if (src === null) {
      return false;
    }

    // @TODO : filtrer les extensions ici
    const absolutePath = path.join(this._directory, src);

    if (fs.existsSync(absolutePath) === false) {
      return false;
    }

    if (fs.statSync(absolutePath).isFile() !== true) {
      return false;
    }

    return true;
  });
};

/**
 * Tente d'extraire la valeur de `src` du premier element `img`
 * contenu (desendant) dans le fragment HTML fourni.
 *
 * @param {HTMLelement} fragment
 * @return {String | null} la valeur de l'attribut `src` du fragment
 */
Picset.prototype.extractImageSrc = function extractImageSrc(fragment) {
  // Doit faire référence à un preset
  const preset = this.presets()[fragment.getAttribute('data-responsive')];

  if (typeof preset === 'undefined') {
    return null;
  }

  // Doit posséder une balise `img`
  const element = fragment.getElementsByTagName('img').item(0);

  if (element === null) {
    return null;
  }

  // Retourner la valeur de rc
  return element.getAttribute('src');
};

/**
 * Redimensionner et sauvegarder les images
 *
 * @param {String} infos
 * @param {Array}  presets
 * @throws Exeception
 * @return {Array} sources
 */
Picset.prototype.sources = function sources(src, preset) {

  const infos = path.parse(src);
  return jimp.read(path.join(
    this._directory,
    infos.dir,
    infos.base
  ))
    .then((image) => {
      // Cf https://developer.mozilla.org/fr/docs/Web/JavaScript/Closures
      const sizes = preset.sizes.sort((a, b) => {
        return a - b;
      } );
      let base = image.bitmap.width / sizes[sizes.length - 1];
      console.log(
        '---\n' +
        `Fichier : ${src}\n` +
        `Réglages : ${preset}\n` +
        `Largeur originale : ${image.bitmap.width}\n` +
        `Sizes : ${sizes}\n` +
        `base : ${base.toPrecision(4)}`);

      if (base.toPrecision(4) < 1) {
        console.log(
          '/!\\ Attention l\'image originale devrais ' +
          'au minimum faire %s pixels de large',
          sizes[sizes.length - 1]
        );
      }

      if ( ! preset.ratio) {
        base = false;
      }
      return sizes.map((size) => {
        return this.resize(
          image.clone(), // image.clone(); // returns a clone of the image
          size,
          infos,
          base
        );
      } );
    },
    (reject) => {
      return reject;
    }
    );
};

Picset.prototype.resize = function resize(image, size, infos, base) {
  // NEED :
  // - largeur voulue
  // - repertoire relatif
  // - repertoire globale
  // - base (ratio)
  // - extension
  //
  let suffix = `${size}w`;

  if (base) {
    suffix = `${size}x`;
    size = Math.round(base * size);
  }

  const filename = path.join(
    infos.dir,
    `${infos.name}@${suffix}${infos.ext}`
  );
  console.log('%s (%spx)',
    filename,
    size
  );
  // Note : où attraper une erreur d'écriture d'image? (new promise ?)
  image
    .resize(
      size,
      jimp.AUTO)
    .quality(60)
    .write(path.join(
      this._directory,
      filename
    ));

  return {
    'size': size,
    'src': filename,
    'suffix': suffix
  };
}

/**
 * Recursively list files filter by extension white list
 *
 * @param {String} directory
 * @param {Array} extensions
 * @param {Array} files
 */
Picset.prototype.scanFiles = function scanFiles(directory, extensions) {
  return fs.readdirSync(directory)
    .reduce((files, file) => {

      const filename = path.join(
        directory,
        file
      );

      if (fs.statSync(filename).isDirectory()) {
        return files.concat(this.scanFiles(
          filename,
          extensions
        ));
      }

      if (! extensions.includes(path.extname(filename))) {
        return files;
      }

      return files.concat(filename);

    }, [] );
};
