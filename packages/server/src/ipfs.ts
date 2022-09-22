import { create } from "ipfs-http-client";
import type { IPFS } from "ipfs-core-types";
import urlJoin from "url-join";

import { ipfsAPI, publicIPFSGateway, privateIPFSGateway } from "./conf.js";

enum gwType {
  public = "public",
  private = "private",
}

function getGw(type: gwType) {
  switch (type) {
    case gwType.public:
      return publicIPFSGateway;
    case gwType.private:
      return privateIPFSGateway;
  }
}

export function GetGatewayURL(ipfsPath: string, type: keyof typeof gwType): string {
  const gw = getGw(type as gwType);
  return urlJoin(gw, ipfsPath);
}

const ipfs: IPFS = create({
  url: ipfsAPI,
});
export default ipfs;
