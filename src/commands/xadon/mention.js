/**
 * XADON V9 · mention — owner tag auto-responder.
 *
 *   .mention -r 😎            → react with 😎 whenever the owner is tagged
 *   .mention -r sticker        → (reply to a sticker) sticker-react when tagged
 *   .mention -m 😎            → reply with 😎 when the owner is tagged
 *   .mention -m sticker        → (reply to a sticker) reply with that sticker
 *   .mention -m <message>      → reply with custom text when tagged
 *   .mention on | off | status
 *   .mention -r off  ·  .mention -m off   (disable one channel)
 *
 * The auto reply/react itself runs inside src/handler.js (no prefix needed),
 * so it works in every group and DM even while you are offline.
 */
const fs = require('fs');
const path = require('path');
const config = require('../../../config');

const CFG_KEY = 'mention:config';
const R_FILE = path.resolve(__dirname, '../../../database/mention-react.webp');
const M_FILE = path.resolve(__dirname, '../../../database/mention-msg.webp');

const DEFAULTS = { mode: 'off', reactEmoji: '', msgEmoji: '', msgText: '', reactSticker: false, msgSticker: false };

function getCfg(db) {
  try { return { ...DEFAULTS, ...(db.get(CFG_KEY, {})) }; } catch { return { ...DEFAULTS }; }
}
function setCfg(db, patch) {
  const next = { ...getCfg(db), ...patch };
  db.set(CFG_KEY, next);
  return next;
}

const digits = (jid = '') => String(jid).split('@')[0].split(':')[0];
const ownerDigits = () => (config.ownerNumbers || []).map((n) => String(n).replace(/\D/g, ''));

/** True when the message tags (mentions) the owner. */
function ownerTagged(m) {
  try {
    const owners = ownerDigits();
    if (!owners.length) return false;
    return (m.mentions || []).some((j) => owners.includes(digits(j)));
  } catch { return false; }
}

const isEmoji = (s = '') => {
  const t = String(s).trim();
  if (!t || t.length > 12) return false;
  return /\p{Extended_Pictographic}/u.test(t);
};

/** Sticker-react: bind a sticker to the tagger's message (associationType 11). */
async function stickerReact(sock, chat, tagKey, buf) {
  try {
    await sock.relayMessage(chat, {
      messageContextInfo: { messageAssociation: { associationType: 11, parentMessageKey: tagKey } },
      stickerMessage: { sticker: buf, mimetype: 'image/webp' },
    }, {});
    return true;
  } catch { return false; }
}

/** Run the auto response. Returns true when something was sent. */
async function doRespond(sock, raw, m, db) {
  const cfg = getCfg(db);
  if (cfg.mode === 'off') return false;
  const wantReact = cfg.mode === 'react' || cfg.mode === 'both';
  const wantMsg = cfg.mode === 'message' || cfg.mode === 'both';
  let didReact = false;
  let didMsg = false;

  if (wantReact) {
    try {
      if (cfg.reactSticker && fs.existsSync(R_FILE)) {
        const buf = fs.readFileSync(R_FILE);
        const ok = await stickerReact(sock, m.chat, m.key, buf);
        if (!ok) await sock.sendMessage(m.chat, { sticker: buf }, { quoted: raw }).catch(() => {});
        didReact = true;
      } else if (cfg.reactEmoji) {
        await sock.sendMessage(m.chat, { react: { text: cfg.reactEmoji, key: m.key } }).catch(() => {});
        didReact = true;
      }
    } catch {}
  }

  if (wantMsg) {
    try {
      if (cfg.msgSticker && fs.existsSync(M_FILE)) {
        await sock.sendMessage(m.chat, { sticker: fs.readFileSync(M_FILE) }, { quoted: raw }).catch(() => {});
        didMsg = true;
      } else {
        const body = cfg.msgText || cfg.msgEmoji || 'Yes? The owner will get back to you shortly.';
        await sock.sendMessage(m.chat, { text: body, mentions: [m.sender] }, { quoted: raw }).catch(() => {});
        didMsg = true;
      }
    } catch {}
  }
  return (didReact || didMsg) ? { reacted: didReact, replied: didMsg } : false;
}

function statusCard(ui, db) {
  const c = getCfg(db);
  const on = (v) => (v ? 'ON' : 'off');
  return ui.card({
    icon: '◈', title: 'Mention responder',
    subtitle: `mode ⟶ ${c.mode.toUpperCase()}`,
    rows: [
      ['react (-r)', c.reactSticker ? `sticker ${on(true)}` : (c.reactEmoji ? `${c.reactEmoji} ${on(true)}` : on(false))],
      ['message (-m)', c.msgSticker ? `sticker ${on(true)}` : ([c.msgEmoji, c.msgText].filter(Boolean).join(' · ') || on(false))],
    ],
    body: [
      '.mention -r 😎 · -r sticker (reply)',
      '.mention -m 😎 · -m sticker (reply)',
      '.mention -m <custom reply text>',
      '.mention on · off · -r off · -m off',
    ].join('\n'),
  });
}

module.exports = {
  name: 'mention',
  alias: ['mentions', 'tagme', 'ownertag'],
  desc: 'Auto react/reply whenever the owner is tagged',
  usage: '.mention -r 😎 | .mention -m <text> | .mention on/off/status',
  category: 'xadon9',
  owner: true,
  getCfg, setCfg, ownerTagged, doRespond, R_FILE, M_FILE,
  async run({ sock, m, args, reply, ui, db, prefix }) {
    const sub = String(args[0] || '').toLowerCase();

    if (!sub || sub === 'status' || sub === 'info') return reply(statusCard(ui, db));

    if (sub === 'on') {
      const c = getCfg(db);
      const hasR = !!(c.reactEmoji || c.reactSticker);
      const hasM = !!(c.msgEmoji || c.msgText || c.msgSticker);
      const mode = hasR && hasM ? 'both' : hasM ? 'message' : 'react';
      setCfg(db, { mode });
      return reply(ui.notice('success', 'Mention on', `Responder is live in ${mode.toUpperCase()} mode.\n${prefix}mention status`));
    }
    if (sub === 'off' || sub === 'disable') {
      setCfg(db, { mode: 'off' });
      return reply(ui.notice('warn', 'Mention off', 'The owner-tag responder is disabled.'));
    }

    if (sub === '-r' || sub === 'r') {
      const rest = args.slice(1).join(' ').trim();
      if (/^off$/i.test(rest)) {
        const c = setCfg(db, { reactEmoji: '', reactSticker: false, mode: getCfg(db).mode === 'react' ? 'off' : getCfg(db).mode === 'both' ? 'message' : getCfg(db).mode });
        void c;
        return reply(ui.notice('warn', 'React off', 'Tag-react disabled. Message replies (if any) still work.'));
      }
      if (/^sticker$/i.test(rest)) {
        const q = m.quoted;
        if (!q || q.type !== 'stickerMessage') return reply(ui.notice('info', 'Reply to a sticker', `Reply to the sticker you want, then send:\n${prefix}mention -r sticker`));
        try {
          const buf = await q.download();
          fs.mkdirSync(path.dirname(R_FILE), { recursive: true });
          fs.writeFileSync(R_FILE, buf);
          const c = getCfg(db);
          setCfg(db, { reactSticker: true, mode: c.mode === 'off' ? 'react' : c.mode === 'message' ? 'both' : c.mode });
          return reply(ui.notice('success', 'Sticker react saved', 'Whenever someone tags the owner, the bot sticker-reacts with this sticker.'));
        } catch (e) { return reply(ui.notice('error', 'Save failed', String(e.message || e).slice(0, 200))); }
      }
      if (!isEmoji(rest)) return reply(ui.notice('info', 'React emoji', `Usage: ${prefix}mention -r 😎\nOr reply to a sticker: ${prefix}mention -r sticker`));
      const emoji = rest.split(/\s+/)[0];
      const c = getCfg(db);
      setCfg(db, { reactEmoji: emoji, reactSticker: false, mode: c.mode === 'off' ? 'react' : c.mode === 'message' ? 'both' : c.mode });
      return reply(ui.notice('success', 'React saved', `Tag-react emoji set to ${emoji}\nLive: ${prefix}mention on`));
    }

    if (sub === '-m' || sub === 'm') {
      const rest = args.slice(1).join(' ').trim();
      if (!rest) return reply(ui.notice('info', 'Message reply', `Usage:\n${prefix}mention -m 😎\n${prefix}mention -m I am busy, will reply soon\n${prefix}mention -m sticker (reply to a sticker)`));
      if (/^off$/i.test(rest)) {
        const before = getCfg(db);
        setCfg(db, { msgEmoji: '', msgText: '', msgSticker: false, mode: before.mode === 'message' ? 'off' : before.mode === 'both' ? 'react' : before.mode });
        return reply(ui.notice('warn', 'Message off', 'Tag message-reply disabled. Reacts (if any) still work.'));
      }
      if (/^sticker$/i.test(rest)) {
        const q = m.quoted;
        if (!q || q.type !== 'stickerMessage') return reply(ui.notice('info', 'Reply to a sticker', `Reply to the sticker you want, then send:\n${prefix}mention -m sticker`));
        try {
          const buf = await q.download();
          fs.mkdirSync(path.dirname(M_FILE), { recursive: true });
          fs.writeFileSync(M_FILE, buf);
          const c = getCfg(db);
          setCfg(db, { msgSticker: true, mode: c.mode === 'off' ? 'message' : c.mode === 'react' ? 'both' : c.mode });
          return reply(ui.notice('success', 'Sticker reply saved', 'Whenever someone tags the owner, the bot replies with this sticker.'));
        } catch (e) { return reply(ui.notice('error', 'Save failed', String(e.message || e).slice(0, 200))); }
      }
      const c = getCfg(db);
      const first = rest.split(/\s+/)[0];
      if (isEmoji(rest) && rest.split(/\s+/).length === 1) {
        setCfg(db, { msgEmoji: first, msgText: '', msgSticker: false, mode: c.mode === 'off' ? 'message' : c.mode === 'react' ? 'both' : c.mode });
        return reply(ui.notice('success', 'Reply emoji saved', `Tag-reply emoji set to ${first}`));
      }
      setCfg(db, { msgText: rest.slice(0, 500), msgEmoji: '', msgSticker: false, mode: c.mode === 'off' ? 'message' : c.mode === 'react' ? 'both' : c.mode });
      return reply(ui.notice('success', 'Reply message saved', `Tag-reply text set:\n${rest.slice(0, 200)}`));
    }

    return reply(statusCard(ui, db));
  },
};
