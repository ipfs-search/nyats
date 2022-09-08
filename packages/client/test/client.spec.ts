import { use, expect } from "chai";
import { default as chaiString } from "chai-string";
use(chaiString);

import {
	ClientConfig,
	DefaultConfig,
	ResourceType,
	IPNSThumbnailURL,
	GenerateThumbnailURL,
} from "../src/client.js";

const testHash = "QmfQVstTkoG7ipSkCH2J9hjS9AssQmexeXDEjs7urQavcC";
const testWidth = 123;
const testHeight = 345;

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
		const config: ClientConfig = {
			ipnsRoot: "/ipfs/testroot.com",
			gatewayURL: "http://localhost:8080",
			endpoint: "https://endpoint.com/",
		};
		it("returns correct URL", () => {
			const redirectURL = IPNSThumbnailURL(testHash, testWidth, testHeight, config);
			expect(redirectURL).to.equal("http://localhost:8080/ipfs/testroot.com/" + filename);
		});
	});
});
