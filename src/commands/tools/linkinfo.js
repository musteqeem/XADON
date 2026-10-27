// XADON V8 · linkinfo — parse a URL into parts (offline).
module.exports = {
  name: 'linkinfo', alias: ['urlinfo', 'parseurl'], desc: 'Break a URL into parts', usage: '.linkinfo https://x.com/a?b=1#c', category: 'tools',
  async run({ text, m, reply, ui }) {
    const input = (text || m.quoted?.body || '').trim().split(/\s+/)[0] || '';
    let u;
    try { u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`); }
    catch { return reply(ui.notice('error', 'Bad URL', 'Supply a valid link.')); }
    return reply(ui.card({
      icon: '🔗', title: u.hostname, subtitle: 'url anatomy',
      rows: [['protocol', u.protocol], ['host', u.host], ['path', u.pathname.slice(0, 40) || '/'], ['query', u.search ? u.search.slice(1, 60) : '—'], ['hash', u.hash || '—']],
      body: u.search ? `Params: ${[...u.searchParams.keys()].slice(0, 8).join(', ')}` : '',
    }));
  },
};
