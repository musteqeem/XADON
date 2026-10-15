/** XADON V3 · setlang — bot language, 100+ langs (Google/MyMemory/Libre backends). */
const { LANGS, normLang } = require('../../lib/translate');
const botstate = require('../../lib/botstate');
module.exports = {
  name: 'setlang', alias: ['language', 'lang'], desc: 'Set bot language (100+ langs)', usage: '.setlang fr | .setlang list', category: 'owner', owner: true,
  async run({ text, reply, ui }) {
    const t = (text || '').trim().toLowerCase();
    if (!t || t === 'list') {
      const codes = Object.keys(LANGS).sort().join(', ');
      return reply(ui.card({ icon: '◐', title: 'Languages (100+)', subtitle: `.setlang <code> · current: ${botstate.botLang()}`, rows: [], body: codes.slice(0, 1800) }));
    }
    const code = normLang(t.split(/\s+/)[0]);
    if (!code) return reply(ui.notice('error', 'Unknown language', `Try .setlang list — e.g. .setlang fr, .setlang yo, .setlang sw`));
    botstate.setMany({ BOT_LANG: code });
    return reply(ui.notice('success', 'Language updated', `Bot language → ${LANGS[code]} (${code})`));
  },
};
