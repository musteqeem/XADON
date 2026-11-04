// XADON V10 · AUTO — keyword alerts: DM the owner when watched words appear.
module.exports = {
  name: 'autokeyword',
  alias: ['kwalert', 'keywordalert'],
  desc: 'DM you when watched keywords are mentioned',
  usage: '.autokeyword on|off · .autokeyword add <word> · .autokeyword list · .autokeyword del <word>',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db, prefix }) {
    const cfg = db.get('autokeyword', { on: false, words: [] });
    const sub = String(args[0] || '').toLowerCase();
    if (sub === 'add' || sub === 'watch') {
      const w = args.slice(1).join(' ').trim().toLowerCase().slice(0, 40);
      if (!w) return reply(ui.notice('info', 'Keyword', `Usage: ${prefix}autokeyword add bot name`));
      if (!cfg.words.includes(w)) cfg.words.push(w);
      cfg.on = true; db.set('autokeyword', cfg);
      return reply(ui.notice('success', 'Watching', `"${w}" added. ${cfg.words.length} keyword(s) armed.`));
    }
    if (sub === 'del' || sub === 'remove') {
      const w = args.slice(1).join(' ').trim().toLowerCase();
      cfg.words = cfg.words.filter((x) => x !== w);
      db.set('autokeyword', cfg);
      return reply(ui.notice('warn', 'Removed', `"${w}" no longer watched.`));
    }
    if (sub === 'list') {
      if (!cfg.words.length) return reply(ui.notice('info', 'No keywords', `Add one: ${prefix}autokeyword add <word>`));
      return reply(ui.card({ icon: '◈', title: 'Watched keywords', subtitle: cfg.on ? 'alerts ON' : 'alerts OFF', rows: cfg.words.map((w, i) => [`#${i + 1}`, w]) }));
    }
    const val = /^(on|1|yes)$/.test(sub) ? true : /^(off|0|no)$/.test(sub) ? false : !cfg.on;
    cfg.on = val; db.set('autokeyword', cfg);
    return reply(ui.notice(val ? 'success' : 'warn', `Keyword alerts ${val ? 'on' : 'off'}`, cfg.words.length ? `${cfg.words.length} keyword(s) watched.` : `Add words: ${prefix}autokeyword add <word>`));
  },
};
