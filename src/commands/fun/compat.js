// XADON V8 · compat — friendship compatibility between two names.
const crypto = require('crypto');
module.exports = {
  name: 'compat', alias: ['compatx', 'bond'], desc: 'Compatibility between two names', usage: '.compat Ada | Obi', category: 'fun',
  async run({ text, reply, ui, prefix }) {
    const parts = String(text || '').split('|').map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2) return reply(ui.notice('info', 'Compat', `Usage: ${ui.fonts.mono(`${prefix}compat Ada | Obi`)}`));
    const [a, b] = [parts[0].slice(0, 30), parts[1].slice(0, 30)];
    const key = [a.toLowerCase(), b.toLowerCase()].sort().join('~');
    const score = 40 + (crypto.createHash('sha256').update(`compat:${key}`).digest()[0] % 61);
    const verdict = score >= 90 ? 'Unbreakable bond' : score >= 70 ? 'Strong match' : score >= 55 ? 'Worth trying' : 'Chaotic energy';
    return reply(ui.card({ icon: '💞', title: `${a} × ${b}: ${score}%`, subtitle: verdict, rows: [['bond', ui.bar(score)]] }));
  },
};
