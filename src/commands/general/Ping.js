/** XADON V7 · ping — short editing mode, no delete */
const fmt = require('../../lib/format');

module.exports = {
  name: 'ping',
  alias: ['speed', 'p'],
  desc: 'Check bot speed',
  async run({ sock, m, prefix }) {
    const start = Date.now();

    // 1. Send placeholder
    const sent = await sock.sendMessage(m.chat, { text: '*_֎ Pinging..._*' });

    const ms = Date.now() - start;
    let out = `*_֎ Pong! ${ms}mS_*`;

    // 2. Keep .setreply ping custom if user set one
    try {
      const custom = fmt.getCustom('ping');
      if (custom) out = fmt.fillVars(custom, { m, prefix }).replace(/\{text\}/gi, out).replace(/\{ms\}/gi, ms);
    } catch {}

    // 3. EDIT same message - NOT delete, NOT new message
    await sock.sendMessage(m.chat, {
      text: out,
      edit: sent.key
    }).catch(async () => {
      // Fallback for old Baileys if edit fails
      await sock.sendMessage(m.chat, { text: out }, { quoted: m.raw }).catch(() => {});
    });
  },
};