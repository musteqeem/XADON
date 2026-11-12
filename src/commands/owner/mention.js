/**
 * XADON V17 · mention — owner tag auto-responder (LID/JID-proof).
 *
 * Triggers when the owner is tagged in ANY form:
 *   @owner mention · reply to owner's message · raw number typed
 *   (2348000000000 or @2348000000000 — JID/LID confusion bypassed)
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
 *
 * V17 fixes:
 *  - LID-proof mentions: every reply tags BOTH m.sender and m.senderAlt
 *    (phone-JID + @lid), so the tag highlights in LID-mode groups.
 *  - Sticker-react rebuilt on the sreact (associationType 11) pattern:
 *    full parentMessageKey + relayMessage, with sendMessage fallback.
 *  - Quoted-sticker finder covers every XADON/Baileys shape
 *    (m.quoted / m.quotedMessage / raw contextInfo), like sreact.
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

const digits = (jid = '') => String(jid).split('@')[0].split(':')[0].replace(/\D/g, '');
const ownerDigits = () => (config.ownerNumbers || []).map((n) => String(n).replace(/\D/g, '')).filter(Boolean);

/**
 * V17 · LID-proof mention list: always tag BOTH the phone-JID and the
 * @lid form of the sender when we know them. In @lid groups WhatsApp only
 * highlights the @lid form; in classic groups only the phone JID. Sending
 * both covers every group. Deduped, blanks removed.
 */
function mentionJids(m) {
  try {
    const out = [];
    for (const j of [m?.sender, m?.senderAlt]) {
      if (j && typeof j === 'string' && j.includes('@') && !out.includes(j)) out.push(j);
    }
    // Fallback: never send an empty mentions array when we have a sender.
    if (!out.length && m?.sender) out.push(m.sender);
    return out;
  } catch { return m?.sender ? [m.sender] : []; }
}

/**
 * XADON V11 · owner match that survives the WhatsApp LID/JID mess.
 * A mention can arrive as phone JID (234...@s.whatsapp.net), LID
 * (12345@lid) or a bare push-name tag — so we match flexibly:
 * exact digits OR same last-9-digits (both sides 10+ digits long).
 */
function sameOwner(a = '', b = '') {
  const x = String(a).replace(/\D/g, '');
  const y = String(b).replace(/\D/g, '');
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.length >= 10 && y.length >= 10 && x.slice(-9) === y.slice(-9)) return true;
  return false;
}
function isOwnerJid(jid = '') {
  try {
    const d = digits(jid);
    if (!d) return false;
    return ownerDigits().some((o) => sameOwner(d, o));
  } catch { return false; }
}

/**
 * True when the message tags the owner — via ANY of:
 *  1. structured mention (phone JID or LID form)
 *  2. reply to the owner's message (quoted sender is the owner)
 *  3. raw number typed in the text: 2348000000000 or @2348000000000
 */
function ownerTagged(m) {
  try {
    const owners = ownerDigits();
    if (!owners.length) return false;
    const hit = (d) => d && owners.some((o) => sameOwner(d, o));
    // 1 · structured mentions (covers JID + LID mention forms)
    for (const j of (m.mentions || [])) { if (hit(digits(j))) return true; }
    // also cover alternate sender fields some Baileys versions fill
    for (const j of [m.senderAlt].filter(Boolean)) { if (hit(digits(j))) return true; }
    // 2 · replying to the owner counts as tagging the owner
    if (m.quoted?.sender && hit(digits(m.quoted.sender))) return true;
    // also cover XADON's alternate quoted holder
    if (m.quotedMessage?.sender && hit(digits(m.quotedMessage.sender))) return true;
    // 3 · raw number in the text body (234... or @234...)
    const body = String(m.body || '');
    const chunks = body.match(/@?\+?\d{7,15}/g) || [];
    for (const c of chunks) {
      const d = String(c).replace(/\D/g, '');
      if (d.length >= 7 && hit(d)) return true;
    }
    return false;
  } catch { return false; }
}

const isEmoji = (s = '') => {
  const t = String(s).trim();
  if (!t || t.length > 12) return false;
  return /\p{Extended_Pictographic}/u.test(t);
};

// ── V17 · quoted-sticker helpers (same pattern as rich/sreact) ──

/** Find a stickerMessage object from EVERY XADON/Baileys quoted shape. */
function getQuotedStickerMessage(quoted) {
  if (!quoted) return null;
  if (quoted.stickerMessage) return quoted.stickerMessage;
  if (quoted.lottieStickerMessage) return quoted.lottieStickerMessage;
  if (quoted.message?.stickerMessage) return quoted.message.stickerMessage;
  if (quoted.message?.lottieStickerMessage) return quoted.message.lottieStickerMessage;
  if (quoted.quotedMessage?.stickerMessage) return quoted.quotedMessage.stickerMessage;
  if (quoted.raw?.message?.stickerMessage) return quoted.raw.message.stickerMessage;
  if (quoted.mtype === 'stickerMessage' || quoted.mtype === 'lottieStickerMessage') return quoted;
  if (quoted.type === 'stickerMessage') return quoted.message || quoted;
  return null;
}

/** True when m carries a quoted sticker in ANY known holder. */
function hasQuotedSticker(m) {
  try {
    if (!m) return false;
    if (m.quoted && (m.quoted.type === 'stickerMessage' || getQuotedStickerMessage(m.quoted))) return true;
    if (m.quotedMessage && getQuotedStickerMessage(m.quotedMessage)) return true;
    const ctx = m.raw?.message?.extendedTextMessage?.contextInfo
      || m.message?.extendedTextMessage?.contextInfo
      || m.raw?.message?.imageMessage?.contextInfo
      || m.raw?.message?.videoMessage?.contextInfo
      || m.raw?.message?.stickerMessage?.contextInfo;
    if (ctx?.quotedMessage?.stickerMessage || ctx?.quotedMessage?.lottieStickerMessage) return true;
    return false;
  } catch { return false; }
}

/** Download the quoted sticker buffer, trying every known path. */
async function downloadQuotedSticker(m) {
  const errs = [];
  // 1 · serialized helper (normal path)
  try {
    if (m?.quoted?.download) {
      const buf = await m.quoted.download();
      if (buf && buf.length) return buf;
    }
  } catch (e) { errs.push(String(e.message || e)); }
  // 2 · Baileys direct on the quoted raw holder
  try {
    const { downloadMediaMessage } = require('@musteqeem/baileys');
    const qRaw = m?.quoted?.raw;
    if (qRaw?.message) {
      const buf = await downloadMediaMessage(qRaw, 'buffer', {});
      if (buf && buf.length) return buf;
    }
  } catch (e) { errs.push(String(e.message || e)); }
  // 3 · Baileys direct on the parent raw (quotedMessage inside contextInfo)
  try {
    const { downloadMediaMessage } = require('@musteqeem/baileys');
    if (m?.raw?.message) {
      const msg = m.raw.message;
      const key = Object.keys(msg)[0] || '';
      const ctx = msg[key]?.contextInfo || {};
      if (ctx.quotedMessage && (ctx.quotedMessage.stickerMessage || ctx.quotedMessage.lottieStickerMessage)) {
        const qRaw = { key: { remoteJid: m.chat, id: ctx.stanzaId, participant: ctx.participant, fromMe: false }, message: ctx.quotedMessage };
        const buf = await downloadMediaMessage(qRaw, 'buffer', {});
        if (buf && buf.length) return buf;
      }
    }
  } catch (e) { errs.push(String(e.message || e)); }
  const err = new Error(errs.filter(Boolean).join(' | ').slice(0, 200) || 'could not download sticker');
  throw err;
}

/**
 * V17 · Sticker-react (sreact pattern): bind a sticker to the tagger's
 * message via messageAssociation associationType 11. Uses the FULL
 * parentMessageKey (remoteJid + id + participant + fromMe), relays with
 * relayMessage, and falls back to a plain quoted sticker send.
 */
async function stickerReact(sock, chat, tagKey, buf) {
  const fullKey = {
    remoteJid: tagKey?.remoteJid || chat,
    fromMe: tagKey?.fromMe ?? false,
    id: tagKey?.id,
    participant: tagKey?.participant || undefined,
  };
  if (!fullKey.participant) delete fullKey.participant;
  if (!fullKey?.id) return false;
  try {
    if (typeof sock?.relayMessage === 'function') {
      await sock.relayMessage(chat, {
        messageContextInfo: { messageAssociation: { associationType: 11, parentMessageKey: fullKey } },
        stickerMessage: { sticker: buf, mimetype: 'image/webp' },
      }, {});
      return true;
    }
  } catch {}
  try {
    if (typeof sock?.sendMessage === 'function') {
      await sock.sendMessage(chat, {
        messageContextInfo: { messageAssociation: { associationType: 11, parentMessageKey: fullKey } },
        stickerMessage: { sticker: buf, mimetype: 'image/webp' },
      }).catch(() => {});
      return true;
    }
  } catch {}
  return false;
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
        await sock.sendMessage(m.chat, { text: body, mentions: mentionJids(m) }, { quoted: raw }).catch(() => {});
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
      'Triggers: @tag · reply to owner · raw number (234… / @234…)',
    ].join('\n'),
  });
}

module.exports = {
  name: 'mention',
  alias: ['mentions', 'tagme', 'ownertag'],
  desc: 'Auto react/reply whenever the owner is tagged',
  usage: '.mention -r 😎 | .mention -m <text> | .mention on/off/status',
  category: 'owner',
  owner: true,
  getCfg, setCfg, ownerTagged, isOwnerJid, sameOwner, doRespond, mentionJids, hasQuotedSticker, downloadQuotedSticker, stickerReact, R_FILE, M_FILE,
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
        if (!hasQuotedSticker(m)) return reply(ui.notice('info', 'Reply to a sticker', `Reply to the sticker you want, then send:\n${prefix}mention -r sticker`));
        try {
          const buf = await downloadQuotedSticker(m);
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
        if (!hasQuotedSticker(m)) return reply(ui.notice('info', 'Reply to a sticker', `Reply to the sticker you want, then send:\n${prefix}mention -m sticker`));
        try {
          const buf = await downloadQuotedSticker(m);
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
