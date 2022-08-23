"strict";
import { use, expect } from "chai";
import sinon from "sinon";
import request from "supertest";
import path from "path";
import fs from "fs";
import buffer from "buffer";
import esmock from "esmock";

// Chai plugins
import sinonChai from "sinon-chai";
use(sinonChai);

import sharp from "sharp";

// OpenAPI matcher
import { chaiPlugin as matchApiSchema } from "api-contract-validator";
const apiDefinitionsPath = path.resolve("openapi.yml");
use(matchApiSchema({ apiDefinitionsPath }));

const grapefruitPath = path.resolve("server/test/grapefruit.jpg");
async function grapefruitStream() {
  const readStream = fs.createReadStream(grapefruitPath, {
    highWaterMark: 1024,
  });

  return readStream;
}

// Ref: https://github.com/chafey/dicom2ion-js/blob/main/src/asyncIterableToBuffer.js
const asyncIteratorToBuffer = async (readable) => {
  const chunks = [];
  for await (let chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

describe("Integration test", () => {
  const rootCid = "rootCid";
  const newRootCid = "newRootCid";
  const cid = "QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF";
  const width = 100;
  const height = 100;
  const protocol = "ipfs";
  const thumbPath = `/${cid}-${width}-${height}.webp`;
  const getURL = `/thumbnail/${protocol}/${cid}/${width}/${height}`;

  let response, addStub, statStub, app;

  beforeEach(async () => {
    statStub = sinon.stub();
    statStub.withArgs("/").returns({
      cid: rootCid,
    });

    const catStub = sinon.stub().resolves(grapefruitStream());
    addStub = sinon.stub().resolves({
      cid: "thumbnailCid",
      size: 34,
    });
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

    const makeApp = await esmock("../app.js", {
      "ipfs-http-client": {
        create: () => ipfsMock,
      },
    });
    app = request(await makeApp());
  });

  describe("Generated image thumbnail", () => {
    beforeEach(async () => {
      statStub.withArgs(thumbPath).throws("not found", "file does not exist");
    });

    it("Satisfies OpenAPI spec", async () => {
      response = await app.get(getURL);

      expect(response).to.have.status(301).and.to.matchApiSchema();
    });

    it("Has WebP format and correct dimensions", async () => {
      response = await app.get(getURL);

      const addCall = addStub.getCall(0);

      const thumbnail = await addCall.firstArg.toBuffer();
      const thumbnailMeta = await sharp(thumbnail).metadata();
      expect(thumbnailMeta.width).to.equal(width);
      expect(thumbnailMeta.height).to.equal(height);
      expect(thumbnailMeta.format).to.equal("webp");
    });

    it("Returns correct thumbnail URL", async () => {
      response = await app.get(getURL);

      expect(response.header["location"]).to.equal(
        `https://gateway.ipfs.io/ipfs/${newRootCid}${thumbPath}`
      );
    });
  });

  describe("Existing image thumbnail", () => {
    beforeEach(async () => {
      statStub.withArgs(thumbPath).resolves();
    });

    it("Satisfies OpenAPI spec", async () => {
      response = await app.get(getURL);

      expect(response).to.have.status(301).and.to.matchApiSchema();
    });

    it("Returns correct thumbnail URL", async () => {
      response = await app.get(getURL);

      expect(response.header["location"]).to.equal(
        `https://gateway.ipfs.io/ipfs/${rootCid}${thumbPath}`
      );
    });
  });
});
