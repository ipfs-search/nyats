const assert = require('assert').strict;
const { spawn } = require('child_process');
const debug = require('debug')('nyats:video_thumbnailer');

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
    makeThumbnail(stream, width, height) {
      //Extract first 40% scene change on a vframe (full frame), minimum 3s after start of video.

      const ffmpeg = spawn(
        'ffmpeg',
        [
          '-f', 'mp4',
          '-ss', '3',
          '-i', '-',
          '-vf', `select=gt(scene,0.4), scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`,
          '-frames:v', '1',
          '-vsync', 'vfr',
          '-f', 'singlejpeg',
          '-',
          '-loglevel', 'debug',
        ],
      )

      // Setup plumbing
      stream.pipe(ffmpeg.stdin);
      ffmpeg.stderr.on('data', (data) => {
        debug(data.toString('utf8'));
      });

      assert.notEqual(ffmpeg.stdout, null);
      return ffmpeg.stdout;
    }
  };
}
