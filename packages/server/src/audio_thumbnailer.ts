import makeFfmpegThumbnailer from "./ffmpeg_thumbnailer.js";
import { extractFirstFrame } from "./ffmpeg_extractor.js";

export default function () {
  return makeFfmpegThumbnailer(extractFirstFrame);
}
