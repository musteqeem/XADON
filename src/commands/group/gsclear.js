// XADON V7 · gsclear — delete tracked group statuses.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'gsclear', alias: ['gsdel', 'clearstatus'], desc: 'Delete tracked group statuses', usage: '.gsclear', category: 'group', group: true, admin: true,
  async run({ sock, m, reply, ui }) {
    try {
      const ids = fx.clearIds(m.chat);
      if (!ids.length) return reply(ui.notice('info', 'Nothing tracked', 'No statuses tracked for this group.'));
      let ok = 0;
      for (const id of ids) {
        try { if (typeof sock.deleteGroupStatus === 'function') { await sock.deleteGroupStatus(m.chat, { remoteJid: m.chat, fromMe: true, id }); ok++; } } catch {}
        await new Promise((r) => setTimeout(r, 300));
      }
      return reply(ui.notice('success', 'Cleared', `Removed ${ok}/${ids.length} tracked status(es).`));
    } catch (e) { return reply(ui.notice('error', 'Clear failed', String(e.message || e).slice(0, 200))); }
  },
};
