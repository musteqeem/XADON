// XADON AI command: version — Show bot and Node.js versions.
module.exports = {
  name: 'version',
  desc: 'Show bot and Node.js versions',
  usage: '.version',
  async run(ctx) { return require('../../lib/extra-commands')('version', ctx); },
};
