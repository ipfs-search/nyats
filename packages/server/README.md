# `nyats-server`

nyats (Not Yet Another Thumbnail Service) client-side caching IPFS thumbnailing server. Generates thumbnails for IPFS CID's, writes thumbnails to IPFS, adds them to MFS, publishes IPNS hash and returns redirect to thumbnail in MFS, allowing for efficient client-side caching.

## Client library

For usage in JS/TS, there's [nyats-client](https://www.npmjs.com/package/nyats-client), the official client library.

## Dependencies

You need a local ipfs node; see: https://docs.ipfs.io/how-to/command-line-quick-start/

## Usage

1. Install dependencies: `npm install`
2. Start local IPFS node: `ipfs daemon`
3. `npm start`
   Or, to use the local gateway: `IPFS_GATEWAY=http://127.0.0.1:8080 npm start`
4. Open `http://localhost:9614/thumbnail/<protocol>/<cid>/<width>/<height>`, and behold.
   Example: http://localhost:9614/thumbnail/ipfs/QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF/200/200

## Development

For development, we recommend using `npm run start:watch`, which will watch the code and automatically rebuild and restart the server (using nodemon and ts-node).

Example with debugging, a single process and local IPFS gateway:

```sh
$ DEBUG=nyats* NYATS_PROCESSES=1 IPFS_GATEWAY=http://127.0.0.1:8080 npm run start:watch
```

## Configuration

The main configuration options are the following, the rest can be found in [`src/config.ts`](src/config.ts):

- `NYATS_SERVER_HOST` (default: `localhost`)
- `NYATS_SERVER_PORT` (default: `9614`)
- `IPFS_API` (default: `http://localhost:5001`)
- `IPFS_GATEWAY` (default: `https://gateway.ipfs.io`)
