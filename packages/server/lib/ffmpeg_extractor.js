import { default as childProcess } from "child_process";
import { default as pathToFfmpeg } from "ffmpeg-static";

import makeDebugger from "debug";

const debug = makeDebugger("nyats:ffmpeg_extractor");
const ffmpeg_debug = makeDebugger("nyats:ffmpeg");

export async function ffmpegExtractor(params) {
  const commonParams = [
    "-c:v",
    "libwebp",
    "-f",
    "image2",
    "-",
    "-loglevel",
    "info",
    "-hide_banner",
  ];

  const fullParams = params.concat(commonParams);

  ffmpeg_debug("ffmpeg ", fullParams.join(" "));

  const ffmpeg = childProcess.spawn(pathToFfmpeg, fullParams, {
    encoding: "buffer",
    windowsHide: true,
    timeout: 60000, // 30s timeout by default
  });

  // Debug log stdout closing
  ffmpeg.stdout.on("close", () => {
    debug("stdout closed");
  });

  // Pipe stderr to debug
  ffmpeg.stderr.on("data", (data) => {
    ffmpeg_debug(data.toString("utf8"));
  });

  ffmpeg.once("exit", (code) => {
    if (code !== 0) {
      throw new Error(`ffmpeg process exited with code ${code}`);
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
