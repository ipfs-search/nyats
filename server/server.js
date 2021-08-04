const express = require('express');
const ipfsClient = require('ipfs-http-client');
const createThumbnailer = require('./thumbnailer');

const app = express();

async function main() {
  const NYATS_SERVER_LISTEN = process.env.NYATS_SERVER_LISTEN || 'localhost:9614';
  const IPFS_API = process.env.IPFS_API || 'http://localhost:5001';

  const ipfs = await ipfsClient.create(IPFS_API);

  const version = await ipfs.version()
  console.log('IPFS deamon version:', version.version)

  const thumbnailer = createThumbnailer(ipfs);

  app.get('/thumbnail/:protocol/:cid/:width/:height', async (req, res, next) => {
    // TODO: Validation
    // https://express-validator.github.io/docs/
    const { protocol, cid, width, height } = req.params;
    const url = await thumbnailer(protocol, cid, parseInt(width), parseInt(height));
    res.redirect(url);
  });

  function error(res, code, err) {
    console.error(`${code}: ${err}`);
    console.trace(err);

    res.json({ error: `${err}` }).status(code).end();
  }

  app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV === 'production') {
      // Don't leak details in production
      error(res, 500, 'Internal Server Error');
    }

    if (res.headersSent) {
      return next(err);
    }

    error(res, 500, err);
  });

  app.listen(NYATS_SERVER_LISTEN, () => console.log(`nyats server listening on ${NYATS_SERVER_LISTEN}!`));

  // Publish to IPNS every minute, but only if the root was changed
  const root = await ipfs.files.stat('/', {hash: true});
  var rootCidStr = root.cid.toString();

  setInterval(async function() {
    // Publish to IPNS - normally we only want to do this every few minutes or so - this is a client-side cache.
    // Don't wait though!
    const newroot = await ipfs.files.stat('/', {hash: true});
    const newrootStr = newroot.cid.toString();
    if (newrootStr != rootCidStr) {
      console.log('Publishing root to IPNS.');
      rootCidStr = newrootStr;
      await ipfs.name.publish(newroot.cid);
    }
  }, 60000);
}

main()
