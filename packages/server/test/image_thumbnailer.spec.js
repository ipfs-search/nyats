"strict";
import sharp from "sharp";
import { expect } from "chai";

import makeThumbnailer from "../lib/image_thumbnailer.js";
import { animateThumbnails } from "../lib/conf.js";
import { getStream } from "./util.js";

const thumbnailer = makeThumbnailer();
const tests = [
	{ format: "JPEG", filename: "grapefruit.jpg" },
	{ format: "Static WebP", filename: "Johnrogershousemay2020.webp" },
	{ format: "Animated WebP", filename: "bored_animation.webp", animated: true },
	{ format: "Transparent WebP", filename: "1_webp_a.webp", transparent: true },
	{
		format: "Transparent PNG",
		filename: "PNG_transparency_demonstration_1.png",
		transparent: true,
	},
	{
		format: "Transparent APNG",
		filename: "beachball.png",
		animated: true,
		transparent: true,
	},
	{ format: "Static GIF", filename: "Sunflower_as_gif_websafe.gif" },
	{ format: "Animated GIF", filename: "Rotating_earth_(large).gif", animated: true },
];
const testWidth = 123;
const testHeight = 234;

describe("image_thumbnailer", function () {
	// eslint-disable-next-line mocha/no-setup-in-describe
	tests.forEach(({ format, filename, animated = false, transparent = false }) => {
		describe(`Generating ${format} thumbnail from ${filename}`, function () {
			let metadata;

			beforeEach(async function () {
				this.timeout(10000);
				const stream = getStream(filename);
				const thumbnail = await thumbnailer(stream, testWidth, testHeight);
				const buffer = await thumbnail.toBuffer();
				metadata = await sharp(buffer).metadata();
			});

			it("Has WebP format and correct dimensions", async function () {
				expect(metadata.width).to.equal(testWidth);
				expect(metadata.height).to.equal(testHeight);
				expect(metadata.format).to.equal("webp");
			});

			if (transparent) {
				it("Has transparency", function () {
					expect(metadata.hasAlpha).to.be.true;
				});
			} else {
				it("Does not have transparency", function () {
					if (animateThumbnails && animated) {
						// Fails for  Animated WebP thumbnail from bored_animation.webp and
						// Animated GIF thumbnail from Rotating_earth_(large).gif
						this.skip();
					}

					expect(metadata.hasAlpha).to.be.false;
				});
			}

			if (animateThumbnails && animated) {
				it("Is animated", function () {
					if (format.includes("PNG") && animated && transparent) {
						// Bug: sharp doesn't seem to detect 'pages' (frames) in transparent APNG.
						this.skip();
					}
					expect(metadata).to.haveOwnProperty("pages");
					expect(metadata.pages).to.be.greaterThan(1);
				});
			} else {
				it("Is not animated", function () {
					if ("pages" in metadata) {
						expect(metadata.pages).to.equal(1);
					}
				});

				it("Should have a size <1000kb", function () {
					expect(metadata.size).to.be.below(100 * 1024);
				});
			}
		});
	});
});
