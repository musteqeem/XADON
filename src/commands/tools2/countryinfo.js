// XADON AI command: countryinfo — Look up a country.
module.exports = {
  name: 'countryx',
  desc: 'Look up a country',
  usage: '.countryinfo',
  async run(ctx) { return require('../../lib/extra-commands')('countryinfo', ctx); },
};
