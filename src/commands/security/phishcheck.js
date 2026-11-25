/** XADON AI · security — ethical, defensive recon only. Educational use. */
module.exports = {
  name: 'phishcheck', alias: ['phishscan', 'urlrisk'], desc: 'Heuristic phishing-risk score for a link (educational)',
  usage: '.phishcheck <link>', category: 'security',
  async run({ args, reply, ui }) {
    const u = String(args[0] || '').trim();
    if (!/^https?:\/\/\S+/i.test(u)) return reply(ui.notice('info', 'Phish check', `${ui.fonts.mono('.phishcheck <link>')}`));
    let score = 0; const flags = [];
    try {
      const p = new URL(u);
      if (p.protocol === 'http:') { score += 25; flags.push('not HTTPS'); }
      if (p.username || p.password || u.includes('@')) { score += 25; flags.push('@ trick in URL'); }
      if (/xn--/.test(p.hostname)) { score += 25; flags.push('punycode / look-alike domain'); }
      if ((p.hostname.match(/\./g) || []).length >= 3) { score += 10; flags.push('deep subdomains'); }
      if (/[-]{2,}|\d{4,}|login|verify|secure|account|update|free|gift|prize/i.test(u) && !/\.(gov|edu)(\.|$)/i.test(p.hostname)) { score += 10; flags.push('urgent/bait words'); }
      if (p.hostname.length > 30) { score += 5; flags.push('very long domain'); }
    } catch { return reply(ui.notice('error', 'Bad URL', 'That link could not be parsed.')); }
    const verdict = score >= 50 ? 'HIGH RISK — do not open' : score >= 25 ? 'SUSPICIOUS — verify sender first' : 'LOW RISK — still stay alert';
    await reply(ui.card({ icon: '\uD83D\uDEE1\uFE0F', title: 'Phish check', rows: [['score', `${Math.min(score, 100)}/100`], ['verdict', verdict], ['flags', flags.join(', ') || 'none']], body: ui.footer() }));
  },
};
