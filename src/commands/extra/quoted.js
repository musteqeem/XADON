// XADON AI · quoted — recover the message your reply quotes (even view-once / deleted attempts).
const store = require('../../lib/msgstore');
module.exports = {
  name: 'quoted',
  alias: ['quoteinfo', 'qmsg', 'getquoted'],
  desc: 'Recover the quoted message',
  usage: 'reply to a message with .quoted',
  category: 'extra',
  async run({ sock, m, reply, ui, fail }) {
    const q = m.quoted;
    if (!q) return fail('Reply to a message', 'Reply to any message with .quoted to recover what it quoted.');
    const sender = q.sender ? '@' + String(q.sender).split('@')[0].split(':')[0] : 'unknown';
    const rows = [
      ['from', sender],
      ['type', q.type || 'text'],
      ['id', String(q.id || '').slice(0, 24) || '-'],
      ['media', q.isMedia ? 'yes' : 'no'],
    ];
    const body = (q.body || '').slice(0, 1500) || (q.isMedia ? '[media — resending below]' : '[no text]');
    await reply(ui.card({ icon: '\u275D', title: 'Quoted message', subtitle: `recovered from your reply`, rows, body }));
    // try resend quoted media (view-once reveal included)
    if (q.isMedia) {
      try {
        const buf = await q.download();
        const kind = q.type === 'imageMessage' ? 'image' : q.type === 'videoMessage' ? 'video' : q.type === 'audioMessage' ? 'audio' : 'document';
        const payload = kind === 'image' ? { image: buf, caption: body.slice(0, 500) }
          : kind === 'video' ? { video: buf, caption: body.slice(0, 500) }
          : kind === 'audio' ? { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true }
          : { document: buf, mimetype: 'application/octet-stream', fileName: 'quoted.bin' };
        await sock.sendMessage(m.chat, payload, { quoted: m.raw });
      } catch {
        // fallback: look in msgstore cache
        try {
          const hit = store.findById(m.chat, q.id);
          if (hit?.body) await reply(ui.card({ icon: '\u275D', title: 'Cached copy', rows: [], body: hit.body.slice(0, 1500) }));
        } catch {}
      }
    }
  },
};
