// XADON V11 · autotranslate — per-chat live translation + optional owner-DM mirror.
// Any message not already in the chat's target language is translated and
// posted as a reply. Works in groups AND private chats.
//
//   .autotranslate on es      → translate everything here to Spanish
//   .autotranslate on         → translate everything here to English
//   .autotranslate dm on      → also forward translations to your DM
//   .autotranslate dm off | .autotranslate off | .autotranslate status
const { normLang, LANGS } = require('../../lib/translate');
module.exports = {
  name: 'autotranslate',
  alias: ['autotr', 'autotrans'],
  desc: 'Auto-translate chat to a default language (+DM mirror)',
  usage: '.autotranslate on es | .autotranslate dm on | .autotranslate off | status',
  category: 'tools',
  async run({ m, args, reply, ui, db, isAdmin, isOwner }) {
    const { fonts } = ui;
    if (m.isGroup && !isAdmin && !isOwner) return reply(ui.notice('error', 'Admins only', 'Only group admins can configure auto-translate.'));
    const key = `autotranslate:${m.chat}`;
    const cfg = db.get(key, { on: false, lang: 'en', dm: false });
    const sub = String(args[0] || '').toLowerCase();

    if (!sub || sub === 'status' || sub === 'info') {
      const name = LANGS[cfg.lang] || cfg.lang;
      return reply(ui.card({
        icon: '◐', title: 'Auto Translate', subtitle: cfg.on ? `ON → ${name}` : 'OFF',
        rows: [['target', cfg.on ? `${name} (${cfg.lang})` : '—'], ['dm mirror', cfg.dm ? 'ON' : 'off']],
        body: `${fonts.smallCaps('on:')} .autotranslate on es\n${fonts.smallCaps('dm mirror:')} .autotranslate dm on\n${fonts.smallCaps('off:')} .autotranslate off`,
      }));
    }
    if (sub === 'on' || sub === 'enable') {
      const lang = normLang(args[1] || cfg.lang || 'en');
      if (!lang) return reply(ui.notice('error', 'Unknown language', `'${args[1]}' is not supported.`));
      db.set(key, { on: true, lang, dm: !!cfg.dm });
      return reply(ui.notice('success', 'Auto translate ON', `Everything here is translated to ${fonts.bold(LANGS[lang])}.\nDM mirror: ${cfg.dm ? 'ON' : 'off'} (.autotranslate dm on)`));
    }
    if (sub === 'off' || sub === 'disable') {
      db.set(key, { ...cfg, on: false });
      return reply(ui.notice('warn', 'Auto translate OFF', 'Live translation paused for this chat.'));
    }
    if (sub === 'dm') {
      const v = String(args[1] || '').toLowerCase();
      const dm = /^(on|enable|yes|1)$/.test(v) ? true : /^(off|disable|no|0)$/.test(v) ? false : !cfg.dm;
      db.set(key, { ...cfg, dm });
      return reply(ui.notice(dm ? 'success' : 'warn', `DM mirror ${dm ? 'ON' : 'OFF'}`,
        dm ? 'Translations will also land in the owner DM.' : 'Translations stay in this chat only.'));
    }
    if (sub === 'lang' || sub === 'setlang' || sub === 'set') {
      const lang = normLang(args[1] || '');
      if (!lang) return reply(ui.notice('error', 'Unknown language', `Usage: .autotranslate lang es`));
      db.set(key, { ...cfg, lang });
      return reply(ui.notice('success', 'Target language set', `Now translating to ${fonts.bold(LANGS[lang])}.`));
    }
    return reply(ui.notice('info', 'Auto translate', `${fonts.mono('.autotranslate on es')} · ${fonts.mono('dm on')} · ${fonts.mono('off')} · ${fonts.mono('status')}`));
  },
};
