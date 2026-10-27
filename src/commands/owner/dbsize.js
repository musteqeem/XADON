// XADON V8 · dbsize — database keys + file size report.
const fs = require('fs');
const path = require('path');
module.exports = {
  name: 'dbsize', alias: ['dbstats', 'dbinfo'], desc: 'Database size report', usage: '.dbsize', category: 'owner', owner: true,
  async run({ reply, ui, db }) {
    const all = db.all();
    const keys = Object.keys(all);
    let bytes = 0;
    try { bytes = fs.statSync(path.resolve(__dirname, '../../../database/data.json')).size; } catch {}
    const kb = (bytes / 1024).toFixed(1);
    const top = keys.map((k) => [k, JSON.stringify(all[k] || '').length]).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return reply(ui.card({
      icon: '🗄', title: 'Database', subtitle: `${keys.length} keys · ${kb} KB`,
      rows: top.map(([k, s]) => [k.slice(0, 22), `${(s / 1024).toFixed(1)} KB`]),
      body: keys.length ? '' : 'Database is empty.',
    }));
  },
};
