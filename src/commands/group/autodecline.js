// XADON V7 · autodecline — auto-decline join requests.
module.exports = {
  name: 'autodecline', alias: ['autoreject', 'nodecline'], desc: 'Auto-decline join requests', usage: '.autodecline on|off', category: 'group', group: true, admin: true,
  async run({ m, args, reply, ui, db }) {
    const sub = String(args[0] || '').toLowerCase();
    const key = `autodecline:${m.chat}`;
    if (sub === 'on' || sub === '1') { db.set(key, true); return reply(ui.notice('success', 'Auto decline ON', 'Pending join requests are declined automatically.')); }
    if (sub === 'off' || sub === '0') { db.set(key, false); return reply(ui.notice('warn', 'Auto decline OFF', 'Requests stay pending.')); }
    return reply(ui.notice('info', 'Auto decline', `Currently ${db.get(key, false) ? 'ON' : 'OFF'}. Usage: .autodecline on|off`));
  },
};
