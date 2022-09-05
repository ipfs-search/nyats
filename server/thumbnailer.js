import { strict as assert } from "assert";
import asyncIteratorToStream from "async-iterator-to-stream";
import makeDebugger from "debug";

import makeTypeDetector from "./type_detector.js";
import makeImageThumbnailer from "./image_thumbnailer.js";
import makeVideoThumbnailer from "./video_thumbnailer.js";

import { ipfsTimeout } from "./conf.js";

const debug = makeDebugger("nyats:thumbnailer");

export default (ipfs) => {
  const typeDetector = makeTypeDetector();
  const imageThumbnailer = makeImageThumbnailer();
  const videoThumbnailer = makeVideoThumbnailer();

  async function getURL(root, path) {
    return `/ipfs/${root}${path}`;
  }

  async function getThumbnail(protocol, cid, typeHint, width, height) {
    debug(`Retreiving ${cid} from IPFS`);

    const input = await ipfs.cat(`/${protocol}/${cid}`, {
      timeout: ipfsTimeout,
    });

    let stream = asyncIteratorToStream(input);

    let type;
    if (typeHint) {
      debug(`Using type hint: ${typeHint}`);
      type = typeHint;
    } else {
      [type, stream] = await typeDetector.detectType(stream);
      debug(`Detected type: ${type}`);
    }

    debug(`Generating ${width}x${height} thumbnail`);
    switch (type) {
      case "image":
        return imageThumbnailer(stream, width, height);

      case "video":
      case "audio":
        return videoThumbnailer(`http://localhost:8080/ipfs/${cid}`, width, height);

      default:
        throw Error(`unsupported type: ${type}`);
    }
  }

  async function getExistingThumbnail(path) {
    // If the file already exists, don't generate again
    try {
      debug(`Checking for ${path} on MFS`);
      await ipfs.files.stat(path, { hash: true });

      // Return MFS path to allow for gateway caching.
      // This might unecessarily cause lag
      const root = await ipfs.files.stat("/", { hash: true });

      return getURL(root.cid, path);
    } catch (error) {
      debug(`MFS result: ${error}`);

      if (error.message !== "file does not exist") {
        // Unexpected error.
        throw error;
      } else {
        debug(`${path} not found on MFS`);
        return null;
      }
    }
  }

  async function writeThumbnail(thumbnail) {
    debug(`Adding thumbnail to IPFS`);
    const ipfsThumbnail = await ipfs.add(thumbnail, {
      cidVersion: 1,
      rawLeaves: true,
      timeout: ipfsTimeout,
    });

    if (ipfsThumbnail.size === 0) {
      throw Error("invalid thumbnail generated: 0 bytes length");
    }

    return ipfsThumbnail;
  }

  async function addToMFS(ipfsThumbnail, path) {
    // TODO: Soft fail here
    // Ref: HTTPError: cp: cannot put node in path /QmWR97DZDJSxQUjKx7EYBhsDWriweYSiM2t1ngPSkZ9HnM-161-90.jpg: directory already has entry by that name
    // Sep 04 18:57:12 eccles npm[10337]: 500: HTTPError: cp: cannot put node in path /QmYHSss8UPB7RLni8DNQgZPTNFC9VmBctMvaT5ym92S8S6-400-400.webp: directory already has entry by that name
    // Sep 04 18:57:12 eccles npm[10337]: Trace: HTTPError: cp: cannot put node in path /QmYHSss8UPB7RLni8DNQgZPTNFC9VmBctMvaT5ym92S8S6-400-400.webp: directory already has entry by that name
    // Sep 04 18:57:12 eccles npm[10337]:     at Object.errorHandler [as handleError] (/usr/local/libexec/nyats/node_modules/ipfs-http-client/src/lib/core.js:100:15)
    // Sep 04 18:57:12 eccles npm[10337]:     at processTicksAndRejections (node:internal/process/task_queues:96:5)
    // Sep 04 18:57:12 eccles npm[10337]:     at async Client.fetch (/usr/local/libexec/nyats/node_modules/ipfs-utils/src/http.js:145:9)
    // Sep 04 18:57:12 eccles npm[10337]:     at async Object.cp (/usr/local/libexec/nyats/node_modules/ipfs-http-client/src/files/cp.js:20:17)
    // Sep 04 18:57:12 eccles npm[10337]:     at async generateThumbnail (file:///usr/local/libexec/nyats/server/thumbnailer.js:111:5)
    // Sep 04 18:57:12 eccles npm[10337]:     at async file:///usr/local/libexec/nyats/server/app.js:34:24 {
    // Sep 04 18:57:12 eccles npm[10337]:   response: Response {
    // Sep 04 18:57:12 eccles npm[10337]:     size: 0,
    // Sep 04 18:57:12 eccles npm[10337]:     timeout: 0,
    // Sep 04 18:57:12 eccles npm[10337]:     [Symbol(Body internals)]: { body: [PassThrough], disturbed: true, error: null },
    // Sep 04 18:57:12 eccles npm[10337]:     [Symbol(Response internals)]: {
    // Sep 04 18:57:12 eccles npm[10337]:       url: 'http://localhost:5001/api/v0/files/cp?flush=false&arg=%2Fipfs%2Fbafkreigf2iqhripz7vq7lnbyt6hhrawyvbp3u5ajma7kbmsmxpihf7oxli&arg=%2FQmYHSss8UPB7RLni8DNQgZPTNFC9VmBctMvaT5ym92S8S6-400-400.web
    // Sep 04 18:57:12 eccles npm[10337]:       status: 500,
    // Sep 04 18:57:12 eccles npm[10337]:       statusText: 'Internal Server Error',
    // Sep 04 18:57:12 eccles npm[10337]:       headers: [Headers],
    // Sep 04 18:57:12 eccles npm[10337]:       counter: 0
    // Sep 04 18:57:12 eccles npm[10337]:     }
    // Sep 04 18:57:12 eccles npm[10337]:   }
    // Sep 04 18:57:12 eccles npm[10337]: }
    // Sep 04 18:57:12 eccles npm[10337]:     at error (file:///usr/local/libexec/nyats/server/app.js:50:13)
    // Sep 04 18:57:12 eccles npm[10337]:     at file:///usr/local/libexec/nyats/server/app.js:69:5
    // Sep 04 18:57:12 eccles npm[10337]:     at Layer.handle_error (/usr/local/libexec/nyats/node_modules/express/lib/router/layer.js:71:5)
    // Sep 04 18:57:12 eccles npm[10337]:     at trim_prefix (/usr/local/libexec/nyats/node_modules/express/lib/router/index.js:326:13)
    // Sep 04 18:57:12 eccles npm[10337]:     at /usr/local/libexec/nyats/node_modules/express/lib/router/index.js:286:9
    // Sep 04 18:57:12 eccles npm[10337]:     at Function.process_params (/usr/local/libexec/nyats/node_modules/express/lib/router/index.js:346:12)
    // Sep 04 18:57:12 eccles npm[10337]:     at next (/usr/local/libexec/nyats/node_modules/express/lib/router/index.js:280:10)
    // Sep 04 18:57:12 eccles npm[10337]:     at next (/usr/local/libexec/nyats/node_modules/express/lib/router/route.js:129:14)
    // Sep 04 18:57:12 eccles npm[10337]:     at file:///usr/local/libexec/nyats/server/app.js:44:7
    // Sep 04 18:57:12 eccles npm[10337]:     at processTicksAndRejections (node:internal/process/task_queues:96:5)
    debug(`Adding thumbnail ${ipfsThumbnail.cid} to ${path}`);
    return ipfs.files.cp(ipfsThumbnail.cid, path, { flush: false });
  }

  async function flushRootCID() {
    return ipfs.files.flush("/");
  }

  async function generateThumbnail(path, protocol, cid, type, width, height) {
    debug(`Generating thumbnail for ${protocol}://${cid} of type ${type} at ${width}x${height}`);

    const thumbnail = await getThumbnail(protocol, cid, type, width, height);
    const ipfsThumbnail = await writeThumbnail(thumbnail);

    await addToMFS(ipfsThumbnail, path);
    const rootCid = await flushRootCID();

    return getURL(rootCid, path);
  }

  return async (protocol, cid, type, width, height) => {
    assert.equal(protocol, "ipfs");

    const path = `/${cid}-${width}-${height}.webp`;

    const existing = await getExistingThumbnail(path);
    if (existing) {
      debug(`Returning existing thumbnail: ${existing}`);
      return existing;
    }

    return generateThumbnail(path, protocol, cid, type, width, height);
  };
};
