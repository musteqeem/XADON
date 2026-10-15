// XADON AI command: table — Format pipe-separated rows as aligned text.
module.exports = {
  name: 'table',
  desc: 'Format pipe-separated rows as aligned text',
  usage: '.table',
  async run(ctx) { return require('../../lib/extra-commands')('table', ctx); },
};
