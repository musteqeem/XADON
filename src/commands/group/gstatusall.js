// XADON · gstatusall — broadcast a status to every group the bot is in. Supports media replies.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'gstatusall', alias: ['gsall', 'gsbroadcast'], desc: 'Broadcast status to all groups (text or reply media)', usage: '.gstatusall <text> [--bg=red]  ·  reply to image/video/audio with .gstatusall [caption]', category: 'group', group: true, admin: true,
  async run({ sock, m, text, reply, ui }) {
    try {
      let body = (text || '').replace(/--bg=[^\s]+/gi, '').trim();
      const bgMatch = (text || '').match(/--bg=([^\s]+)/i);
      const bg = bgMatch ? bgMatch[1] : null;
      const q = m.quoted;
      // MEDIA MODE: reply to image/video/audio
      if (q?.isMedia) {
        let buf;
        try { buf = await q.download(); }
        catch (e) { return reply(ui.notice('error', 'Media failed', 'Could not download the replied media: ' + String(e.message || e).slice(0, 150))); }
        const cap = body || q.body || '';
        const payload =
          q.type === 'imageMessage' ? { image: buf, caption: cap } :
          q.type === 'videoMessage' ? { video: buf, caption: cap } :
          q.type === 'audioMessage' ? { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: !!q.message?.audioMessage?.ptt } :
          q.type === 'stickerMessage' ? { sticker: buf } :
          q.type === 'documentMessage' ? { document: buf, mimetype: q.message?.documentMessage?.mimetype || 'application/octet-stream', fileName: q.message?.documentMessage?.fileName || 'status.bin', caption: cap } :
          null;
        if (!payload) return reply(ui.notice('error', 'Media failed', 'That media type cannot be posted as a status.'));
        const groups = await sock.groupFetchAllParticipating().catch(() => ({}));
        const ids = Object.keys(groups || {});
        if (!ids.length) return reply(ui.notice('error', 'No groups', 'The bot is not in any group.'));
        let ok = 0, no = 0;
        for (const gid of ids) {
          try { await fx.sendGroupStatus(sock, gid, payload, bg ? { backgroundColor: bg } : {}); ok++; }
          catch { no++; }
          await new Promise((r) => setTimeout(r, 600));
        }
        return reply(ui.notice('success', 'Broadcast done', `Media status posted in ${ok} group(s)${no ? `, ${no} failed` : ''}.`));
      }
      // TEXT MODE
      if (!body && q?.body) body = q.body;
      if (!body) return reply(ui.notice('info', 'Broadcast status', 'Usage: .gstatusall hello everyone\nOr reply to media with .gstatusall [caption]'));
      const groups = await sock.groupFetchAllParticipating().catch(() => ({}));
      const ids = Object.keys(groups || {});
      if (!ids.length) return reply(ui.notice('error', 'No groups', 'The bot is not in any group.'));
      let ok = 0, no = 0;
      for (const gid of ids) {
        try { await fx.sendGroupStatus(sock, gid, { text: body.slice(0, 1000) }, bg ? { backgroundColor: bg } : {}); ok++; } catch { no++; }
        await new Promise((r) => setTimeout(r, 600));
      }
      return reply(ui.notice('success', 'Broadcast done', `Posted in ${ok} group(s)${no ? `, ${no} failed` : ''}.`));
    } catch (e) { return reply(ui.notice('error', 'Broadcast failed', String(e.message || e).slice(0, 200))); }
  },
};
