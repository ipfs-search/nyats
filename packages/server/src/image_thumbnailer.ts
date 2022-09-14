import debuggerFactory from "debug";
import sharp from "sharp";

import { animateThumbnails, nyatsMaxInputHeight, nyatsMaxInputWidth } from "./conf.js";

const debug = debuggerFactory("nyats:image_thumbnailer");

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function isLossless(metadata: sharp.Metadata): boolean {
  switch (metadata.format) {
    case "jpeg":
    case "heif":
      return false;
    case "png":
    case "gif":
    case "svg":
    case "tiff":
      return true;
    case "webp":
      // Consistent with the VP8 bitstream, lossy WebP works exclusively with
      // an 8-bit Y'CbCr 4:2:0 (often called YUV420) image format. Please
      // refer to Section 2, "Format Overview" of RFC 6386, VP8 Data Format
      // and Decoding Guide for more detail. Lossless WebP works exclusively
      // with the RGBA format. See the WebP Lossless Bitstream specification.
      // https://developers.google.com/speed/webp/faq
      return metadata.chromaSubsampling !== "4:2:0";
    default:
      throw new ValidationError(`Unexpected format: ${metadata.format}`);
  }
}

function validateMetadata(metadata: sharp.Metadata) {
  // Validate input data, prevent PNG bombs and the likes.
  if (metadata.width > nyatsMaxInputWidth || metadata.height > nyatsMaxInputHeight) {
    throw new ValidationError(
      `Image dimensions (${metadata.width}x${metadata.height}) exceed maximum input dimensions.`
    );
  }
}

function getWebpOptions(metadata: sharp.Metadata, isAnimated: boolean): sharp.WebpOptions {
  const webpOptions: sharp.WebpOptions = {
    lossless: isLossless(metadata),
  };

  if (isAnimated) {
    webpOptions.loop = metadata.loop;
    webpOptions.delay = metadata.delay;
  }

  return webpOptions;
}

function getTransformer(
  image: sharp.Sharp,
  metadata: sharp.Metadata,
  width: number,
  height: number
) {
  const isAnimated = animateThumbnails && metadata.pages > 1;
  const webpOptions = getWebpOptions(metadata, isAnimated);

  return image
    .resize(width, height, {
      // Attention doesn't work for animations
      position: isAnimated ? sharp.gravity.center : sharp.strategy.attention,
    })
    .timeout({
      seconds: 120,
    })
    .webp(webpOptions);
}

async function getMetadata(image: sharp.Sharp): Promise<sharp.Metadata> {
  return image.clone().metadata();
}

function getImage(stream: NodeJS.ReadableStream): sharp.Sharp {
  const image = sharp({
    animated: animateThumbnails,
    failOn: "error",
  });
  stream.pipe(image);
  return image;
}

async function makeThumbnail(stream: NodeJS.ReadableStream, width: number, height: number) {
  const image = getImage(stream);

  const metadata = await getMetadata(image);
  debug("Got metadata:", metadata);

  validateMetadata(metadata);

  return getTransformer(image, metadata, width, height);
}

export default function makeThumbnailer() {
  return makeThumbnail;
}
