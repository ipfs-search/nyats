import makeFfmpegThumbnailer from "./ffmpeg_thumbnailer";
import { extractFirstFrame } from "./ffmpeg_extractor";

export default function () {
  return makeFfmpegThumbnailer(extractFirstFrame);
}
