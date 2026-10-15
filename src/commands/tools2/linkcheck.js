// XADON AI · TOOLS — premium unicode card, no emojis.
module.exports = {
  name: 'linkcheck',
  alias: ['urlcheck'],
  desc: 'Check if a link is alive',
  usage: '.linkcheck <url>',
  category: 'tools2',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const url = args[0] || '';
    if (!/^https?:\/\/\S+/i.test(url)) return reply(ui.notice('info', 'Link check', `${fonts.mono(`${prefix}linkcheck https://google.com`)}`));
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'user-agent': 'XADON-AI' } });
      return reply(ui.card({ icon: '⌖', title: r.ok ? 'Link alive' : `HTTP ${r.status}`, subtitle: new URL(url).hostname, rows: [['status', fonts.bold(String(r.status))]], body: ui.footer() }));
    } catch { return reply(ui.notice('error', 'Link dead', 'No response from that URL.')); }
  },
};
