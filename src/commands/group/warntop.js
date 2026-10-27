// XADON V8 · warntop — most-warned members in this group.
module.exports = {
  name: 'warntop', alias: ['topwarn', 'warnrank'], desc: 'Most-warned members ranking', usage: '.warntop [n]', group: true, admin: true, category: 'group',
  async run({ sock, m, args, reply, ui, db }) {
    const n = Math.min(Math.max(Number(args[0]) || 5, 1), 15);
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    const rows = [];
    for (const p of meta?.participants || []) {
      const jid = p.id;
      const warns = db.get(`warns:${m.chat}:${jid}`, []);
      if (warns.length) rows.push([jid, warns.length]);
    }
    rows.sort((a, b) => b[1] - a[1]);
    if (!rows.length) return reply(ui.notice('info', 'Warn top', 'Nobody has warnings in this group yet.'));
    return reply(ui.card({
      icon: '⚠', title: `Warn ranking (top ${Math.min(n, rows.length)})`, subtitle: 'manual + anti-guard warns',
      rows: rows.slice(0, n).map(([jid, c], i) => [`#${i + 1} @${String(jid).split('@')[0]}`, `${c}/3`]),
      body: 'Clear one: .unwarn @user',
    }));
  },
};
