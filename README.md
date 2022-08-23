# nyats

[![pipeline status](https://gitlab.com/ipfs-search.com/nyats/badges/main/pipeline.svg)](https://gitlab.com/ipfs-search.com/nyats/-/commits/main)
[![Maintainability](https://api.codeclimate.com/v1/badges/832428092fde7a9f1dae/maintainability)](https://codeclimate.com/github/ipfs-search/nyats/maintainability)
[![Backers on Open Collective](https://opencollective.com/ipfs-search/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/ipfs-search/sponsors/badge.svg)](#sponsors)

Not Yet Another Thumbnail Service, thumbnailer for [ipfs-search.com](https://ipfs-search.com)

IPFS caching thumbnailer. Generates thumbnails for IPFS CID's, adds them to IPFS node (if not pre-existing) and redirects to IPFS URL, while regularly publishing to IPNS. Soon, we will be able to use IPNS as a cache, so clients will not even need to hit the server.

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
- `IPNS_UPDATE_INTERVAL` (in ms, default `60000`, 60s)

## Contributors

This project exists thanks to all the people who contribute.
<a href="https://github.com/ipfs-search/nyats/graphs/contributors"><img src="https://opencollective.com/ipfs-search/contributors.svg?width=890&button=false" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/ipfs-search#backer)]

<a href="https://opencollective.com/ipfs-search#backers" target="_blank"><img src="https://opencollective.com/ipfs-search/backers.svg?width=890"></a>

## Sponsors

<a href="https://nlnet.nl/project/IPFS-search/"><img width="200pt" src="https://nlnet.nl/logo/banner.png"></a> <a href="https://nlnet.nl/project/IPFS-search/"><img width="200pt" src="https://nlnet.nl/image/logos/NGI0_tag.png"></a>
<br>
ipfs-search is supported by NLNet through the EU's Next Generation Internet (NGI0) programme.

<a href="https://redpencil.io/projects/"><img width="270pt" src="https://raw.githubusercontent.com/redpencilio/frontend-redpencil.io/327318b84ffb396d8af6776f19b9f36212596082/public/assets/vector/rpio-logo.svg"> </a><br>
RedPencil is supporting the hosting of ipfs-search.com.

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/ipfs-search#sponsor)]

<a href="https://opencollective.com/ipfs-search/sponsor/0/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/ipfs-search/sponsor/1/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/ipfs-search/sponsor/2/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/ipfs-search/sponsor/3/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/ipfs-search/sponsor/4/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/ipfs-search/sponsor/5/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/ipfs-search/sponsor/6/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/ipfs-search/sponsor/7/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/ipfs-search/sponsor/8/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/ipfs-search/sponsor/9/website" target="_blank"><img src="https://opencollective.com/ipfs-search/sponsor/9/avatar.svg"></a>
