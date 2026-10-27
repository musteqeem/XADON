// XADON V6 · WaPlus group automations + ANTI ENGINE.
// Every .anti* toggle writes into groupPolicy here and is enforced below.
//
// POLICY MODES (all group antis support them):
//   off   — disabled                                    (.antilink off)
//   on    — delete the message + warn text only         (.antilink on)
//   warn  — delete + warn; 3 warns = auto-kick          (.antilink warn)
//   kick  — delete + kick immediately                   (.antilink kick)
//
// Warns share the manual .warn system (db key warns:<chat>:<jid>),
// so .warnings shows anti-warns and 3 strikes = removal everywhere.
const config = require('../config');
const db = require('./lib/database');
const { serialize } = require('./lib/serialize');

const quizzes = new Map();
const tempKicks = new Map();
const spamHits = new Map(); // `${chat}:${sender}` -> [timestamps]
const dupTrack = new Map(); // `${chat}:${sender}` -> { body, count, at }
const joinAt = new Map();   // `${chat}:${sender}` -> timestamp
const digit = (jid = '') => String(jid).split('@')[0].split(':')[0];
const groupPolicy = (jid) => db.get(`groupPolicy:${jid}`, {});
const savePolicy = (jid, next) => db.set(`groupPolicy:${jid}`, { ...groupPolicy(jid), ...next });

const BADWORDS = ['fuck', 'shit', 'bitch', 'dick', 'pussy', 'nigga', 'nigger', 'bastard', 'whore', 'slut', 'asshole', 'motherfucker', 'fucker', 'cunt', 'dildo', 'porn', 'hentai', 'horny', 'sexy bitch', 'kill yourself', 'kys'];
const XADON_AN = (s) => `_*亗 ${s}*_`;
const hasBadWord = (text = '') => { const low = ` ${String(text).toLowerCase()} `; return BADWORDS.some((w) => low.includes(w)); };
const isLink = (text = '') => /(?:https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|discord\.gg\/|bit\.ly|tinyurl|youtu\.be)[^\s]+/i.test(text);
const isInvite = (text = '') => /(?:chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|discord\.gg\/)[^\s]+/i.test(text);
const isForeign = (text = '') => /[\u0600-\u06FF\u0750-\u077F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0E00-\u0E7F\u0900-\u097F]/.test(text || '');
const hasPhone = (text = '') => /(?:\+\d[\d\s\-.()]{6,}\d|\b\d{3}[\s\-.]?\d{3}[\s\-.]?\d{4,}\b|\b\d{9,}\b)/.test(text || '');
const hasEmail = (text = '') => /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text || '');
const isShortLink = (text = '') => /(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|cutt\.ly|rebrand\.ly|tiny\.cc|ow\.ly|buff\.ly|adf\.ly|shorte\.st|linktr\.ee|shorturl\.at)[^\s]*/i.test(text || '');
const emojiCount = (text = '') => (String(text).match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu) || []).length;
const hasBug = (text = '') => {
  const t = String(text || '');
  if (t.length > 3000) return true;
  if (/(.)\1{24,}/.test(t)) return true;                       // aaaaaaaaa… freeze walls
  if (/[‮‭​‌‍﻿￾]{8,}/.test(t)) return true;                     // invisible / bidi crash chars
  if (/[̀-ͯ]{12,}/.test(t)) return true;                          // zalgo combining-mark floods
  return false;
};
const capsShout = (text = '') => {
  const letters = (String(text).match(/[A-Za-z]/g) || []).length;
  if (letters < 12) return false;
  const caps = (String(text).match(/[A-Z]/g) || []).length;
  return caps / letters >= 0.7;
};
const dupSpam = (chat, sender, body = '') => {
  const t = String(body || '').trim();
  if (t.length < 5) return false;
  const k = `${chat}:${digit(sender)}`;
  const now = Date.now();
  const prev = dupTrack.get(k);
  if (prev && prev.body === t && now - prev.at < 60000) {
    prev.count += 1; prev.at = now;
    dupTrack.set(k, prev);
    return prev.count >= 3;
  }
  dupTrack.set(k, { body: t, count: 1, at: now });
  if (dupTrack.size > 2000) for (const key of [...dupTrack.keys()].slice(0, 500)) dupTrack.delete(key);
  return false;
};
const lagosHour = () => Number(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', hour12: false }));
const isNight = () => [23, 0, 1, 2, 3, 4].includes(lagosHour());
const isNewcomer = (chat, sender, windowMs = 10 * 60_000) => {
  const at = joinAt.get(`${chat}:${digit(sender)}`);
  return !!(at && Date.now() - at < windowMs);
};

/**
 * XADON AI message-ID rule:
 * XADON AI's own outgoing IDs always contain the tag "XADON" somewhere
 * inside the ID (e.g. BAE5…XADON…). Any id carrying XADON = our family = NEVER a bot.
 * Any other BAE5… id from someone else = another bot's engine output = block it.
 */
const isXadonId = (id = '') => /XADON/i.test(String(id || ''));
const looksBot = (raw, push) => {
  const id = String(raw?.key?.id || '');
  if (!id || isXadonId(id)) return false;                 // XADON AI family → exempt
  if (/^BAE5/i.test(id) && !raw?.key?.fromMe) return true; // foreign bot engine id
  const note = `${raw?.pushName || ''} ${push || ''}`.toLowerCase();
  if (/bot$|bot |_bot|cody|kord|wolf/i.test(note) && !raw?.key?.fromMe) return /bot/i.test(note);
  return false;
};

function rawContext(raw) {
  try {
    const msg = raw?.message || {};
    const key = Object.keys(msg)[0] || '';
    const inner = msg[key] || {};
    const ctx = inner.contextInfo || {};
    const viewOnce = !!(inner.viewOnce || inner.viewOnceMessage || ctx.isViewOnce);
    const forwardingScore = Number(ctx.forwardingScore || 0);
    const forwarded = !!(ctx.isForwarded || forwardingScore > 0);
    return { key, ctx, viewOnce, forwarded, forwardingScore };
  } catch { return { key: '', ctx: {}, viewOnce: false, forwarded: false, forwardingScore: 0 }; }
}

// ── V8 · 10 NEW anti detectors ──
const isCodeBlock = (text = '') => /```/.test(String(text)) || /~~~/.test(String(text));
const hasFancyFont = (text = '') => {
  const t = String(text);
  const fancy = (t.match(/[\u{1D400}-\u{1D7FF}\uFF01-\uFF5E]/gu) || []).length;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  return fancy >= 6 && letters >= 6 && fancy / Math.max(letters, 1) >= 0.35;
};
const isCloudLink = (text = '') => /(mediafire\.com|drive\.google\.com|dropbox\.com|mega\.nz|onedrive\.live\.com|1drv\.ms|anonfiles|gofile\.io|terabox|zippyshare|sendspace\.com)[^\s]*/i.test(String(text));
const isApkLink = (text = '') => /\.apk(\?|\s|$)/i.test(String(text)) || /(apkmirror|apkpure|apkcombo|modapk|happymod)[^\s]*/i.test(String(text));
const NSFW_WORDS = ['pornhub', 'xvideos', 'xhamster', 'onlyfans', 'camgirl', 'escort service', 'nude pic', 'nude video', 'sex chat', 'adult video', 'xxx video', 'erotic story', 'bdsm', 'orgy', 'masturbat'];
const hasNsfw = (text = '') => { const low = ` ${String(text).toLowerCase()} `; return NSFW_WORDS.some((w) => low.includes(w)); };
const SCAM_PATTERNS = [/free\s+(money|cash|gift|iphone|airtime|data)/i, /win\s+(cash|prize|lottery|\$)/i, /click\s+to\s+earn/i, /double\s+your\s+(money|crypto)/i, /send\s+\$?\d+.*(get|receive)\s+\$?\d+/i, /investment\s+bonus/i, /claim\s+(your|free).*(reward|bonus|prize)/i, /forex\s+(doubler|bot|guaranteed)/i];
const isScam = (text = '') => SCAM_PATTERNS.some((re) => re.test(String(text)));
const isWallOfText = (text = '') => { const t = String(text); return t.split(/\r?\n/).length >= 16 || (t.length >= 1500 && (t.match(/\n/g) || []).length >= 8); };
const BET_PATTERNS = [/\b(odd|odds|stake|parlay|accumulator)\b/i, /bet9ja|sportybet|1xbet|betway|nairabet/i, /sure\s+odds/i, /fixed\s+match/i, /correct\s+score\s+tip/i];
const isBetting = (text = '') => BET_PATTERNS.some((re) => re.test(String(text)));

async function participantAdmin(sock, jid, sender) {
  try {
    const meta = await sock.groupMetadata(jid);
    const p = meta.participants?.find((x) => [x.id, x.jid, x.lid, x.phoneNumber].filter(Boolean).some((v) => digit(v) === digit(sender)));
    return !!p?.admin;
  } catch {
    return false;
  }
}

// ── mode helpers ──
function modeOf(value) {
  if (value === true || value === 'on' || value === 'enable' || value === 1 || value === '1' || value === 'delete') return 'on';
  const v = String(value ?? '').toLowerCase().trim();
  if (['warn', 'warns', 'warning', 'warnings'].includes(v)) return 'warn';
  if (['kick', 'remove', 'ban'].includes(v)) return 'kick';
  if (['on', 'enable', 'yes', 'delete'].includes(v)) return 'on';
  return 'off';
}
const policyMode = (policy, key) => modeOf(policy?.[key]);
const modeActive = (policy, key) => policyMode(policy, key) !== 'off';

async function pushAntiWarn(chat, jid, rule, reason) {
  const key = `warns:${chat}:${jid}`;
  const warns = db.get(key, []);
  warns.push({ by: `anti-${rule}`, reason: String(reason).slice(0, 200), at: Date.now() });
  const kept = warns.slice(-10);
  db.set(key, kept);
  return kept.length;
}
function clearAntiWarn(chat, jid) { db.set(`warns:${chat}:${jid}`, []); }

/** Delete + enforce the rule's mode. Returns true when the message was handled. */
async function enforce(sock, raw, jid, sender, number, reason, rule) {
  const policy = groupPolicy(jid);
  const mode = modeOf(policy[rule]);
  if (mode === 'off') return false;
  const authorAdmin = await participantAdmin(sock, jid, sender);
  const owner = config.ownerNumbers.includes(number) || isPrivilegedSender(number);
  if (authorAdmin || owner) return false;
  const botAdmin = await participantAdmin(sock, jid, sock.user?.id || '');
  if (!botAdmin) return false;

  await sock.sendMessage(jid, { delete: raw.key }).catch(() => {});
  const tag = `@${digit(sender)}`;
  const cleanReason = String(reason).replace(/^_\*亗\s*/, '').replace(/\*_$/, '');

  if (mode === 'kick') {
    try {
      await sock.groupParticipantsUpdate(jid, [sender], 'remove');
      await sock.sendMessage(jid, { text: XADON_AN(`${cleanReason}, ${tag} — removed (anti-${rule} kick mode).`), mentions: [sender] }).catch(() => {});
    } catch {
      await sock.sendMessage(jid, { text: XADON_AN(`${cleanReason}, ${tag} — I could not remove them (make me admin).`), mentions: [sender] }).catch(() => {});
    }
    return true;
  }
  if (mode === 'warn') {
    const n = await pushAntiWarn(jid, sender, rule, cleanReason);
    if (n >= 3) {
      clearAntiWarn(jid, sender);
      try {
        await sock.groupParticipantsUpdate(jid, [sender], 'remove');
        await sock.sendMessage(jid, { text: XADON_AN(`3/3 strikes — ${tag} removed (anti-${rule}: ${cleanReason}).`), mentions: [sender] }).catch(() => {});
      } catch {
        await sock.sendMessage(jid, { text: XADON_AN(`3/3 strikes — ${tag} should be removed but I lack admin rights.`), mentions: [sender] }).catch(() => {});
      }
    } else {
      await sock.sendMessage(jid, { text: XADON_AN(`warning ${n}/3 — ${tag}: ${cleanReason} (anti-${rule}).`), mentions: [sender] }).catch(() => {});
    }
    return true;
  }
  // on: delete + single notice
  await sock.sendMessage(jid, { text: `${reason}, ${tag}.`, mentions: [sender] }).catch(() => {});
  return true;
}

// V8 · privileged senders (hard-owner / mod / sudo) are never anti-punished
function isPrivilegedSender(number) {
  try {
    const privs = require('./lib/privs');
    return privs.isSudoPriv(db, config, number);
  } catch { return false; }
}

// legacy simple delete-only path (kept for compatibility)
async function guarded(sock, raw, jid, sender, number, reason) {
  const authorAdmin = await participantAdmin(sock, jid, sender);
  const owner = config.ownerNumbers.includes(number) || isPrivilegedSender(number);
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
  const { viewOnce, forwarded, forwardingScore } = rawContext(raw);
  // V8 · admin-tag detection needs the admin list (lazy, only when antiadmin is armed)
  let adminJids = null;
  const tagsAdmin = async () => {
    try {
      if (!modeActive(policy, 'antiadmin')) return false;
      if (!(m.mentions || []).length) return false;
      if (!adminJids) {
        const meta = await sock.groupMetadata(jid).catch(() => null);
        adminJids = (meta?.participants || []).filter((p) => p.admin).map((p) => digit(p.id));
      }
      return (m.mentions || []).some((x) => adminJids.includes(digit(x)));
    } catch { return false; }
  };
  const hitAntiAdmin = modeActive(policy, 'antiadmin') && (m.mentions || []).length > 0 && await tagsAdmin();

  // AFK auto-notice: anyone tagging an AFK user gets their reason.
  try {
    for (const tagged of m.mentions || []) {
      const afk = db.get(`afk:${tagged}`, null);
      if (afk) await sock.sendMessage(jid, { text: `@${digit(tagged)} is AFK: ${afk.reason || 'Away'}.`, mentions: [tagged] }).catch(() => {});
    }
  } catch {}

  const rawStr = (() => { try { return JSON.stringify(raw.message || '').slice(0, 4000); } catch { return ''; } })();
  const isGif = m.type === 'videoMessage' && !!(m.message?.videoMessage?.gifPlayback);
  const isCallLog = /callLog|callLogMessage|callCreation/i.test(m.type || '') || /callLog/i.test(rawStr);
  const isChannelFwd = !!(rawContext(raw).ctx?.forwardedNewsletterMessageInfo) || /forwardedNewsletterMessageInfo/i.test(rawStr);
  const isEvent = /eventMessage|scheduledCallCreation|eventCreation/i.test(m.type || '') || /scheduledCallCreationMessage|eventMessage/i.test(rawStr);
  const isLocation = /locationMessage|liveLocationMessage/i.test(m.type || '');
  const isPin = /pinInChatMessage|keepInChatMessage/i.test(m.type || '') || /pinInChatMessage/i.test(rawStr);
  const isReaction = m.type === 'reactionMessage';
  const isShare = /productMessage|orderMessage|catalogMessage|paymentInvite|sendPayment|interactiveMessage/i.test(m.type || '');
  const isHidetag = (m.mentions || []).length >= 4 && !(m.body || '').includes('@');
  const isGroupStatusMsg = /groupStatusMessage|groupStatus/i.test(rawStr);
  const isStatusReply = /status@broadcast/i.test(rawStr) && !!m.quoted;
  const ugBlob = `${m.body || ''}`;

  // [active?, reason, ruleKey] — every rule carries its warn/kick mode.
  const rules = [
    [modeActive(policy, 'antilink') && isLink(m.body), XADON_AN('Link removed: links are not allowed in this group'), 'antilink'],
    [modeActive(policy, 'antiinvite') && isInvite(m.body), XADON_AN('Invite removed: group invites are disabled here'), 'antiinvite'],
    [modeActive(policy, 'antibadword') && hasBadWord(m.body), XADON_AN('Message removed: watch your language'), 'antibadword'],
    [modeActive(policy, 'antiforeign') && isForeign(m.body), XADON_AN('Message removed: foreign scripts are disabled here'), 'antiforeign'],
    [modeActive(policy, 'antiflood') && (m.body || '').length > 1200, XADON_AN('Message removed: flooding is not allowed'), 'antiflood'],
    [modeActive(policy, 'antitag') && (m.mentions || []).length >= 4, XADON_AN('Message removed: mass tagging is disabled'), 'antitag'],
    [modeActive(policy, 'antimention') && (m.mentions || []).some((x) => digit(x) === digit(sock.user?.id || 'none')), XADON_AN('Message removed: do not tag the bot'), 'antimention'],
    [modeActive(policy, 'antiforward') && forwarded, XADON_AN('Message removed: forwards are disabled here'), 'antiforward'],
    [modeActive(policy, 'antivv') && (viewOnce || /viewOnce/i.test(m.type || '')) && m.isMedia, XADON_AN('View-once removed: view-once media is disabled'), 'antivv'],
    [modeActive(policy, 'antisticker') && m.type === 'stickerMessage', XADON_AN('Sticker removed: stickers are disabled here'), 'antisticker'],
    [modeActive(policy, 'antiaudio') && m.type === 'audioMessage', XADON_AN('Audio removed: voice notes are disabled here'), 'antiaudio'],
    [modeActive(policy, 'antiimage') && m.type === 'imageMessage', XADON_AN('Photo removed: images are disabled here'), 'antiimage'],
    [modeActive(policy, 'antivideo') && m.type === 'videoMessage' && !isGif, XADON_AN('Video removed: videos are disabled here'), 'antivideo'],
    [modeActive(policy, 'antidoc') && m.type === 'documentMessage', XADON_AN('Document removed: files are disabled here'), 'antidoc'],
    [modeActive(policy, 'anticontact') && /contactMessage|contactsArrayMessage/i.test(m.type || ''), XADON_AN('Contact removed: vCards are disabled here'), 'anticontact'],
    [modeActive(policy, 'antipoll') && /poll/i.test(m.type || ''), XADON_AN('Poll removed: polls are disabled here'), 'antipoll'],
    [modeActive(policy, 'antibot') && looksBot(raw, m.pushName), XADON_AN('Message removed: other bots are not allowed here'), 'antibot'],
    [modeActive(policy, 'antistatus') && /statusMention|newsletter/i.test(rawStr), XADON_AN('Message removed: status/channel tags are disabled'), 'antistatus'],
    [modeActive(policy, 'anticall') && isCallLog, XADON_AN('Call log removed: call messages are disabled here'), 'anticall'],
    [modeActive(policy, 'antichannel') && isChannelFwd, XADON_AN('Channel forward removed: channel posts are disabled here'), 'antichannel'],
    [modeActive(policy, 'antievent') && isEvent, XADON_AN('Event removed: group events are disabled here'), 'antievent'],
    [modeActive(policy, 'antigif') && isGif, XADON_AN('GIF removed: gifs are disabled here'), 'antigif'],
    [modeActive(policy, 'antihidetag') && isHidetag, XADON_AN('Hidetag removed: hidden mentions are disabled here'), 'antihidetag'],
    [modeActive(policy, 'antilocation') && isLocation, XADON_AN('Location removed: live/location shares are disabled here'), 'antilocation'],
    [modeActive(policy, 'antinight') && isNight(), XADON_AN('Night mode: the group is quiet right now (23:00–05:00 Lagos)'), 'antinight'],
    [modeActive(policy, 'antipin') && isPin, XADON_AN('Pin removed: pins are disabled here'), 'antipin'],
    [modeActive(policy, 'antireact') && isReaction, XADON_AN('Reaction removed: reactions are disabled here'), 'antireact'],
    [modeActive(policy, 'antishare') && isShare, XADON_AN('Share removed: product/order shares are disabled here'), 'antishare'],
    [modeActive(policy, 'antigroupstatus') && isGroupStatusMsg, XADON_AN('Group-status post removed: group statuses are disabled here'), 'antigroupstatus'],
    [modeActive(policy, 'antistatusreply') && isStatusReply, XADON_AN('Status reply removed: replying to statuses is disabled here'), 'antistatusreply'],
    // ── V6 · 10 NEW antis ──
    [modeActive(policy, 'antiphone') && hasPhone(m.body), XADON_AN('Message removed: phone numbers are not allowed here'), 'antiphone'],
    [modeActive(policy, 'antiemail') && hasEmail(m.body), XADON_AN('Message removed: email addresses are not allowed here'), 'antiemail'],
    [modeActive(policy, 'antiemoji') && emojiCount(m.body) >= 8, XADON_AN('Message removed: emoji floods are not allowed here'), 'antiemoji'],
    [modeActive(policy, 'antibug') && hasBug(m.body), XADON_AN('Message removed: crash/virus texts are not allowed here'), 'antibug'],
    [modeActive(policy, 'antishort') && isShortLink(m.body), XADON_AN('Message removed: shortened/masked links are not allowed'), 'antishort'],
    [modeActive(policy, 'antiduplicate') && dupSpam(jid, m.sender, m.body), XADON_AN('Message removed: sending the same message repeatedly is not allowed'), 'antiduplicate'],
    [modeActive(policy, 'anticaps') && capsShout(m.body), XADON_AN('Message removed: excessive CAPS shouting is not allowed'), 'anticaps'],
    [modeActive(policy, 'antijoin') && isNewcomer(jid, m.sender) && (isLink(m.body) || m.isMedia), XADON_AN('Message removed: new members cannot send links/media yet'), 'antijoin'],
    // ── V8 · 10 NEWER antis ──
    [modeActive(policy, 'anticode') && isCodeBlock(m.body), XADON_AN('Code removed: code blocks are not allowed here'), 'anticode'],
    [modeActive(policy, 'antifont') && hasFancyFont(m.body), XADON_AN('Message removed: fancy/styled fonts are not allowed here'), 'antifont'],
    [hitAntiAdmin, XADON_AN('Message removed: tagging admins is not allowed here'), 'antiadmin'],
    [modeActive(policy, 'antibroadcast') && (forwardingScore >= 5 || /forwarded.*many|broadcast/i.test(rawStr)), XADON_AN('Broadcast removed: highly-forwarded messages are not allowed'), 'antibroadcast'],
    [modeActive(policy, 'anticloud') && isCloudLink(m.body), XADON_AN('Link removed: cloud-drive links are not allowed here'), 'anticloud'],
    [modeActive(policy, 'antiapk') && isApkLink(m.body), XADON_AN('File removed: APK files/links are not allowed here'), 'antiapk'],
    [modeActive(policy, 'antinsfw') && hasNsfw(m.body), XADON_AN('Message removed: adult/NSFW content is not allowed here'), 'antinsfw'],
    [modeActive(policy, 'antisurvey') && isScam(m.body), XADON_AN('Message removed: giveaway/scam messages are not allowed here'), 'antisurvey'],
    [modeActive(policy, 'antiwall') && isWallOfText(m.body), XADON_AN('Message removed: walls of text are not allowed here'), 'antiwall'],
    [modeActive(policy, 'antibet') && isBetting(m.body), XADON_AN('Message removed: betting/gambling tips are not allowed here'), 'antibet'],
  ];
  for (const [hit, reason, rule] of rules) {
    if (hit && await enforce(sock, raw, jid, m.sender, m.number, reason, rule)) return true;
  }

  // ── ANTIUG · the ultimate guard: one switch that covers everything ──
  if (modeActive(policy, 'antiug')) {
    const ugHit =
      isLink(ugBlob) || isInvite(ugBlob) || hasBadWord(ugBlob) || isForeign(ugBlob) ||
      hasPhone(ugBlob) || hasEmail(ugBlob) || isShortLink(ugBlob) || hasBug(ugBlob) ||
      capsShout(ugBlob) || emojiCount(ugBlob) >= 8 || forwarded ||
      isCodeBlock(ugBlob) || hasFancyFont(ugBlob) || isCloudLink(ugBlob) || isApkLink(ugBlob) ||
      hasNsfw(ugBlob) || isScam(ugBlob) || isWallOfText(ugBlob) || isBetting(ugBlob) ||
      looksBot(raw, m.pushName) || (m.mentions || []).length >= 4;
    if (ugHit && await enforce(sock, raw, jid, m.sender, m.number, XADON_AN('Ultimate guard: unwanted content is blocked while ANTIUG is on'), 'antiug')) return true;
  }

  if ((modeActive(policy, 'antispam') || modeActive(policy, 'antiflood')) && spamNow(jid, m.sender, 10000, modeActive(policy, 'antiflood') ? 4 : 5)) {
    const rule = modeActive(policy, 'antispam') ? 'antispam' : 'antiflood';
    if (await enforce(sock, raw, jid, m.sender, m.number, XADON_AN('Message removed: slow down, anti-spam is on'), rule)) return true;
  }

  // antidelete / antiedit / antidp are flag-only at message level:
  // deletes are captured in connection.js (messages.update revoke hook) into msgstore,
  // group-icon changes are reverted in connection.js group-update hook.
  void policy.antidelete; void policy.antiedit; void policy.antidp;
  void policy.antidesc; void policy.antiname; void policy.antijoinreq;

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
      joinAt.set(key, Date.now()); // newcomer guard timestamp
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
    if (update.action === 'remove') {
      joinAt.delete(key);
      if (policy.goodbye) {
        const text = (policy.goodbyeText || 'Goodbye @user.').replace(/@user/g, `@${digit(jid)}`).replace(/@group/g, policy.groupName || 'the group');
        await sock.sendMessage(update.id, { text, mentions: [jid] }).catch(() => {});
      }
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

module.exports = { handleMessage, handleParticipantsUpdate, startQuiz, scheduleTempKick, savePolicy, groupPolicy, modeOf, policyMode, digit, enforce, guarded };
