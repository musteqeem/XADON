// XADON V12 · quoted — recover the quoted message WITH its media.
// Order: receive-time snapshot (survives deletion) → live download → text cache.
// Usage: reply to a message with .quoted
const store = require('../../lib/msgstore');
const cache = require('../../lib/mediacache');
module.exports = {
  name: 'quoted',
  alias: ['quoteinfo', 'qmsg', 'getquoted'],
  desc: 'Recover the quoted message (+media)',
  usage: 'reply to a message with .quoted',
  category: 'tools',
  async run({ sock, m, reply, ui, fail }) {
    const q = m.quoted;
    if (!q) return fail('Reply to a message', 'Reply to any message with .quoted to recover what it quoted.');
    const sender = q.sender ? '@' + String(q.sender).split('@')[0].split(':')[0] : 'unknown';
    const snap = cache.get(m.chat, q.id);
    const rows = [
      ['from', sender],
      ['type', q.type || 'text'],
      ['id', String(q.id || '').slice(0, 24) || '-'],
      ['media', q.isMedia ? 'yes' : 'no'],
      ['snapshot', snap ? 'recovered 📎' : 'none'],
    ];
    const body = (q.body || '').slice(0, 1500) || (q.isMedia ? '[media — resending below]' : '[no text]');
    await reply(ui.card({ icon: '❝', title: 'Quoted message', subtitle: 'recovered from your reply', rows, body }));
    if (!q.isMedia && !snap) return;
    // 1) snapshot first (works even when the original was deleted)
    const payload = cache.toPayload(snap);
    if (payload) {
      try {
        if (payload.image || payload.video) {
          await sock.sendMessage(m.chat, { ...payload, caption: `${body.slice(0, 500)}` }, { quoted: m.raw });
        } else {
          await sock.sendMessage(m.chat, payload, { quoted: m.raw });
        }
        return;
      } catch {}
    }
    // 2) live download fallback
    if (q.isMedia) {
      try {
        const buf = await q.download();
        const kind = q.type === 'imageMessage' ? 'image' : q.type === 'videoMessage' ? 'video' : q.type === 'audioMessage' ? 'audio' : q.type === 'stickerMessage' ? 'sticker' : 'document';
        const media = kind === 'image' ? { image: buf, caption: body.slice(0, 500) }
          : kind === 'video' ? { video: buf, caption: body.slice(0, 500) }
          : kind === 'audio' ? { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true }
          : kind === 'sticker' ? { sticker: buf }
          : { document: buf, mimetype: 'application/octet-stream', fileName: 'quoted.bin' };
        await sock.sendMessage(m.chat, media, { quoted: m.raw });
        return;
      } catch {}
    }
    // 3) text cache last resort
    try {
      const hit = store.findById(m.chat, q.id);
      if (hit?.body) await reply(ui.card({ icon: '❝', title: 'Cached copy', rows: [], body: hit.body.slice(0, 1500) }));
    } catch {}
  },
};
