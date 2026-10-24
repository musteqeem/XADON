// XADON AI · restore (imported format).
module.exports = {
  name: 'restore',
  aliases: ['importdb', 'loadbackup'],
  description: 'Restore backup (reply to backup file)',
  category: 'extra',
  groupOnly: false,
  ownerOnly: true,
  async execute(sock, m, extra) {
    const { reply, ui, db } = extra;
    const q = m.quoted;
    const src = (q?.type === 'documentMessage') ? q : null;
    if (!src) return reply(ui.notice('info', 'Restore', 'Reply to your xadon-backup.json file with .restore.'));
    try {
      const buf = await src.download();
      const obj = JSON.parse(buf.toString('utf8'));
      for (const [k, v] of Object.entries(obj).slice(0, 2000)) db.set(k, v);
      return reply(ui.notice('success', 'Restored', `${Object.keys(obj).length} keys imported.`));
    } catch { return reply(ui.notice('error', 'Restore failed', 'That file is not a valid backup.')); }
  },
};
