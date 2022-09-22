import { use, expect } from "chai";
import request from "supertest";
import path from "path";
import fs from "fs";
import sinon from "sinon";
import { stubInterface } from "ts-sinon";
import type { IPFS } from "ipfs-core-types";
import { CID } from "multiformats/cid";
import sharp from "sharp";
import { chaiPlugin as matchApiSchema } from "api-contract-validator";

import makeApp from "../src/app.js";
import makeThumbnailer from "../src/thumbnailer.js";
import { publicIPFSGateway } from "../src/conf.js";

// OpenAPI matcher
const apiDefinitionsPath = path.resolve("../../openapi.yml");
use(matchApiSchema({ apiDefinitionsPath }));

const grapefruitPath = path.resolve("test/assets/grapefruit.jpg");
async function grapefruitStream() {
  const readStream = fs.createReadStream(grapefruitPath);
  return readStream;
}

const cid = "QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF";
const thumbnailCid = "QmPwG1cSwtz19rMh81Zfii5iw4jSAC8yLK7byY5U7g38gs";
const width = 100;
const height = 100;
const protocol = "ipfs";
const getURL = `/thumbnail/${protocol}/${cid}/${width}/${height}`;
const rootCid = "Qmc1QXsKgyQNjpbcvFeuSw5FJ6zYZ41pxcR4zkPjMPDCar";
const newRootCid = "QmfTg8E3YRx7PwcnXpPGWRJsgpLUqPTLvyrEJEP7SdB8FH";
const thumbPath = `/${cid}-${width}-${height}.webp`;
const thumbPathExists = `/${cid}-${width}-${height}.webp`;

let grapefruit: fs.ReadStream;

const notFoundError = new Error("file does not exist");
notFoundError.name = "not found";

describe("app integration tests", function () {
  let ipfsMock;
  let statStub;
  let response, app;

  beforeEach(async function () {
    grapefruit = await grapefruitStream();

    ipfsMock = stubInterface<IPFS>();

    ipfsMock.cat.returns(grapefruit);
    ipfsMock.version.resolves({ version: "0.99.0" });
    ipfsMock.add.resolves({
      cid: CID.parse(thumbnailCid),
      size: 34,
      path: "",
    });

    statStub = sinon
      .stub()
      .onSecondCall()
      .returns({ cid: CID.parse(rootCid) });

    ipfsMock.files.flush = sinon.stub().resolves(newRootCid);
    ipfsMock.files.cp = sinon.stub().resolves();
    ipfsMock.files.stat = statStub;

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
    beforeEach(function () {
      statStub.onFirstCall().throws(notFoundError);
    });

    it("Satisfies OpenAPI spec", expectOpenAPISchema());
    it(
      "Returns correct thumbnail URL",
      expectThumbnailURL(`${publicIPFSGateway}/ipfs/${newRootCid}${thumbPath}`)
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
    beforeEach(function () {
      statStub.onFirstCall().resolves();
    });

    it("Satisfies OpenAPI spec", expectOpenAPISchema());
    it(
      "Returns correct thumbnail URL",
      expectThumbnailURL(`${publicIPFSGateway}/ipfs/${rootCid}${thumbPathExists}`)
    );
  });
});
