const assert = require('assert').strict;
const sharp = require('sharp');
const asyncIteratorToStream = require("async-iterator-to-stream");

module.exports = function(ipfs) {
  function getThumbnail(source, width, height) {
    const stream = asyncIteratorToStream(source);

    let transformer = sharp()
      .resize(width, height, {
        position: sharp.strategy.attention,
      });

    return stream.pipe(transformer);
  }

  async function getURL(path) {
    const root = await ipfs.files.stat('/', {hash: true});
    console.debug(`MFS root: ${root.cid}`);

    return `http://localhost:8080/ipfs/${root.cid}${path}`
  }

  return async function(protocol, cid, width, height) {
    assert.equal(protocol, 'ipfs');

    const path = `/${cid}-${width}-${height}.jpg`

    // If the file already exists, don't generate again
    try {
      await ipfs.files.stat(path, {hash: true});
      return getURL(path);
    } catch (error) {
      if (error.message != 'file does not exist') {
        throw error;
      }
    }

    const input = ipfs.cat(`/${protocol}/${cid}`, {
      timeout: '30000', // 30s timeout
    });

    const thumbnail = getThumbnail(input, width, height);

    await ipfs.files.write(
      path, thumbnail,
      {
        create: true,
        cidVersion: 1,
        rawLeaves: true,
        flush: true,
      });

    return getURL(path);
  }
};
