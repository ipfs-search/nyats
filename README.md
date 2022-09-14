# nyats

[![pipeline status](https://gitlab.com/ipfs-search.com/nyats/badges/main/pipeline.svg)](https://gitlab.com/ipfs-search.com/nyats/-/commits/main)
[![Maintainability](https://api.codeclimate.com/v1/badges/832428092fde7a9f1dae/maintainability)](https://codeclimate.com/github/ipfs-search/nyats/maintainability)
[![Backers on Open Collective](https://opencollective.com/ipfs-search/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/ipfs-search/sponsors/badge.svg)](#sponsors)

Not Yet Another Thumbnail Service, thumbnailer for [ipfs-search.com](https://ipfs-search.com)

IPFS caching thumbnailer. Generates thumbnails for IPFS CID's, adds them to IPFS node (if not pre-existing) and redirects to IPFS URL, while regularly publishing to IPNS. Soon, we will be able to use IPNS as a cache, so clients will not even need to hit the server.

## Packages

- [nyats-server](packages/server#readme): API server rendering thumbnails for IPFS content.
- [nyats-client](packages/client#readme): Client for API server, generating appropriate URL's for generating and requesting thumbnails.
- [nyats-vuetify-img](packages/vuetify-img#readme): Vuetify3 thumbnailing component, based on v-img, rendering thumbnails for IPFS CID's using IPNS for caching and nyats API as fallback.

## Getting started

To use any of the aforementioned packages, please refer to their respective README's.

As for developing, we're using [lerna](https://lerna.js.org/) to organize nyats-related packages together and to manage their dependencies. Common development dependencies reside in the root repository.

To start developing, you can install all the project's dependencies as follows:

```sh
npm i && npm run bootstrap
```

## Commands

To facilitate development, the following commands will be run through the root package on all subpackages (which have that command available):

- `npm run bootstrap`: Install packages and their dependencies, such that they can use one another.
- `npm run build`: Build packages.
- `npm run test`: Test packages.
- `npm run lint`: Lint packages.
- `npm run clean`: ... ok, you get the gist, no?
- `npm run publish`: Also, yeah... publish All the Packages!

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
