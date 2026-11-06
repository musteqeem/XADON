// XADON V12 · PREMIUM — savechat: export recent chat text as .txt + .zip.
// Usage: .savechat [10-100]  (default 30)
const store = require('../../lib/msgstore');
const { zipText } = require('../../lib/zipmini');
const short = (j = '') => String(j).split('@')[0].split(':')[0];
module.exports = {
  name: 'savechat',
  alias: ['chatlog', 'exportchat'],
  desc: 'Export recent messages as txt + zip',
  usage: '.savechat 30',
  group: true, category: 'group2',
  async run({ sock, m, args, reply, ui }) {
    const n = Math.min(100, Math.max(10, Number(args[0]) || 30));
    const list = store.listByChat(m.chat, n);
    if (!list.length) return reply(ui.notice('info', 'Nothing cached', 'No recent messages in my short memory yet.'));
    const when = (t) => { try { return new Date(t).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
    const lines = list.map((e) => `[${when(e.at)}] ${e.pushName || short(e.sender)} (${short(e.sender)}): ${e.body || `[${e.type}]`}`).join('\n');
    const full = `CHAT EXPORT — ${m.chat}\nCount: ${list.length} · exported ${new Date().toISOString()}\n${'='.repeat(44)}\n${lines}\n`;
    const tag = `chat-${m.chat.split('@')[0]}.txt`;
    await sock.sendMessage(m.chat, { document: Buffer.from(full, 'utf8'), mimetype: 'text/plain', fileName: tag }, { quoted: m.raw }).catch(() => {});
    await sock.sendMessage(m.chat, { document: zipText(tag, full), mimetype: 'application/zip', fileName: tag.replace(/\.txt$/, '.zip') }, { quoted: m.raw }).catch(() => {});
  },
};
