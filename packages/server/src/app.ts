import process from "node:process";
import express from "express";
import { strict as assert } from "assert";
import healthcheck from "express-healthcheck";
import { param, query, validationResult, matchedData } from "express-validator";
import isIPFS from "is-ipfs";
import makeDebugger from "debug";

import { nyatsMaxOutputHeight, nyatsMaxOutputWidth } from "./conf.js";
import { Type, Protocol, Thumbnailer, ThumbnailRequest } from "./types.js";
import { GetGatewayURL } from "./ipfs.js";

const debug = makeDebugger("nyats:server");

export default (thumbnailer: Thumbnailer): express.Express => {
  const app = express();

  app.get(
    "/thumbnail/:protocol/:cid/:width/:height/",
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      await param("protocol").isIn(Object.keys(Protocol)).run(req);
      await param("width").isInt({ min: 16, max: nyatsMaxOutputWidth }).toInt().run(req);
      await param("height").isInt({ min: 16, max: nyatsMaxOutputHeight }).toInt().run(req);
      await query("type").optional().isIn(Object.keys(Type)).run(req);
      await param("cid")
        .custom((v) => isIPFS.cid(v))
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = matchedData(req);
      const { protocol, type, cid, width, height } = data;

      debug(
        `Received thumbnail request for ${protocol}://${cid} at ${width}x${height} of type ${type}`
      );

      try {
        const thumbReq: ThumbnailRequest = data as ThumbnailRequest;
        const ipfsPath = await thumbnailer(thumbReq);
        assert(ipfsPath);

        res.setHeader("x-ipfs-path", ipfsPath);
        const redirectURL = GetGatewayURL(ipfsPath);

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
