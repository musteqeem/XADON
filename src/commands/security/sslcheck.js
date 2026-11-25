/** XADON AI · security — ethical, defensive recon only. Educational use. */
const tls = require('tls');
module.exports = {
  name: 'sslcheck', alias: ['certcheck', 'tlscheck'], desc: 'Check a site TLS certificate + expiry (defensive)',
  usage: '.sslcheck example.com', category: 'security',
  async run({ args, reply, ui }) {
    const host = String(args[0] || '').trim().replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    if (!host) return reply(ui.notice('info', 'SSL check', `${ui.fonts.mono('.sslcheck example.com')}`));
    const days = await new Promise((resolve) => {
      const s = tls.connect({ host, port: 443, servername: host, timeout: 12000 }, () => {
        try { resolve(Math.floor((new Date(s.getPeerCertificate().valid_to) - Date.now()) / 86400000)); } catch { resolve(null); }
        s.end();
      });
      s.on('error', () => resolve(null)); s.on('timeout', () => { s.destroy(); resolve(null); });
    });
    if (days === null) return reply(ui.notice('error', 'SSL check', 'No TLS certificate found (or host unreachable).'));
    const state = days < 0 ? 'EXPIRED' : days < 14 ? 'EXPIRING SOON' : 'VALID';
    await reply(ui.card({ icon: '\uD83D\uDD12', title: 'SSL certificate', subtitle: host, rows: [['status', state], ['expires in', `${days} day(s)`]], body: ui.footer() }));
  },
};
