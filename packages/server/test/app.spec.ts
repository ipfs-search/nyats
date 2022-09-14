"strict";
import { use, expect } from "chai";
import sinon from "sinon";
import request from "supertest";
import path from "path";
import fs from "fs";
import { stubObject } from "ts-sinon";
import { CID, IPFSHTTPClient } from "ipfs-http-client";

import makeApp from "../src/app.js";
import makeThumbnailer from "../src/thumbnailer.js";
import { ipfsGateway } from "../src/conf.js";
import ipfs from "../src/ipfs.js";

import sharp from "sharp";

// OpenAPI matcher
import { chaiPlugin as matchApiSchema } from "api-contract-validator";

const apiDefinitionsPath = path.resolve("../../openapi.yml");
use(matchApiSchema({ apiDefinitionsPath }));

const grapefruitPath = path.resolve("test/assets/grapefruit.jpg");
async function grapefruitStream() {
  const readStream = fs.createReadStream(grapefruitPath);
  return readStream;
}

describe("app integration tests", function () {
  const rootCid = "rootCid";
  const newRootCid = "newRootCid";
  const cid = "QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF";
  const width = 100;
  const height = 100;
  const protocol = "ipfs";
  const thumbPath = `/${cid}-${width}-${height}.webp`;
  const getURL = `/thumbnail/${protocol}/${cid}/${width}/${height}`;

  let response, addStub, statStub, app, grapefruit;

  beforeEach(async function () {
    grapefruit = await grapefruitStream();

    const ipfsMock = stubObject<IPFSHTTPClient>(ipfs, {
      cat: grapefruit,
      version: { version: "0.99.0" },
      add: {
        cid: CID.parse("QmPwG1cSwtz19rMh81Zfii5iw4jSAC8yLK7byY5U7g38gs"),
        size: 34,
        path: "",
      },
    });

    ipfsMock.files.stat.withArgs("/").returns({
      cid: rootCid,
    });
    ipfsMock.files;
    ipfsMock.files.flush.resolves(sinon.promise().resolve(CID.parse(newRootCid)));

    const thumbnailer = makeThumbnailer(ipfsMock);
    app = request(makeApp(thumbnailer));
  });

  afterEach(async function () {
    grapefruit.destroy();
  });

  function expectThumbnailURL(url) {
    return async () => {
      response = await app.get(getURL);
      expect(response.header["location"]).to.equal(url);
    };
  }

  function expectOpenAPISchema() {
    return async () => {
      response = await app.get(getURL);
      expect(response).to.have.status(301).and.to.matchApiSchema();
    };
  }

  describe("Generated image thumbnail", function () {
    beforeEach(async function () {
      statStub.withArgs(thumbPath).throws("not found", "file does not exist");
    });

    it("Satisfies OpenAPI spec", expectOpenAPISchema());
    it(
      "Returns correct thumbnail URL",
      expectThumbnailURL(`${ipfsGateway}/ipfs/${newRootCid}${thumbPath}`)
    );

    it("Has WebP format and correct dimensions", async function () {
      response = await app.get(getURL);

      const addCall = addStub.getCall(0);

      const thumbnail = await addCall.firstArg.toBuffer();
      const thumbnailMeta = await sharp(thumbnail).metadata();
      expect(thumbnailMeta.width).to.equal(width);
      expect(thumbnailMeta.height).to.equal(height);
      expect(thumbnailMeta.format).to.equal("webp");
    });
  });

  describe("Existing image thumbnail", function () {
    beforeEach(async function () {
      statStub.withArgs(thumbPath).resolves();
    });

    it("Satisfies OpenAPI spec", expectOpenAPISchema());
    it(
      "Returns correct thumbnail URL",
      expectThumbnailURL(`${ipfsGateway}/ipfs/${rootCid}${thumbPath}`)
    );
  });
});
