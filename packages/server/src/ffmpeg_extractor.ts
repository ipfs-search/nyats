import { default as childProcess } from "child_process";
import { default as pathToFfmpeg } from "ffmpeg-static";

import makeDebugger from "debug";
import { Readable } from "stream";

const debug = makeDebugger("nyats:ffmpeg_extractor");
const ffmpeg_debug = makeDebugger("nyats:ffmpeg");

const ffmpegCommonParams = [
  "-c:v",
  "libwebp",
  "-f",
  "image2",
  "-",
  "-loglevel",
  "info",
  "-hide_banner",
];

const ffmpegTimeout = 60000; // 60s default timeout

async function ffmpegExtractor(params: string[]): Promise<Readable> {
  const ffmpegParams = params.concat(ffmpegCommonParams);

  ffmpeg_debug("ffmpeg ", ffmpegParams.join(" "));

  const ffmpeg = childProcess.spawn(pathToFfmpeg, ffmpegParams, {
    windowsHide: true,
    timeout: ffmpegTimeout,
  });

  // Debug log stdout closing
  ffmpeg.stdout.on("close", () => {
    debug("stdout closed");
  });

  // Pipe stderr to debug
  const stderr = [];
  ffmpeg.stderr.on("data", (data) => {
    const strData = data.toString("utf8");
    stderr.push(strData);
    ffmpeg_debug(strData);
  });

  ffmpeg.once("exit", (code) => {
    if (code !== 0) {
      throw new Error(`ffmpeg process exited with code ${code}`, {
        cause: stderr.join(),
      });
    }
  });

  ffmpeg.once("error", (err) => {
    throw err;
  });

  return new Promise((resolve) => {
    ffmpeg.once("spawn", () => {
      resolve(ffmpeg.stdout);
    });
  });
}

function scaleFilter(width: number, height: number) {
  return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
}

export async function extractKeyFrames(url: string, width: number, height: number) {
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

export async function extractFirstFrame(url: string, width: number, height: number) {
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

export async function extractCoverArt(url: string, width: number, height: number) {
  // TODO: Use cover art archive as secondary source.
  // https://coverartarchive.org/release/79de4fa8-102c-402f-8040-3f1aa6d0c1b4/front
  debug("Extract cover art for streams with attached pictures, thumbnails or cover art.");

  return ffmpegExtractor([
    "-i",
    `async:${url}`,
    "-map 0:v",
    "-map -0:V",
    "-vf",
    scaleFilter(width, height),
    "-frames:v 1",
  ]);
}
