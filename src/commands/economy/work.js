// XADON AI · ECONOMY — premium unicode card, no emojis.
const JOBS = ['courier', 'chef', 'driver', 'designer', 'guard', 'coder'];
module.exports = {
  name: 'work',
  alias: ['workx'],
  desc: 'Work and earn coins',
  category: 'economy',
  async run({ m, reply, ui, db }) {
    const { fonts } = ui;
    const k = `eco:${m.sender}`;
    const b = db.get(k, { coins: 100, last: 0 });
    const earn = 40 + (m.sender.charCodeAt(m.sender.length - 2) % 120);
    b.coins += earn; db.set(k, b);
    const job = JOBS[earn % JOBS.length];
    return reply(ui.card({ icon: '⚒', title: `Worked as ${job}`, subtitle: 'shift complete', rows: [['earned', fonts.bold(`+${earn}`)], ['balance', fonts.bold(String(b.coins))]], body: ui.footer() }));
  },
};
