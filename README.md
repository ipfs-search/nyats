# nyats
Not Yet Another Thumbnail Service

IPFS caching thumbnailer. Generates thumbnails for IPFS CID's, adds them to IPFS node (if not pre-existing) and redirects to IPFS URL, while regularly publishing to IPNS. Soon, we will be able to use IPNS as a cache, so clients will not even need to hit the server.

Very much a work in progress.

## Server

### Dependencies

You need a local ipfs node; see: https://docs.ipfs.io/how-to/command-line-quick-start/

### Usage
1. Install dependencies: `npm install`
2. Start local IPFS node: `ipfs daemon`
3. `npm start`
    Or, to use the local gateway: `IPFS_GATEWAY=http://127.0.0.1:8080 npm start`
4. Open `http://localhost:9614/thumbnail/<protocol>/<cid>/<width>/<height>`, and behold.
   Example: http://localhost:9614/thumbnail/ipfs/QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF/200/200

### Configuration
The API can be configured through the following environment variables:
- `NYATS_SERVER_PORT` (default: `9614`)
- `IPFS_API` (default: `http://localhost:5001`)
- `IPFS_GATEWAY` (default: `https://gateway.ipfs.io`)
- `IPNS_UPDATE_INTERVAL` (in ms, default ``60000`, 60s)
