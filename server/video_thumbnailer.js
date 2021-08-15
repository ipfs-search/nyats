const prism = require('prism-media');
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

  const ffmpeg = prism.FFmpeg.getInfo();
  debug(`Using FFmpeg version ${ffmpeg.version}`);

  return {
    makeThumbnail(stream, width, height) {
      console.log('testyeah');
      //Extract first 40% scene change on a vframe (full frame), minimum 3s after start of video.
      const keyFrameExtractor = new prism.FFmpeg({
        args: [
          '-ss', '3',
          '-vf',`"select=gt(scene\,0.4), scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`,
          '-frames:v', '1',
          '-vsync', 'vfr',
          '-f', 'singlejpeg',
          '-loglevel', '0',
        ]
      });

      return stream.pipe(keyFrameExtractor, (err) => {
        if (err) {
          console.error('Pipeline failed.', err);
        } else {
          console.log('Pipeline succeeded.');
        }
      });
      // return stream;
    }
  };
}
