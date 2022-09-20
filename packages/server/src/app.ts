import process from "node:process";
import express from "express";
import { strict as assert } from "assert";
import healthcheck from "express-healthcheck";
import { param, query, validationResult, matchedData } from "express-validator";
import urlJoin from "url-join";
import isIPFS from "is-ipfs";
import { ipfsGateway, nyatsMaxOutputHeight, nyatsMaxOutputWidth } from "./conf.js";

import makeDebugger from "debug";
import { Type, Protocol, Thumbnailer, ThumbnailRequest } from "./types";
const debug = makeDebugger("nyats:server");

function getGatewayURL(req, ipfsPath) {
  // We can use the referer to derive whether we've been requested from a gateway
  // and then use this to generate URL's.
  const referer = req.headers["referer"];
  debug(referer);

  return urlJoin(ipfsGateway, ipfsPath);
}

export default (thumbnailer: Thumbnailer): express.Express => {
  const app = express();

  app.get(
    "/thumbnail/:protocol/:cid/:width/:height/",
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      await param("protocol").isIn(Object.values(Protocol)).run(req);
      await param("width").isInt({ min: 16, max: nyatsMaxOutputWidth }).toInt().run(req);
      await param("height").isInt({ min: 16, max: nyatsMaxOutputHeight }).toInt().run(req);
      await query("type").isIn(Object.values(Type)).run(req);
      await param("cid")
        .custom((v) => isIPFS.cid(v))
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = matchedData(req);
      const { protocol, cid, width, height, type } = data;

      debug(
        `Received thumbnail request for ${protocol}://${cid} at ${width}x${height} of type ${type}`
      );

      console.log("Got protocol", protocol);
      console.log("Protocol", Protocol);

      try {
        const thumbReq: ThumbnailRequest = data as ThumbnailRequest;
        const ipfsPath = await thumbnailer(thumbReq);
        assert(ipfsPath);

        res.setHeader("x-ipfs-path", ipfsPath);
        const redirectURL = getGatewayURL(req, ipfsPath);

        debug(`Redirecting to ${redirectURL}`);
        res.redirect(301, redirectURL);
      } catch (e) {
        // ExpressJS <5 doesn't properly catch async errors (yet)
        next(e);
      }
    }
  );

  function error(res, code, err) {
    console.error(`${code}: ${err}`);
    console.trace(err);

    res
      .status(code)
      .json({ error: `${err}` })
      .end();
  }

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

  app.use("/healthcheck", healthcheck());

  return app;
};
