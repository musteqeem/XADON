// XADON V12 · PREMIUM — selfdestruct: message that deletes itself.
// Usage: .selfdestruct 30s meet me here  ·  .selfdestruct 2m secret plan
module.exports = {
  name: 'selfdestruct',
  alias: ['timedmsg', 'vanishmsg'],
  desc: 'Send a message that auto-deletes (5s–10m)',
  usage: '.selfdestruct 30s your text here',
  category: 'general',
  async run({ sock, m, args, reply, ui }) {
    const raw = String(args[0] || '').toLowerCase();
    const mt = raw.match(/^(\d+)(s|sec|secs|m|min|mins)?$/);
    if (!mt) return reply(ui.notice('info', 'Self destruct', `Usage: ${ui.fonts.mono('.selfdestruct 30s meet me here')}\nTime: 5s – 10m (default 30s).`));
    let secs = Number(mt[1]) * (/^m/.test(mt[2] || 's') ? 60 : 1);
    secs = Math.min(600, Math.max(5, secs));
    const text = args.slice(1).join(' ').slice(0, 1500);
    if (!text) return reply(ui.notice('info', 'Empty', 'Give me the message text after the time.'));
    let sent = null;
    try {
      sent = await sock.sendMessage(m.chat, { text: `⏳ ${text}\n\n${ui.fonts.smallCaps(`self-destructs in ${secs}s`)}` }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Failed', 'Could not send the message.')); }
    if (sent?.key) {
      const k = sent.key;
      setTimeout(() => sock.sendMessage(m.chat, { delete: k }).catch(() => {}), secs * 1000).unref?.();
    }
    try { await sock.sendMessage(m.chat, { delete: m.key }).catch(() => {}); } catch {}
  },
};
