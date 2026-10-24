// XADON AI · attendlist (imported format).
module.exports = {
  name: 'attendlist',
  aliases: ['absenlist'],
  description: 'Show today attendance',
  category: 'extra',
  groupOnly: true,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui, db } = extra;
    const day = new Date().toISOString().slice(0, 10);
    const list = db.get(`attend:${m.chat}:${day}`, []);
    if (!list.length) return reply(ui.notice('info', 'Nobody yet', `No attendance for ${day}. Type .attendance to mark present.`));
    const rows = list.slice(0, 25).map((j, i) => [`#${i + 1}`, '@' + String(j).split('@')[0]]);
    return reply(ui.card({ icon: '\u2630', title: 'Attendance', subtitle: `${day} — ${list.length} present`, rows }), { mentions: list });
  },
};
