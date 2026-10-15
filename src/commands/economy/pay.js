// XADON AI · ECONOMY — premium unicode card, no emojis.
module.exports = {
  name: 'pay',
  alias: ['payx'],
  desc: 'Send coins to a friend',
  usage: '.pay @user <amount>',
  category: 'economy',
  async run({ m, args, reply, ui, db, target, prefix }) {
    const { fonts } = ui;
    const jid = target();
    const amt = Math.max(1, parseInt(args.find((a) => /^\d+$/.test(a || '')) || '0', 10));
    if (!jid || !amt) return reply(ui.notice('info', 'Pay coins', `${fonts.mono(`${prefix}pay @friend 50`)}`));
    const a = db.get(`eco:${m.sender}`, { coins: 100, last: 0 });
    if (a.coins < amt) return reply(ui.notice('error', 'No funds', `Balance: ${a.coins}.`));
    const v = db.get(`eco:${jid}`, { coins: 100, last: 0 });
    a.coins -= amt; v.coins += amt; db.set(`eco:${m.sender}`, a); db.set(`eco:${jid}`, v);
    return reply(ui.card({ icon: '◈', title: `Sent ${amt}`, subtitle: `@${jid.split('@')[0]}`, rows: [['balance', fonts.bold(String(a.coins))]], body: ui.footer() }));
  },
};
