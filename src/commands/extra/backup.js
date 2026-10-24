// XADON AI · backup (imported format).
module.exports = {
  name: 'backup',
  aliases: ['savedb', 'exportdb'],
  description: 'Export database backup',
  category: 'extra',
  groupOnly: false,
  ownerOnly: true,
  async execute(sock, m, extra) {
    const { reply, ui, db, prefix } = extra;
    const data = db.all();
    const json = JSON.stringify(data).slice(0, 60000);
    await sock.sendMessage(m.chat, { document: Buffer.from(JSON.stringify(data, null, 2)), mimetype: 'application/json', fileName: 'xadon-backup.json' }, { quoted: m.raw });
    return reply(ui.card({ icon: '\u25A3', title: 'Backup sent', subtitle: `${Object.keys(data).length} keys`, rows: [], body: `Restore: ${prefix}restore (reply with backup file)` }));
  },
};
