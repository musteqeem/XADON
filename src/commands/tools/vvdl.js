/** XADON V9 · vvdl — re-post view-once media right here in this chat. */
const { downloadMediaMessage } = require('@musteqeem/baileys');
module.exports = {
  name: 'vvdl',
  alias: ['vvhere', 'unonce'],
  desc: 'Re-post view-once media in this chat',
  usage: '.vvdl (reply to a view-once message)',
  category: 'tools',
  owner: true,
  async run({ sock, m, reply, ui }) {
    const rawstore = require('../../lib/rawstore');
    const q = m.quoted;
    const target = q || (m.isMedia ? m : null);
    if (!target) return reply(ui.notice('info', 'View-once here', 'Reply to a view-once message with .vvdl to re-post it here as normal media.'));
    try {
      const raw = (q && rawstore.get(m.chat, q.id)) || target.raw || m.raw;
      const buf = await downloadMediaMessage(raw, 'buffer', {});
      const t = target.type || '';
      const payload =
        t.includes('image') ? { image: buf, caption: ui.footer() } :
        t.includes('video') ? { video: buf, caption: ui.footer(), gifPlayback: !!target.message?.videoMessage?.gifPlayback } :
        t.includes('audio') ? { audio: buf, mimetype: 'audio/ogg; codecs=opus' } :
        t.includes('sticker') ? { sticker: buf } :
        { document: buf, mimetype: 'application/octet-stream', fileName: 'media' };
      await sock.sendMessage(m.chat, payload, { quoted: m.raw });
    } catch (e) {
      return reply(ui.notice('error', 'Failed', `${String(e.message || e).slice(0, 250)}\nExpired view-once media cannot be recovered.`));
    }
  },
};
