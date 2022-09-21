import { create } from "ipfs-http-client";
import type { IPFS } from "ipfs-core-types";

import { ipfsAPI } from "./conf.js";

const ipfs: IPFS = create({
  url: ipfsAPI,
});
export default ipfs;
