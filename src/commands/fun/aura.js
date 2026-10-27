// XADON V8 · aura — aura score from any name (deterministic, just for fun).
const crypto = require('crypto');
const TITLES = ['Faint Glow', 'Rising Spark', 'Bright Flame', 'Blazing Aura', 'Legendary Presence', 'Cosmic Force'];
module.exports = {
  name: 'aura', alias: ['auracheck', 'vibe'], desc: 'Check aura level', usage: '.aura <name>', category: 'fun',
  async run({ text, m, reply, ui }) {
    const name = (text || m.pushName || 'Someone').trim().slice(0, 40);
    const score = crypto.createHash('sha256').update(`aura:${name.toLowerCase()}`).digest()[0] % 101;
    const title = TITLES[Math.min(TITLES.length - 1, Math.floor(score / 18))];
    return reply(ui.card({ icon: '✦', title: `${name}: ${score}%`, subtitle: title, rows: [['level', ui.bar(score)]], body: '' }));
  },
};
