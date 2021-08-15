const assert = require('assert').strict;
const sharp = require('sharp');
const asyncIteratorToStream = require('async-iterator-to-stream');
const debug = require('debug')('nyats');
const typeDetector = require('./type_detector');

module.exports = (ipfs,
  {
    ipfsGateway = 'https://gateway.ipfs.io',
    ipfsTimeout = 10000,
  }) => {

  function makeImageThumbnail(stream, width, height) {
    const transformer = sharp()
      .resize(width, height, {
        position: sharp.strategy.attention,
      })
      .toFormat('jpeg', {
        mozjpeg: true,
      });

    return stream.pipe(transformer);
  }

  function getThumbnail(type, stream, width, height) {
    debug(`Generating ${width}x${height} thumbnail`);
    switch (type) {
      case 'image':
          return makeImageThumbnail(stream, width, height);
        break
      default:
        throw Error(`unsupported type: ${type}`);
    }
  }

  async function getURL(root, path) {
    return `${ipfsGateway}/ipfs/${root}${path}`;
  }

  const detector = typeDetector();

  return async (protocol, cid, width, height) => {
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

    debug(`Retreiving ${cid} from IPFS`);

    const input = await ipfs.cat(`/${protocol}/${cid}`, {
      timeout: ipfsTimeout,
    });

    let stream = asyncIteratorToStream(input);

    [type, stream] = await detector.detectType(stream);
    console.log(`Detected type: ${type}`);

    const thumbnail = getThumbnail(type, stream, width, height);

    debug(`Writing thumbmail for ${cid} to IPFS`);
    // We separate this from write

    const ipfsThumbnail = await ipfs.add(thumbnail, {
      cidVersion: 1,
      rawLeaves: true,
      timeout: ipfsTimeout,
    });

    if (ipfsThumbnail['size'] === 0) {
      throw Error('invalid thumbnail generated: 0 bytes length');
    }

    debug(`Adding thumbnail ${ipfsThumbnail.cid} to ${path}`);
    ipfs.files.cp(
      ipfsThumbnail.cid, path, { flush: false }
    );

    // Return URL of thumbnail
    debug(`Returning URL for ${path}`);
    const rootCid = await ipfs.files.flush('/');
    return getURL(rootCid, path);
  };
};
