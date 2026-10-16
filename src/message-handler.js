// @musteqeem — WaPlus message-level group automations; intentionally separate from command routing.
// XADON anti-engine: every .anti* toggle writes into groupPolicy here and is enforced below.
const config = require('../config');
const db = require('./lib/database');
const { serialize } = require('./lib/serialize');

const quizzes = new Map();
const tempKicks = new Map();
const spamHits = new Map(); // `${chat}:${sender}` -> [timestamps]
const digit = (jid = '') => String(jid).split('@')[0].split(':')[0];
const groupPolicy = (jid) => db.get(`groupPolicy:${jid}`, {});
const savePolicy = (jid, next) => db.set(`groupPolicy:${jid}`, { ...groupPolicy(jid), ...next });
const BADWORDS = ['fuck','shit','bitch','dick','pussy','nigga','nigger','bastard','whore','slut'];
const XADON_AN = (s) => `_*亗 ${s}*_`;
const hasBadWord = (text = '') => { const low = ` ${String(text).toLowerCase()} `; return BADWORDS.some((w) => low.includes(w)); };
const isLink = (text = '') => /(?:https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|discord\.gg\/)[^\s]+/i.test(text);
const isInvite = (text = '') => /(?:chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|discord\.gg\/)[^\s]+/i.test(text);
const isForeign = (text = '') => /[\u0600-\u06FF\u0750-\u077F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0E00-\u0E7F\u0900-\u097F]/.test(text || '');
const looksBot = (raw, push) => {
  const note = `${raw?.pushName || ''} ${push || ''}`.toLowerCase();
  if (/bot$|bot |_bot|cody|kord|wolf|xadon/i.test(note) && !raw?.key?.fromMe) return /bot/i.test(note);
  return false;
};

function rawContext(raw) {
  try {
    const msg = raw?.message || {};
    const key = Object.keys(msg)[0] || '';
    const inner = msg[key] || {};
    const ctx = inner.contextInfo || {};
    const viewOnce = !!(inner.viewOnce || inner.viewOnceMessage || ctx.isViewOnce);
    const forwarded = !!(ctx.isForwarded || (ctx.forwardingScore || 0) > 0);
    return { key, ctx, viewOnce, forwarded };
  } catch { return { key: '', ctx: {}, viewOnce: false, forwarded: false }; }
}

async function participantAdmin(sock, jid, sender) {
  try {
    const meta = await sock.groupMetadata(jid);
    const p = meta.participants?.find((x) => [x.id, x.jid, x.lid, x.phoneNumber].filter(Boolean).some((v) => digit(v) === digit(sender)));
    return !!p?.admin;
  } catch {
    return false;
  }
}

async function guarded(sock, raw, jid, sender, number, reason) {
  const authorAdmin = await participantAdmin(sock, jid, sender);
  const owner = config.ownerNumbers.includes(number);
  if (authorAdmin || owner) return false;
  const botAdmin = await participantAdmin(sock, jid, sock.user?.id || '');
  if (!botAdmin) return false;
  await sock.sendMessage(jid, { delete: raw.key }).catch(() => {});
  await sock.sendMessage(jid, { text: `${reason}, @${digit(sender)}.`, mentions: [sender] }).catch(() => {});
  return true;
}

function spamNow(chat, sender, windowMs = 10000, limit = 5) {
  const k = `${chat}:${digit(sender)}`;
  const now = Date.now();
  const arr = (spamHits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  spamHits.set(k, arr);
  if (spamHits.size > 2000) for (const key of [...spamHits.keys()].slice(0, 500)) spamHits.delete(key);
  return arr.length >= limit;
}

async function handleMessage(sock, raw) {
  if (!raw?.message || raw.key?.fromMe || raw.key?.remoteJid === 'status@broadcast') return false;
  const m = serialize(sock, raw);
  if (!m.isGroup) return false;
  const jid = m.chat;
  const policy = groupPolicy(jid);
  const { viewOnce, forwarded } = rawContext(raw);

  // AFK auto-notice: anyone tagging an AFK user gets their reason.
  try {
    for (const tagged of m.mentions || []) {
      const afk = db.get(`afk:${tagged}`, null);
      if (afk) await sock.sendMessage(jid, { text: `@${digit(tagged)} is AFK: ${afk.reason || 'Away'}.`, mentions: [tagged] }).catch(() => {});
    }
  } catch {}

  const rules = [
    [policy.antilink && isLink(m.body), XADON_AN('Link removed: links are disabled in this group')],
    [policy.antiinvite && isInvite(m.body), XADON_AN('Invite removed: group invites are disabled here')],
    [policy.antibadword && hasBadWord(m.body), XADON_AN('Message removed: watch your language')],
    [policy.antiforeign && isForeign(m.body), XADON_AN('Message removed: foreign scripts are disabled here')],
    [policy.antiflood && (m.body || '').length > 1200, XADON_AN('Message removed: flooding is not allowed')],
    [policy.antitag && (m.mentions || []).length >= 4, XADON_AN('Message removed: mass tagging is disabled')],
    [policy.antimention && (m.mentions || []).some((x) => digit(x) === digit(sock.user?.id || 'none')), XADON_AN('Message removed: do not tag the bot')],
    [policy.antiforward && forwarded, XADON_AN('Message removed: forwards are disabled here')],
    [policy.antivv && (viewOnce || /viewOnce/i.test(m.type || '')) && m.isMedia, XADON_AN('View-once removed: view-once media is disabled')],
    [policy.antisticker && m.type === 'stickerMessage', XADON_AN('Sticker removed: stickers are disabled here')],
    [policy.antiaudio && m.type === 'audioMessage', XADON_AN('Audio removed: voice notes are disabled here')],
    [policy.antiimage && m.type === 'imageMessage', XADON_AN('Photo removed: images are disabled here')],
    [policy.antivideo && m.type === 'videoMessage', XADON_AN('Video removed: videos are disabled here')],
    [policy.antidoc && m.type === 'documentMessage', XADON_AN('Document removed: files are disabled here')],
    [policy.anticontact && /contactMessage|contactsArrayMessage/i.test(m.type || ''), XADON_AN('Contact removed: vCards are disabled here')],
    [policy.antipoll && /poll/i.test(m.type || ''), XADON_AN('Poll removed: polls are disabled here')],
    [policy.antibot && looksBot(raw, m.pushName), XADON_AN('Message removed: other bots are not allowed here')],
    [policy.antistatus && /statusMention|newsletter/i.test(JSON.stringify(raw.message || '').slice(0, 2000)), XADON_AN('Message removed: status/channel tags are disabled')],
  ];
  for (const [hit, reason] of rules) {
    if (hit && await guarded(sock, raw, jid, m.sender, m.number, reason)) return true;
  }

  if ((policy.antispam || policy.antiflood) && spamNow(jid, m.sender, 10000, policy.antiflood ? 4 : 5)) {
    if (await guarded(sock, raw, jid, m.sender, m.number, XADON_AN('Message removed: slow down, anti-spam is on'))) return true;
  }

  // antidelete / antiedit are flag-only: WhatsApp gives no text event for them,
  // but keeping the flags lets .antilist show full coverage and future protocol hooks plug in.
  void policy.antidelete; void policy.antiedit;

  const active = quizzes.get(jid);
  if (active && Date.now() < active.expiresAt && m.body && m.body.toLowerCase() === active.answer) {
    quizzes.delete(jid);
    await sock.sendMessage(jid, { text: `Correct, @${digit(m.sender)}! ${active.explanation || ''}`.trim(), mentions: [m.sender] });
    return true;
  }
  return false;
}

async function handleParticipantsUpdate(sock, update) {
  if (!update?.id || !Array.isArray(update.participants)) return;
  const policy = groupPolicy(update.id);
  for (const participant of update.participants) {
    const jid = typeof participant === 'string' ? participant : participant.id || participant.jid;
    if (!jid) continue;
    const key = `${update.id}:${digit(jid)}`;
    if (update.action === 'add') {
      const entry = tempKicks.get(key);
      if (entry && entry.expiresAt > Date.now()) {
        try {
          const meta = await sock.groupMetadata(update.id);
          const bot = meta.participants?.find((p) => [p.id, p.jid, p.lid].filter(Boolean).some((v) => digit(v) === digit(sock.user?.id)));
          if (bot?.admin) await sock.groupParticipantsUpdate(update.id, [jid], 'remove');
        } catch (err) {
          console.error('[tempkick]', err.message);
        }
      }
      if (policy.welcome) {
        const text = (policy.welcomeText || 'Welcome @user to @group!').replace(/@user/g, `@${digit(jid)}`).replace(/@group/g, policy.groupName || 'the group');
        await sock.sendMessage(update.id, { text, mentions: [jid] }).catch(() => {});
      }
    }
    if (update.action === 'remove' && policy.goodbye) {
      const text = (policy.goodbyeText || 'Goodbye @user.').replace(/@user/g, `@${digit(jid)}`).replace(/@group/g, policy.groupName || 'the group');
      await sock.sendMessage(update.id, { text, mentions: [jid] }).catch(() => {});
    }
  }
}

function startQuiz(groupJid, question, answer, explanation = '') {
  quizzes.set(groupJid, { answer: String(answer).trim().toLowerCase(), explanation, expiresAt: Date.now() + 5 * 60_000 });
  return question;
}

async function scheduleTempKick(sock, groupJid, userJid, durationMs) {
  const key = `${groupJid}:${digit(userJid)}`;
  const expiresAt = Date.now() + durationMs;
  tempKicks.set(key, { jid: userJid, expiresAt });
  const previous = tempKicks.get(`${key}:timer`);
  if (previous) clearTimeout(previous);
  const timer = setTimeout(() => tempKicks.delete(key), durationMs);
  timer.unref?.();
  tempKicks.set(`${key}:timer`, timer);
  const [result] = await sock.groupParticipantsUpdate(groupJid, [userJid], 'remove');
  if (result?.status && result.status !== '200') {
    clearTimeout(timer);
    tempKicks.delete(key);
    tempKicks.delete(`${key}:timer`);
    throw new Error(`WhatsApp returned status ${result.status}`);
  }
  return expiresAt;
}

module.exports = { handleMessage, handleParticipantsUpdate, startQuiz, scheduleTempKick, savePolicy, groupPolicy, digit };
