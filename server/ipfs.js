import { create } from "ipfs-http-client";
import { ipfsAPI } from "./conf.js";

export const ipfs = create(ipfsAPI);
