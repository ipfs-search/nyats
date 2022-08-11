const magic = require('stream-mmmagic');
const micromatch = require('micromatch');
const debug = require('debug')('nyats:type_detector');
const contentTypes = require('./content_types');

function compileTypeRe() {
  const typeRe = {};

  for (const key of Object.keys(contentTypes)) {
    typeRe[key] = contentTypes[key].map((m) => micromatch.makeRe(m));
  }

  return typeRe;
}

module.exports = () => {
  const typeRe = compileTypeRe();

  function typeFromMime(mime) {
    for (const key of Object.keys(typeRe)) {
      const reLs = typeRe[key];
      if (reLs.some((re) => re.test(mime))) {
        return key;
      }
    }

    throw Error(`unmatched mime type: ${mime}`);
  }

  return {
    async detectType(input) {
      const [mime, output] = await magic.promise(input, { peekBytes: 1024 });
      const type = typeFromMime(mime.type);
      return [type, output];
    },
  };
};
