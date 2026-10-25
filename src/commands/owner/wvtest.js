// XADON V7 · wvtest — in-chat mini-app signal test (rich webview).
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'wvtest', alias: ['apptest', 'signalapp'], desc: 'In-chat mini-app test', usage: '.wvtest', category: 'owner', owner: true,
  async run({ sock, m, reply, ui }) {
    const html = '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Helvetica,Arial;color:#e9edef;background:#0b141a;font-size:13px}.wrap{max-width:400px;margin:auto;padding:10px}.card{background:#111b21;border:1px solid #00a884;border-radius:12px;padding:18px;text-align:center}h1{font-size:18px;margin-bottom:6px}p{color:#8696a0;font-size:12px}.dot{width:14px;height:14px;border-radius:50%;background:#00a884;margin:10px auto}</style><div class="wrap"><div class="card"><h1>SIGNAL TEST</h1><div class="dot"></div><p>Rich webview is live.</p></div></div>';
    try {
      await fx.webApp(sock, m.chat, html, { quoted: m.raw });
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {});
    } catch (e) { return reply(ui.notice('error', 'Webview failed', 'This runtime cannot render in-chat apps. ' + String(e.message || e).slice(0, 150))); }
  },
};
