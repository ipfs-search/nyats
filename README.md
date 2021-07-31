# nyats
Not Yet Another Thumbnail Service

IPFS caching thumbnailer. Generates thumbnails for IPFS CID's, adds them to IPFS node (if not pre-existing) and redirects to IPFS URL, while regularly publishing to IPNS.

Very much a work in progress.

## Usage
1. Install dependencies: `npm install`
2. Start local IPFS node
3. `$ node index.js`
4. Open `http://localhost:9614/thumbnail/<cid>/<width>/<height>`, and behold.
