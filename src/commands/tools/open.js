/** XADON V3 · open — in-app website button (nativeFlow url). */
const { sendOpenLink } = require('../../lib/rich');
module.exports = {
  name: 'open', alias: ['view', 'website', 'url'], desc: 'Open a website in-app', usage: '.open https://youtube.com | Watch', category: 'tools',
  async run({ sock, m, args, reply, prefix }) {
    let full = (args.join(' ') || '').trim();
    if (!full && m.quoted && /conversation|extendedTextMessage/.test(m.quoted.type || '')) full = (m.quoted.body || '').trim();
    if (!full) return reply(`╭─❍ *WEBSITE BUTTON*\n│\n│ ⚉ *Usage:* ${prefix}open <link> | <button text>\n│ ✪ *Example:* ${prefix}open https://youtube.com | Watch\n│ 🌐 *Opens in WhatsApp's in-app browser*\n╰──────────────────`);
    const parts = full.split('|').map((s) => s.trim());
    const url = parts[0] || ''; const label = (parts[1] || '☁︎ Open Link').slice(0, 40);
    if (!url) return reply('Add a link first.');
    await sock.sendMessage(m.chat, { react: { text: '🌐', key: m.key } }).catch(() => {});
    await sendOpenLink(sock, m.chat, { url, label, quoted: m.raw });
    await sock.sendMessage(m.chat, { react: { text: '🥏', key: m.key } }).catch(() => {});
  },
};
