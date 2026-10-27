// XADON V8 · fortune — offline fortune cookie (no API).
const crypto = require('crypto');
const LINES = ['A bold message will change your week.', 'Patience now saves you twice later.', 'Someone is about to trust you with something big.', 'Your quiet work is about to get loud applause.', 'Say yes to the plan you keep postponing.', 'A small risk today beats a big regret tomorrow.', 'Good news arrives from an old contact.', 'Guard your time this week — it pays off.', 'You will laugh about this month very soon.', 'An unexpected message brings an opportunity.', 'Finish what you started; the ending is good.', 'Your calm is your unfair advantage.'];
module.exports = {
  name: 'fortune', alias: ['cookie', 'prophecy'], desc: 'Open a fortune cookie', usage: '.fortune', category: 'fun',
  async run({ m, reply, ui }) {
    const pick = LINES[crypto.randomInt(LINES.length)];
    return reply(ui.card({ icon: '🥠', title: 'Fortune cookie', subtitle: `for ${m.pushName || 'you'}`, body: `“${pick}”` }));
  },
};
