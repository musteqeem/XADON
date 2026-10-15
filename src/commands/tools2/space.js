// XADON AI command: space — Show the current ISS position.
module.exports = {
  name: 'space',
  desc: 'Show the current ISS position',
  usage: '.space',
  async run(ctx) { return require('../../lib/extra-commands')('space', ctx); },
};
