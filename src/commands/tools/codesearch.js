// XADON AI command: codesearch — Search public GitHub code via repository API help.
module.exports = {
  name: 'codesearch',
  desc: 'Search public GitHub code via repository API help',
  usage: '.codesearch',
  async run(ctx) { return require('../../lib/extra-commands')('codesearch', ctx); },
};
