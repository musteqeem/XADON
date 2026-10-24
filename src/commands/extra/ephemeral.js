// XADON AI · ephemeral — disappearing messages for the group (Baileys groupToggleEphemeral).
module.exports = {
  name: 'ephemeral',
  alias: ['disappear', 'disappearing'],
  desc: 'Toggle disappearing messages',
  usage: '.ephemeral on | off | 24h | 7d | 90d',
  group: true, admin: true, botAdmin: true, category: 'extra',
  async run({ sock, m, args, reply, ui }) {
    const a = String(args[0] || '').toLowerCase();
    const secs = /^(on|24h|1d)$/.test(a) ? 86400 : /^7d|week$/.test(a) ? 604800 : /^90d|3m$/.test(a) ? 7776000 : /^(off|0)$/.test(a) ? 0 : null;
    if (secs === null) return reply(ui.notice('info', 'Ephemeral', 'Usage: .ephemeral on | 24h | 7d | 90d | off'));
    try {
      if (typeof sock.groupToggleEphemeral !== 'function') return reply(ui.notice('error', 'Not supported', 'This Baileys build has no ephemeral API.'));
      await sock.groupToggleEphemeral(m.chat, secs);
      return reply(ui.notice(secs ? 'success' : 'warn', 'Ephemeral ' + (secs ? 'on' : 'off'), secs ? `Messages disappear after ${a}.` : 'Disappearing messages disabled.'));
    } catch { return reply(ui.notice('error', 'Failed', 'Could not change the setting. The bot needs admin rights.')); }
  },
};
