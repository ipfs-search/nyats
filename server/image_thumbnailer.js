const sharp = require('sharp');

const white = {r:255, g:255, b:255}; // Default: white background

module.exports = () => {
  return {
    makeThumbnail(stream, width, height) {
      const transformer = sharp()
        .flatten({ background: white })
        .resize(width, height, {
          position: sharp.strategy.attention,
          background: white
        })
        .toFormat('jpeg', {
          mozjpeg: true,
        });

      return stream.pipe(transformer);
    },
  };
};
