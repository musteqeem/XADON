// XADON AI · TOOLS — premium unicode card, no emojis.
const Z = { lagos: 'Africa/Lagos', london: 'Europe/London', newyork: 'America/New_York', dubai: 'Asia/Dubai', tokyo: 'Asia/Tokyo', paris: 'Europe/Paris' };
module.exports = {
  name: 'worldclock',
  alias: ['clockx'],
  desc: 'World clock lookup',
  usage: '.worldclock lagos',
  category: 'tools2',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const z = Z[String(args[0] || 'lagos').toLowerCase().replace(/\s/g, '')];
    if (!z) return reply(ui.notice('info', 'World clock', `${fonts.mono(`${prefix}worldclock lagos`)}${'\n'}${fonts.smallCaps('lagos london newyork dubai tokyo paris')}`));
    const t = new Intl.DateTimeFormat('en-GB', { timeZone: z, hour: '2-digit', minute: '2-digit', weekday: 'short', day: '2-digit', month: 'short' }).format(new Date());
    return reply(ui.card({ icon: '◔', title: t, subtitle: z, rows: [], body: ui.footer() }));
  },
};
