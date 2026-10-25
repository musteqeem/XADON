// XADON V7 · metatable — live bot stats as a Meta-style table.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'metatable', alias: ['statstable', 'botstats'], desc: 'Bot stats as rich table', usage: '.metatable', category: 'rich',
  async run({ sock, m, reply, ui, loader, prefix }) {
    try {
      const up = Math.floor(process.uptime());
      const rows = [['Metric', 'Value'], ['Commands', String(loader.commands.size)], ['Uptime', `${Math.floor(up / 3600)}h ${Math.floor((up % 3600) / 60)}m`], ['Prefix', prefix], ['Bot', require('../../lib/botstate').botName()]];
      await fx.richTable(sock, m.chat, { heading: 'Bot Statistics', intro: '', rows, quoted: m.raw });
    } catch (e) { return reply(ui.notice('error', 'Rich failed', String(e.message || e).slice(0, 200))); }
  },
};
