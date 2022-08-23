export default async function startIPNSPublisher(ipfs, updateInterval) {
	// Publish to IPNS every minute, but only if the root was changed
	const root = await ipfs.files.stat("/", { hash: true });
	let rootCidStr = root.cid.toString();

	const timeout = setInterval(async () => {
		// Publish to IPNS - normally we only want to do this every few minutes or so,
		// this is a client-side cache. Don't wait though!
		const newroot = await ipfs.files.stat("/", { hash: true });
		const newrootStr = newroot.cid.toString();
		if (newrootStr !== rootCidStr) {
			debug(`Publishing new root ${newrootStr} to IPNS.`);
			rootCidStr = newrootStr;
			await ipfs.name.publish(newroot.cid);
		}
	}, updateInterval);

	console.log("Started IPNS publisher with interval %sms", updateInterval);

	return timeout;
}
