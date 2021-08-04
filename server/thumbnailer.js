const assert = require('assert').strict;
const sharp = require('sharp');
const asyncIteratorToStream = require("async-iterator-to-stream");

module.exports = function(ipfs, ipfs_gateway) {
  function getThumbnail(source, width, height) {
    const stream = asyncIteratorToStream(source);

    let transformer = sharp()
      .resize(width, height, {
        position: sharp.strategy.attention,
      });

    return stream.pipe(transformer);
  }

  async function getURL(root, path) {
    console.debug(`MFS root: ${root.cid}`);

    return `${ipfs_gateway}/ipfs/${root.cid}${path}`
  }

  return async function(protocol, cid, width, height) {
    assert.equal(protocol, 'ipfs');

    const path = `/${cid}-${width}-${height}.jpg`

    // If the file already exists, don't generate again
    try {
      await ipfs.files.stat(path, {hash: true});
      const root = await ipfs.files.stat('/', {hash: true});
      return getURL(root, path);
    } catch (error) {
      if (error.message != 'file does not exist') {
        throw error;
      }
    }

    const input = ipfs.cat(`/${protocol}/${cid}`, {
      timeout: '30000', // 30s timeout
    });

    const thumbnail = getThumbnail(input, width, height);

    // Write thumbnail to IPFS
    await ipfs.files.write(
      path, thumbnail,
      {
        create: true,
        cidVersion: 1,
        rawLeaves: true,
        flush: true,
      });

    const root = await ipfs.files.stat('/', {hash: true});

    // Return URL of thumbnail
    return getURL(root, path);
  }
};
