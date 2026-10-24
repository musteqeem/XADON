// XADON AI · fliptext (imported format).
module.exports = {
  name: 'fliptext',
  aliases: ['upside', 'upsidedown'],
  description: 'Upside-down text',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui } = extra;
    const t = args.join(' ').trim();
    if (!t) return reply(ui.notice('info', 'Flip text', 'Usage: .fliptext hello world'));
    const map = { a: '\u0250', b: 'q', c: '\u0254', d: 'p', e: '\u01DD', f: '\u025F', g: '\u0183', h: '\u0265', i: '\u0131', j: '\u027E', k: '\u029E', l: 'l', m: '\u026F', n: 'u', o: 'o', p: 'd', q: 'b', r: '\u0279', s: 's', t: '\u0287', u: 'n', v: '\u028C', w: '\u028D', x: 'x', y: '\u028E', z: 'z', '.': '\u02D9', ',': "'", '?': '\u00BF', '!': '\u00A1' };
    const out = [...t.toLowerCase()].reverse().map((c) => map[c] || c).join('');
    return reply(ui.card({ icon: '\u25A3', title: 'Flipped', rows: [], body: out.slice(0, 500) }));
  },
};
