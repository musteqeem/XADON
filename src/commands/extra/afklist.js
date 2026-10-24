// XADON AI · afklist (imported format).
module.exports = {
  name: 'afklist',
  aliases: ['afks'],
  description: 'List AFK members in this group',
  category: 'extra',
  groupOnly: true,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui, db } = extra;
    try {
      const meta = await sock.groupMetadata(m.chat).catch(() => null);
      const parts = meta?.participants || [];
      const afks = [];
      for (const p of parts) {
        const jid = p.id || p.jid;
        if (!jid) continue;
        const rec = db.get(`afk:${jid}`, null);
        if (rec) afks.push([String(jid).split('@')[0].slice(-6), String(rec.reason || 'Away').slice(0, 30)]);
        if (afks.length >= 20) break;
      }
      if (!afks.length) return reply(ui.notice('info', 'Nobody AFK', 'No AFK members right now.'));
      return reply(ui.card({ icon: '\u25CB', title: 'AFK list', subtitle: `${afks.length} away`, rows: afks }));
    } catch { return reply(ui.notice('error', 'Failed', 'Could not read AFK list.')); }
  },
};
