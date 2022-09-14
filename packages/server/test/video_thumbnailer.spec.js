"strict";
import sharp from "sharp";
import { expect } from "chai";
import makeDebugger from "debug";

import makeThumbnailer from "../lib/video_thumbnailer.js";
import { server } from "./util.js";

const debug = makeDebugger("nyats:spec:video_thumbnailer");
const thumbnailer = makeThumbnailer();

const tests = [
  { format: "MP4", filename: "file_example_MP4_480_1_5MG.mp4" },
  { format: "MOV", filename: "file_example_MOV_480_700kB.mov" },
  { format: "AVI", filename: "file_example_AVI_480_750kB.avi" },
  { format: "MKV", filename: "sample_960x540.mkv" },
  { format: "WMV", filename: "file_example_WMV_480_1_2MB.wmv" },
  { format: "WebM", filename: "file_example_WEBM_480_900KB.webm" },
  { format: "OGG", filename: "file_example_OGG_480_1_7mg.ogg" },
  { format: "HEVC", filename: "sample_640x360.hevc" },
  { format: "FLV", filename: "sample_640x360.flv" },
  { format: "MPEG", filename: "sample_640x360.mpeg" },
  { format: "MJPEG", filename: "sample_640x360.mjpeg" },
  { format: "MTS", filename: "sample_640x360.mts" },
];

const testServerPort = 6739;
const testWidth = 124;
const testHeight = 236;

function getURL(filename) {
  return `http://localhost:${testServerPort}/${filename}`;
}

describe("video_thumbnailer", function () {
  this.timeout(10000);

  before(function (done) {
    server.listen(testServerPort, "localhost", () => {
      debug("Test server started");
      done();
    });
  });

  after(function (done) {
    server.close(() => {
      debug("Test server stopped");
      done();
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  tests.forEach(({ format, filename }) => {
    describe(`Generating ${format} thumbnail from ${filename}`, function () {
      let metadata;

      beforeEach(async function () {
        this.timeout(20000);
        const url = getURL(filename);
        const thumbnail = await thumbnailer(url, testWidth, testHeight);
        const image = sharp();

        thumbnail.pipe(image);
        metadata = await image.metadata();
      });

      it("Is in WebP format", function () {
        expect(metadata.format).to.equal("webp");
      });

      it("Has correct dimensions", function () {
        expect(metadata.width).to.equal(testWidth);
        expect(metadata.height).to.equal(testHeight);
      });

      it("Does not have transparency", function () {
        expect(metadata.hasAlpha).to.be.false;
      });

      it("Is not animated", function () {
        if ("pages" in metadata) {
          expect(metadata.pages).to.equal(1);
        }
      });
    });
  });
});
