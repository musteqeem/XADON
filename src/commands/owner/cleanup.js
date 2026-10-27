// XADON V8 · cleanup — clear deleted-caches, status cache and temp audio files.
const fs = require('fs');
const os = require('path');
module.exports = {
  name: 'cleanup', alias: ['clean', 'clearcache'], desc: 'Clear bot caches + temp files', usage: '.cleanup', category: 'owner', owner: true,
  async run({ reply, ui, db }) {
    let keys = 0;
    try {
      for (const k of Object.keys(db.all())) {
        if (k.startsWith('deleted:')) { db.delete(k); keys++; }
      }
      db.delete('statusCache');
    } catch {}
    let files = 0;
    try {
      const tmp = require('os').tmpdir();
      for (const f of fs.readdirSync(tmp)) {
        if (f.startsWith('xadon_')) { try { fs.unlinkSync(os.join(tmp, f)); files++; } catch {} }
      }
    } catch {}
    return reply(ui.notice('success', 'Cleanup done', `Cleared ${keys} deleted-cache keys, status cache and ${files} temp file(s).`));
  },
};
