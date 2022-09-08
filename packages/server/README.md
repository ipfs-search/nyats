# `nyats-server`

nyats (Not Yet Another Thumbnail Service) client-side caching IPFS thumbnailing server. Generates thumbnails for IPFS CID's, writes thumbnails to IPFS, adds them to MFS, publishes IPNS hash and returns redirect to thumbnail in MFS, allowing for efficient client-side caching.

## Dependencies

You need a local ipfs node; see: https://docs.ipfs.io/how-to/command-line-quick-start/

## Usage

1. Install dependencies: `npm install`
2. Start local IPFS node: `ipfs daemon`
3. `npm start`
   Or, to use the local gateway: `IPFS_GATEWAY=http://127.0.0.1:8080 npm start`
4. Open `http://localhost:9614/thumbnail/<protocol>/<cid>/<width>/<height>`, and behold.
   Example: http://localhost:9614/thumbnail/ipfs/QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF/200/200

## Configuration

The API can be configured through the following environment variables:

- `NYATS_SERVER_HOST` (default: `localhost`)
- `NYATS_SERVER_PORT` (default: `9614`)
- `IPFS_API` (default: `http://localhost:5001`)
- `IPFS_GATEWAY` (default: `https://gateway.ipfs.io`)
- `IPNS_UPDATE_INTERVAL` (in ms, default `60000`, 60s)
