/** XADON V3 · tovideo — audio/sticker → video container note. */
module.exports = { name: 'tovideo', alias: ['tomp4'], desc: 'Send audio as video note', usage: '.tovideo (reply audio)', category: 'media',
  async run({ sock, m, reply, ui }) {
    const q = m.quoted;
    if (!q?.isMedia) return reply(ui.notice('info', 'To video', 'Reply to an audio/video with .tovideo'));
    try {
      const buf = await q.download();
      if (/audio/.test(q.type || '')) return sock.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg', ptt: true }, { quoted: m.raw });
      return sock.sendMessage(m.chat, { video: buf, caption: '_*亗 Converted*_ ' }, { quoted: m.raw });
    } catch (e) { return reply(ui.notice('error', 'Convert failed', e.message)); }
  } };
