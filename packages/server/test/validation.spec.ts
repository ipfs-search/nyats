import request from "supertest";
import { expect } from "chai";
import { stubInterface } from "ts-sinon";
import type { IPFS } from "ipfs-core-types";

import makeApp from "../src/app";
import makeThumbnailer from "../src/thumbnailer";

const cid = "QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF";
const width = 100;
const height = 100;
const protocol = "ipfs";
const type = "image;";

describe("app validation tests", function () {
  let app;
  beforeEach(function () {
    const ipfsMock = stubInterface<IPFS>();
    const thumbnailer = makeThumbnailer(ipfsMock);
    app = request(makeApp(thumbnailer));
  });

  async function expectBadRequest(url) {
    const response = await app.get(url);
    expect(response).to.have.status(400);
  }

  describe("wrong protocol", function () {
    it("Returns a 400", function () {
      const url = `/thumbnail/wrong/${cid}/${width}/${height}`;
      expectBadRequest(url);
    });
  });
});
