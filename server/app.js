import process from "node:process";
import express from "express";
import { strict as assert } from "assert";
import healthcheck from "express-healthcheck";

import makeDebugger from "debug";
const debug = makeDebugger("nyats:server");

export default (thumbnailer) => {
  const app = express();

  app.get("/thumbnail/:protocol/:cid/:width/:height/", async (req, res, next) => {
    // TODO: Validation
    // https://express-validator.github.io/docs/
    const { protocol, cid, width, height } = req.params;
    const { type } = req.query;

    debug(
      `Received thumbnail request for ${protocol}://${cid} at ${width}x${height} of type ${type}`
    );

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
