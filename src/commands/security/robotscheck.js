/** XADON AI · security — ethical, defensive recon only. Educational use. */
const axios = require('axios');
module.exports = {
  name: 'robotscheck', alias: ['robots', 'securitytxt'], desc: 'Read robots.txt + security.txt (defensive recon)',
  usage: '.robotscheck example.com', category: 'security',
  async run({ args, reply, ui }) {
    let host = String(args[0] || '').trim().replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    if (!host) return reply(ui.notice('info', 'robots.txt', `${ui.fonts.mono('.robotscheck example.com')}`));
    const get = async (p) => axios.get(`https://${host}${p}`, { timeout: 12000, validateStatus: () => true }).then((r) => (r.status === 200 ? String(r.data).slice(0, 1200) : null)).catch(() => null);
    const robots = await get('/robots.txt');
    const sec = await get('/.well-known/security.txt');
    await reply(ui.card({ icon: '\uD83E\uDD16', title: 'robots + security.txt', subtitle: host, rows: [['robots.txt', robots ? 'found' : 'absent'], ['security.txt', sec ? 'found' : 'absent']],
      body: (robots ? `\u2500 robots.txt \u2500\n${robots.slice(0, 500)}\n` : '') + (sec ? `\u2500 security.txt \u2500\n${sec.slice(0, 500)}\n` : '') + `\n${ui.footer()}` }));
  },
};
