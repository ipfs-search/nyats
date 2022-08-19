import express from "express";
import { strict as assert } from "assert";
import { create } from "ipfs-http-client";
import makeDebugger from "debug";

import makeThumbnailer from "./thumbnailer.js";

const debug = makeDebugger("nyats:server");

async function startRootUpdater(ipfs, updateInterval) {
  // Publish to IPNS every minute, but only if the root was changed
  const root = await ipfs.files.stat("/", { hash: true });
  let rootCidStr = root.cid.toString();

  setInterval(async () => {
    // Publish to IPNS - normally we only want to do this every few minutes or so,
    // this is a client-side cache. Don't wait though!
    const newroot = await ipfs.files.stat("/", { hash: true });
    const newrootStr = newroot.cid.toString();
    if (newrootStr !== rootCidStr) {
      debug(`Publishing new root ${newrootStr} to IPNS.`);
      rootCidStr = newrootStr;
      await ipfs.name.publish(newroot.cid);
    }
  }, updateInterval);
}

async function getIPFS(ipfsAPI) {
  const ipfs = create(ipfsAPI);

  try {
    const version = await ipfs.version();
    console.log("IPFS daemon version:", version.version);
  } catch (e) {
    console.log("Unable to get IPFS daemon version. Is the IPFS daemon running?");
    throw e;
  }

  return ipfs;
}

export default async () => {
  const app = express();

  const updateInterval = process.env.IPNS_UPDATE_INTERVAL || 60 * 1000;
  const ipfsGateway = process.env.IPFS_GATEWAY || "https://gateway.ipfs.io";
  const ipfsTimeout = process.env.IPFS_TIMEOUT || 120 * 1000;
  const ipfsAPI = process.env.IPFS_API || "http://localhost:5001";

  console.log(`IPFS gateway: ${ipfsGateway}`);

  const ipfs = await getIPFS(ipfsAPI);
  const thumbnailer = makeThumbnailer(ipfs, { ipfsGateway, ipfsTimeout });

  startRootUpdater(ipfs, updateInterval);

  app.get("/thumbnail/:protocol/:cid/:width/:height/", async (req, res, next) => {
    // TODO: Validation
    // https://express-validator.github.io/docs/
    const { protocol, cid, width, height } = req.params;
    const { type } = req.query;

    try {
      const url = await thumbnailer(protocol, cid, type, parseInt(width), parseInt(height));
      assert(url);
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

    res
      .status(code)
      .json({ error: `${err}` })
      .end();
  }

  process.on("uncaughtException", (err) => {
    // This is to prevent the server from crashing on timeout.
    // Somehow IPFS errors seem to both result in a rejected promise as well as thrown.
    // Results from here: https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs-core-utils/src/with-timeout-option.js
    if (err.name === "TimeoutError") return;
  });

  app.use((err, _, res, next) => {
    if (process.env.NODE_ENV === "production") {
      // Don't leak details in production
      error(res, 500, "Internal Server Error");
    }

    if (res.headersSent) {
      console.log("headers already sent");
      return next(err);
    }

    error(res, 500, err);
  });

  return app;
};
