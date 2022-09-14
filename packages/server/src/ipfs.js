import { create } from "ipfs-http-client";
import { ipfsAPI } from "./conf.js";

const ipfs = create({
  url: ipfsAPI,
});
export default ipfs;
