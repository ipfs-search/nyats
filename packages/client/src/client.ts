import urlJoin from "url-join";

export interface ClientConfig {
  endpoint: string;
  gatewayURL: string;
  ipnsRoot: string;
}

export type CID = string;
export type URL = string;

export enum ResourceType {
  document,
  audio,
  video,
  image,
}

export function GetClient(config: ClientConfig = DefaultConfig) {
  return {
    IPNSThumbnailURL: function (hash: CID, width: number, height: number): URL {
      const filename = `${hash}-${width}-${height}.webp`;
      return urlJoin(config.gatewayURL, config.ipnsRoot, filename);
    },

    GenerateThumbnailURL: function (
      hash: CID,
      width: number,
      height: number,
      type?: keyof typeof ResourceType
    ): URL {
      let apiPath = `/ipfs/${hash}/${width}/${height}/`;
      if (type && type in ResourceType) {
        apiPath += `?type=${type}`;
      }
      return urlJoin(config.endpoint, apiPath);
    },
  };
}

// Export default client with default config
export const DefaultConfig = {
  endpoint: "https://api.ipfs-search.com/v1/thumbnail/",
  gatewayURL: "https://gw.dwebsearch.com",
  ipnsRoot: "/ipns/12D3KooWPVobDRG9Mdmact3ejSe6UAFP8cevmw35HHR1ZDwCozSo/",
};

const DefaultClient = GetClient(DefaultConfig);
export const IPNSThumbnailURL = DefaultClient.IPNSThumbnailURL;
export const GenerateThumbnailURL = DefaultClient.GenerateThumbnailURL;
export default DefaultClient;
