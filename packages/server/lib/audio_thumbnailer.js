import makeDebugger from "debug";
import { ffmpegExtractor, scaleFilter } from "./ffmpeg_extractor";

const debug = makeDebugger("nyats:audio_thumbnailer");

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

module.exports = () => {
  return {
    async makeThumbnail(url, width, height) {
      debug(`Extracting thumbnail from ${url}`);
      const extractors = [extractCoverArt];

      for (const extract of extractors) {
        try {
          const { stdout, stderr } = await extract(url, width, height);

          stderr.on("data", (data) => {
            debug(data.toString("utf8"));
          });

          return stdout;
        } catch (e) {
          debug(e);
        }
      }

      throw new Error("All thumbnail methods failed.");
    },
  };
};
