/** XADON TTS — Google Translate voice, no key. */
module.exports = {
  name: 'tts',
  alias: ['voice', 'speak', 'say'],
  desc: 'Turn text into voice note',
  usage: '.tts en | hello world',
  async run({ sock, m, text, reply, ui, prefix }) {
    const { fonts } = ui;
    let lang = 'en';
    let query = text;
    if (text.includes('|')) { const p = text.split('|'); lang = (p[0].trim() || 'en').slice(0, 5); query = p.slice(1).join('|').trim(); }
    if (!query) query = m.quoted?.body || '';
    if (!query) return reply(ui.notice('info', 'Voice', `${fonts.mono(`${prefix}tts en | hello everyone`)}`));
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(query.slice(0, 180))}`;
    await sock.sendMessage(m.chat, { audio: { url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: m.raw });
  },
};
