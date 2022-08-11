const debug = require('debug')('nyats:image_thumbnailer');
const sharp = require('sharp');

const white = {r:255, g:255, b:255}; // Default: white background

function isLossless(metadata) {
  switch (metadata.format) {
    case 'jpeg':
      return false
    case 'png':
    case 'gif':
    case 'svg':
      return true
    case 'webp':
      // Consistent with the VP8 bitstream, lossy WebP works exclusively with
      // an 8-bit Y'CbCr 4:2:0 (often called YUV420) image format. Please
      // refer to Section 2, "Format Overview" of RFC 6386, VP8 Data Format
      // and Decoding Guide for more detail. Lossless WebP works exclusively
      // with the RGBA format. See the WebP Lossless Bitstream specification.
      // https://developers.google.com/speed/webp/faq
      return metadata.chromaSubsampling != '4:2:0';
  }
}

module.exports = () => {
  return {
    async makeThumbnail(stream, width, height) {
      const image = sharp();

      const metadata = await image.metadata();
      debug('Got metadata:', metadata);

      const transformer = image
        .resize(width, height, {
          position: sharp.strategy.attention,
        })
        .webp({
          lossless: isLossless(metadata),
          loop: metadata.loop,
          delay: metadata.delay,
        });

      return stream.pipe(transformer);
    },
  };
};
