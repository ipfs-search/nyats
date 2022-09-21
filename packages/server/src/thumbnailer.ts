import { Readable } from "stream";
import makeDebugger from "debug";
import type { IPFS } from "ipfs-core-types";
import { CID } from "multiformats/cid";

import makeTypeDetector from "./type_detector.js";
import makeImageThumbnailer from "./image_thumbnailer.js";
import makeVideoThumbnailer from "./video_thumbnailer.js";
import makeAudioThumbnailer from "./audio_thumbnailer.js";

import { ipfsTimeout } from "./conf.js";
import { Path, Type, ThumbnailRequest, URL } from "./types.js";
import { ReadableStream } from "node:stream/web";

const debug = makeDebugger("nyats:thumbnailer");

export default (ipfs: IPFS) => {
  const typeDetector = makeTypeDetector();
  const imageThumbnailer = makeImageThumbnailer();
  const videoThumbnailer = makeVideoThumbnailer();
  const audioThumbnailer = makeAudioThumbnailer();

  async function getURL(root: CID, path: string) {
    return `/ipfs/${root.toString()}${path}`;
  }

  async function getType(
    request: ThumbnailRequest,
    stream: Readable
  ): Promise<[Type, NodeJS.ReadableStream]> {
    if (request.type) {
      debug(`Using type hint: ${request.type}`);
      return [request.type, stream];
    } else {
      debug("Detecting mime type");
      return typeDetector.detectType(stream);
    }
  }

  async function getThumbnail(request: ThumbnailRequest): Promise<Readable> {
    const { protocol, cid, width, height } = request;

    debug(`Retreiving ${cid} from IPFS`);
    const input = ipfs.cat(`/${protocol}/${cid}`, {
      timeout: ipfsTimeout,
    });

    const stream = Readable.from(input);

    const [type, imgstream] = await getType(request, stream);

    debug(`Generating ${width}x${height} thumbnail`);
    switch (type as Type) {
      case Type.image:
        return imageThumbnailer(imgstream, width, height);

      case Type.video:
        return videoThumbnailer(`http://localhost:8080/ipfs/${cid}`, width, height);

      case Type.audio:
        return audioThumbnailer(`http://localhost:8080/ipfs/${cid}`, width, height);

      default:
        throw Error(`unsupported type: ${type}`);
    }
  }

  async function getExistingThumbnail(path: Path) {
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

  async function writeThumbnail(thumbnail: Readable): Promise<CID> {
    debug(`Adding thumbnail to IPFS`);
    const ipfsThumbnail = await ipfs.add(thumbnail, {
      cidVersion: 1,
      rawLeaves: true,
      timeout: ipfsTimeout,
    });

    if (ipfsThumbnail.size === 0) {
      throw Error("invalid thumbnail generated: 0 bytes length");
    }

    return ipfsThumbnail.cid;
  }

  async function addToMFS(cid: CID, path: Path) {
    debug(`Linking thumbnail ${cid} to ${path}`);
    try {
      return ipfs.files.cp(cid, path, { flush: false });
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

  async function generateThumbnail(path: Path, request: ThumbnailRequest): Promise<URL> {
    const { protocol, cid, type, width, height } = request;
    debug(`Generating thumbnail for ${protocol}://${cid} of type ${type} at ${width}x${height}`);

    const thumbnail = await getThumbnail(request);
    const ipfsThumbnail = await writeThumbnail(thumbnail);

    await addToMFS(ipfsThumbnail, path);
    const rootCid = await flushRootCID();

    return getURL(rootCid, path);
  }

  return async (request: ThumbnailRequest): Promise<URL> => {
    const { cid, width, height } = request;

    const path = `/${cid}-${width}-${height}.webp`;

    const existing = await getExistingThumbnail(path);
    if (existing) {
      debug(`Returning existing thumbnail: ${existing}`);
      return existing;
    }

    return generateThumbnail(path, request);
  };
};
