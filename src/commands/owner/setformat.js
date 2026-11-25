// XADON V13 · setformat — 25 reply formats + canvas styles (normal | hacker) + animated.
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
  raw: 'RAW text only — no UI, no footer, no branding (adults/simple)',
  clean: 'unicode dividers only ─── (no cards, no spam)',
  elder: 'ELDER mode — plain, spaced, easy to read',
  retro: 'old-school ASCII [ BOT ] text (works everywhere)',
  neon: 'neon glow frame (premium)',
  glass: 'frosted glass card',
  minimal: 'plain text, zero styling',
  gold: 'gold royal frame',
  ocean: 'ocean wave frame',
  royal: 'royal crown frame',
  candy: 'soft candy frame',
  ghost: 'faint ghost signature',
  veil: 'veiled divider card',
  xadon: 'XADON group-closed frame UI',
  canvas: 'animated canvas image card — styles: normal | hacker',
  animated: 'ANIMATION — canvas image plays a loading edit-animation, then the reply lands as its caption',
  pulse: 'pulse header card',
};
module.exports = {
  name: 'setformat', alias: ['format', 'replyformat'], desc: 'Switch bot reply format (25 formats + canvas styles)', usage: '.setformat animated | .setformat canvas hacker | .setformat list', category: 'owner', owner: true,
  async run({ text, reply, ui }) {
    const t = (text || '').trim().toLowerCase();
    if (!t || t === 'list') {
      const cur = fmt.getFormat();
      const rows = fmt.FORMATS.map((f) => {
        let d = `${f === cur ? '● active' : '○'} — ${DESC[f] || ''}`;
        if (f === 'canvas') d += ` (current style: ${fmt.getCanvasStyle()})`;
        return [f, d];
      });
      return reply(ui.card({ icon: '◈', title: `Reply formats (${fmt.FORMATS.length})`, subtitle: `current: ${cur}${cur === 'canvas' ? ' · ' + fmt.getCanvasStyle() : ''}`, rows, body: 'Usage: .setformat raw\n.setformat animated  (canvas loading animation, reply as caption)\n.setformat canvas normal  (colour gradient card)\n.setformat canvas hacker  (matrix terminal card)\nMedia/Ads thumbnail: .setreplypic <url | reply image>' }));
    }
    const parts = t.split(/\s+/);
    // canvas style picker: ".setformat canvas hacker" / ".setformat canvas normal"
    if (parts[0] === 'canvas' && parts[1]) {
      const st = fmt.setCanvasStyle(parts[1]);
      if (!st) return reply(ui.notice('error', 'Unknown canvas style', 'Pick: ' + fmt.CANVAS_STYLES.join(', ') + '\nExample: .setformat canvas hacker'));
      fmt.setFormat('canvas');
      return reply(ui.notice('success', 'Canvas style updated', `Every bot reply is now a ${st === 'hacker' ? 'green-on-black MATRIX terminal' : 'colour gradient'} image card.\nSwitch back: .setformat canvas ${st === 'hacker' ? 'normal' : 'hacker'}`));
    }
    const f = fmt.setFormat(parts[0]);
    if (!f) return reply(ui.notice('error', 'Unknown format', 'Pick: ' + fmt.FORMATS.join(', ') + '\nCanvas styles: .setformat canvas hacker'));
    const extra = f === 'canvas' ? `\nCanvas style: ${fmt.getCanvasStyle()} (change: .setformat canvas hacker)` : '';
    return reply(ui.notice('success', 'Reply format updated', `Every bot reply now uses ${f} format (${DESC[f]}).${extra}\n${f === 'media' || f === 'ads' ? 'Set the picture with .setreplypic' : 'No restart needed.'}`));
  },
};
