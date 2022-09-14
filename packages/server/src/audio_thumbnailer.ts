import makeDebugger from "debug";
import { extractCoverArt } from "./ffmpeg_extractor.js";

const debug = makeDebugger("nyats:audio_thumbnailer");

async function makeThumbnail(
  url: string,
  width: number,
  height: number
): Promise<import("stream").Readable> {
  debug(`Extracting thumbnail from ${url}`);

  return extractCoverArt(url, width, height);
}

export default function thumbnailerFactory() {
  return makeThumbnail;
}
