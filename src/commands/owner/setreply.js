// XADON V7 · setreply — customize any command reply text
const fmt = require('../../lib/format');
module.exports = {
  name: 'setreply', alias: ['customreply', 'setresponse'], desc: 'Customize any command reply (e.g. ping)', usage: '.setreply ping <text> | .setreply ping off', category: 'owner', owner: true,
  async run({ args, text, reply, ui, loader, prefix }) {
    const sub = String(args[0] || '').toLowerCase();
    if (!sub || sub === 'list') {
      const all = fmt.listCustom();
      return reply(ui.card({ icon: '✎', title: 'Custom replies', subtitle: `${all.length} override(s)`, rows: all.map(([c, v]) => [c, String(v).slice(0, 40)]), body: 'Usage: .setreply ping "〔PONG〕 {bot} · {text}"\nPlaceholders: {user} {bot} {prefix} {date} {time} {number} {text}\nRemove: .delreply ping' }));
    }
    const cmd = loader.find(sub);
    if (!cmd) return reply(ui.notice('error', 'Unknown command', `No command named ${sub}.`));
    const rest = text.slice(sub.length).trim();
    if (!rest || /^(off|clear|reset|default)$/i.test(rest)) { fmt.delCustom(sub); return reply(ui.notice('success', 'Custom reply removed', `${sub} is back to default.`)); }
    fmt.setCustom(sub, rest);
    return reply(ui.notice('success', 'Custom reply saved', `Every .${sub} reply now says:\n${fmt.fillVars(rest, { prefix }).slice(0, 300)}\n\nTip: include {text} to keep the original output inside.`));
  },
};
