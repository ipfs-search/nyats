const assert = require('assert').strict;
const sharp = require('sharp');
const asyncIteratorToStream = require("async-iterator-to-stream");

module.exports = function(ipfs) {
  function getThumbnail(source, width, height) {
    const stream = asyncIteratorToStream(source);

    let transformer = sharp()
      .resize(width, height, {
        position: sharp.strategy.attention,
      })
      .on('info', function(info) {
        console.log('Image height is ' + info.height);
      });

    return stream.pipe(transformer);
  }
  function getURL(fsEntry) {
    return `http://localhost:8080/ipfs/${fsEntry.cid}`;
  }

  return async function(protocol, cid, width, height) {
    assert.equal(protocol, 'ipfs');

    const input = ipfs.cat(`/${protocol}/${cid}`);

    const thumbnail = getThumbnail(input, width, height);
    const fsEntry = await ipfs.add(thumbnail);

    return getURL(fsEntry);
  }
};
