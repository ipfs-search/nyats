import { create } from "ipfs-http-client";
import { ipfsAPI } from "./conf.js";

const ipfs = create(ipfsAPI);
export default ipfs;
