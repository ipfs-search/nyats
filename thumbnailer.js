const assert = require('assert').strict;
const sharp = require('sharp');
const stream = require('stream');

module.exports = function(ipfs) {
  async function _getThumbnail(source) {
    // Note: source should be of type AsyncIterable<Uint8Array> but is '[object AsyncGenerator]' of type object
    // which sharp refuses.
    let shittyFile = new Uint8Array()
    for await (const chunk of source) {
      shittyFile += chunk
      console.log(chunk)
    }

    return sharp(shittyFile).resize(300)
      .on('info', function(info) {
        console.log('Image height is ' + info.height);
      });
  }
  function _addIPFS(f) {

  }
  function _ipfsURL(cid) {
    return `https://gateway.ipfs.io/ipfs/${cid}`;
  }

  return async function(protocol, cid, width, height) {
    assert.equal(protocol, 'ipfs');

    const input = ipfs.cat(`/${protocol}/${cid}`);
    const thumbnail = await _getThumbnail(input);
    const thumbnailCid = _addIPFS(thumbnail);

    return _ipfsURL(cid);
  }
};
