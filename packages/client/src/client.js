import urlJoin from "url-join";

export const defaultConfig = {
	endpoint: "https://api.ipfs-search.com/v1/thumbnail/",
	gatewayURL: "https://gw.dwebsearch.com",
	ipnsRoot: "/ipns/12D3KooWPVobDRG9Mdmact3ejSe6UAFP8cevmw35HHR1ZDwCozSo/",
};

export function IPNSThumbnailURL(hash, width, height, config = defaultConfig) {
	const filename = `${hash}-${width}-${height}.webp`;
	return urlJoin(config.gatewayURL, config.ipnsRoot, filename);
}

export function GenerateThumbnailURL(hash, width, height, type, config = defaultConfig) {
	const apiPath = `/ipfs/${hash}/${width}/${height}/?type=${type}`;
	return urlJoin(config.endpoint, apiPath);
}
