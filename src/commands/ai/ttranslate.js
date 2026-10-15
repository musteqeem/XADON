/** XADON V3 · otranslate (premium translate) — same fixed engine. */
const base = require('./translate');
module.exports = { ...base, name: 'otranslate', alias: ['ptr', 'ptrt'], desc: 'Premium translate (100+ languages)', usage: '.otranslate fr | hello' };
