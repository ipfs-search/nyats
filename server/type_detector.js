const magic = require('stream-mmmagic');
const micromatch = require('micromatch');
const debug = require('debug')('nyats:type_detector');

const mimeTypes = {
  text: [
    // eBook types
    'application/x-mobipocket-ebook',
    'application/epub+zip',
    'application/vnd.amazon.ebook',
    // Scanned documents
    'image/vnd.djvu',
    'application/pdf',
    // HTML/plain text
    'text/html',
    'text/plain',
    // Text editors
    'application/postscript',
    'application/rtf',
    // Open Office et al.
    'application/vnd.oasis.opendocument.text',
    'application/vnd.sun.xml.writer',
    'application/vnd.stardivision.writer',
    'application/x-starwriter',
    // MS Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Misc
    'application/x-abiword',
  ],
  audio: [
    'audio/*',
    // 'application/ogg',
  ],
  video: [
    'video/*',
    // 'application/mp4'
  ],
  image: [
    'image/*',
  ],
};

function compileTypeRe() {
  let typeRe = {};

  for (let key of Object.keys(mimeTypes)) {
    typeRe[key] = mimeTypes[key].map((m) => micromatch.makeRe(m));
  }

  return typeRe;
}


module.exports = () => {
  const typeRe = compileTypeRe();

  function typeFromMime(mime) {
    for (let key of Object.keys(typeRe)) {
      const reLs = typeRe[key];
      if (reLs.some((re) => {
          return re.test(mime);
        })) {
        return key;
      }
    }

    throw Error(`unmatched mime type: ${mime}`);
  }

  return {
    async detectType(input) {
      const [mime, output] = await magic.promise(input, {peekBytes: 1024});
      const type = typeFromMime(mime.type);
      return [type, output];
    }
  };
};
