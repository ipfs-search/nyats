# `nyats-client`

Client for the nyats (Not Yet Another Thumbnail Service) IPFS thumbnailing server.

## Installation

`npm i -S nyats-client`

## Usage

The library consists of 2 functions:

### `IPNSThumbnailURL(cid, width, height)`

Returns URL to load pre-existing thumbnails from cache. This URL will return a 404 if it does not, in which case a thumbnail will need to be generated.

### `GenerateThumbnailURL(cid, width, height, type?)`

Returns a URL used to generate a thumbnail. If succesful, a redirect to an IPFS gateway is returned. The `type` parameter is optional and can be used to skip mimetype detection on the server. Allowed values are: `image`, `video`, `document` and `audio`.

### Example

Please see [demo/index.html](demo/index.html) for a minimal example implementation in pure HTML5/JS.

## Configuration

In the default configuration, this library uses ipfs-search.com testing environment. There are no guarantees that we will continue this service and without prior permission, commercial usage is not allowed.
You are free to run your own server, in which case the configuration can be set in two different ways:

### `GetClient()`

```js
import {GetClient} from "nyats-client";

const client = GetClient({
  endpoint: "<API ENDPOINT>",
  gatewayURL: "<IPFS GATEWAY>",
  ipnsRoot: "/ipns/<PEER ID>/",
});

client.IPNSThumbnailURL(...);
```

### Override default configuration

```js
import {DefaultConfig, IPNSThumbnailURL, GenerateThumbnailURL} from "nyats-client";

DefaultConfig.endpoint = "<API ENDPOINT>";
DefaultConfig.gatewayURL = "<IPFS GATEWAY>";
DefaultConfig.ipnsRoot = "/ipns/<PEER ID>/";
client.IPNSThumbnailURL(...);
```

## Disclaimer

There are no guarantees provided and commercial usage is not allowed. Please contact us at [info@ipfs-search.com](mailto:info@ipfs-search.com) if you are interested in production-scale usage.
