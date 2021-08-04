module.exports = {
  create: async (options) => {
    let {
      nyats_server, ipfs_gateway, root_cid;
    } = options;

    nyats_server = nyats_server || 'http://localhost:9614';
    ipfs_gateway = ipfs_gateway || 'https://gateway.ipfs.io';

    async function get_rootcid() {
      const resp = await fetch(nyats_server + 'rootcid/');
      return resp.root_cid
    }

    root_cid = root_cid || await get_root();

    return {
      get_nyats_url(cid, width, height) {
        return nyats_server + `/thumbnail/ipfs/${cid}/${width}/${height}`;
      },
      get_gateway_url(cid, width, height) {
        return ipfs_gateway + ``
      },
      get_thumbnail_urls: (cid, width, height) => {
        return [
          get_gateway_url(cid, width, height),
          get_nyats_url(cid, width, heights)
        ];
      }
    }
  }
};
