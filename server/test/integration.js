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

import { chaiImage } from "chai-image";
use(chaiImage);

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

describe("Thumbnail generator", () => {
  describe("Generated image thumbnail", () => {
    let response, addStub;

    beforeEach(async () => {
      const cid = "QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF";
      const width = 50;
      const height = 50;
      const protocol = "ipfs";

      const statStub = sinon.stub();
      statStub.throws("not found", "file does not exist");

      const catStub = sinon.stub().resolves(grapefruitStream());
      addStub = sinon.stub().resolves({
        cid: "thumbnailCid",
        size: 34,
      });
      const cpStub = sinon.stub().resolves();
      const flushStub = sinon.stub().resolves();

      // statStub.withArgs("/${cid}-${width}-${height}.webp").throws(
      //   new Error({
      //     message: "file does not exist",
      //   })
      // );
      // statStub.withArgs("/").returns({
      //   cid: "rootCid",
      // });

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
      const app = request(await makeApp());
      response = await app.get(`/thumbnail/${protocol}/${cid}/${width}/${height}`);
    });

    it("Should satisfy OpenAPI spec", async () => {
      expect(response).to.have.status(301).and.to.matchApiSchema();
    });

    it("Should return an image with correct dimensions", async () => {
      const addCall = addStub.getCall(0);
      const thumbnail = await asyncIteratorToBuffer(addCall.firstArg);
      const original = fs.readFileSync(grapefruitPath);

      expect(thumbnail).to.matchImage(original);
    });
  });
});
