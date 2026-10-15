// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'iplookup',
  alias: ['ipinfo'],
  desc: 'IP address lookup',
  usage: '.iplookup <ip>',
  category: 'search',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const ip = args[0] || '';
    if (!/^[\d.:a-fA-F]+$/.test(ip)) return reply(ui.notice('info', 'IP lookup', `${fonts.mono(`${prefix}iplookup 8.8.8.8`)}`));
    try {
      const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp,org,query`);
      const j = await r.json();
      if (j.status !== 'success') throw new Error('nf');
      return reply(ui.card({ icon: '⌖', title: j.query, subtitle: 'ip-api', rows: [['country', fonts.bold(j.country || 'N/A')], ['city', fonts.bold(`${j.city || ''} ${j.regionName || ''}`.trim() || 'N/A')], ['isp', fonts.smallCaps(j.isp || 'N/A')]], body: ui.footer() }));
    } catch { return reply(ui.notice('error', 'Lookup failed', 'That IP could not be resolved.')); }
  },
};
