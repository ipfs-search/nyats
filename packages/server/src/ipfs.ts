import { create } from "ipfs-http-client";
import type { IPFS } from "ipfs-core-types";
import urlJoin from "url-join";

import { ipfsAPI, ipfsGateway } from "./conf.js";

export function GetGatewayURL(ipfsPath: string): string {
  return urlJoin(ipfsGateway, ipfsPath);
}

const ipfs: IPFS = create({
  url: ipfsAPI,
});
export default ipfs;
