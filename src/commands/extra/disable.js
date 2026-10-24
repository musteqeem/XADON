// XADON AI · disable (imported format).
module.exports = {
  name: 'disable',
  aliases: ['offcmd', 'mutecmd'],
  description: 'Disable a command in this group',
  category: 'extra',
  groupOnly: true,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db, loader } = extra;
    const n = String(args[0] || '').toLowerCase();
    if (!n) return reply(ui.notice('info', 'Disable', 'Usage: .disable ping'));
    const c = loader.find(n);
    if (!c) return reply(ui.notice('error', 'No command', `"${n}" not found.`));
    if (['disable', 'enable', 'cmdlist'].includes(c.name)) return reply(ui.notice('error', 'Blocked', 'That command cannot be disabled.'));
    const k = `disabled:${m.chat}`;
    const off = db.get(k, []);
    if (!off.includes(c.name)) off.push(c.name);
    db.set(k, off);
    return reply(ui.notice('success', 'Disabled', `.${c.name} is off in this group.`));
  },
};
