import request from "supertest";
import { use, expect } from "chai";
import chaiHtttp from "chai-http";
import { stubInterface } from "ts-sinon";
import type { IPFS } from "ipfs-core-types";

import { nyatsMaxOutputWidth, nyatsMaxOutputHeight } from "../src/conf";
import makeApp from "../src/app";
import makeThumbnailer from "../src/thumbnailer";

use(chaiHtttp);

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

  describe("wrong cid", function () {
    it("Returns a 400", function () {
      const url = `/thumbnail/${protocol}/nocid/${width}/${height}`;
      expectBadRequest(url);
    });
  });

  describe("wrong type", function () {
    it("Returns a 400", function () {
      const url = `/thumbnail/${protocol}/${cid}/${width}/${height}?type=banana`;
      expectBadRequest(url);
    });
  });

  describe("too small a width", function () {
    it("Returns a 400", function () {
      const url = `/thumbnail/${protocol}/${cid}/2/${height}`;
      expectBadRequest(url);
    });
  });

  describe("too small a height", function () {
    it("Returns a 400", function () {
      const url = `/thumbnail/${protocol}/${cid}/${width}/2`;
      expectBadRequest(url);
    });
  });

  describe("too large a width", function () {
    it("Returns a 400", function () {
      const largeWidth = nyatsMaxOutputWidth + 1;
      const url = `/thumbnail/${protocol}/${cid}/${largeWidth}/${height}`;
      expectBadRequest(url);
    });
  });

  describe("too large a height", function () {
    it("Returns a 400", function () {
      const largeHeight = nyatsMaxOutputHeight + 1;
      const url = `/thumbnail/${protocol}/${cid}/${width}/${largeHeight}`;
      expectBadRequest(url);
    });
  });
});
