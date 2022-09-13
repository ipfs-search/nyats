"strict";
import sharp from "sharp";
import { expect } from "chai";
import makeDebugger from "debug";

import makeThumbnailer from "../lib/video_thumbnailer.js";
import { server } from "./util.js";

const debug = makeDebugger("nyats:spec:video_thumbnailer");
const thumbnailer = makeThumbnailer();

const tests = [{ format: "MP4", filename: "file_example_MP4_480_1_5MG.mp4" }];

const testServerPort = 3431;
const testWidth = 123;
const testHeight = 234;

function getURL(filename) {
	return `http://localhost:${testServerPort}/${filename}`;
}

describe("video_thumbnailer", function () {
	before(function () {
		server.listen(testServerPort);
		debug(`Test server listening on localhost:${testServerPort}`);
	});

	after(function () {
		server.close();
		debug("Test server stopped");
	});

	// eslint-disable-next-line mocha/no-setup-in-describe
	tests.forEach(({ format, filename }) => {
		describe(`Generating ${format} thumbnail from ${filename}`, function () {
			let metadata;

			beforeEach(async function () {
				this.timeout(10000);
				const url = getURL(filename);
				const thumbnail = await thumbnailer(url, testWidth, testHeight);
				const buffer = await thumbnail.toBuffer();
				metadata = await sharp(buffer).metadata();
			});

			it("Has WebP format and correct dimensions", async function () {
				expect(metadata.width).to.equal(testWidth);
				expect(metadata.height).to.equal(testHeight);
				expect(metadata.format).to.equal("webp");
			});
		});
	});
});
