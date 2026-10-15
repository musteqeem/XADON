// XADON AI · TOOLS — premium unicode card, no emojis.
module.exports = {
  name: 'timer',
  alias: ['timerx'],
  desc: 'Countdown timer ping',
  usage: '.timer <seconds>',
  category: 'tools2',
  async run({ args, reply, ui, sock, m, prefix }) {
    const { fonts } = ui;
    const s = Math.min(300, Math.max(2, parseInt(args[0] || '', 10) || 0));
    if (!s) return reply(ui.notice('info', 'Timer', `${fonts.mono(`${prefix}timer 30`)}`));
    await reply(ui.notice('info', `Timer set ${s}s`, 'I will ping you when it ends.'));
    setTimeout(() => sock.sendMessage(m.chat, { text: `◔ ${fonts.bold('TIME UP')}  ${fonts.smallCaps(`${s} seconds elapsed`)}${'\n\n'}${ui.footer()}` }, { quoted: m.raw }).catch(() => {}), s * 1000);
  },
};
