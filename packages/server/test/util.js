"strict";
import path from "path";
import fs from "fs";
import http from "http";
import makeDebugger from "debug";
import handler from "serve-handler";

const debug = makeDebugger("nyats:spec:util");
const assetDir = "test/assets";

export function getStream(filename) {
	const filePath = path.resolve(`${assetDir}/${filename}`);
	return fs.createReadStream(filePath);
}

export const server = http.createServer(function (req, res) {
	return handler(req, res, {
		public: assetDir,
	});
});
