// XADON AI command: timezone — Show the current time in a timezone.
module.exports = {
  name: 'timezone',
  desc: 'Show the current time in a timezone',
  usage: '.timezone',
  async run(ctx) { return require('../../lib/extra-commands')('timezone', ctx); },
};
