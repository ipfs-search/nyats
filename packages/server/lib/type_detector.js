import { promise } from 'stream-mmmagic';
import micromatch from 'micromatch';
import contentTypes from './content_types.js';

function compileTypeRe() {
  const typeRe = {};

  for (const key of Object.keys(contentTypes)) {
    typeRe[key] = contentTypes[key].map((m) => micromatch.makeRe(m));
  }

  return typeRe;
}

export default () => {
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
      const [mime, output] = await promise(input, { peekBytes: 1024 });
      const type = typeFromMime(mime.type);
      return [type, output];
    },
  };
};