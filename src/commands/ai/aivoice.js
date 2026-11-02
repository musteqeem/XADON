/** XADON V9 · aivoice — ask AI, get the answer as a voice note. */
module.exports = {
  name: 'aivoice',
  alias: ['aivn', 'askvoice', 'voicereply'],
  desc: 'AI answer delivered as voice note',
  usage: '.aivoice <question>  |  .aivoice fr | <question>',
  category: 'ai',
  async run({ sock, m, text, reply, ui, prefix }) {
    const { ask } = require('../../lib/ai');
    let lang = 'en';
    let q = (text || m.quoted?.body || '').trim();
    if (q.includes('|')) { const p = q.split('|'); if (p[0].trim().length <= 5) { lang = p[0].trim() || 'en'; q = p.slice(1).join('|').trim(); } }
    if (!q) return reply(ui.notice('info', 'AI voice', `Usage: ${prefix}aivoice what is photosynthesis?\nOr: ${prefix}aivoice fr | tell me a joke`));
    try { await sock.sendPresenceUpdate('recording', m.chat).catch(() => {}); } catch {}
    let answer;
    try {
      ({ answer } = await ask(m.chat, q));
    } catch (e) {
      return reply(ui.notice('error', 'AI offline', String(e.message || e).slice(0, 200)));
    }
    const short = String(answer).slice(0, 180);
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(short)}`;
      await sock.sendMessage(m.chat, { audio: { url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: m.raw });
      if (String(answer).length > 185) {
        await sock.sendMessage(m.chat, { text: `${String(answer).slice(0, 1500)}\n\n${ui.footer()}` }, { quoted: m.raw });
      }
    } catch {
      await sock.sendMessage(m.chat, { text: `${answer}\n\n${ui.footer()}` }, { quoted: m.raw });
    }
  },
};
