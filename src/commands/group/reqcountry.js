// XADON V7 · reqcountry — country-code filter for approvals.
module.exports = {
  name: 'reqcountry', alias: ['addcountry', 'reqcc'], desc: 'Filter approvals by country code', usage: '.reqcountry 234 | .reqcountry all', category: 'group', group: true, admin: true,
  async run({ args, reply, ui, db }) {
    const cc = String(args[0] || '').toLowerCase();
    if (!cc) return reply(ui.notice('info', 'Country filter', `Currently ${db.get('autoaddCC', '') ? '+' + db.get('autoaddCC', '') : 'all'}. Usage: .reqcountry 234`));
    if (cc === 'all') { db.set('autoaddCC', ''); return reply(ui.notice('success', 'Filter cleared', 'All countries approved.')); }
    const clean = cc.replace(/\D/g, '');
    if (!clean) return reply(ui.notice('error', 'Bad code', 'Usage: .reqcountry 234'));
    db.set('autoaddCC', clean);
    return reply(ui.notice('success', 'Filter set', `Only +${clean} numbers approved.`));
  },
};
