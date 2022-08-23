"strict";
import { use, expect } from "chai";
import sinon from "sinon";
import request from "supertest";
import path from "path";
import fs from "fs";
import esmock from "esmock";

// Use Sinon with Chai
import sinonChai from "sinon-chai";
use(sinonChai);

// OpenAPI matcher
import { chaiPlugin as matchApiSchema } from "api-contract-validator";
const apiDefinitionsPath = path.resolve("openapi.yml");
use(matchApiSchema({ apiDefinitionsPath }));

async function grapefruitAsyncIterator() {
  const filepath = path.resolve("server/test/grapefruit.jpg");
  const readStream = fs.createReadStream(filepath, {
    highWaterMark: 1024,
  });

  return readStream;
}

describe("Thumbnail generator", () => {
  describe("Newly generated thumbnail", () => {
    let response;

    const cid = "QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF";
    const width = 200;
    const height = 200;
    const protocol = "ipfs";

    const statStub = sinon.stub();
    statStub.throws("not found", "file does not exist");

    const catStub = sinon.stub().resolves(grapefruitAsyncIterator());
    const addStub = sinon.stub().resolves({
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

    beforeEach(async function () {
      const makeApp = await esmock("../app.js", {
        "ipfs-http-client": {
          create: () => ipfsMock,
        },
      });
      const app = request(await makeApp());
      response = await app.get(`/thumbnail/${protocol}/${cid}/${width}/${height}`);
    });

    it("Should satisfy OpenAPI spec", async function () {
      expect(response).to.have.status(301).and.to.matchApiSchema();
    });
  });
});
