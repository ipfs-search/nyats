import os from "os";

export const nyatsProcesses = parseInt(process.env.NYATS_PROCESSES) || os.cpus().length;
export const nyatsHost = process.env.NYATS_SERVER_HOST || "localhost";
export const nyatsPort = parseInt(process.env.NYATS_SERVER_PORT || "9614");
export const nyatsMaxOutputWidth = parseInt(process.env.NYATS_MAX_WIDTH || "2048");
export const nyatsMaxOutputHeight = parseInt(process.env.NYATS_MAX_HEIGHT || "2048");
export const nyatsMaxInputWidth = parseInt(process.env.NYATS_MAX_WIDTH || "8192");
export const nyatsMaxInputHeight = parseInt(process.env.NYATS_MAX_HEIGHT || "8192");
export const updateInterval = parseInt(process.env.IPNS_UPDATE_INTERVAL || "60000");
export const ipfsAPI = process.env.IPFS_API || "http://localhost:5001";
export const ipfsTimeout = parseInt(process.env.IPFS_TIMEOUT || "120000");
export const publicIPFSGateway = process.env.PUBLIC_IPFS_GATEWAY || "https://dweb.link";
export const privateIPFSGateway = process.env.PRIVATE_IPFS_GATEWAY || "http://127.0.0.1:8080";
export const animateThumbnails = false;
