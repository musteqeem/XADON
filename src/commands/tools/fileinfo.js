// XADON V8 · fileinfo — inspect quoted media/text (type, size, sha-256).
const crypto = require('crypto');
module.exports = {
  name: 'fileinfo', alias: ['mediainfo', 'filecheck'], desc: 'Inspect quoted media info', usage: 'Reply to media with .fileinfo', category: 'tools',
  async run({ m, text, reply, ui }) {
    const q = m.quoted;
    let buf = null, label = '';
    if (q?.isMedia) { try { buf = await q.download(); label = q.type; } catch {} }
    else if (m.isMedia) { try { buf = await m.download(); label = m.type; } catch {} }
    else if (text || q?.body) buf = Buffer.from(text || q.body || '');
    if (!buf) return reply(ui.notice('info', 'File info', 'Reply to an image/audio/video/document with .fileinfo'));
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    const kb = (buf.length / 1024).toFixed(1);
    return reply(ui.card({
      icon: '🗎', title: 'File info', subtitle: label || 'text buffer',
      rows: [['bytes', `${buf.length} (${kb} KB)`], ['sha-256', 'see body']],
      body: ui.fonts.mono(sha),
    }));
  },
};
