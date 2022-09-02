import getIPFS from "./getipfs.js";
import makeApp from "./app.js";
import startIPNSPublisher from "./ipns_publisher.js";
import makeThumbnailer from "./thumbnailer.js";

// Settings
const nyatsHost = process.env.NYATS_SERVER_HOST || "localhost";
const nyatsPort = process.env.NYATS_SERVER_PORT || "9614";
const updateInterval = process.env.IPNS_UPDATE_INTERVAL || 60 * 1000;
const ipfsAPI = process.env.IPFS_API || "http://localhost:5001";
const ipfsGateway = process.env.IPFS_GATEWAY || "https://gateway.ipfs.io";
const ipfsTimeout = process.env.IPFS_TIMEOUT || 120 * 1000;

process.on("uncaughtException", (err) => {
	// This is to prevent the server from crashing on timeout.
	// Somehow IPFS errors seem to both result in a rejected promise as well as thrown.
	// Results from here: https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs-core-utils/src/with-timeout-option.js
	if (err.name === "TimeoutError") return;
});

try {
	const ipfs = await getIPFS(ipfsAPI);
	console.log(`IPFS gateway: ${ipfsGateway}`);
	const thumbnailer = makeThumbnailer(ipfs, { ipfsGateway, ipfsTimeout });
	const app = await makeApp(thumbnailer);

	app.listen(nyatsPort, nyatsHost, () => {
		console.log(`nyats server listening on http://localhost:${nyatsPort}`);
		startIPNSPublisher(ipfs, updateInterval);
	});
} catch (err) {
	console.error("Error starting server:", err);
}
