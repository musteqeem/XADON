/** XADON password generator — crypto-strong, offline. */
const crypto = require('crypto');
module.exports = {
  name: 'password',
  alias: ['pass', 'genpass', 'pw'],
  desc: 'Generate a strong password',
  usage: '.password 16',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    let len = Number(args[0]) || 12;
    len = Math.max(6, Math.min(64, len));
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?';
    let out = '';
    const rnd = crypto.randomBytes(len);
    for (let i = 0; i < len; i++) out += chars[rnd[i] % chars.length];
    await reply(ui.card({ icon: '⚿', title: 'Password', subtitle: `${len} characters`, rows: [], body: `${fonts.mono(out)}\n\n${fonts.smallCaps('do not share it')}\n${ui.footer()}` }));
  },
};
