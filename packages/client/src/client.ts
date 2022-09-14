import urlJoin from "url-join";

export interface ClientConfig {
	endpoint: string;
	gatewayURL: string;
	ipnsRoot: string;
}

export type CID = string;
export type URL = string;

export enum ResourceType {
	Unknown = "",
	Document = "document",
	Audio = "audio",
	Video = "video",
	Image = "image",
}

export const DefaultConfig = {
	endpoint: "https://api.ipfs-search.com/v1/thumbnail/",
	gatewayURL: "https://gw.dwebsearch.com",
	ipnsRoot: "/ipns/12D3KooWPVobDRG9Mdmact3ejSe6UAFP8cevmw35HHR1ZDwCozSo/",
};

export function IPNSThumbnailURL(
	hash: CID,
	width: number,
	height: number,
	config: ClientConfig = DefaultConfig
): URL {
	const filename = `${hash}-${width}-${height}.webp`;
	return urlJoin(config.gatewayURL, config.ipnsRoot, filename);
}

export function GenerateThumbnailURL(
	hash: CID,
	width: number,
	height: number,
	type: ResourceType = ResourceType.Unknown,
	config: ClientConfig = DefaultConfig
): URL {
	let apiPath = `/ipfs/${hash}/${width}/${height}/`;
	if (type != ResourceType.Unknown) apiPath += `?type=${type}`;
	return urlJoin(config.endpoint, apiPath);
}
