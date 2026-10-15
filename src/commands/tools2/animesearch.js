// XADON AI command: animesearch — Search anime titles via Jikan.
module.exports = {
  name: 'animesearch',
  desc: 'Search anime titles via Jikan',
  usage: '.animesearch',
  async run(ctx) { return require('../../lib/extra-commands')('animesearch', ctx); },
};
