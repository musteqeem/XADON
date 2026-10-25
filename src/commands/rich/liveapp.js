// XADON V7 · liveapp - quick poll mini app (WA-in-WA mini app).
const fx = require('../../lib/premium-fx');
const APP_HTML = '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Helvetica,Arial;color:#e9edef;background:#0b141a;font-size:13px}.wrap{max-width:400px;margin:auto;padding:10px}.card{background:#111b21;border:1px solid #222d34;border-radius:12px;padding:16px}h1{font-size:17px;margin-bottom:6px}p{color:#8696a0;font-size:12px;margin:4px 0}.row{display:flex;gap:8px;margin-top:10px}.btn{flex:1;text-align:center;background:#00a884;color:#06281f;font-weight:700;border-radius:8px;padding:10px;font-size:13px}</style><div class="wrap"><div class="card"><h1>QUICK POLL</h1><p>Best time for movie night?</p><div class="row"><div class="btn">Friday</div><div class="btn">Saturday</div></div><div class="row"><div class="btn">Sunday</div></div></div></div>';
module.exports = {
  name: 'liveapp', alias: ['pollapp', 'voteapp'], desc: 'Quick poll mini app', usage: '.liveapp', category: 'rich',
  async run({ sock, m, reply, ui }) {
    try {
      await fx.webApp(sock, m.chat, APP_HTML, { quoted: m.raw });
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {});
    } catch (e) { return reply(ui.notice('error', 'Mini app failed', 'This Baileys runtime cannot render in-chat apps. ' + String(e.message || e).slice(0, 150))); }
  },
};
