"strict";
import { use, expect } from "chai";
import sinon from "sinon";
import request from "supertest";
import path from "path";
import fs from "fs";
import buffer from "buffer";
import esmock from "esmock";

import makeApp from "../app.js";
import startIPNSPublisher from "../ipns_publisher.js";
import makeThumbnailer from "../thumbnailer.js";

import sharp from "sharp";

// OpenAPI matcher
import { chaiPlugin as matchApiSchema } from "api-contract-validator";
const apiDefinitionsPath = path.resolve("openapi.yml");
use(matchApiSchema({ apiDefinitionsPath }));

const grapefruitPath = path.resolve("server/test/grapefruit.jpg");
async function grapefruitStream() {
  const readStream = fs.createReadStream(grapefruitPath);
  return readStream;
}

describe("Integration tests", () => {
  const rootCid = "rootCid";
  const newRootCid = "newRootCid";
  const cid = "QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF";
  const width = 100;
  const height = 100;
  const protocol = "ipfs";
  const thumbPath = `/${cid}-${width}-${height}.webp`;
  const getURL = `/thumbnail/${protocol}/${cid}/${width}/${height}`;
  const ipfsGateway = "https://ipfsgateway/";
  const ipfsTimeout = 60000;

  let response, addStub, statStub, app, grapefruit;

  beforeEach(async () => {
    statStub = sinon.stub();
    statStub.withArgs("/").returns({
      cid: rootCid,
    });
    addStub = sinon.stub().resolves({
      cid: "thumbnailCid",
      size: 34,
    });

    grapefruit = await grapefruitStream();
    const catStub = sinon.stub().resolves(grapefruit);
    const cpStub = sinon.stub().resolves();
    const flushStub = sinon.stub().resolves(newRootCid);

    const ipfsMock = {
      version: sinon.stub().resolves({ version: "0.99.0" }),
      add: addStub,
      cat: catStub,
      files: {
        stat: statStub,
        cp: cpStub,
        flush: flushStub,
      },
    };

    const getIPFS = await esmock("../getipfs.js", {
      "ipfs-http-client": {
        create: () => ipfsMock,
      },
    });

    const ipfs = await getIPFS("http://localhost:5001");
    const thumbnailer = makeThumbnailer(ipfs, { ipfsGateway, ipfsTimeout });
    app = request(makeApp(thumbnailer));
  });

  afterEach(async () => {
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

  describe("Generated image thumbnail", () => {
    beforeEach(async () => {
      statStub.withArgs(thumbPath).throws("not found", "file does not exist");
    });

    it("Satisfies OpenAPI spec", expectOpenAPISchema());
    it(
      "Returns correct thumbnail URL",
      expectThumbnailURL(`${ipfsGateway}/ipfs/${newRootCid}${thumbPath}`)
    );

    it("Has WebP format and correct dimensions", async () => {
      response = await app.get(getURL);

      const addCall = addStub.getCall(0);

      const thumbnail = await addCall.firstArg.toBuffer();
      const thumbnailMeta = await sharp(thumbnail).metadata();
      expect(thumbnailMeta.width).to.equal(width);
      expect(thumbnailMeta.height).to.equal(height);
      expect(thumbnailMeta.format).to.equal("webp");
    });
  });

  describe("Existing image thumbnail", () => {
    beforeEach(async () => {
      statStub.withArgs(thumbPath).resolves();
    });

    it("Satisfies OpenAPI spec", expectOpenAPISchema());
    it(
      "Returns correct thumbnail URL",
      expectThumbnailURL(`${ipfsGateway}/ipfs/${rootCid}${thumbPath}`)
    );
  });
});
