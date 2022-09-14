import { default as childProcess } from "child_process";
import { default as pathToFfmpeg } from "ffmpeg-static";

import makeDebugger from "debug";

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

export async function ffmpegExtractor(params) {
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
  let stderr = [];
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

export function scaleFilter(width, height) {
  return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
}
