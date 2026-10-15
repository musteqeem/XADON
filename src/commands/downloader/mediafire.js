// XADON AI · DOWNLOADER — premium unicode card, no emojis.
module.exports = {
  name: 'mediafire',
  alias: ['mfdl'],
  desc: 'MediaFire link check',
  usage: '.mediafire <link>',
  category: 'downloader',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const url = args[0] || '';
    if (!/mediafire\.com/i.test(url)) return reply(ui.notice('info', 'MediaFire', `${fonts.mono(`${prefix}mediafire <link>`)}`));
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'XADON-AI' } });
      const html = await r.text();
      const m = html.match(/aria-label="Download file"[^>]*|kNO[\s\S]{0,200}/);
      return reply(ui.card({ icon: '▼', title: 'MediaFire file', subtitle: 'direct page', rows: [['status', fonts.bold(r.ok ? 'REACHABLE' : 'UNKNOWN')], ['link', fonts.mono(url.slice(0, 90))]], body: `${fonts.smallCaps('open the link and tap download')}\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'Check failed', 'That link is unreachable.')); }
  },
};
