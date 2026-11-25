/** XADON AI · security — ethical, defensive recon only. Educational use. */
const axios = require('axios');
module.exports = {
  name: 'urlunshorten', alias: ['unshort', 'expandurl'], desc: 'Expand a shortened link, show redirect chain (anti-phishing)',
  usage: '.urlunshorten <short link>', category: 'security',
  async run({ args, reply, ui }) {
    let u = String(args[0] || '').trim();
    if (!/^https?:\/\/\S+/i.test(u)) return reply(ui.notice('info', 'Unshorten', `${ui.fonts.mono('.urlunshorten https://bit.ly/xyz')}`));
    const chain = [u];
    try {
      let cur = u;
      for (let i = 0; i < 5; i++) {
        const r = await axios.get(cur, { timeout: 12000, maxRedirects: 0, validateStatus: (s) => s >= 200 && s < 400 });
        const loc = r.headers?.location;
        if (!loc) break;
        cur = new URL(loc, cur).toString();
        chain.push(cur);
        if (chain.length > 6) break;
      }
      await reply(ui.card({ icon: '\uD83D\uDD0D', title: 'Redirect chain', rows: [], body: chain.map((c, i) => `${i + 1}. ${c.slice(0, 120)}`).join('\n') + `\n\n${ui.footer()}` }));
    } catch (e) { await reply(ui.notice('error', 'Expand failed', String(e.message || e).slice(0, 160))); }
  },
};
