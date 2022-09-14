import makeDebugger from "debug";

const debug = makeDebugger("nyats:video_thumbnailer");

import { ffmpegExtractor, scaleFilter } from "./ffmpeg_extractor.js";

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

async function makeThumbnail(url, width, height) {
  debug(`Extracting thumbnail from ${url}`);

  return extractFirstFrame(url, width, height);
}

export default function thumbnailerFactory() {
  return makeThumbnail;
}
