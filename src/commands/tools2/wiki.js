// XADON AI command: wiki — Search Wikipedia summaries.
module.exports = {
  name: 'wiki2',
  desc: 'Search Wikipedia summaries',
  usage: '.wiki',
  async run(ctx) { return require('../../lib/extra-commands')('wiki', ctx); },
};
