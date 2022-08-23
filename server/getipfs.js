import { create as makeIPFSClient } from "ipfs-http-client";

export default async function getIPFS(ipfsAPI) {
	const ipfs = makeIPFSClient(ipfsAPI);

	try {
		const version = await ipfs.version();
		console.log("IPFS daemon version:", version.version);
	} catch (e) {
		console.log("Unable to get IPFS daemon version. Is the IPFS daemon running?");
		throw e;
	}

	return ipfs;
}
