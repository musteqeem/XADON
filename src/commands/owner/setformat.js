// XADON V7 · setformat — 4 reply formats: default | mono | media | rich
const fmt = require('../../lib/format');
module.exports = {
  name: 'setformat', alias: ['format', 'replyformat'], desc: 'Switch bot reply format (default/mono/media/rich)', usage: '.setformat mono | .setformat list', category: 'owner', owner: true,
  async run({ text, reply, ui }) {
    const t = (text || '').trim().toLowerCase();
    if (!t || t === 'list') {
      return reply(ui.card({ icon: '◈', title: 'Reply formats (4)', subtitle: `current: ${fmt.getFormat()}`, rows: fmt.FORMATS.map((f) => [f, f === fmt.getFormat() ? '● active' : '○']), body: 'default = classic premium style\nmono = ```mono block``` replies\nmedia = reply picture + caption on EVERY reply\nrich = Meta-style rich messages\n\nUsage: .setformat mono' }));
    }
    const f = fmt.setFormat(t);
    if (!f) return reply(ui.notice('error', 'Unknown format', 'Pick: default, mono, media, rich'));
    return reply(ui.notice('success', 'Reply format updated', `Every bot reply now uses ${f} format.\n${f === 'media' ? 'Set the picture with .setreplypic' : f === 'mono' ? 'Example:\n```\n✓ ANTILINK ENABLED\n```' : 'No restart needed.'}`));
  },
};
