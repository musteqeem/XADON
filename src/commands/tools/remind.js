/** XADON remind — in-memory timer, replies in the same chat. */
const parse = (v = '') => { const mm = String(v).match(/^(\d+)(s|m|h)$/i); if (!mm) return 0; const n = Number(mm[1]); const s = { s: 1e3, m: 6e4, h: 36e5 }[mm[2].toLowerCase()]; const d = n * s; return d >= 5e3 && d <= 24 * 36e5 ? d : 0; };
module.exports = {
  name: 'remind',
  alias: ['reminder', 'alarm'],
  desc: 'Set a quick reminder',
  usage: '.remind 10m drink water',
  async run({ sock, m, args, reply, ui, prefix }) {
    const { fonts } = ui;
    const ms = parse(args[0]);
    const body = args.slice(1).join(' ').trim() || 'Reminder!';
    if (!ms) return reply(ui.notice('info', 'Reminder', `${fonts.mono(`${prefix}remind 10m drink water`)}\n${fonts.smallCaps('units: s m h · 5s to 24h')}`));
    const label = ms < 6e4 ? `${Math.round(ms / 1e3)}s` : ms < 36e5 ? `${Math.round(ms / 6e4)}m` : `${Math.round(ms / 36e5)}h`;
    await reply(ui.notice('success', `Reminder in ${label}`, fonts.italic(body.slice(0, 200))));
    setTimeout(() => sock.sendMessage(m.chat, { text: `⏰ ${fonts.bold('REMINDER')}\n${body.slice(0, 500)}\n\n${ui.footer()}`, mentions: [m.sender] }).catch(() => {}), ms).unref?.();
  },
};
