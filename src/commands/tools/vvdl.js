/** XADON · vvdl — re-post view-once media right here (fixed media-key path). */
module.exports = {
  name: 'vvdl',
  alias: ['vvhere', 'unonce'],
  desc: 'Re-post view-once media in this chat',
  usage: '.vvdl (reply to a view-once message)',
  category: 'tools',
  owner: true,
  async run({ sock, m, reply, ui }) {
    const q = m.quoted;
    const target = q || (m.isMedia ? m : null);
    if (!target) return reply(ui.notice('info', 'View-once here', 'Reply to a view-once message with .vvdl to re-post it here as normal media.'));
    let buf, kind = target.type || '';
    try {
      const { downloadViewOnce } = require('../../lib/viewonce');
      const res = await downloadViewOnce(sock, m);
      buf = res.buf; kind = res.kind;
    } catch (e) {
      // fallback: direct raw download (old path)
      try {
        const { downloadMediaMessage } = require('@musteqeem/baileys');
        const rawstore = require('../../lib/rawstore');
        const raw = (q && rawstore.get(m.chat, q.id)) || target.raw || m.raw;
        buf = await downloadMediaMessage(raw, 'buffer', {});
      } catch (e2) {
        return reply(ui.notice('error', 'Failed', `${String(e.message || e2.message || e2).slice(0, 250)}\nExpired view-once media cannot be recovered.`));
      }
    }
    try {
      const t = String(kind || '');
      const payload =
        t.includes('image') ? { image: buf, caption: ui.footer() } :
        t.includes('video') ? { video: buf, caption: ui.footer(), gifPlayback: !!target.message?.videoMessage?.gifPlayback } :
        t.includes('audio') ? { audio: buf, mimetype: 'audio/ogg; codecs=opus' } :
        t.includes('sticker') ? { sticker: buf } :
        { document: buf, mimetype: 'application/octet-stream', fileName: 'media' };
      await sock.sendMessage(m.chat, payload, { quoted: m.raw });
    } catch (e) {
      return reply(ui.notice('error', 'Failed', String(e.message || e).slice(0, 250)));
    }
  },
};
