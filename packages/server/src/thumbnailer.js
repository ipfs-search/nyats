import { strict as assert } from "assert";
import asyncIteratorToStream from "async-iterator-to-stream";
import makeDebugger from "debug";
import makeTypeDetector from "./type_detector.js";
import makeImageThumbnailer from "./image_thumbnailer.js";
import makeVideoThumbnailer from "./video_thumbnailer.js";
import makeAudioThumbnailer from "./audio_thumbnailer.js";

import { ipfsTimeout } from "./conf.js";

const debug = makeDebugger("nyats:thumbnailer");

export default (ipfs) => {
  const typeDetector = makeTypeDetector();
  const imageThumbnailer = makeImageThumbnailer();
  const videoThumbnailer = makeVideoThumbnailer();
  const audioThumbnailer = makeAudioThumbnailer();

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
        return videoThumbnailer(`http://localhost:8080/ipfs/${cid}`, width, height);

      case "audio":
        return audioThumbnailer(`http://localhost:8080/ipfs/${cid}`, width, height);

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
    debug(`Adding thumbnail ${ipfsThumbnail.cid} to ${path}`);
    try {
      ipfs.files.cp(ipfsThumbnail.cid, path, { flush: false });
    } catch (e) {
      if (
        e.name === "HTTPError" &&
        e.messages.includes("directory already has entry by that name")
      ) {
        console.warn("Pre-existing thumbnail in ${path}", e.message);
        return;
      }

      throw e;
    }
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
