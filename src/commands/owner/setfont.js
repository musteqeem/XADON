/** XADON V6 · setfont — 100 unicode fonts, applied GLOBALLY + INSTANTLY (no restart).
 * Every bot reply (menus, notices, guard warnings) is re-styled through the
 * premium power-layer the moment you set it. .setfont list shows live previews. */
const botstate = require('../../lib/botstate');
const fonts = require('../../lib/fonts');

const PER_PAGE = 15;
module.exports = {
  name: 'setfont', alias: ['menufont', 'fonts', 'font'], desc: 'Change bot font style (100 fonts, instant)', usage: '.setfont mono | .setfont list [page] | .setfont random | .setfont plain', category: 'owner', owner: true,
  async run({ sock, m, text, reply, ui }) {
    const arg = (text || '').trim();
    const [first, second] = arg.toLowerCase().split(/\s+/);

    if (!first || first === 'list' || first === 'all') {
      const page = Math.max(1, parseInt(first === 'list' || first === 'all' ? second : second, 10) || 1);
      const pages = Math.ceil(fonts.FONTS.length / PER_PAGE);
      const p = Math.min(page, pages);
      const slice = fonts.FONTS.slice((p - 1) * PER_PAGE, p * PER_PAGE);
      const body = slice.map((f) => `• ${f} → ${fonts.get(f)('Xadon Ai 123')}`).join('\n')
        + `\n\npage ${p}/${pages} · total ${fonts.FONTS.length} fonts\nUsage: .setfont list ${p < pages ? p + 1 : 1} · set with .setfont <name>`;
      return sock.sendMessage(m.chat, {
        text: ui.card({ icon: '✐', title: 'Fonts (100)', subtitle: `current: ${botstate.botFont()}`, rows: [], body }),
        noTransform: true,
      }, { quoted: m.raw });
    }

    let name = first;
    if (first === 'random' || first === 'shuffle') {
      name = fonts.FONTS[Math.floor(Math.random() * fonts.FONTS.length)];
    }
    if (!fonts.get(name)) {
      const guess = fonts.FONTS.filter((f) => f.includes(first)).slice(0, 10);
      return reply(ui.notice('error', 'Unknown font', `Try .setfont list — e.g. .setfont mono, .setfont star, .setfont crown${guess.length ? `\nDid you mean: ${guess.join(', ')}` : ''}`));
    }
    botstate.setMany({ BOT_FONT: name });
    try { require('../../config').botFont = name; } catch {}
    return reply(ui.notice('success', 'Font updated', `Every bot reply is now styled with ${name}\nPreview: ${fonts.get(name)('Xadon Ai is online')}\nNo restart needed · saved permanently`));
  },
};
