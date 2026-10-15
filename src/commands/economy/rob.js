// XADON AI · ECONOMY — premium unicode card, no emojis.
module.exports = {
  name: 'rob',
  alias: ['robx'],
  desc: 'Rob a member',
  usage: '.rob @user',
  category: 'economy',
  async run({ m, reply, ui, db, target }) {
    const { fonts } = ui;
    const jid = target();
    if (!jid) return reply(ui.notice('info', 'Rob', 'Mention or reply to a target.'));
    const a = db.get(`eco:${m.sender}`, { coins: 100, last: 0 });
    const v = db.get(`eco:${jid}`, { coins: 100, last: 0 });
    const steal = Math.min(v.coins, 30 + (Date.now() % 90));
    const caught = Date.now() % 3 === 0;
    if (caught) { a.coins = Math.max(0, a.coins - 40); db.set(`eco:${m.sender}`, a); return reply(ui.notice('warn', 'Caught', `You paid a 40 coin fine.`)); }
    v.coins -= steal; a.coins += steal; db.set(`eco:${jid}`, v); db.set(`eco:${m.sender}`, a);
    return reply(ui.card({ icon: '◈', title: `Stole ${steal}`, subtitle: 'robbery', rows: [['balance', fonts.bold(String(a.coins))]], body: ui.footer() }));
  },
};
