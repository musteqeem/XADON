// XADON V7 · gsmedia — media-only group status with caption + color.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'gsmedia', alias: ['gsimage', 'gsvideo'], desc: 'Post media as group status', usage: 'reply to image/video/audio with .gsmedia [caption]', category: 'group', group: true, admin: true,
  async run({ sock, m, text, reply, ui }) {
    try {
      const q = m.quoted;
      if (!q?.isMedia) return reply(ui.notice('info', 'Media status', 'Reply to an image, video or audio with .gsmedia [caption]'));
      const buf = await q.download();
      const cap = (text || '').trim() || q.body || '';
      const payload = q.type === 'imageMessage' ? { image: buf, caption: cap } : q.type === 'videoMessage' ? { video: buf, caption: cap } : { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: !!q.message?.audioMessage?.ptt };
      await fx.sendGroupStatus(sock, m.chat, payload, {});
      return reply(ui.notice('success', 'Status posted', 'Media status is live.'));
    } catch (e) { return reply(ui.notice('error', 'Status failed', 'This runtime cannot publish group statuses. ' + String(e.message || e).slice(0, 150))); }
  },
};
