import { use, expect } from "chai";
import { default as chaiString } from "chai-string";
use(chaiString);

import {
	ClientConfig,
	DefaultConfig,
	ResourceType,
	IPNSThumbnailURL,
	GenerateThumbnailURL,
} from "../src/client";

const testHash = "QmfQVstTkoG7ipSkCH2J9hjS9AssQmexeXDEjs7urQavcC";
const testWidth = 123;
const testHeight = 345;

const testConfig: ClientConfig = {
	ipnsRoot: "/ipfs/testroot.com",
	gatewayURL: "http://localhost:8080",
	endpoint: "https://endpoint.com/path",
};

describe("IPNSThumbnailURL", () => {
	const filename = `${testHash}-${testWidth}-${testHeight}.webp`;

	describe("with default configuration", () => {
		it("returns correct URL", () => {
			const redirectURL = IPNSThumbnailURL(testHash, testWidth, testHeight);
			expect(redirectURL).to.startWith(DefaultConfig.gatewayURL);

			const url = new URL(redirectURL);
			expect(url.pathname).to.equal(DefaultConfig.ipnsRoot + filename);
		});
	});

	describe("with custom configuration", () => {
		it("returns correct URL", () => {
			const redirectURL = IPNSThumbnailURL(testHash, testWidth, testHeight, testConfig);
			expect(redirectURL).to.equal("http://localhost:8080/ipfs/testroot.com/" + filename);
		});
	});
});

describe("GenerateThumbnailURL", () => {
	const protocol = "ipfs";
	const path = `${protocol}/${testHash}/${testWidth}/${testHeight}/`;

	describe("with default configuration", () => {
		describe("without type specified", () => {
			const redirectURL = GenerateThumbnailURL(testHash, testWidth, testHeight);

			it("returns correct URL", () => {
				expect(redirectURL).to.equal(DefaultConfig.endpoint + path);
			});
		});
		describe("with type specified", () => {
			const redirectURL = GenerateThumbnailURL(testHash, testWidth, testHeight, ResourceType.Image);

			it("includes type in URL", () => {
				expect(redirectURL).to.startWith(DefaultConfig.endpoint);

				const url = new URL(redirectURL);
				expect(url.searchParams.get("type")).to.equal("image");
			});
		});
	});

	describe("with custom configuration", () => {
		const redirectURL = GenerateThumbnailURL(
			testHash,
			testWidth,
			testHeight,
			ResourceType.Unknown,
			testConfig
		);

		it("returns correct URL", () => {
			expect(redirectURL).to.equal("https://endpoint.com/path/" + path);
		});
	});
});
