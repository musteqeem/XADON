// XADON AI · filter — photo filters (sharp): gray | invert | flip | flop | rotate.
let sharp;
try { sharp = require('sharp'); } catch {}
module.exports = {
  name: 'filter',
  alias: ['imgfilter', 'photoedit'],
  desc: 'Apply a filter to a photo',
  usage: 'reply to an image with .filter gray|invert|flip|flop|rotate',
  category: 'extra',
  async run({ sock, m, args, reply, ui, fail }) {
    const f = String(args[0] || 'gray').toLowerCase();
    if (!['gray', 'grey', 'invert', 'flip', 'flop', 'rotate'].includes(f)) return fail('Which filter?', 'Pick: gray, invert, flip, flop, rotate.');
    const src = m.type === 'imageMessage' ? m : m.quoted?.type === 'imageMessage' ? m.quoted : null;
    if (!src) return fail('Reply to an image', 'Reply to a photo with .filter gray.');
    if (!sharp) return fail('No image engine', 'Ask the owner to run: npm install sharp');
    try {
      const input = await src.download();
      let img = sharp(input);
      if (f === 'gray' || f === 'grey') img = img.grayscale();
      else if (f === 'invert') img = img.negate();
      else if (f === 'flip') img = img.flip();
      else if (f === 'flop') img = img.flop();
      else img = img.rotate(90);
      const out = await img.jpeg({ quality: 85 }).toBuffer();
      await sock.sendMessage(m.chat, { image: out, caption: `${ui.fonts.bold('FILTER')}  ${f}\n\n${ui.footer()}` }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Filter failed', 'Could not process that image.')); }
  },
};
