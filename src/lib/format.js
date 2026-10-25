/**
 * XADON V7 · REPLY FORMATS + CUSTOM REPLIES + REPLY PICTURE + BRANDING
 *
 * 4 switchable response formats (owner picks with .setformat):
 *   default — the classic premium card/unicode style (unchanged)
 *   mono    — everything wrapped in a ```mono block```, e.g. ```✓ ANTILINK ENABLED```
 *   media   — the global reply picture + caption on EVERY bot reply (.setreplypic)
 *   rich    — Meta-AI-style rich message (markdown/table/code capable, with fallback)
 *
 * Custom replies:  .setreply ping "custom text {text}"  overrides any command's
 * reply text. Placeholders: {user} {bot} {prefix} {date} {time} {text}.
 * Reply picture:   .setreplypic <url | reply to image>  /  .setreplypic off
 */
const fs = require('fs');
const path = require('path');
const db = require('./database');

const FORMATS = ['default', 'mono', 'media', 'rich'];
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
  return sock.sendMessage(chat, { text: body, ...extra }, quoted ? { quoted } : undefined);
}

module.exports = {
  FORMATS, getFormat, setFormat, getCustom, setCustom, delCustom, listCustom,
  fillVars, getReplyPic, setReplyPicUrl, saveReplyPicFile, clearReplyPic,
  brand, liveName, sendFormatted, MONO_WRAP,
};
