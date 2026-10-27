// XADON V8 · envcheck — runtime health without leaking secrets.
const fs = require('fs');
const path = require('path');
module.exports = {
  name: 'envcheck', alias: ['healthcheck', 'syscheck'], desc: 'Runtime health check', usage: '.envcheck', category: 'owner', owner: true,
  async run({ reply, ui, db, config, sock }) {
    const mask = (s) => s ? `+${String(s).replace(/\D/g, '').slice(0, 4)}…${String(s).replace(/\D/g, '').slice(-2)}` : 'missing';
    const rows = [];
    rows.push(['mode', String(db.get('mode', config.mode))]);
    rows.push(['prefix', String(db.get('prefix', config.prefix))]);
    rows.push(['owner', mask((config.ownerNumbers || [])[0])]);
    rows.push(['session dir', fs.existsSync(config.sessionDir) ? 'ready' : 'not created yet']);
    rows.push(['menu image', (() => { try { const p = require('../../lib/botstate').menuImage(); return /^https?:/.test(p) ? 'remote url' : fs.existsSync(path.isAbsolute(p) ? p : path.join(process.cwd(), p)) ? 'ready' : 'missing'; } catch { return 'error'; } })()]);
    rows.push(['reply format', String(db.get('replyFormat', 'default'))]);
    rows.push(['connection', sock?.user?.id ? 'logged in' : 'unknown']);
    return reply(ui.card({ icon: '✓', title: 'Health check', subtitle: 'no secrets shown', rows }));
  },
};
