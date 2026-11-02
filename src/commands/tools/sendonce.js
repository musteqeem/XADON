/** XADON V9 · sendonce — send any photo/video/voice as view-once. */
module.exports = {
  name: 'sendonce',
  alias: ['oncesend', 'onesend'],
  desc: 'Resend quoted media as view-once',
  usage: '.sendonce (reply to photo/video/audio)',
  category: 'tools',
  async run({ sock, m, reply, ui }) {
    const target = m.quoted?.isMedia ? m.quoted : m.isMedia ? m : null;
    if (!target) return reply(ui.notice('info', 'View-once sender', 'Reply to a photo, video or voice note with .sendonce'));
    try {
      const buf = await target.download();
      const t = target.type || '';
      const payload =
        t.includes('image') ? { image: buf, caption: m.quoted?.body || '', viewOnce: true } :
        t.includes('video') ? { video: buf, caption: m.quoted?.body || '', viewOnce: true } :
        t.includes('audio') ? { audio: buf, mimetype: 'audio/ogg; codecs=opus', viewOnce: true } :
        null;
      if (!payload) return reply(ui.notice('warn', 'Not supported', 'Only photos, videos and voice notes can be sent as view-once.'));
      await sock.sendMessage(m.chat, payload, { quoted: m.raw });
    } catch (e) {
      return reply(ui.notice('error', 'Failed', String(e.message || e).slice(0, 200)));
    }
  },
};
