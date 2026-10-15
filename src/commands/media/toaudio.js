/** XADON V3 · toaudio — video → audio note (re-send as audio). */
module.exports = { name: 'toaudio', alias: ['tomp3', 'video2audio'], desc: 'Convert video to audio', usage: '.toaudio (reply video)', category: 'media',
  async run({ sock, m, reply, ui }) {
    const q = m.quoted;
    if (!q?.isMedia || !/video/.test(q.type || '')) return reply(ui.notice('info', 'To audio', 'Reply to a video with .toaudio'));
    try {
      const buf = await q.download();
      return sock.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg', ptt: false }, { quoted: m.raw });
    } catch (e) { return reply(ui.notice('error', 'Convert failed', e.message)); }
  } };
