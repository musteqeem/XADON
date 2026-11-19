/**
 * XADON AI · message upgrade + full customization layer.
 * - smart chunking (WhatsApp 4096-char safe split)
 * - presence flair (composing / recording while sending long texts)
 * - full customization keys (honored by lib/format footer/brand):
 *     db.set('customFooter', '...')  -> replaces ⌬ footer line
 *     db.set('customHeader', '...')  -> prefix line on cards
 *     .setbotname / .setreply / .setreplypic / .setformat keep working
 * - random anti/quote mark helper shared with rich.js + message-handler
 */
const db = require('./database');
const MARKS = ['亗', '֎', '♛', '☬', '✪', '⚉'];
const pickMark = () => MARKS[Math.floor(Math.random() * MARKS.length)];
const getFooter = () => {
  try {
    const c = db.get('customFooter', '');
    if (c) return String(c).slice(0, 120);
  } catch {}
  return '';
};
async function sendSmart(sock, chat, text, opts = {}) {
  const body = String(text ?? '');
  const parts = [];
  let s = body;
  while (s.length > 3800) { let i = s.lastIndexOf('\n', 3800); if (i < 0) i = 3800; parts.push(s.slice(0, i)); s = s.slice(i); }
  parts.push(s);
  let last = null;
  for (const p of parts) {
    try { await sock.sendPresenceUpdate('composing', chat).catch(() => {}); } catch {}
    // eslint-disable-next-line no-await-in-loop
    last = await sock.sendMessage(chat, { text: p, ...(opts.mentions ? { mentions: opts.mentions } : {}) }, opts.quoted ? { quoted: opts.quoted } : undefined);
  }
  try { await sock.sendPresenceUpdate('paused', chat).catch(() => {}); } catch {}
  return last;
}
module.exports = { MARKS, pickMark, getFooter, sendSmart };
