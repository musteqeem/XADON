/** XADON AI · security — ethical, defensive recon only. Educational use. */
const axios = require('axios');
module.exports = {
  name: 'httpheaders', alias: ['secheaders', 'headers'], desc: 'Audit website security headers (defensive)',
  usage: '.httpheaders https://example.com', category: 'security',
  async run({ args, reply, ui }) {
    let u = String(args[0] || '').trim();
    if (!u) return reply(ui.notice('info', 'Headers', `${ui.fonts.mono('.httpheaders https://example.com')}`));
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    try {
      const r = await axios.get(u, { timeout: 15000, maxRedirects: 3, validateStatus: () => true });
      const h = r.headers || {};
      const want = ['strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy'];
      const rows = want.map((k) => [k, h[k] ? `\u2705 ${String(h[k]).slice(0, 50)}` : '\u274C missing']);
      rows.unshift(['server', String(h.server || h['x-powered-by'] || 'hidden').slice(0, 40)], ['status', String(r.status)]);
      await reply(ui.card({ icon: '\u25C8', title: 'Security headers', subtitle: u.slice(0, 60), rows, body: ui.footer() }));
    } catch (e) { await reply(ui.notice('error', 'Fetch failed', String(e.message || e).slice(0, 160))); }
  },
};
