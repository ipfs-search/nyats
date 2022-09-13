import makeDebugger from "debug";

const debug = makeDebugger("nyats:video_thumbnailer");

import { ffmpegExtractor, scaleFilter } from "./ffmpeg_extractor";

async function extractKeyFrames(url, width, height) {
  debug("Extract first 40% scene change 30 vframes(full frames).");

  return ffmpegExtractor([
    "-skip_frame",
    "nointra", // Only I-frames
    "-t",
    "600", // Consider first 10m of video
    "-i",
    `async:${url}`,
    "-an",
    "-vf",
    `${scaleFilter(width, height)}, setpts=N/(2*TB)`, // 2 FPS

    // https://superuser.com/a/1704315
    "-compression_level",
    "6",
    "-q:v",
    "75",
    "-loop",
    "0",
    "-frames:v",
    "20",
  ]);
}

async function extractFirstFrame(url, width, height) {
  debug("Extracting first frame");
  return ffmpegExtractor([
    // '-f', 'matroska', // ffmpeg's type detection seems to work 'fine'
    "-i",
    `async:${url}`,
    "-vf",
    scaleFilter(width, height),
    "-frames:v",
    "1",
    "-vsync",
    "vfr",
  ]);
}

module.exports = () => {
  return {
    async makeThumbnail(url, width, height) {
      debug(`Extracting thumbnail from ${url}`);

      return extractKeyFrames(url, width, height);
    },
  };
};
