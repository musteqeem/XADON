/** XADON V9 · askmeta — ask Meta AI (tags it so it answers in groups). */
const { META_JID } = require('./addmeta');
module.exports = {
  name: 'askmeta',
  alias: ['metaa', 'metaq', 'metatag'],
  desc: 'Ask Meta AI by tagging it',
  usage: '.askmeta <question>',
  category: 'xadon9',
  async run({ sock, m, text, reply, ui, prefix }) {
    const q = (text || m.quoted?.body || '').trim();
    if (!q) return reply(ui.notice('info', 'Ask Meta', `Usage: ${prefix}askmeta what is the capital of France?\nIf Meta AI is not here yet, an admin should run ${prefix}addmeta first.`));
    try {
      await sock.sendMessage(m.chat, { text: `${q.slice(0, 1500)}`, mentions: [META_JID] }, { quoted: m.raw });
    } catch (e) {
      return reply(ui.notice('error', 'Ask failed', String(e.message || e).slice(0, 200)));
    }
  },
};
