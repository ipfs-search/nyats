import { default as mmagic } from "stream-mmmagic";
import micromatch from "micromatch";
import contentTypes from "./content_types.js";
import { Readable } from "stream";

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
    async detectType(input: Readable): Promise<[string, NodeJS.ReadableStream]> {
      const [mime, output] = await mmagic.promise(input, { peekBytes: 1024 });
      // @ts-expect-error https://github.com/seangarner/node-stream-mmmagic/pull/19
      const type = typeFromMime(mime.type);
      return [type, output];
    },
  };
};
