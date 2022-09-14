import makeDebugger from "debug";

const debug = makeDebugger("nyats:video_thumbnailer");

import { extractFirstFrame } from "./ffmpeg_extractor.js";

async function makeThumbnail(
  url: string,
  width: number,
  height: number
): Promise<import("stream").Readable> {
  debug(`Extracting thumbnail from ${url}`);

  return extractFirstFrame(url, width, height);
}

export default function thumbnailerFactory() {
  return makeThumbnail;
}
