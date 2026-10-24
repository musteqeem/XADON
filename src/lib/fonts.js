/**
 * XADON V3 · FONTS — 100 unicode font styles (no images, no emoji).
 * Works everywhere in WhatsApp.
 *
 *   const fonts = require('./fonts');
 *   fonts.get('neon')('Hello')   -> styled string
 *   fonts.applyFont('crown', t)  -> protects links + @mentions, normalizes old styles first
 *   fonts.FONTS.length           -> 100
 */
const NORMAL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const build = (lower, upper, digits = '0123456789') => {
  const target = [...lower, ...upper, ...digits];
  const map = new Map([...NORMAL].map((ch, i) => [ch, target[i]]));
  return (text) => [...String(text)].map((ch) => map.get(ch) || ch).join('');
};

// ── trusted base transforms ──
const bold = build('𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇', '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭', '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵');
const serif = build('𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳', '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙', '𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗');
const italic = build('𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻', '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡');
const mono = build('𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣', '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉', '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿');
const SMALL = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ';
const smallCaps = build(SMALL, SMALL);
const spaced = (text) => [...String(text)].join(' ');
const plain = (text) => String(text);

const code = (start, i) => String.fromCodePoint(start + i);
const fullwidth = build(
  [...Array(26)].map((_, i) => code(0xff41, i)).join(''),
  [...Array(26)].map((_, i) => code(0xff21, i)).join(''),
  [...Array(10)].map((_, i) => code(0xff10, i)).join(''),
);
const circled = build(
  [...Array(26)].map((_, i) => code(0x24d0, i)).join(''),
  [...Array(26)].map((_, i) => code(0x24b6, i)).join(''),
  ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'].join(''),
);
const ring = build(
  [...Array(26)].map((_, i) => code(0x249c, i)).join(''),
  [...Array(26)].map((_, i) => code(0x24b6, i)).join(''),
  ['⓪', '⑴', '⑵', '⑶', '⑷', '⑸', '⑹', '⑺', '⑻', '⑼'].join(''),
);

const FLIP = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ',
  k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
  u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'ʐ',
  0: '0', 1: 'Ɩ', 2: 'ᄅ', 3: 'Ɛ', 4: 'ㄣ', 5: 'ϛ', 6: '9', 7: 'L', 8: '8', 9: '6',
};
const upside = (text) => [...String(text)].map((ch) => {
  const low = ch.toLowerCase();
  if (FLIP[low] !== undefined && /[a-z0-9]/i.test(ch)) return FLIP[low];
  return ch;
}).reverse().join('');

const strike = (text) => [...String(text)].map((ch) => (ch === ' ' || ch === '\n' ? ch : ch + '̶')).join('');
const under = (text) => [...String(text)].map((ch) => (ch === ' ' || ch === '\n' ? ch : ch + '̲')).join('');
const slash = (text) => [...String(text)].map((ch) => (ch === ' ' || ch === '\n' ? ch : ch + '̸')).join('');
const vapor = (text) => [...fullwidth(String(text))].join(' ');
const ghost = (text) => strike(smallCaps(String(text)));

// ── normalize: turn previously-styled unicode back to plain ascii first,
// so .setfont re-styles the WHOLE message instead of stacking. ──
const _rev = new Map();
for (const fn of [bold, serif, italic, mono, smallCaps, fullwidth, circled, ring]) {
  for (const ch of NORMAL) {
    const styled = fn(ch);
    if (styled && styled !== ch && !_rev.has(styled)) _rev.set(styled, ch);
  }
}
const normalize = (text) => [...String(text)].map((ch) => {
  if (_rev.has(ch)) return _rev.get(ch);
  if (ch === ' ' || ch === '\n') return ch;
  return ch;
}).join('').replace(/[̶̸̲]/g, '');

// Never style links, @mentions or bot commands (would break taps / tag matching / copying).
const PROTECT = /(https?:\/\/\S+|www\.\S+|chat\.whatsapp\.com\/\S+|wa\.me\/\S+|t\.me\/\S+|discord\.gg\/\S+|@\d+|[./!#][A-Za-z][A-Za-z0-9_-]*)/gi;
const styleChunk = (fn, chunk) => (fn === upside ? fn(normalize(chunk)) : fn(normalize(chunk)));

// ── 12 decorative wraps × 7 base fonts = 84 signature styles ──
const WRAPS = [
  ['star', '★ ', ' ★'], ['crown', '♛ ', ' ♛'], ['spark', '✦ ', ' ✦'],
  ['gem', '⌬ ', ' ⌬'], ['royal', '𓆩 ', ' 𓆪'], ['arrow', '⫷ ', ' ⫸'],
  ['box', '⟦ ', ' ⟧'], ['corner', '『', '』'], ['quote', '「', '」'],
  ['dbl', '《', '》'], ['angle', '〈', '〉'], ['bracket', '〔', ' 〕'],
];
const WRAP_BASES = [
  ['', bold], ['-serif', serif], ['-italic', italic], ['-mono', mono],
  ['-small', smallCaps], ['-circle', circled], ['-wide', fullwidth],
];

const STYLES = {
  plain, bold, serif, italic, mono, smallcaps: smallCaps, smallCaps,
  spaced, fullwidth, circled, ring, upside, strike, under, slash, vapor, ghost,
};
for (const [wname, open, close] of WRAPS) {
  for (const [suffix, base] of WRAP_BASES) {
    STYLES[wname + suffix] = (text) => `${open}${base(normalize(String(text)))}${close}`;
  }
}

const FONTS = [
  'plain', 'bold', 'serif', 'italic', 'mono', 'smallcaps', 'spaced',
  'fullwidth', 'circled', 'ring', 'upside', 'strike', 'under', 'slash', 'vapor', 'ghost',
  ...WRAPS.flatMap(([wname]) => WRAP_BASES.map(([suffix]) => wname + (suffix || ''))),
];

function get(name = '') {
  const n = String(name || '').trim().toLowerCase().replace(/\s+/g, '');
  if (!n || n === 'off' || n === 'default' || n === 'normal') return STYLES.plain;
  if (STYLES[n]) return STYLES[n];
  if (n === 'small-caps' || n === 'small_caps') return STYLES.smallcaps;
  return null;
}

function applyFont(name, text) {
  const fn = get(name);
  if (!fn) return String(text);
  const key = String(name || '').toLowerCase();
  if (key === 'plain' || key === 'off') return String(text);
  return String(text).split(PROTECT).map((part, i) =>
    (i % 2 === 1 ? part : styleChunk(fn, part)),
  ).join('');
}

module.exports = {
  FONTS, STYLES, get, applyFont, normalize,
  // backwards-compatible direct helpers (used by ui.js + commands)
  bold, serif, italic, mono, smallCaps, smallcaps: smallCaps, spaced, plain,
  fullwidth, circled, ring, upside, strike, under, slash, vapor, ghost,
};
