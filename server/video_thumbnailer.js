import { promisify } from "util";
import { spawn as _spawn } from "child_process";
import makeDebugger from "debug";
import pathToFfmpeg from "ffmpeg-static";

const spawn = promisify(_spawn);
const debug = makeDebugger("nyats:video_thumbnailer");

async function ffmpegExtractor(params) {
  const commonParams = ["-f", "webp", "-", "-loglevel", "info", "-hide_banner"];

  const ffmpeg = spawn(pathToFfmpeg, params.concat(commonParams), {
    encoding: "buffer",
    windowsHide: true,
    timeout: 30000, // 30s timeout by default
  });

  // ffmpeg.child.stderr.on('data', (data) => {
  //   debug(data.toString('utf8'));
  // });

  return ffmpeg;
}

function scaleFilter(width, height) {
  return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
}

async function extractCoverArt(url, width, height) {
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

async function extractKeyFrame(url, width, height) {
  debug(
    "Extract first 40% scene change on a vframe (full frame), minimum 3s after start of video."
  );

  const vFilter = `select=gt(scene\,0.4), ${scaleFilter(width, height)}`;

  return ffmpegExtractor([
    "-ss 3", // Skip first 3s
    "-i",
    `async:${url}`,
    "-vf",
    vFilter,
    "-frames:v",
    "1",
    "-vsync",
    "vfr",

    // https://superuser.com/a/1704315
    "-compression_level",
    "6",
    "-q:v",
    "75",
    "-loop",
    "0",
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

async function makeThumbnail(url, width, height) {
  debug(`Extracting thumbnail from ${url}`);
  const extractors = [extractCoverArt, extractKeyFrame, extractFirstFrame];

  for (const extract of extractors) {
    try {
      const { stdout } = await extract(url, width, height);
      return stdout;
    } catch (e) {
      debug(e);
    }
  }

  throw new Error("All thumbnail methods failed.");
}

export default function thumbnailerFactory() {
  return makeThumbnail;
}
