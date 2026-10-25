// XADON V7 · reqdelay — global join-request approval delay.
module.exports = {
  name: 'reqdelay', alias: ['adddelay', 'approvaldelay'], desc: 'Set join-approval delay (seconds)', usage: '.reqdelay 60', category: 'group', group: true, admin: true,
  async run({ args, reply, ui, db }) {
    const s = parseInt(args[0], 10);
    if (isNaN(s) || s < 0) return reply(ui.notice('info', 'Request delay', `Currently ${db.get('autoaddDelay', 0)}s. Usage: .reqdelay 60`));
    db.set('autoaddDelay', s);
    return reply(ui.notice('success', 'Delay set', `Join requests wait ${s}s before approval.`));
  },
};
