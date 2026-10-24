/** XADON V6 · setlang — bot language, 100+ langs. POWERFUL: every bot reply is
 * auto-translated into the new language INSTANTLY (no restart) through the
 * premium power-layer. .setlang ar -> all bot replies go out in Arabic. */
const { LANGS, normLang } = require('../../lib/translate');
const botstate = require('../../lib/botstate');

const QUICK = ['en:English', 'ar:Arabic', 'fr:French', 'es:Spanish', 'pt:Portuguese', 'sw:Swahili', 'yo:Yoruba', 'ha:Hausa', 'ig:Igbo', 'hi:Hindi', 'ur:Urdu', 'tr:Turkish', 'de:German', 'ru:Russian', 'zh-cn:Chinese'];

module.exports = {
  name: 'setlang', alias: ['language', 'lang', 'setlanguage'], desc: 'Set bot language — all replies translate instantly (100+ langs)', usage: '.setlang ar | .setlang list | .setlang off', category: 'owner', owner: true,
  async run({ text, reply, ui }) {
    const t = (text || '').trim().toLowerCase();
    const current = botstate.botLang();
    if (!t || t === 'list' || t === 'all') {
      const codes = Object.keys(LANGS).sort().join(', ');
      return reply(ui.card({
        icon: '◐', title: 'Languages (100+)',
        subtitle: `current: ${LANGS[current] || current} (${current}) · instant, no restart`,
        rows: QUICK.map((q) => { const [c, n] = q.split(':'); return [c, `${n}${c === current ? '  ← active' : ''}`]; }),
        body: `All codes:\n${codes.slice(0, 1500)}\n\nUsage: .setlang ar  → every bot reply goes out in Arabic\nReset: .setlang off (back to English)`,
      }));
    }
    if (['off', 'reset', 'default', 'en'].includes(t)) {
      botstate.setMany({ BOT_LANG: 'en' });
      try { require('../../config').botLang = 'en'; } catch {}
      return reply(ui.notice('success', 'Language reset', 'Bot replies are back in English. No restart needed.'));
    }
    const code = normLang(t.split(/\s+/)[0]);
    if (!code) return reply(ui.notice('error', 'Unknown language', `Try .setlang list — e.g. .setlang ar, .setlang yo, .setlang sw`));
    botstate.setMany({ BOT_LANG: code });
    try { require('../../config').botLang = code; } catch {}
    // NOTE: this confirmation itself passes through the power-layer, so it
    // arrives already translated into the new language — instant proof.
    return reply(ui.notice('success', 'Language updated', `Bot language → ${LANGS[code]} (${code}). Every bot reply from now on is written in ${LANGS[code]}. No restart needed.`));
  },
};
