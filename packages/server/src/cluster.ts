import { exit } from "node:process";
import cluster from "cluster";
import debuggerFactory from "debug";

import makeApp from "./app.js";
import ipfs from "./ipfs.js";
import startIPNSPublisher from "./ipns_publisher.js";
import makeThumbnailer from "./thumbnailer.js";

import { nyatsHost, nyatsPort, nyatsProcesses, updateInterval, ipfsGateway } from "./conf.js";

const debug = debuggerFactory("nyats:cluster");

process.on("uncaughtException", (err) => {
  // This is to prevent the server from crashing on timeout.
  // Somehow IPFS errors seem to both result in a rejected promise as well as thrown.
  // Results from here: https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs-core-utils/src/with-timeout-option.js
  if (err.name === "TimeoutError") return;
});

async function checkIPFS() {
  try {
    const version = await ipfs.version();
    console.log("IPFS daemon version:", version.version);
  } catch (e) {
    console.log("Unable to get IPFS daemon version. Is the IPFS daemon running?");
    throw e;
  }
}

function forkWorkers() {
  // Start workers and listen for messages containing notifyRequest
  debug(`Starting ${nyatsProcesses} worker processes.`);

  let workerCount = 0;
  cluster.on("listening", (worker, address) => {
    workerCount++;

    debug("Started worker %d: %s", workerCount, worker);

    if (workerCount == nyatsProcesses) {
      console.log(
        `${workerCount} workers started and listening on http://${address.address}:${address.port}`
      );
    }
  });

  cluster.on("exit", function (worker) {
    console.log(`worker ${worker.process.pid} died.\nshutting down server.`);
    exit(1);
  });

  for (let i = 0; i < nyatsProcesses; i++) {
    debug(i);
    cluster.fork();
  }
}

function startWorker() {
  const thumbnailer = makeThumbnailer(ipfs);
  const app = makeApp(thumbnailer);

  app.listen(nyatsPort, nyatsHost);
}

if (cluster.isMaster) {
  await checkIPFS();
  console.log(`IPFS gateway: ${ipfsGateway}`);

  forkWorkers();
  startIPNSPublisher(ipfs, updateInterval);
} else {
  startWorker();
}
