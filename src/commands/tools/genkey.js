// XADON V8 · genkey — offline random API-style key generator.
const crypto = require('crypto');
module.exports = {
  name: 'genkey', alias: ['apikey', 'token'], desc: 'Generate a random key', usage: '.genkey [prefix] [bytes 8-64]', category: 'tools',
  async run({ args, reply, ui }) {
    let prefix = 'xdn', n = 24;
    for (const a of args) { if (/^\d{1,3}$/.test(a)) n = Math.min(Math.max(Number(a), 8), 64); else if (/^[A-Za-z]{1,12}$/.test(a)) prefix = a.toLowerCase(); }
    const key = `${prefix}_${crypto.randomBytes(n).toString('base64url')}`;
    return reply(ui.card({ icon: '⌘', title: 'Random key', subtitle: `${n} bytes · handle like a secret`, rows: [['prefix', prefix]], body: ui.fonts.mono(key.slice(0, 300)) }));
  },
};
