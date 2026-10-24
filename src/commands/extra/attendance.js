// XADON AI · attendance (imported format).
module.exports = {
  name: 'attendance',
  aliases: ['present', 'absen'],
  description: 'Mark attendance today',
  category: 'extra',
  groupOnly: true,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui, db } = extra;
    const day = new Date().toISOString().slice(0, 10);
    const k = `attend:${m.chat}:${day}`;
    const list = db.get(k, []);
    if (!list.includes(m.sender)) list.push(m.sender);
    db.set(k, list);
    return reply(ui.notice('success', 'Present', `Marked present for ${day}. Total: ${list.length}.`));
  },
};
