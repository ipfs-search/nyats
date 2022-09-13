import { default as childProcess } from "child_process";
import { default as pathToFfmpeg } from "ffmpeg-static";

import makeDebugger from "debug";

const debug = makeDebugger("nyats:ffmpeg_extractor");
const ffmpeg_debug = makeDebugger("nyats:ffmpeg");

async function ffmpegExtractor(params) {
  const commonParams = ["-f", "webp", "-", "-loglevel", "info", "-hide_banner"];

  const fullParams = params.concat(commonParams);

  debug(`Params: ${fullParams}`);

  const ffmpeg = childProcess.spawn(pathToFfmpeg, fullParams, {
    encoding: "buffer",
    windowsHide: true,
    timeout: 60000, // 30s timeout by default
  });

  ffmpeg.stdout.on("close", () => {
    debug("stdout closed");
  });
  ffmpeg.stderr.on("data", (data) => {
    ffmpeg_debug(data.toString("utf8"));
  });

  return new Promise((resolve, reject) => {
    ffmpeg.on("spawn", () => {
      debug("ffmpeg spawned");
      resolve(ffmpeg.stdout);
    });

    ffmpeg.on("error", (err) => {
      console.log(`Error in ffmpeg: ${err}`);
      reject(err);
    });
  });
}

function scaleFilter(width, height) {
  return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
}

module.exports = {
  ffmpegExtractor,
  scaleFilter,
};
