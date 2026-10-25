// XADON V7 · setreplypic — picture attached to ALL bot replies (media format)
const fmt = require('../../lib/format');
module.exports = {
  name: 'setreplypic', alias: ['replypic', 'setreplypicture'], desc: 'Set picture shown on all bot replies', usage: '.setreplypic <url> | reply to image | .setreplypic off', category: 'owner', owner: true,
  async run({ sock, m, args, text, reply, ui }) {
    const t = (text || '').trim();
    if (/^(off|clear|remove|default)$/i.test(t)) { fmt.clearReplyPic(); return reply(ui.notice('success', 'Reply picture removed', 'Bot replies are text-only again.')); }
    // reply-to-image / quoted image
    try {
      const q = m.quoted;
      const buf = q?.isMedia ? await q.download().catch(() => null) : null;
      if (buf) {
        if (!fmt.saveReplyPicFile(buf)) throw new Error('save failed');
        if (fmt.getFormat() !== 'media') fmt.setFormat('media');
        return reply(ui.notice('success', 'Reply picture set', 'This image now appears on EVERY bot reply (media format auto-enabled).\nChange style anytime: .setformat default'));
      }
    } catch {}
    const url = (args[0] || t).match(/https?:\/\/\S+/i)?.[0];
    if (!url) return reply(ui.notice('info', 'Set reply picture', 'Usage: .setreplypic <image-url>\nOr reply to an image with .setreplypic\nRemove: .setreplypic off'));
    try { const r = await fetch(url); if (!r.ok) throw new Error('download failed'); fmt.saveReplyPicFile(Buffer.from(await r.arrayBuffer())); } catch { fmt.setReplyPicUrl(url); }
    if (fmt.getFormat() !== 'media') fmt.setFormat('media');
    return reply(ui.notice('success', 'Reply picture set', 'This picture now appears on EVERY bot reply (media format auto-enabled).'));
  },
};
