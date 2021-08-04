# nyats server
API server for Not Yet Another Thumbnail Server

## Usage
1. Install dependencies: `npm install`
2. Start local IPFS node
3. `$ node start`
4. Open `http://localhost:9614/thumbnail/<cid>/<width>/<height>`, and behold.

## Configuration
The API can be configured through the following environment variables:
- `NYATS_SERVER_LISTEN` (default: `localhost:9614`)
- `IPFS_API` (default: `http://localhost:5001`)
- `IPFS_GATEWAY` (default: `https://gateway.ipfs.io`)
- `IPNS_UPDATE_INTERVAL` (in ms, default ``60000`, 60s)
