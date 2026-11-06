/** XADON V9 · dnslookup — DNS records for any domain (A, MX, TXT, NS). No key needed. */
const dns = require('node:dns').promises;
module.exports = {
  name: 'dnslookup',
  alias: ['dnsinfo', 'domaininfo'],
  desc: 'DNS records for a domain',
  usage: '.dnslookup <domain>',
  category: 'xadon9',
  async run({ m, text, reply, ui, prefix }) {
    let d = (text || m.quoted?.body || '').trim().split(/\s+/)[0] || '';
    d = d.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    if (!/^[\w.-]+\.[a-z]{2,}$/i.test(d)) return reply(ui.notice('info', 'DNS lookup', `Usage: ${prefix}dnslookup google.com`));
    const rows = [];
    const grab = async (label, fn) => {
      try {
        const r = await fn();
        const flat = Array.isArray(r) ? r.map((x) => (typeof x === 'object' ? Object.values(x).join(' ') : x)).join('\n') : String(r);
        rows.push([label, flat.slice(0, 300) || '—']);
      } catch { rows.push([label, 'none']); }
    };
    await grab('A', () => dns.resolve4(d));
    await grab('MX', () => dns.resolveMx(d).then((r) => r.map((x) => `${x.priority} ${x.exchange}`)));
    await grab('NS', () => dns.resolveNs(d));
    await grab('TXT', () => dns.resolveTxt(d).then((r) => r.map((x) => x.join(' '))));
    return reply(ui.card({ icon: '◈', title: 'DNS records', subtitle: d, rows }));
  },
};
