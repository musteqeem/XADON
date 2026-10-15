// XADON AI command: stats — Show bot runtime and command totals.
module.exports = {
  name: 'stats',
  desc: 'Show bot runtime and command totals',
  usage: '.stats',
  async run(ctx) { return require('../../lib/extra-commands')('stats', ctx); },
};
