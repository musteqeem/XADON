/** XADON AI · mutetimer — mute a group for a set time, then auto-unmute. */
function parseDur(s = '') {
  const m = String(s).trim().toLowerCase().match(/^(\d+)\s*([smh])$/);
  if (!m) return null;
  const mult = m[2] === 's' ? 1000 : m[2] === 'm' ? 60000 : 3600000;
  const ms = Number(m[1]) * mult;
  if (!ms || ms < 10000 || ms > 12 * 3600000) return null;
  return ms;
}
function fmt(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}
module.exports = {
  name: 'mutetimer',
  alias: ['timedmute', 'mutefor'],
  desc: 'Mute the group for a set time (auto-unmute)',
  usage: '.mutetimer 10m  ·  .mutetimer 1h  ·  .mutetimer 30s',
  category: 'group', group: true, admin: true, botAdmin: true,
  async run({ sock, m, args, reply, ui }) {
    const ms = parseDur(args[0] || '');
    if (!ms) return reply(ui.notice('info', 'Mute timer', `${ui.fonts.mono('.mutetimer 10m')} (10s – 12h)`));
    try {
      await sock.groupSettingUpdate(m.chat, 'announcement');
      await reply(ui.card({ icon: '\uD83D\uDD07', title: 'Group muted', subtitle: `auto-unmute in ${fmt(ms)}`, rows: [], body: `\u26A1 Only admins can chat till then.\n\n${ui.footer()}` }));
      setTimeout(() => sock.groupSettingUpdate(m.chat, 'not_announcement').then(() =>
        sock.sendMessage(m.chat, { text: `\u2726 \u2500\u2500\u2500 \u22C6\u22C5\u22C5\u22C5 \u2500\u2500\u2500 \u2726\n\uD83D\uDD0A Group reopened — mute timer (${fmt(ms)}) elapsed.\n\n${ui.footer()}` }).catch(() => {})
      ).catch(() => {}), ms);
    } catch { await reply(ui.notice('error', 'Mute failed', 'I need admin rights with message rights.')); }
  },
};
