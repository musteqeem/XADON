/** XADON AI · security — ethical, defensive recon only. Educational use. */
const whois = require('whois-json');
module.exports = {
  name: 'whois', alias: ['domainwhois', 'domaininfo'], desc: 'WHOIS lookup for a domain (defensive recon)',
  usage: '.whois example.com', category: 'security',
  async run({ sock, m, args, reply, ui }) {
    const d = String(args[0] || '').trim().replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d)) return reply(ui.notice('info', 'WHOIS', `${ui.fonts.mono('.whois example.com')}`));
    try {
      const r = await whois(d, { timeout: 15000 });
      const rows = [['domain', d], ['registrar', String(r.registrar || r.registrarName || '—').slice(0, 60)], ['created', String(r.creationDate || r.created || '—').slice(0, 40)], ['expires', String(r.expiryDate || r.expires || r.registryExpiryDate || '—').slice(0, 40)], ['status', String([r.status || r.domainStatus].flat().filter(Boolean)[0] || '—').slice(0, 60)]];
      await reply(ui.card({ icon: '\u25C8', title: 'WHOIS', subtitle: d, rows, body: ui.footer() }));
    } catch (e) { await reply(ui.notice('error', 'WHOIS failed', String(e.message || e).slice(0, 160))); }
  },
};
