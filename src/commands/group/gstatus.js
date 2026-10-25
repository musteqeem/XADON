// XADON V7 · gstatus — post a group status (text or reply media, --bg=color).
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'gstatus', alias: ['groupstatus', 'gs'], desc: 'Post a status to this group', usage: '.gstatus <text> [--bg=red] | reply media', category: 'group', group: true, admin: true,
  async run({ sock, m, text, reply, ui }) {
    try {
      let body = text || '';
      const bg = (body.match(/--bg=([^\s]+)/i) || [])[1];
      body = body.replace(/--bg=[^\s]+/gi, '').trim();
      const q = m.quoted;
      if (q?.isMedia) {
        try {
          const buf = await q.download();
          const cap = body || q.body || '';
          const payload = q.type === 'imageMessage' ? { image: buf, caption: cap } : q.type === 'videoMessage' ? { video: buf, caption: cap } : q.type === 'audioMessage' ? { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: !!q.message?.audioMessage?.ptt } : { document: buf, mimetype: 'application/octet-stream', fileName: 'status.bin', caption: cap };
          await fx.sendGroupStatus(sock, m.chat, payload, bg ? { backgroundColor: bg } : {});
          return reply(ui.notice('success', 'Status posted', 'Media status is live.'));
        } catch {}
      }
      if (!body && q?.body) body = q.body;
      if (!body) return reply(ui.notice('info', 'Group status', 'Usage: .gstatus hello world --bg=red\nOr reply to media with .gstatus [caption]'));
      await fx.sendGroupStatus(sock, m.chat, { text: body.slice(0, 1000) }, bg ? { backgroundColor: bg } : {});
      return reply(ui.notice('success', 'Status posted', 'Text status is live.'));
    } catch (e) { return reply(ui.notice('error', 'Status failed', 'This runtime cannot publish group statuses. ' + String(e.message || e).slice(0, 150))); }
  },
};
