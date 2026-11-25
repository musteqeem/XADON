/**
 * XADON V9 · REPLY FORMATS (12) + CUSTOM REPLIES + REPLY PICTURE + BRANDING
 *
 * 12 switchable response formats (owner picks with .setformat):
 *   default — the classic premium card/unicode style (unchanged)
 *   mono    — everything wrapped in a ```mono block```
 *   media   — the global reply picture + caption on EVERY bot reply (.setreplypic)
 *   rich    — Meta-AI-style rich message (markdown/table/code capable, with fallback)
 *   color   — coloured GenAI label card (botForwardedMessage richResponse, green/white)
 *   html    — WA-in-WA HTML view (FOA HTML primitive, styled card with the reply text)
 *   a2ui    — A2UI app card (interactive bloksWidget surface with the reply text)
 *   ads     — fixed External Ad Reply card (big thumbnail + title + link, always visible)
 *   raw     — RAW text only: no header, no footer, no branding, no quote card (adults/simple phones)
 *   clean   — unicode dividers only: ─── text ─── (no cards, no footer spam)
 *   elder   — ELDER/simple mode: plain big-readable unicode, extra line spacing, no fancy fonts
 *   retro   — old-school ASCII: [ BOT ] text (works on every phone, zero fancy unicode)
 *
 * The reply picture (.setreplypic) doubles as the ads/media thumbnail source.
 * Custom replies:  .setreply ping "custom text {text}"  overrides any command's
 * reply text. Placeholders: {user} {bot} {prefix} {date} {time} {text}.
 * Reply picture:   .setreplypic <url | reply to image>  /  .setreplypic off
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./database');

const FORMATS = ['default', 'mono', 'media', 'rich', 'color', 'html', 'a2ui', 'ads', 'raw', 'clean', 'elder', 'retro', 'neon', 'glass', 'minimal', 'gold', 'ocean', 'royal', 'candy', 'ghost', 'veil', 'pulse', 'xadon', 'canvas', 'animated'];
// V10 - 10 NEW premium formats (XADON premium sources: prexzy rich cards, richRelay grids, htmlGame webviews, poolcard/router, translation service, albumpic carousels, hiddenmsg cards, metamsg tables, sendlocation pins): neon glass minimal gold ocean royal candy ghost veil pulse.
const PIC_FILE = path.resolve(__dirname, '../../assets/reply-pic.jpg');

const liveName = () => {
  try { return require('./botstate').botName() || 'XADON AI'; } catch { return 'XADON AI'; }
};

const getFormat = () => {
  const f = String(db.get('replyFormat', 'default') || 'default').toLowerCase();
  return FORMATS.includes(f) ? f : 'default';
};
const setFormat = (name) => {
  const f = String(name || '').toLowerCase();
  if (!FORMATS.includes(f)) return null;
  db.set('replyFormat', f);
  return f;
};

// ---- canvas image styles: normal (colour gradient) | hacker (matrix terminal) ----
const CANVAS_STYLES = ['normal', 'hacker'];
const getCanvasStyle = () => {
  const s = String(db.get('canvasStyle', 'normal') || 'normal').toLowerCase();
  return CANVAS_STYLES.includes(s) ? s : 'normal';
};
const setCanvasStyle = (name) => {
  const s = String(name || '').toLowerCase();
  if (!CANVAS_STYLES.includes(s)) return null;
  db.set('canvasStyle', s);
  return s;
};

// ---- custom per-command reply text ----
const getCustom = (cmd) => db.get(`customreply:${String(cmd || '').toLowerCase()}`, null);
const setCustom = (cmd, text) => { db.set(`customreply:${String(cmd).toLowerCase()}`, String(text).slice(0, 1500)); };
const delCustom = (cmd) => { db.delete(`customreply:${String(cmd).toLowerCase()}`); };
const listCustom = () => Object.entries(db.all()).filter(([k]) => k.startsWith('customreply:')).map(([k, v]) => [k.slice(12), v]);

function fillVars(text, { m, prefix } = {}) {
  const now = new Date();
  return String(text)
    .replace(/\{user\}/gi, m?.pushName || 'User')
    .replace(/\{bot\}/gi, liveName())
    .replace(/\{prefix\}/gi, prefix || '.')
    .replace(/\{date\}/gi, now.toLocaleDateString('en-GB'))
    .replace(/\{time\}/gi, now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    .replace(/\{number\}/gi, m ? String(m.sender).split('@')[0].split(':')[0] : '')
    .replace(/@date\b/gi, now.toLocaleDateString('en-GB'))
    .replace(/@time\b/gi, now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    .replace(/@user\b/gi, m?.pushName || 'User')
    .replace(/@bot\b/gi, liveName());
}

// ---- global reply picture ----
function getReplyPic() {
  const url = db.get('replyPicUrl', '');
  if (url) return { kind: 'url', value: url };
  try { if (fs.existsSync(PIC_FILE)) return { kind: 'file', value: fs.readFileSync(PIC_FILE) }; } catch {}
  return null;
}
function setReplyPicUrl(url) { db.set('replyPicUrl', String(url).slice(0, 500)); try { if (fs.existsSync(PIC_FILE)) fs.unlinkSync(PIC_FILE); } catch {} }
function saveReplyPicFile(buf) { try { fs.mkdirSync(path.dirname(PIC_FILE), { recursive: true }); fs.writeFileSync(PIC_FILE, buf); db.delete('replyPicUrl'); return true; } catch { return false; } }
function clearReplyPic() { db.delete('replyPicUrl'); try { if (fs.existsSync(PIC_FILE)) fs.unlinkSync(PIC_FILE); } catch {} }

// ---- branding: never show stale "XADON" when owner renamed the bot ----
function brand(text) {
  const bn = liveName();
  let out = String(text ?? '');
  if (bn && !/^xadon ai$/i.test(bn)) {
    out = out.replace(/\bXADON(?:\s*AI)?\b/g, bn).replace(/\bXadon AI\b/g, bn);
  }
  return out;
}

const MONO_WRAP = (t) => '```\n' + String(t) + '\n```';

const escHtml = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── V8 · COLOUR format: GenAI coloured-label card ──
async function sendColor(sock, chat, text, { quoted, mentions } = {}) {
  const payload = {
    __typename: 'GenAIUnifiedResponse',
    response_id: `xadon-${Date.now()}`,
    sections: [{
      __typename: 'GenAIUnifiedResponseSection',
      view_model: {
        __typename: 'GenAISingleLayoutViewModel',
        primitive: {
          __typename: 'GenAILabelPrimitive',
          text: String(text).slice(0, 1000),
          variant: 'POSITIVE',
          background_color_override: '#0E7C61FF',
          text_color_override: '#FFFFFFFF',
        },
      },
    }],
  };
  const msg = {
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          unifiedResponse: { data: Buffer.from(JSON.stringify(payload)) },
          contextInfo: { isForwarded: true, forwardOrigin: 4 },
        },
      },
    },
  };
  await sock.relayMessage(chat, msg, {});
}

// ── V8 · HTML format: WA-in-WA HTML view (FOA primitive) ──
async function sendHtml(sock, chat, text, { quoted } = {}) {
  let generateWAMessageFromContent;
  try { ({ generateWAMessageFromContent } = require('@musteqeem/baileys')); } catch { throw new Error('baileys html'); }
  const bn = liveName();
  const html = `<div style="background:#0b141a;color:#e9edef;padding:14px;border-radius:12px;font-family:sans-serif"><div style="font-size:15px;font-weight:700;margin-bottom:6px">${escHtml(bn)}</div><div style="font-size:13px;line-height:1.5;white-space:pre-wrap">${escHtml(String(text).slice(0, 2000))}</div></div>`.trim();
  const payload = {
    __typename: 'GenAIUnifiedResponse',
    response_id: crypto.randomUUID(),
    sections: [{
      __typename: 'GenAIUnifiedResponseSection',
      view_model: {
        __typename: 'GenAISingleLayoutViewModel',
        primitive: { __typename: 'FOAHtmlPrimitiveDemoDONOTUSE', trusted_sources: [], payload: html },
      },
    }],
  };
  const content = {
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          unifiedResponse: { data: Buffer.from(JSON.stringify(payload)).toString('base64') },
          contextInfo: { isForwarded: true, forwardOrigin: 4 },
        },
      },
    },
  };
  const gen = generateWAMessageFromContent(chat, content, {});
  await sock.relayMessage(chat, gen.message, { messageId: gen.key.id });
}

// ── V8 · A2UI format: interactive app card carrying the reply text ──
async function sendA2ui(sock, chat, text, { quoted } = {}) {
  const bn = liveName();
  const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
  const surface = {
    createSurface: {
      catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
      components: [
        { component: 'Column', id: 'root', children: ['hero', 'bodycard'] },
        { component: 'Card', id: 'hero', child: 'hero_content' },
        { component: 'Column', id: 'hero_content', children: ['hero_title', 'hero_status'] },
        { component: 'Text', id: 'hero_title', text: bn, variant: 'h1' },
        { component: 'Text', id: 'hero_status', text: `\u25CF ${now} Lagos`, variant: 'caption' },
        { component: 'Card', id: 'bodycard', child: 'body_content' },
        { component: 'Column', id: 'body_content', children: ['body_text'] },
        { component: 'Text', id: 'body_text', text: String(text).slice(0, 1500), variant: 'body' },
      ],
      surfaceId: `xadon-${Date.now()}`,
    },
    version: 'v0.9',
  };
  const msg = {
    messageContextInfo: { threadId: [], messageSecret: new Uint8Array(crypto.randomBytes(32)) },
    interactiveMessage: {
      body: { text: '' },
      bloksWidget: { uuid: crypto.randomUUID(), data: JSON.stringify(surface), type: 'im_a2ui' },
      contextInfo: {},
      nativeFlowMessage: { buttons: [{ name: '' }], messageParamsJson: '{}' },
    },
  };
  await sock.relayMessage(chat, msg, { additionalNodes: [{ tag: 'biz', attrs: {} }] });
}

// ── V8 · ADS format: fixed External Ad Reply card (visible on all WA versions) ──
async function sendAds(sock, chat, text, { quoted, mentions } = {}) {
  const bn = liveName();
  let website = 'https://github.com/musteqeem/baileys';
  try { website = require('../../config').links.website || website; } catch {}
  const info = { title: bn, body: String(text).slice(0, 120) || bn, mediaType: 1, sourceUrl: website, renderLargerThumbnail: true, showAdAttribution: true };
  try {
    const pic = getReplyPic();
    if (pic && pic.kind === 'url') info.thumbnailUrl = pic.value;
    else if (pic && pic.kind === 'file') info.thumbnail = pic.value.slice(0, 200000);
    else {
      const bp = path.resolve(__dirname, '../../assets/banner.png');
      if (fs.existsSync(bp)) info.thumbnail = fs.readFileSync(bp).slice(0, 200000);
    }
  } catch {}
  return sock.sendMessage(chat, { text: brand(String(text ?? '')), contextInfo: { externalAdReply: info }, mentions }, quoted ? { quoted } : undefined);
}

/**
 * Send text honoring the active format + reply picture.
 * extra is merged (mentions etc.). quoted defaults to the trigger message.
 */
async function sendFormatted(sock, chat, text, opts = {}) {
  const { quoted, format, canvasStyle, ...extra } = opts;
  const fmt = format || getFormat();
  const body = brand(String(text ?? ''));
  if (fmt === 'mono') {
    return sock.sendMessage(chat, { text: MONO_WRAP(body), ...extra }, quoted ? { quoted } : undefined);
  }
  if (fmt === 'media') {
    const pic = getReplyPic();
    if (pic) {
      const img = pic.kind === 'url' ? { url: pic.value } : pic.value;
      return sock.sendMessage(chat, { image: img, caption: body.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined);
    }
    return sock.sendMessage(chat, { text: body, ...extra }, quoted ? { quoted } : undefined);
  }
  if (fmt === 'rich') {
    try {
      const fx = require('./premium-fx');
      return await fx.richText(sock, chat, body, { quoted, mentions: extra.mentions });
    } catch { /* fall through to default */ }
  }
  if (fmt === 'color') {
    try { return await sendColor(sock, chat, body, { quoted, mentions: extra.mentions }); }
    catch { return sock.sendMessage(chat, { text: body, ...extra }, quoted ? { quoted } : undefined); }
  }
  if (fmt === 'html') {
    try { return await sendHtml(sock, chat, body, { quoted }); }
    catch { return sock.sendMessage(chat, { text: body, ...extra }, quoted ? { quoted } : undefined); }
  }
  if (fmt === 'a2ui') {
    try { return await sendA2ui(sock, chat, body, { quoted }); }
    catch { return sock.sendMessage(chat, { text: body, ...extra }, quoted ? { quoted } : undefined); }
  }
  if (fmt === 'ads') {
    try { return await sendAds(sock, chat, body, { quoted, mentions: extra.mentions }); }
    catch { return sock.sendMessage(chat, { text: body, ...extra }, quoted ? { quoted } : undefined); }
  }
  // ── V9 · RAW: exact text, no brand, no footer, no UI (for adults / simple phones) ──
  if (fmt === 'raw') {
    return sock.sendMessage(chat, { text: String(text ?? ''), ...extra }, quoted ? { quoted } : undefined);
  }
  // ── V9 · CLEAN: unicode dividers only, no cards/footers ──
  if (fmt === 'clean') {
    const clean = `───────────────\n${String(text ?? '').replace(/\*|_/g, '')}\n───────────────`;
    return sock.sendMessage(chat, { text: clean.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined);
  }
  // ── V9 · ELDER: big readable plain unicode, double-spaced, no fancy styling ──
  if (fmt === 'elder') {
    const plain = String(text ?? '').replace(/[*_`~]/g, '');
    const spaced = plain.split('\n').join('\n\n');
    const elder = `▸ ${spaced}`.slice(0, 4000);
    return sock.sendMessage(chat, { text: elder, ...extra }, quoted ? { quoted } : undefined);
  }
  // ── V9 · RETRO: old-school ASCII brackets, works everywhere ──
  if (fmt === 'retro') {
    const bn = liveName().toUpperCase();
    const retro = `[ ${bn} ]\n${String(text ?? '').replace(/[*_`~]/g, '')}`.slice(0, 4000);
    return sock.sendMessage(chat, { text: retro, ...extra }, quoted ? { quoted } : undefined);
  }
  const bn10 = liveName();
  if (fmt === 'neon') { const s = `\u2591\u2592\u2593 ${bn10.toUpperCase()} \u2593\u2592\u2591\n${String(text ?? '')}`; return sock.sendMessage(chat, { text: s.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'glass') { const s = `\u256D\u2500\u2500 \u00B7 \u00B7 \u2500\u2500\u256E\n${String(text ?? '')}\n\u2570\u2500\u2500 \u00B7 \u00B7 \u2500\u2500\u256F\n  \u232C ${bn10}`; return sock.sendMessage(chat, { text: s.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'minimal') { return sock.sendMessage(chat, { text: String(text ?? '').replace(/[*_`~]/g, '').slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'gold') { const s = `\u272A ${bn10}\n\u2756\u2756\u2756\u2756\u2756\u2756\u2756\n${String(text ?? '')}`; return sock.sendMessage(chat, { text: s.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'ocean') { const s = `\u224B\u224B\u224B ${bn10} \u224B\u224B\u224B\n${String(text ?? '')}`; return sock.sendMessage(chat, { text: s.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'royal') { const s = `\u265B ${bn10.toUpperCase()} \u265B\n${String(text ?? '')}`; return sock.sendMessage(chat, { text: s.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'candy') { const s = `\u2726 ${String(text ?? '')} \u2726  ${bn10}`; return sock.sendMessage(chat, { text: s.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'ghost') { const s = `${String(text ?? '').replace(/[*_`~]/g, '')}\n\u00B7 \u00B7 \u00B7 ${bn10}`; return sock.sendMessage(chat, { text: s.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'veil') { const s = `\u262C ${String(text ?? '')} \u262C`; return sock.sendMessage(chat, { text: s.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'pulse') { const s = `\u25C9 \u2500\u2500\u2500 ${bn10} \u2500\u2500\u2500 \u25C9\n${String(text ?? '')}`; return sock.sendMessage(chat, { text: s.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined); }
  if (fmt === 'xadon') {
    const x = `\u2726 \u2500\u2500\u2500\u2500\u2500 \u22C6\u22C5\u22C6\u22C5 \u2500\u2500\u2500\u2500\u2500 \u2726\n   *${bn10.toUpperCase()}*\n\u2726 \u2500\u2500\u2500\u2500\u2500 \u22C6\u22C5\u22C6\u22C5 \u2500\u2500\u2500\u2500\u2500 \u2726\n\n${String(text ?? '')}\n\n> ${bn10}`;
    return sock.sendMessage(chat, { text: x.slice(0, 4000), ...extra }, quoted ? { quoted } : undefined);
  }
  if (fmt === 'canvas') {
    try {
      const style = String(canvasStyle || getCanvasStyle()).toLowerCase();
      const img = style === 'hacker'
        ? await canvasHackerCard(String(text ?? '').slice(0, 400), liveName())
        : await canvasCard(String(text ?? '').slice(0, 400), liveName());
      return await sock.sendMessage(chat, { image: img }, quoted ? { quoted } : undefined);
    } catch { return sock.sendMessage(chat, { text: String(text ?? ''), ...extra }, quoted ? { quoted } : undefined); }
  }
  if (fmt === 'animated') {
    try { return await sendAnimated(sock, chat, body, { quoted, mentions: extra.mentions }); }
    catch { return sock.sendMessage(chat, { text: body, ...extra }, quoted ? { quoted } : undefined); }
  }
  return sock.sendMessage(chat, { text: body, ...extra }, quoted ? { quoted } : undefined);
}

function wrapLines(text, maxLen = 34, maxLines = 7) {
  const words = String(text).replace(/[*_`~]/g, '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxLen) { lines.push(cur.trim()); cur = w; if (lines.length >= maxLines) break; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur && lines.length < maxLines) lines.push(cur.trim());
  return lines.slice(0, maxLines);
}

/** Canvas NORMAL — glossy colour gradient card with starfield + scanline animation feel. */
async function canvasCard(text, botName) {
  const sharp = require('sharp');
  const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const shown = wrapLines(text).map(esc);
  let stars = '';
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60; i++) stars += `<circle cx="${(rnd() * 900).toFixed(0)}" cy="${(rnd() * 540).toFixed(0)}" r="${(1 + rnd() * 2).toFixed(1)}" fill="#ffffff" opacity="${(0.3 + rnd() * 0.7).toFixed(2)}"/>`;
  let scan = '';
  for (let y = 8; y < 540; y += 12) scan += `<rect x="0" y="${y}" width="900" height="2" fill="#000000" opacity="0.12"/>`;
  const body = shown.map((l, i) => `<text x="450" y="${250 + i * 36}" font-family="Arial,sans-serif" font-size="27" fill="#ffff00" text-anchor="middle">${l}</text>`).join('');
  const svg = `<svg width="900" height="540" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff69b4"/><stop offset="0.5" stop-color="#33cc33"/><stop offset="1" stop-color="#6666cc"/></linearGradient><linearGradient id="frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.2"/></linearGradient></defs><rect width="900" height="540" fill="url(#g)"/>${stars}${scan}<rect x="10" y="10" width="880" height="520" rx="22" fill="none" stroke="url(#frame)" stroke-width="5"/><text x="450" y="90" font-family="Arial,sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">${esc(botName).toUpperCase().slice(0, 24)}</text><text x="450" y="140" font-family="Arial,sans-serif" font-size="26" fill="#ffffff" text-anchor="middle">\u2726 \u22C6\u22C5\u22C6\u22C5 PREMIUM \u22C6\u22C5\u22C6\u22C5 \u2726</text>${body}<text x="450" y="505" font-family="Arial,sans-serif" font-size="20" fill="#ffffff" opacity="0.85" text-anchor="middle">\u25CF \u25CF \u25CF</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Canvas HACKER — green-on-black matrix terminal card with binary rain + shell frame. */
async function canvasHackerCard(text, botName) {
  const sharp = require('sharp');
  const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const shown = wrapLines(text, 36, 6).map(esc);
  let seed = 1337;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // binary rain columns
  let rain = '';
  for (let c = 0; c < 24; c++) {
    const x = 20 + c * 36;
    let bits = '';
    for (let r = 0; r < 8; r++) bits += rnd() > 0.5 ? '1' : '0';
    rain += `<text x="${x}" y="${60 + (c % 5) * 90}" font-family="monospace" font-size="17" fill="#00ff41" opacity="${(0.15 + rnd() * 0.35).toFixed(2)}" text-anchor="middle">${bits}</text>`;
  }
  let scan = '';
  for (let y = 0; y < 540; y += 6) scan += `<rect x="0" y="${y}" width="900" height="1" fill="#000000" opacity="0.35"/>`;
  const body = shown.map((l, i) => `<text x="70" y="${235 + i * 34}" font-family="monospace" font-size="24" fill="#00ff41">$> ${l}<rect x="${72 + l.length * 14.5}" y="${218 + i * 34}" width="13" height="22" fill="#00ff41" opacity="${i === shown.length - 1 ? 0.9 : 0}"/></text>`).join('');
  const filled = Math.min(10, 3 + shown.join('').length % 8);
  let blocks = '';
  for (let i = 0; i < 10; i++) blocks += `<rect x="${70 + i * 62}" y="440" width="52" height="16" rx="3" fill="${i < filled ? '#00ff41' : 'none'}" stroke="#00ff41" stroke-width="2"/>`;
  const svg = `<svg width="900" height="540" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="0.5" cy="0.4" r="0.9"><stop offset="0" stop-color="#062b06"/><stop offset="1" stop-color="#010801"/></radialGradient><linearGradient id="hframe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#00ff41"/><stop offset="1" stop-color="#008f11"/></linearGradient></defs><rect width="900" height="540" fill="url(#bg)"/>${rain}${scan}<rect x="14" y="14" width="872" height="512" rx="18" fill="none" stroke="url(#hframe)" stroke-width="4"/><!-- terminal header --><rect x="34" y="34" width="832" height="52" rx="12" fill="#031503" stroke="#00ff41" stroke-width="2"/><circle cx="66" cy="60" r="9" fill="#ff5f56"/><circle cx="94" cy="60" r="9" fill="#ffbd2e"/><circle cx="122" cy="60" r="9" fill="#27c93f"/><text x="450" y="69" font-family="monospace" font-size="24" font-weight="bold" fill="#00ff41" text-anchor="middle">XADON // SECURE_SHELL — ${esc(botName).toUpperCase().slice(0, 16)}</text><text x="70" y="135" font-family="monospace" font-size="20" fill="#ffbd2e">[root@xadon]$ decrypting_reply --trace ... OK</text><text x="70" y="168" font-family="monospace" font-size="20" fill="#7df9ff">[access_granted] channel_secured :: AES-256</text><line x1="50" y1="190" x2="850" y2="190" stroke="#00ff41" stroke-width="1" opacity="0.5"/>${body}${blocks}<text x="70" y="492" font-family="monospace" font-size="19" fill="#00ff41" opacity="0.8">status: ENCRYPTED \u25CF ${esc(botName).slice(0, 20)} \u25CF trace_off</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** ANIMATED format — canvas image plays an editing animation, then the reply lands as its caption. */
async function sendAnimated(sock, chat, text, { quoted, mentions } = {}) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const bn = liveName();
  const full = brand(String(text ?? ''));
  const hacker = String(getCanvasStyle()).toLowerCase() === 'hacker';
  let img;
  try {
    img = hacker ? await canvasHackerCard(`${bn} loading`, bn) : await canvasCard(`${bn} loading`, bn);
  } catch {
    return sock.sendMessage(chat, { text: full, mentions }, quoted ? { quoted } : undefined);
  }
  const frames = hacker ? [
    `[root@xadon]$ ./render --style hacker\n[\u2593\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591] 10% \u00B7 injecting pixels`,
    `[root@xadon]$ ./render --style hacker\n[\u2593\u2593\u2593\u2593\u2591\u2591\u2591\u2591\u2591\u2591] 40% \u00B7 bypassing filters`,
    `[root@xadon]$ ./render --style hacker\n[\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2591\u2591\u2591] 70% \u00B7 encrypting frame`,
    `[root@xadon]$ ./render --style hacker\n[\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593] 100% \u00B7 access granted`,
  ] : [
    `\u2726 ${bn}\n\u25D0 warming up the canvas\u2026\n\u2593\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591 10%`,
    `\u2726 ${bn}\n\u25D1 painting pixels\u2026\n\u2593\u2593\u2593\u2593\u2591\u2591\u2591\u2591\u2591\u2591 40%`,
    `\u2726 ${bn}\n\u25D2 adding glow\u2026\n\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2591\u2591\u2591 70%`,
    `\u2726 ${bn}\n\u25D3 final polish\u2026\n\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593 100%`,
  ];
  let sent;
  try {
    sent = await sock.sendMessage(chat, { image: img, caption: frames[0], mentions }, quoted ? { quoted } : undefined);
  } catch {
    return sock.sendMessage(chat, { text: full, mentions }, quoted ? { quoted } : undefined);
  }
  for (const fr of frames.slice(1)) {
    await wait(650);
    try { await sock.sendMessage(chat, { image: img, caption: fr, mentions, edit: sent.key }); }
    catch { break; }
  }
  await wait(650);
  const cap = full.slice(0, 1000);
  const rest = full.slice(1000);
  try {
    await sock.sendMessage(chat, { image: img, caption: cap, mentions, edit: sent.key });
  } catch {
    try { sent = await sock.sendMessage(chat, { image: img, caption: cap, mentions }, quoted ? { quoted } : undefined); }
    catch { return sock.sendMessage(chat, { text: full, mentions }, quoted ? { quoted } : undefined); }
  }
  if (rest) {
    try { await sock.sendMessage(chat, { text: rest.slice(0, 4000), mentions }, quoted ? { quoted } : undefined); } catch {}
  }
  return sent;
}

module.exports = {
  FORMATS, getFormat, setFormat, getCustom, setCustom, delCustom, listCustom,
  fillVars, getReplyPic, setReplyPicUrl, saveReplyPicFile, clearReplyPic,
  brand, liveName, sendFormatted, sendColor, sendHtml, sendA2ui, sendAds, MONO_WRAP,
  CANVAS_STYLES, getCanvasStyle, setCanvasStyle, canvasCard, canvasHackerCard, sendAnimated,
};
