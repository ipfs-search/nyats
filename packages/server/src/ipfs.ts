import { create } from "ipfs-http-client";
import { ipfsAPI } from "./conf.js";
import type { IPFS } from "ipfs-core-types";

const ipfs: IPFS = create({
  url: ipfsAPI,
});
export default ipfs;
