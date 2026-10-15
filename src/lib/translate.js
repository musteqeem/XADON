/**
 * XADON V3 · TRANSLATE ENGINE
 * Multi-provider, no-key, 100+ languages.
 * Chain: Google unofficial → MyMemory → LibreTranslate → Argos.
 */
const LANGS = {
  af: 'Afrikaans', sq: 'Albanian', am: 'Amharic', ar: 'Arabic', hy: 'Armenian', az: 'Azerbaijani',
  eu: 'Basque', be: 'Belarusian', bn: 'Bengali', bs: 'Bosnian', bg: 'Bulgarian', ca: 'Catalan',
  ceb: 'Cebuano', ny: 'Chichewa', 'zh-cn': 'Chinese Simplified', 'zh-tw': 'Chinese Traditional',
  zh: 'Chinese', co: 'Corsican', hr: 'Croatian', cs: 'Czech', da: 'Danish', nl: 'Dutch',
  en: 'English', eo: 'Esperanto', et: 'Estonian', tl: 'Filipino', fi: 'Finnish', fr: 'French',
  fy: 'Frisian', gl: 'Galician', ka: 'Georgian', de: 'German', el: 'Greek', gu: 'Gujarati',
  ht: 'Haitian Creole', ha: 'Hausa', haw: 'Hawaiian', he: 'Hebrew', iw: 'Hebrew', hi: 'Hindi',
  hmn: 'Hmong', hu: 'Hungarian', is: 'Icelandic', ig: 'Igbo', id: 'Indonesian', ga: 'Irish',
  it: 'Italian', ja: 'Japanese', jw: 'Javanese', kn: 'Kannada', kk: 'Kazakh', km: 'Khmer',
  ko: 'Korean', ku: 'Kurdish', ky: 'Kyrgyz', lo: 'Lao', la: 'Latin', lv: 'Latvian', lt: 'Lithuanian',
  lb: 'Luxembourgish', mk: 'Macedonian', mg: 'Malagasy', ms: 'Malay', ml: 'Malayalam', mt: 'Maltese',
  mi: 'Maori', mr: 'Marathi', mn: 'Mongolian', my: 'Myanmar', ne: 'Nepali', no: 'Norwegian',
  or: 'Odia', ps: 'Pashto', fa: 'Persian', pl: 'Polish', pt: 'Portuguese', pa: 'Punjabi',
  ro: 'Romanian', ru: 'Russian', sm: 'Samoan', gd: 'Scots Gaelic', sr: 'Serbian', st: 'Sesotho',
  sn: 'Shona', sd: 'Sindhi', si: 'Sinhala', sk: 'Slovak', sl: 'Slovenian', so: 'Somali',
  es: 'Spanish', su: 'Sundanese', sw: 'Swahili', sv: 'Swedish', tg: 'Tajik', ta: 'Tamil',
  te: 'Telugu', th: 'Thai', tr: 'Turkish', uk: 'Ukrainian', ur: 'Urdu', ug: 'Uyghur', uz: 'Uzbek',
  vi: 'Vietnamese', cy: 'Welsh', xh: 'Xhosa', yi: 'Yiddish', yo: 'Yoruba', zu: 'Zulu', fil: 'Filipino',
  'pt-br': 'Portuguese (Brazil)', 'es-mx': 'Spanish (Mexico)'
};

const ALIAS = { chinese: 'zh-cn', mandarin: 'zh-cn', cantonese: 'zh-tw', hebrew: 'he', filipino: 'tl', tagalog: 'tl', norwegian: 'no', persian: 'fa', punjabi: 'pa' };

function normLang(code = '') {
  let c = String(code).trim().toLowerCase();
  if (ALIAS[c]) return ALIAS[c];
  if (LANGS[c]) return c;
  const short = c.slice(0, 2);
  if (LANGS[short]) return short;
  const found = Object.entries(LANGS).find(([, name]) => name.toLowerCase() === c);
  return found ? found[0] : null;
}

async function viaGoogle(query, target) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(query.slice(0, 900))}`;
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`google ${res.status}`);
  const j = await res.json();
  const out = Array.isArray(j) ? j[0].map((s) => s[0]).join('') : '';
  const src = j?.[2] || 'auto';
  if (!out) throw new Error('google empty');
  return { text: out, source: src, engine: 'google' };
}

async function viaMyMemory(query, target) {
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query.slice(0, 450))}&langpair=auto|${encodeURIComponent(target)}`);
  if (!res.ok) throw new Error(`mymemory ${res.status}`);
  const j = await res.json();
  const out = j?.responseData?.translatedText;
  if (!out || /MYMEMORY WARNING|INVALID/i.test(out)) throw new Error('mymemory limit');
  return { text: out, source: 'auto', engine: 'mymemory' };
}

async function viaLibre(query, target) {
  const hosts = ['https://libretranslate.de/translate', 'https://translate.argosopentech.com/translate'];
  let last = null;
  for (const h of hosts) {
    try {
      const res = await fetch(h, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ q: query.slice(0, 900), source: 'auto', target, format: 'text' }) });
      if (!res.ok) { last = new Error(`libre ${res.status}`); continue; }
      const j = await res.json();
      if (j?.translatedText) return { text: j.translatedText, source: 'auto', engine: 'libre' };
    } catch (e) { last = e; }
  }
  throw last || new Error('libre failed');
}

async function translate(query, target = 'en') {
  const t = normLang(target) || 'en';
  const q = String(query || '').trim();
  if (!q) throw new Error('empty text');
  const errors = [];
  for (const fn of [viaGoogle, viaMyMemory, viaLibre]) {
    try { const r = await fn(q, t); return { ...r, target: t }; } catch (e) { errors.push(`${fn.name}: ${e.message}`); }
  }
  throw new Error(errors.join(' · '));
}

module.exports = { LANGS, normLang, translate };
