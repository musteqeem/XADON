// XADON V8 · setformat — 8 reply formats: default | mono | media | rich | color | html | a2ui | ads
const fmt = require('../../lib/format');
const DESC = {
  default: 'classic premium card/unicode style',
  mono: 'everything in a ```mono block```',
  media: 'reply picture + caption on EVERY reply (.setreplypic)',
  rich: 'Meta-style rich message (markdown/table/code)',
  color: 'coloured GenAI label card (green/white)',
  html: 'WA-in-WA HTML view card',
  a2ui: 'A2UI interactive app card',
  ads: 'fixed External Ad Reply card (thumbnail + link)',
};
module.exports = {
  name: 'setformat', alias: ['format', 'replyformat'], desc: 'Switch bot reply format (8 formats)', usage: '.setformat color | .setformat list', category: 'owner', owner: true,
  async run({ text, reply, ui }) {
    const t = (text || '').trim().toLowerCase();
    if (!t || t === 'list') {
      return reply(ui.card({ icon: '◈', title: 'Reply formats (8)', subtitle: `current: ${fmt.getFormat()}`, rows: fmt.FORMATS.map((f) => [f, `${f === fmt.getFormat() ? '● active' : '○'} — ${DESC[f] || ''}`]), body: 'Usage: .setformat color\nMedia/Ads thumbnail: .setreplypic <url | reply image>' }));
    }
    const f = fmt.setFormat(t);
    if (!f) return reply(ui.notice('error', 'Unknown format', 'Pick: default, mono, media, rich, color, html, a2ui, ads'));
    return reply(ui.notice('success', 'Reply format updated', `Every bot reply now uses ${f} format (${DESC[f]}).\n${f === 'media' || f === 'ads' ? 'Set the picture with .setreplypic' : 'No restart needed.'}`));
  },
};
