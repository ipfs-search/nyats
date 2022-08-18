import debuggerFactory from 'debug';
import sharp from 'sharp';

const debug = debuggerFactory('nyats:image_thumbnailer');

function isLossless(metadata) {
  switch (metadata.format) {
    case 'jpeg':
      return false;
    case 'png':
    case 'gif':
    case 'svg':
      return true;
    case 'webp':
      // Consistent with the VP8 bitstream, lossy WebP works exclusively with
      // an 8-bit Y'CbCr 4:2:0 (often called YUV420) image format. Please
      // refer to Section 2, "Format Overview" of RFC 6386, VP8 Data Format
      // and Decoding Guide for more detail. Lossless WebP works exclusively
      // with the RGBA format. See the WebP Lossless Bitstream specification.
      // https://developers.google.com/speed/webp/faq
      return metadata.chromaSubsampling !== '4:2:0';
    default:
      throw new Error(`Unexpected format: ${metadata.format}`);
  }
}

async function makeThumbnail(stream, width, height) {
  const image = sharp({
    animated: true,
    failOn: 'error',
  });
  stream.pipe(image);

  const metadata = await image.clone().metadata();
  debug('Got metadata:', metadata);

  const isAnimated = metadata.pages > 1;

  const transformer = image
    .resize(width, height, {
      // Attention doesn't work for animations
      position: isAnimated ? sharp.gravity.center : sharp.strategy.attention,
    })
    .timeout({
      seconds: 120,
    })
    .webp({
      lossless: isLossless(metadata),
      loop: metadata.loop,
      delay: metadata.delay,
    });

  return transformer;
}

export default function thumbnailerFactory() {
  return makeThumbnail;
}
