const ffmpegBin = require("ffmpeg-static");
const { FFmpeggy } = require("ffmpeggy");
const debug = require('debug')('nyats:video_thumbnailer');

FFmpeggy.DefaultConfig = {
  ...FFmpeggy.DefaultConfig,
  ffmpegBin,
};

module.exports = () => {
  // # Try extractig cover art (allow only streams which are attached pictures, video thumbnails or cover arts).
  // if ! ffmpeg -i async:$INPUT -map 0:v -map -0:V -vf "scale=$WIDTH:$HEIGHT:force_original_aspect_ratio=increase,crop=$WIDTH:$HEIGHT" -frames:v 1 -f singlejpeg -; then
  // Coverart extractor (attempt 1)
  // const transcoder = new prism.FFmpeg({
  //   args: [
  //     '-analyzeduration', '0',
  //     '-loglevel', '0',
  //     '-f', 's16le',
  //     '-ar', '48000',
  //     '-ac', '2',
  //   ]
  // });

  return {
    async makeThumbnail(stream, width, height) {
      //Extract first 40% scene change on a vframe (full frame), minimum 3s after start of video.
      const keyFrameExtractor = new FFmpeggy({
        autorun: true,
        pipe: true, // shorthand for output set to pipe:0
        inputOptions: [
          '-f matroska',
          '-ss 3',
        ],
        outputOptions: [
          `-vf "select=gt(scene\,0.4), scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`,
          '-frames:v 1',
          '-vsync vfr',
          '-f singlejpeg',
        ],
      }).toStream();

      return keyFrameExtractor.pipe(stream);
    }
  };
}
