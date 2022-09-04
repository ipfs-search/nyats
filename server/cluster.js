import { exit } from "node:process";

import cluster from "cluster";

import { create as makeIPFSClient } from "ipfs-http-client";
import makeApp from "./app.js";
import startIPNSPublisher from "./ipns_publisher.js";
import makeThumbnailer from "./thumbnailer.js";

import {
	nyatsHost,
	nyatsPort,
	nyatsProcesses,
	updateInterval,
	ipfsGateway,
	ipfsAPI,
} from "./conf.js";

const ipfs = makeIPFSClient(ipfsAPI);

process.on("uncaughtException", (err) => {
	// This is to prevent the server from crashing on timeout.
	// Somehow IPFS errors seem to both result in a rejected promise as well as thrown.
	// Results from here: https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs-core-utils/src/with-timeout-option.js
	if (err.name === "TimeoutError") return;
});

if (cluster.isMaster) {
	try {
		const version = await ipfs.version();
		console.log("IPFS daemon version:", version.version);
	} catch (e) {
		console.log("Unable to get IPFS daemon version. Is the IPFS daemon running?");
		throw e;
	}

	console.log(`IPFS gateway: ${ipfsGateway}`);

	cluster.on("listening", (worker, address) => {
		console.log(
			`nyats worker ${worker.process.pid} listening on http://${address.address}:${address.port}`
		);
	});

	cluster.on("exit", function (worker) {
		console.log(`worker ${worker.process.pid} died.\nshutting down server.`);
		exit(1);
	});

	// Start workers and listen for messages containing notifyRequest
	for (var i = 0; i < nyatsProcesses; i++) {
		cluster.fork();
	}
	startIPNSPublisher(ipfs, updateInterval);
} else {
	const thumbnailer = makeThumbnailer(ipfs);
	const app = makeApp(thumbnailer);

	app.listen(nyatsPort, nyatsHost);
}
