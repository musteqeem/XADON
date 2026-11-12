/** XADON V9 · pomodoro — focus timer. .pomodoro 25 maths (pings you when time is up). */
module.exports = {
  name: 'pomodoro',
  alias: ['pomo', 'ptimer', 'studytimer'],
  desc: 'Focus timer with a reminder',
  usage: '.pomodoro <minutes> [label]',
  category: 'tools',
  async run({ sock, m, args, reply, ui, prefix }) {
    const mins = parseFloat(args[0]);
    if (!Number.isFinite(mins) || mins <= 0 || mins > 180) return reply(ui.notice('info', 'Pomodoro', `Usage: ${prefix}pomodoro 25 maths revision`));
    const label = args.slice(1).join(' ').trim().slice(0, 100) || 'focus session';
    const ms = Math.round(mins * 60_000);
    await reply(ui.notice('success', 'Timer started', `⏳ ${mins} min — ${label}\nI will ping you when time is up.`));
    setTimeout(async () => {
      try {
        await sock.sendMessage(m.chat, { text: `◈ 𝗧𝗜𝗠𝗘 𝗨𝗣 ⟶ ${label}\n${mins} minutes done. Take a break, champion.\n\n${ui.footer()}`, mentions: [m.sender] }, { quoted: m.raw });
      } catch {}
    }, ms).unref?.();
  },
};
