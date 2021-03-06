const express = require('express');
const ipfsClient = require('ipfs-http-client');
const createThumbnailer = require('./thumbnailer');
const debug = require('debug')('nyats:server');

const app = express();

async function startRootUpdater(ipfs, updateInterval) {
  // Publish to IPNS every minute, but only if the root was changed
  const root = await ipfs.files.stat('/', { hash: true });
  let rootCidStr = root.cid.toString();

  setInterval(async () => {
    // Publish to IPNS - normally we only want to do this every few minutes or so,
    // this is a client-side cache. Don't wait though!
    const newroot = await ipfs.files.stat('/', { hash: true });
    const newrootStr = newroot.cid.toString();
    if (newrootStr !== rootCidStr) {
      debug(`Publishing new root ${newrootStr} to IPNS.`);
      rootCidStr = newrootStr;
      await ipfs.name.publish(newroot.cid);
    }
  }, updateInterval);
}

async function main() {
  const NYATS_SERVER_PORT = process.env.NYATS_SERVER_PORT || '9614';
  const IPFS_API = process.env.IPFS_API || 'http://localhost:5001';
  const ipfsGateway = process.env.IPFS_GATEWAY || 'https://gateway.ipfs.io';
  const ipfsTimeout = process.env.IPFS_TIMEOUT || 30 * 1000;
  const IPNS_UPDATE_INTERVAL = process.env.IPNS_UPDATE_INTERVAL || 60 * 1000;

  const ipfs = await ipfsClient.create(IPFS_API);

  try {
    const version = await ipfs.version();
    console.log('IPFS daemon version:', version.version);
    console.log(`IPFS gateway: ${ipfsGateway}`)
  } catch (e) {
    console.log('Unable to get IPFS daemon version. Is the IPFS daemon running?');
    return;
  }

  const thumbnailer = createThumbnailer(ipfs, { ipfsGateway, ipfsTimeout });

  startRootUpdater(ipfs, IPNS_UPDATE_INTERVAL);

  app.get('/thumbnail/:protocol/:cid/:width/:height/', async (req, res, next) => {
    // TODO: Validation
    // https://express-validator.github.io/docs/
    const { protocol, cid, width, height } = req.params;
    const { type } = req.query;

    try {
      const url = await thumbnailer(protocol, cid, type, parseInt(width), parseInt(height));
      // TODO: 301 status code (first parameter)
      debug(`Redirecting to ${url}`);
      res.redirect(301, url);
    } catch (e) {
      // ExpressJS <5 doesn't properly catch async errors (yet)
      next(e);
    }
  });

  function error(res, code, err) {
    console.error(`${code}: ${err}`);
    console.trace(err);

    res.status(code).json({ error: `${err}` }).end();
  }

  process.on('uncaughtException', (err) => {
    // This is to prevent the server from crashing on timeout.
    // Somehow IPFS errors seem to both result in a rejected promise as well as thrown.
    // Results from here: https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs-core-utils/src/with-timeout-option.js
    if (err.name === 'TimeoutError') return;
  });

  app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      // Don't leak details in production
      error(res, 500, 'Internal Server Error');
    }

    if (res.headersSent) {
      console.log('headers already sent');
      return next(err);
    }

    error(res, 500, err);
  });

  app.listen(NYATS_SERVER_PORT, () => console.log(`nyats server listening on http://localhost:${NYATS_SERVER_PORT}`));
}

main();
