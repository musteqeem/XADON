// XADON V7 · gstatusall — broadcast a status to every group the bot is in.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'gstatusall', alias: ['gsall', 'gsbroadcast'], desc: 'Broadcast status to all groups', usage: '.gstatusall <text> [--bg=red]', category: 'group', group: true, admin: true,
  async run({ sock, m, text, reply, ui }) {
    try {
      let body = (text || '').replace(/--bg=[^\s]+/gi, '').trim() || m.quoted?.body || '';
      if (!body) return reply(ui.notice('info', 'Broadcast status', 'Usage: .gstatusall hello everyone'));
      const groups = await sock.groupFetchAllParticipating().catch(() => ({}));
      const ids = Object.keys(groups || {});
      if (!ids.length) return reply(ui.notice('error', 'No groups', 'The bot is not in any group.'));
      let ok = 0, no = 0;
      for (const gid of ids) {
        try { await fx.sendGroupStatus(sock, gid, { text: body.slice(0, 1000) }, {}); ok++; } catch { no++; }
        await new Promise((r) => setTimeout(r, 600));
      }
      return reply(ui.notice('success', 'Broadcast done', `Posted in ${ok} group(s)${no ? `, ${no} failed` : ''}.`));
    } catch (e) { return reply(ui.notice('error', 'Broadcast failed', String(e.message || e).slice(0, 200))); }
  },
};
