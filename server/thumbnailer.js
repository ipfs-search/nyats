const assert = require('assert').strict;
const asyncIteratorToStream = require('async-iterator-to-stream');
const debug = require('debug')('nyats:thumbnailer');
const makeTypeDetector = require('./type_detector');
const makeImageThumbnailer = require('./image_thumbnailer');
const makeVideoThumbnailer = require('./video_thumbnailer');

module.exports = (ipfs,
  {
    ipfsGateway = 'https://gateway.ipfs.io',
    ipfsTimeout = 10000,
  }) => {

  const typeDetector = makeTypeDetector();
  const imageThumbnailer = makeImageThumbnailer();
  const videoThumbnailer = makeVideoThumbnailer();

  async function getURL(root, path) {
    return `${ipfsGateway}/ipfs/${root}${path}`;
  }

  async function getThumbnail(protocol, cid, type, width, height) {
    debug(`Retreiving ${cid} from IPFS`);

    const input = await ipfs.cat(`/${protocol}/${cid}`, {
      timeout: ipfsTimeout,
    });

    let stream = asyncIteratorToStream(input);

    if (type !== null) {
      debug(`Using type hint: ${type}`);
    } else {
      [type, stream] = await typeDetector.detectType(stream);
      debug(`Detected type: ${type}`);
    }

    debug(`Generating ${width}x${height} thumbnail`);
    switch (type) {
      case 'image':
        return imageThumbnailer.makeThumbnail(stream, width, height);

      case 'video':
        return videoThumbnailer.makeThumbnail(`http://localhost:8080/ipfs/${cid}`, width, height);

      default:
        throw Error(`unsupported type: ${type}`);
    }
  }

  return async (protocol, cid, type, width, height) => {
    assert.equal(protocol, 'ipfs');

    const path = `/${cid}-${width}-${height}.jpg`;

    // If the file already exists, don't generate again
    try {
      debug(`Checking for ${path} on MFS`);
      await ipfs.files.stat(path, { hash: true });
      // This might unecessarily cause lag
      const root = await ipfs.files.stat('/', { hash: true });

      debug(`Returning existing thumbnail for ${path}`);
      return getURL(root.cid, path);
    } catch (error) {
      debug(`MFS result: ${error}`);

      if (error.message !== 'file does not exist') {
        // Unexpected error.
        throw error;
      } else {
        debug(`${path} not found on MFS, generating thumbnail`);
      }
    }

    try {
      // Try because uncaught promise exception weirdness.
      const thumbnail = await getThumbnail(protocol, cid, type, width, height);

      // We separate writing from MFS updates
      debug(`Writing thumbmail for ${cid} to IPFS`);
      const ipfsThumbnail = await ipfs.add(thumbnail, {
        cidVersion: 1,
        rawLeaves: true,
        timeout: ipfsTimeout,
      });

      if (ipfsThumbnail['size'] === 0) {
        throw Error('invalid thumbnail generated: 0 bytes length');
      }

      // TODO: Soft fail here
      // Ref: HTTPError: cp: cannot put node in path /QmWR97DZDJSxQUjKx7EYBhsDWriweYSiM2t1ngPSkZ9HnM-161-90.jpg: directory already has entry by that name
      debug(`Adding thumbnail ${ipfsThumbnail.cid} to ${path}`);
      ipfs.files.cp(
        ipfsThumbnail.cid, path, { flush: false }
      );

      // Return URL of thumbnail
      debug(`Returning URL for ${path}`);
      const rootCid = await ipfs.files.flush('/');
      return getURL(rootCid, path);
    } catch (e) {
      throw(e);
    }
  };
};
