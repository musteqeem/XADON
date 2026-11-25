/** XADON AI · security — ethical, defensive recon only. Educational use. */
const axios = require('axios');
const cheerio = require('cheerio');
module.exports = {
  name: 'techdetect', alias: ['whatruns', 'stackcheck'], desc: 'Detect site tech from headers + meta (educational)',
  usage: '.techdetect https://example.com', category: 'security',
  async run({ args, reply, ui }) {
    let u = String(args[0] || '').trim();
    if (!u) return reply(ui.notice('info', 'Tech detect', `${ui.fonts.mono('.techdetect https://example.com')}`));
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    try {
      const r = await axios.get(u, { timeout: 15000, maxRedirects: 3, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const h = r.headers || {};
      const $ = cheerio.load(String(r.data || ''));
      const found = [];
      if (h.server) found.push(['server', h.server.slice(0, 40)]);
      if (h['x-powered-by']) found.push(['powered-by', h['x-powered-by'].slice(0, 40)]);
      const gen = $('meta[name="generator"]').attr('content');
      if (gen) found.push(['generator', gen.slice(0, 60)]);
      if ($('[ng-app],[ng-version]').length) found.push(['framework', 'Angular']);
      if ($('#__next').length || $('script[src*="_next/"]').length) found.push(['framework', 'Next.js']);
      if ($('script[src*="wp-content"],link[href*="wp-content"]').length) found.push(['cms', 'WordPress']);
      if ($('script[src*="shopify"]').length) found.push(['platform', 'Shopify']);
      if (!found.length) found.push(['fingerprint', 'minimal — hardened or custom stack']);
      await reply(ui.card({ icon: '\u2699', title: 'Tech detect', subtitle: u.slice(0, 60), rows: found, body: ui.footer() }));
    } catch (e) { await reply(ui.notice('error', 'Detect failed', String(e.message || e).slice(0, 160))); }
  },
};
