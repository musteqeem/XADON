/**
 * XADON V8 · REPLY FORMATS + CUSTOM REPLIES + REPLY PICTURE + BRANDING
 *
 * 8 switchable response formats (owner picks with .setformat):
 *   default — the classic premium card/unicode style (unchanged)
 *   mono    — everything wrapped in a ```mono block```, e.g. ```✓ ANTILINK ENABLED```
 *   media   — the global reply picture + caption on EVERY bot reply (.setreplypic)
 *   rich    — Meta-AI-style rich message (markdown/table/code capable, with fallback)
 *   color   — coloured GenAI label card (botForwardedMessage richResponse, green/white)
 *   html    — WA-in-WA HTML view (FOA HTML primitive, styled card with the reply text)
 *   a2ui    — A2UI app card (interactive bloksWidget surface with the reply text)
 *   ads     — fixed External Ad Reply card (big thumbnail + title + link, always visible)
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

const FORMATS = ['default', 'mono', 'media', 'rich', 'color', 'html', 'a2ui', 'ads'];
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
    .replace(/\{number\}/gi, m ? String(m.sender).split('@')[0].split(':')[0] : '');
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
  const { quoted, format, ...extra } = opts;
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
  return sock.sendMessage(chat, { text: body, ...extra }, quoted ? { quoted } : undefined);
}

module.exports = {
  FORMATS, getFormat, setFormat, getCustom, setCustom, delCustom, listCustom,
  fillVars, getReplyPic, setReplyPicUrl, saveReplyPicFile, clearReplyPic,
  brand, liveName, sendFormatted, sendColor, sendHtml, sendA2ui, sendAds, MONO_WRAP,
};
