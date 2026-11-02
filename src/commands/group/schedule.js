// XADON · schedule — delayed group announcement (admins). Memory timers.
const timers = new Map(); // id -> { timeout, chat, text, at, by }
let seq = 0;
const parseDur = (s) => {
  const mt = String(s || '').match(/^(\d+)(s|m|h|d)$/i);
  if (!mt) return 0;
  const n = Number(mt[1]);
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[mt[2].toLowerCase()];
  return n * mult;
};
module.exports = {
  name: 'schedule',
  alias: ['sched', 'remindin', 'delaymsg'],
  desc: 'Schedule a message in this group',
  usage: '.schedule 10m Meeting in 10 mins  ·  .schedule list  ·  .schedule cancel 2',
  category: 'group',
  group: true,
  admin: true,
  async run({ sock, args, m, reply, ui, prefix }) {
    const sub = String(args[0] || '').toLowerCase();
    const mine = [...timers.entries()].filter(([, t]) => t.chat === m.chat);
    if (sub === 'list') {
      if (!mine.length) return reply(ui.notice('info', 'Nothing scheduled', `Usage: ${prefix}schedule 30m Good morning 🌅`));
      return reply(ui.card({
        icon: '◷', title: 'Scheduled messages', subtitle: `${mine.length} pending`,
        rows: mine.map(([id, t]) => [`#${id}`, `${new Date(t.at).toLocaleTimeString('en-GB')} — ${t.text.slice(0, 40)}`]),
      }));
    }
    if (sub === 'cancel' || sub === 'del') {
      const id = Number(args[1]);
      const t = timers.get(id);
      if (!t || t.chat !== m.chat) return reply(ui.notice('error', 'Not found', 'Use .schedule list to see IDs.'));
      clearTimeout(t.timeout); timers.delete(id);
      return reply(ui.notice('warn', 'Cancelled', `Scheduled message #${id} removed.`));
    }
    const ms = parseDur(args[0]);
    const text = args.slice(1).join(' ').trim();
    if (!ms || ms < 10_000 || ms > 7 * 86_400_000) {
      return reply(ui.notice('info', 'Schedule', `Usage: ${prefix}schedule 30m <message>\nUnits: s m h d (min 10s, max 7d).\n${prefix}schedule list · ${prefix}schedule cancel <id>`));
    }
    if (!text) return reply(ui.notice('error', 'No message', 'Add the announcement text after the delay.'));
    const id = ++seq;
    const at = Date.now() + ms;
    const timeout = setTimeout(async () => {
      timers.delete(id);
      try { await sock.sendMessage(m.chat, { text: `⏰ *Scheduled announcement*\n\n${text}` }); } catch {}
    }, ms);
    if (timeout.unref) timeout.unref();
    timers.set(id, { timeout, chat: m.chat, text: text.slice(0, 1000), at, by: m.sender });
    return reply(ui.notice('success', 'Scheduled', `#${id} will post in ${args[0]}.`));
  },
};
