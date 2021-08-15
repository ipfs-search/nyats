const sharp = require('sharp');

module.exports = () => {
  return {
    async makeThumbnail(stream, width, height) {
      const transformer = sharp()
        .resize(width, height, {
          position: sharp.strategy.attention,
        })
        .toFormat('jpeg', {
          mozjpeg: true,
        });

      return stream.pipe(transformer);
    },
  };
};
