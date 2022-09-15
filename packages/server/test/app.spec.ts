"strict";
import { use, expect } from "chai";
import request from "supertest";
import path from "path";
import fs from "fs";
import sinon, { stubInterface } from "ts-sinon";
import type { IPFS } from "ipfs-core-types";

import { CID } from "multiformats/cid";

import makeApp from "../src/app";
import makeThumbnailer from "../src/thumbnailer";
import { ipfsGateway } from "../src/conf";
// import ipfs from "../src/ipfs";

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

const cid = "QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF";
const cid2 = "QmPwG1cSwtz19rMh81Zfii5iw4jSAC8yLK7byY5U7g38gs";
const width = 100;
const height = 100;
const protocol = "ipfs";
const getURL = `/thumbnail/${protocol}/${cid}/${width}/${height}`;
const rootCid = "rootCid";
const newRootCid = "newRootCid";
const thumbPath = `/${cid}-${width}-${height}.webp`;
const thumbPathExists = `/${cid2}-${width}-${height}.webp`;

// Setup IPFS mock
const ipfsMock = stubInterface<IPFS>();
let grapefruit: fs.ReadStream;
ipfsMock.cat.resolves(grapefruit);
ipfsMock.version.resolves({ version: "0.99.0" });
ipfsMock.add.resolves({
  cid: CID.parse(cid2),
  size: 34,
  path: "",
});

const notFoundError = new Error("file does not exist");
notFoundError.name = "not found";

ipfsMock.files.stat = sinon
  .stub()
  .withArgs("/")
  .returns({ cid: CID.parse(rootCid) })
  .withArgs(thumbPath)
  .throws(notFoundError)
  .withArgs(thumbPathExists)
  .resolves();

ipfsMock.files.flush = sinon.stub().resolves(newRootCid);

describe("app integration tests", function () {
  let response, app;

  beforeEach(async function () {
    grapefruit = await grapefruitStream();
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
    it("Satisfies OpenAPI spec", expectOpenAPISchema());
    it(
      "Returns correct thumbnail URL",
      expectThumbnailURL(`${ipfsGateway}/ipfs/${newRootCid}${thumbPath}`)
    );

    it("Has WebP format and correct dimensions", async function () {
      response = await app.get(getURL);

      const addCall = ipfsMock.add.getCall(0);

      const thumbnail = await addCall.firstArg.toBuffer();
      const thumbnailMeta = await sharp(thumbnail).metadata();
      expect(thumbnailMeta.width).to.equal(width);
      expect(thumbnailMeta.height).to.equal(height);
      expect(thumbnailMeta.format).to.equal("webp");
    });
  });

  describe("Existing image thumbnail", function () {
    it("Satisfies OpenAPI spec", expectOpenAPISchema());
    it(
      "Returns correct thumbnail URL",
      expectThumbnailURL(`${ipfsGateway}/ipfs/${rootCid}${thumbPathExists}`)
    );
  });
});
