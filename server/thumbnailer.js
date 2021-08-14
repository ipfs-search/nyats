const assert = require('assert').strict;
const sharp = require('sharp');
const asyncIteratorToStream = require('async-iterator-to-stream');
const debug = require('debug')('nyats');
const { AbortController } = require('node-abort-controller');

function timeout_signal(timeout) {
  const controller = new AbortController();

  setTimeout(() => {
    debug('Timeout');
    controller.abort();
  }, timeout);

  return controller.signal;
}

module.exports = (ipfs,
  {
    ipfsGateway = 'https://gateway.ipfs.io',
    ipfsTimeout = 10000,
  }) => {
  function getThumbnail(source, width, height) {
    const stream = asyncIteratorToStream(source);

    const transformer = sharp()
      .resize(width, height, {
        position: sharp.strategy.attention,
      });

    return stream.pipe(transformer);
  }

  async function getURL(root, path) {
    return `${ipfsGateway}/ipfs/${root.cid}${path}`;
  }

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
      return getURL(root, path);
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

    try {
      const input = ipfs.cat(`/${protocol}/${cid}`, {
        signal: timeout_signal(ipfsTimeout),
      });

      debug(`Generating ${width}x${height} thumbnail for ${cid}`);
      const thumbnail = getThumbnail(input, width, height);

      // Write thumbnail to IPFS
      debug(`Writing thumbnail to ${path}`);
      await ipfs.files.write(
        path, thumbnail,
        {
          create: true,
          cidVersion: 1,
          rawLeaves: true,
          flush: true,
        });
    } catch (error) {
      console.log('Caught timeout', error.name);
      console.log(error);
      // if (error.message == )
    }

    // Return URL of thumbnail
    debug(`Returning URL for ${path}`);
    const root = await ipfs.files.stat('/', { hash: true });
    return getURL(root, path);
  };
};
