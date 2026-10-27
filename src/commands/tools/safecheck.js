// XADON V8 · safecheck — offline heuristic link safety scan (no network needed).
module.exports = {
  name: 'safecheck', alias: ['linkscan', 'urlsafe', 'isitsafe'], desc: 'Heuristic link safety scan', usage: '.safecheck <url or text>', category: 'tools',
  async run({ text, m, reply, ui }) {
    const input = (text || m.quoted?.body || '').trim();
    if (!input) return reply(ui.notice('info', 'Safe check', 'Usage: .safecheck https://example.com'));
    const flags = [];
    if (/(bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|cutt\.ly|rebrand\.ly|s\.id|shorturl\.at)/i.test(input)) flags.push(['shortener', 'masked destination']);
    if (/@[^/\s]*\//.test(input)) flags.push(['@ trick', '"@" before path — likely phishing']);
    if (/xn--/i.test(input)) flags.push(['punycode', 'look-alike unicode domain']);
    if (/^http:\/\//i.test(input)) flags.push(['no TLS', 'plain http, no padlock']);
    if (/(free.*(gift|iphone|crypto|money)|double.*(money|crypto)|claim.*(prize|reward)|win.*(lottery|cash))/i.test(input)) flags.push(['scam words', 'giveaway/scam phrasing']);
    if (/\.exe(\?|\s|$)|Policy\.apk|\.apk(\?|\s|$)/i.test(input)) flags.push(['executable', 'direct app/binary download']);
    if (/\d+\.\d+\.\d+\.\d+/.test(input)) flags.push(['raw IP', 'numeric host instead of domain']);
    const score = Math.max(0, 100 - flags.length * 22);
    return reply(ui.card({
      icon: score >= 80 ? '✓' : '⚠', title: `Safety ${score}/100`, subtitle: score >= 80 ? 'looks clean' : `${flags.length} red flag(s)`,
      rows: flags.length ? flags : [['scan', 'no heuristic flags']],
      body: input.slice(0, 300),
    }));
  },
};
