import makeDebugger from "debug";

const debug = makeDebugger("nyats:video_thumbnailer");

import { ffmpegThumbnailer } from "./ffmpeg_extractor.js";

export default function thumbnailerFactory(thumbnailer: ffmpegThumbnailer) {
  const makeThumbnail: ffmpegThumbnailer = function (url, width, height) {
    debug(`Extracting thumbnail from ${url}`);
    return thumbnailer(url, width, height);
  };

  return makeThumbnail;
}
