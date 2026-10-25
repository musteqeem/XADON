// XADON V7 · autoadd — auto-approve join requests (delay + country filter).
module.exports = {
  name: 'autoadd', alias: ['autoapprove', 'autoaddreq'], desc: 'Auto-approve join requests', usage: '.autoadd on|off|delay <s>|cc <code>|status', category: 'group', group: true, admin: true,
  async run({ m, args, reply, ui, db }) {
    const sub = String(args[0] || '').toLowerCase();
    const key = `autoadd:${m.chat}`;
    if (sub === 'on' || sub === '1') { db.set(key, true); return reply(ui.notice('success', 'Auto approve ON', 'Join requests are approved automatically (45s sweeper + delay + country filter).')); }
    if (sub === 'off' || sub === '0') { db.set(key, false); return reply(ui.notice('warn', 'Auto approve OFF', 'Join requests need manual approval.')); }
    if (sub === 'delay') { const s = parseInt(args[1], 10); if (isNaN(s) || s < 0) return reply(ui.notice('error', 'Bad delay', 'Usage: .autoadd delay 60')); db.set('autoaddDelay', s); return reply(ui.notice('success', 'Delay set', `Requests wait ${s}s before approval.`)); }
    if (sub === 'cc') { const cc = String(args[1] || '').toLowerCase(); if (cc === 'all') { db.set('autoaddCC', ''); return reply(ui.notice('success', 'Filter cleared', 'All countries approved.')); } const clean = cc.replace(/\D/g, ''); if (!clean) return reply(ui.notice('error', 'Bad code', 'Usage: .autoadd cc 234')); db.set('autoaddCC', clean); return reply(ui.notice('success', 'Filter set', `Only +${clean} numbers approved.`)); }
    const on = !!db.get(key, false), d = db.get('autoaddDelay', 0), cc = db.get('autoaddCC', '');
    return reply(ui.card({ icon: '\u2698', title: 'Auto approve', subtitle: on ? 'ON' : 'OFF', rows: [['status', on ? 'ON' : 'OFF'], ['delay', `${d}s`], ['country', cc ? `+${cc}` : 'all']], body: '.autoadd on|off\n.autoadd delay 60\n.autoadd cc 234|all' }));
  },
};
