/** XADON AI · security — ethical, defensive recon only. Educational use. */
const axios = require('axios');
const crypto = require('crypto');
module.exports = {
  name: 'pwncheck', alias: ['breachcheck', 'pwndpass'], desc: 'Check if a password leaked (k-anonymity, never sent whole)',
  usage: '.pwncheck <password>  (use in DM only!)', category: 'security',
  async run({ args, reply, ui, m }) {
    const pw = args.join(' ');
    if (!pw) return reply(ui.notice('info', 'Breach check', `${ui.fonts.mono('.pwncheck <password>')}\n\u26A0\uFE0F Use in DM only — never in groups.`));
    if (m.isGroup) return reply(ui.notice('warn', 'DM only', 'Run this in a private chat with the bot, never in a group.'));
    try {
      const sha = crypto.createHash('sha1').update(pw).digest('hex').toUpperCase();
      const r = await axios.get(`https://api.pwnedpasswords.com/range/${sha.slice(0, 5)}`, { timeout: 15000 });
      const hit = String(r.data).split('\n').find((l) => l.split(':')[0].trim() === sha.slice(5));
      const n = hit ? Number(hit.split(':')[1]) : 0;
      await reply(ui.card({ icon: '\uD83D\uDD11', title: 'Breach check', rows: [['seen in breaches', n ? `${n.toLocaleString()}× — CHANGE IT` : 'never seen — good']], body: ui.footer() }));
    } catch { await reply(ui.notice('error', 'Check failed', 'The breach API did not respond.')); }
  },
};
