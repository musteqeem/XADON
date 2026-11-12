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
// V13 · bare-domain links with NO http/www (google.com, site.net, shop.xyz …) + "dot" evasions.
// Emails are stripped first so contact@company.com is NOT treated as a link.
const BARE_TLDS = 'com|net|org|io|me|gg|ly|be|tv|co|app|xyz|site|online|store|shop|biz|info|dev|link|click|live|fun|top|win|pro|vip|art|blog|news|tech|ai|ng|us|uk|de|fr|ru|in|br|za|gh|ke|to|cc|ws|fm';
const stripEmails = (t = '') => String(t).replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, ' ');
const isBareLink = (text = '') => {
  const t = stripEmails(text);
  if (!t || isLink(t)) return false;
  if (new RegExp(`(?:^|[\\s(>"'\u201c])((?:[a-z0-9-]{2,}\\.)+(?:${BARE_TLDS}))(?!\\.[a-z])(?:\\/[^\\s]*)?`, 'i').test(t)) return true;
  // spaced evasions: "example dot com", "example . com", "example,com"
  if (new RegExp(`\\b[a-z0-9-]{2,}\\s*(?:\\.|,|\\bdot\\b|\\bd0t\\b)\\s*(?:${BARE_TLDS})\\b`, 'i').test(t)) return true;
  return false;
};
const isAnyLink = (text = '') => isLink(text) || isBareLink(text);
// V13 · poll question + options as plain text (votes carry no text and never match).
const pollText = (raw) => {
  try {
    const msg = raw?.message || {};
    const inner = msg.pollCreationMessage || msg.pollCreationMessageV2 || msg.pollCreationMessageV3 || null;
    if (!inner) return '';
    const out = [];
    if (inner.name) out.push(inner.name);
    for (const o of inner.options || []) {
      if (typeof o === 'string') out.push(o);
      else if (o) out.push(o.optionName || o.name || '');
    }
    return out.filter(Boolean).join('\n');
  } catch { return ''; }
};
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

// ── V10 · 8 NEWER anti detectors ──
const hasZalgo = (text = '') => { const t = String(text); if (/[\u202A-\u202E\u2066-\u2069\u200B-\u200F\uFEFF]/.test(t)) return true; return ((t.match(/[\u0300-\u036F]/g) || []).length >= 3); };
const isSocialLink = (text = '') => /(tiktok\.com|instagram\.com|facebook\.com|fb\.com|fb\.watch|twitter\.com|x\.com|youtube\.com|youtu\.be|snapchat\.com|threads\.net|likee\.video|triller\.co)[^\s]*/i.test(String(text));
const FRAUD_WORDS = ['double your money', 'double your cash', 'double your investment', 'send.*back double', 'forex doubler', 'binary doubler', 'account upgrade', 'dm for upgrade', 'activation fee', 'claim your grant', 'claim your fund', 'yahoo format', 'pick your money', 'sakawa', 'exam expo', 'waec runs', 'jamb runs', 'neco runs', 'miracle centre', 'miracle center', 'upgrade your account'];
const MONEY_WORDS = ['bank', 'account', 'transfer', 'send money', 'opay', 'palmpay', 'moniepoint', 'momo', 'donate', 'contribution'];
const isFraud = (text = '') => {
  const t = String(text); const low = ` ${t.toLowerCase()} `;
  if (/0x[a-f0-9]{30,}/i.test(t)) return true;
  if (/\b(bc1|[13])[a-z0-9]{25,40}\b/i.test(t)) return true;
  if (/\b\d{10}\b/.test(t) && MONEY_WORDS.some((w) => low.includes(w))) return true;
  return FRAUD_WORDS.some((w) => low.includes(w));
};
const PROMO_WORDS = ['promo', 'discount', '% off', 'buy now', 'buy 1 get', 'order now', 'dm to order', 'dm to buy', 'price list', 'wholesale', 'free delivery', 'awoof', 'limited offer', 'shop now', 'vendor', 'jumia', 'konga', 'flash sale', 'clearance sale'];
const isPromo = (text = '') => { const low = ` ${String(text).toLowerCase()} `; let n = 0; for (const w of PROMO_WORDS) if (low.includes(w)) n++; return n >= 2; };
const POLITICS_WORDS = [' apc ', ' pdp ', 'labour party', 'vote for', 'vote buying', 'rigging', ' pvc ', 'campaign rally', 'electoral', 'ballot snatch', 'apc!', 'pdp!'];
const isPolitics = (text = '') => { const low = ` ${String(text).toLowerCase()} `; return POLITICS_WORDS.some((w) => low.includes(w)); };
const LOAN_WORDS = ['instant loan', 'loan app', 'no collateral', 'fairmoney', 'carbon loan', 'branch loan', 'palmcredit', 'aella credit', 'loan without', 'borrow now', 'quick loan', 'easy loan', 'collateral-free', 'renmoney', 'okash'];
const isLoan = (text = '') => { const low = ` ${String(text).toLowerCase()} `; return LOAN_WORDS.some((w) => low.includes(w)); };
const CRYPTO_WORDS = ['100x', '1000x', 'pump signal', 'presale', 'to the moon', 'gem coin', 'futures signal', 'copy trading', 'forex signal', 'deriv bot', 'quotex', 'pocket option', 'binance signal', 'buy the dip'];
const isCrypto = (text = '') => { const low = ` ${String(text).toLowerCase()} `; return CRYPTO_WORDS.some((w) => low.includes(w)); };
const hopLog = new Map(); // `${chat}:${sender}` -> [leave timestamps]
// V11 · antikickall watch: `${chat}:${authorDigits}` -> [remove timestamps]
const kickWatch = new Map();
// V11 · slowmode buckets: `${chat}:${sender}` -> last message timestamp
const slowHits = new Map();
// V11 · slowmode warn throttle: `${chat}:${sender}` -> last warn timestamp
const slowWarned = new Map();
// V11 · recent message keys ring (for .vanish bulk-delete). Newest last, cap 400.
const recentKeys = [];
/** Last N message keys from a sender in a chat (excludes one id, e.g. the command itself). */
function recentBySender(chat, sender, excludeId = null, limit = 20) {
  try {
    const want = String(sender || '').split('@')[0].split(':')[0];
    return recentKeys
      .filter((e) => e.chat === chat && e.id !== excludeId && String(e.sender || '').split('@')[0].split(':')[0] === want)
      .slice(-Math.max(1, Math.min(limit, 50)))
      .reverse();
  } catch { return []; }
}

/** V12 · last N message keys of a whole chat (newest last). Powers .topactive / .mystats. */
function getRecent(chat, n = 400) {
  try {
    return recentKeys.filter((e) => e.chat === chat).slice(-Math.max(1, Math.min(n, 400)));
  } catch { return []; }
}

/** V11 · append to the persistent left/kicked member logs (capped at 500/chat). */
function pushMemberLog(chat, kind, entry) {
  try {
    const k = `memberlog:${kind}:${chat}`;
    const arr = db.get(k, []);
    arr.push({ ...entry, at: Date.now() });
    db.set(k, arr.slice(-500));
  } catch {}
}
function getMemberLog(chat, kind, n = 500) {
  try { return db.get(`memberlog:${kind}:${chat}`, []).slice(-n); } catch { return []; }
}
const ownerDmJid = () => `${String(config.ownerNumbers[0] || '').replace(/\D/g, '')}@s.whatsapp.net`;

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
  if (['demote', 'deduct', 'strip', 'degrade', 'unadmin'].includes(v)) return 'demote';
  if (['on', 'enable', 'yes', 'delete', 'revert'].includes(v)) return 'on';
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
  try {
    recentKeys.push({ chat: jid, id: m.id, sender: m.sender, participant: raw.key?.participant || m.sender, fromMe: !!raw.key?.fromMe });
    if (recentKeys.length > 400) recentKeys.splice(0, recentKeys.length - 400);
  } catch {}
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

  // ── V11 · OWNERZONE + SLOWMODE (run before every other anti rule) ──
  const _pxEarly = String(db.get('prefix', config.prefix) || '.');
  const _isCmdEarly = (m.body || '').startsWith(_pxEarly);
  // ownerzone: only owner-privileged senders may talk (commands still pass so admins can switch it off)
  if (policy.ownerzone && !_isCmdEarly) {
    try {
      const privs = require('./lib/privs');
      const num = String(m.sender).split('@')[0].split(':')[0].replace(/\D/g, '');
      if (!privs.isSudoPriv(db, config, num)) {
        const botAdmin = await participantAdmin(sock, jid, sock.user?.id || '');
        if (botAdmin) await sock.sendMessage(jid, { delete: raw.key }).catch(() => {});
        return true;
      }
    } catch {}
  }
  // slowmode: one message per N seconds (admins + owner-priv exempt)
  if (Number(policy.slowmode) > 0) {
    try {
      const secs = Number(policy.slowmode);
      const privs = require('./lib/privs');
      const num = String(m.sender).split('@')[0].split(':')[0].replace(/\D/g, '');
      const exempt = privs.isSudoPriv(db, config, num) || await participantAdmin(sock, jid, m.sender);
      if (!exempt && (m.body || m.isMedia)) {
        const sk = `${jid}:${digit(m.sender)}`;
        const last = slowHits.get(sk) || 0;
        slowHits.set(sk, Date.now());
        if (slowHits.size > 2000) for (const k of [...slowHits.keys()].slice(0, 500)) slowHits.delete(k);
        if (Date.now() - last < secs * 1000) {
          const botAdmin = await participantAdmin(sock, jid, sock.user?.id || '');
          if (botAdmin) await sock.sendMessage(jid, { delete: raw.key }).catch(() => {});
          const lw = slowWarned.get(sk) || 0;
          if (Date.now() - lw > 60000) {
            slowWarned.set(sk, Date.now());
            await sock.sendMessage(jid, { text: XADON_AN(`Slow mode: @${digit(m.sender)} wait ${secs}s between messages.`), mentions: [m.sender] }).catch(() => {});
          }
          return true;
        }
      }
    } catch {}
  }
  const isGif = m.type === 'videoMessage' && !!(m.message?.videoMessage?.gifPlayback);
  // V13 · per-user mutes (.muteuser / .mutesticker / .muteemoji) — delete + swallow
  // before every other rule, so muted members cannot talk, sticker-spam, or emoji-spam.
  // (Admins and owner-privileged senders are always exempt.)
  try {
    const muteNum = digit(m.sender);
    const isMutedKind = (kind) => { try { return (db.get(`muted:${kind}:${jid}`, []) || []).includes(muteNum); } catch { return false; } };
    const muteHit = isMutedKind('user')
      || (isMutedKind('sticker') && m.type === 'stickerMessage')
      || (isMutedKind('emoji') && emojiCount(m.body) >= 1);
    if (muteHit) {
      const privs = require('./lib/privs');
      const exempt = privs.isSudoPriv(db, config, muteNum) || await participantAdmin(sock, jid, m.sender);
      if (!exempt) {
        const botAdmin = await participantAdmin(sock, jid, sock.user?.id || '');
        if (botAdmin) await sock.sendMessage(jid, { delete: raw.key }).catch(() => {});
        return true;
      }
    }
  } catch {}
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
  // V13 · poll question + options (so .antilink/.antiinvite catch links hidden in polls)
  const pollTxt = pollText(raw);
  const ugBlob = `${m.body || ''}`;
  const _px = String(db.get('prefix', config.prefix) || '.');
  const isCmdText = (m.body || '').startsWith(_px) && /[a-z]/i.test(String(m.body || '').slice(_px.length, _px.length + 1));

  // [active?, reason, ruleKey] — every rule carries its warn/kick mode.
  const rules = [
    [modeActive(policy, 'antilink') && (isAnyLink(m.body) || isAnyLink(pollTxt)), XADON_AN('Link removed: links are not allowed in this group'), 'antilink'],
    [modeActive(policy, 'antiinvite') && (isInvite(m.body) || isInvite(pollTxt)), XADON_AN('Invite removed: group invites are disabled here'), 'antiinvite'],
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
    [modeActive(policy, 'antijoin') && isNewcomer(jid, m.sender) && (isAnyLink(m.body) || m.isMedia), XADON_AN('Message removed: new members cannot send links/media yet'), 'antijoin'],
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
    // ── V10 · 9 NEWER antis ──
    [modeActive(policy, 'antizalgo') && hasZalgo(m.body), XADON_AN('Zalgo removed: weird unicode abuse is not allowed here'), 'antizalgo'],
    [modeActive(policy, 'anticommand') && isCmdText, XADON_AN('Command removed: only admins can use bot commands here'), 'anticommand'],
    [modeActive(policy, 'antisocial') && isSocialLink(m.body), XADON_AN('Social link removed: social-media links are disabled here'), 'antisocial'],
    [modeActive(policy, 'antifraud') && isFraud(m.body), XADON_AN('Scam removed: money-fraud messages are not allowed here'), 'antifraud'],
    [modeActive(policy, 'antipromo') && isPromo(m.body), XADON_AN('Promo removed: adverts are not allowed here'), 'antipromo'],
    [modeActive(policy, 'antipolitics') && isPolitics(m.body), XADON_AN('Politics removed: campaign messages are not allowed here'), 'antipolitics'],
    [modeActive(policy, 'antimedia') && !!m.isMedia, XADON_AN('Media removed: this group is text-only right now'), 'antimedia'],
    [modeActive(policy, 'antiloan') && isLoan(m.body), XADON_AN('Loan spam removed: loan adverts are not allowed here'), 'antiloan'],
    [modeActive(policy, 'anticrypto') && isCrypto(m.body), XADON_AN('Crypto removed: crypto signals and hype are not allowed here'), 'anticrypto'],
  ];
  for (const [hit, reason, rule] of rules) {
    if (hit && await enforce(sock, raw, jid, m.sender, m.number, reason, rule)) return true;
  }

  // ── ANTIUG · the ultimate guard: one switch that covers everything ──
  if (modeActive(policy, 'antiug')) {
    const ugHit =
      isAnyLink(ugBlob) || isInvite(ugBlob) || hasBadWord(ugBlob) || isForeign(ugBlob) ||
      hasPhone(ugBlob) || hasEmail(ugBlob) || isShortLink(ugBlob) || hasBug(ugBlob) ||
      capsShout(ugBlob) || emojiCount(ugBlob) >= 8 || forwarded ||
      isCodeBlock(ugBlob) || hasFancyFont(ugBlob) || isCloudLink(ugBlob) || isApkLink(ugBlob) ||
      hasNsfw(ugBlob) || isScam(ugBlob) || isWallOfText(ugBlob) || isBetting(ugBlob) ||
      hasZalgo(ugBlob) || isSocialLink(ugBlob) || isFraud(ugBlob) || isPromo(ugBlob) ||
      isPolitics(ugBlob) || isLoan(ugBlob) || isCrypto(ugBlob) || !!m.isMedia || isCmdText ||
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
  const author = update.author || update.actor || null;
  const authorNum = author ? String(author).split('@')[0].split(':')[0].replace(/\D/g, '') : '';
  const botNum = String(sock.user?.id || '').split('@')[0].split(':')[0].replace(/\D/g, '');
  let privs = null;
  try { privs = require('./lib/privs'); } catch {}
  const authorPriv = !!(authorNum && (authorNum === botNum || (privs && privs.isSudoPriv(db, config, authorNum)) || (config.ownerNumbers || []).map(String).some((o) => String(o).replace(/\D/g, '') === authorNum)));
  const botIsAdmin = async () => {
    try {
      const meta = await sock.groupMetadata(update.id);
      return !!meta?.participants?.find((p) => [p.id, p.jid, p.lid, p.phoneNumber].filter(Boolean).some((v) => digit(v) === botNum || digit(v) === digit(sock.user?.id || '')))?.admin;
    } catch { return false; }
  };
  // V11 · revert an unauthorized promote/demote, then punish the author per mode.
  // Modes: on = revert only · demote = revert + demote author · kick = revert + kick author · warn = revert + warn (3 warns = kick).
  const revertRole = async (victim, toAdmin, kind) => {
    try {
      if (!await botIsAdmin()) {
        await sock.sendMessage(update.id, { text: XADON_AN(`Anti-${kind}: @${digit(author)} changed @${digit(victim)} but I am not admin so I cannot revert it.`), mentions: [author, victim].filter(Boolean) }).catch(() => {});
        return false;
      }
      await sock.groupParticipantsUpdate(update.id, [victim], toAdmin ? 'promote' : 'demote').catch(() => {});
      return true;
    } catch { return false; }
  };
  // Punish the rogue admin AFTER the victim was restored. Returns a short label.
  const punishAuthor = async (rule, mode, kind) => {
    try {
      if (mode === 'on' || mode === 'off') return 'reverted';
      if (!await botIsAdmin()) {
        await sock.sendMessage(update.id, { text: XADON_AN(`Anti-${kind}: @${digit(author)} broke the rule but I am not admin so I cannot punish them — make me admin!`), mentions: [author].filter(Boolean) }).catch(() => {});
        return 'no-punish (not admin)';
      }
      if (mode === 'demote') {
        await sock.groupParticipantsUpdate(update.id, [author], 'demote').catch(() => {});
        await sock.sendMessage(update.id, { text: XADON_AN(`Anti-${kind}: unauthorized ${kind} by @${digit(author)} reverted — and @${digit(author)} was demoted for it.`), mentions: [author].filter(Boolean) }).catch(() => {});
        return 'demoted';
      }
      if (mode === 'kick') {
        await sock.sendMessage(update.id, { text: XADON_AN(`Anti-${kind}: unauthorized ${kind} by @${digit(author)} reverted — removing @${digit(author)} now.`), mentions: [author].filter(Boolean) }).catch(() => {});
        await sock.groupParticipantsUpdate(update.id, [author], 'remove').catch(() => {});
        return 'kicked';
      }
      if (mode === 'warn') {
        const n = await pushAntiWarn(update.id, author, rule, `unauthorized ${kind}`);
        if (n >= 3) {
          await sock.groupParticipantsUpdate(update.id, [author], 'remove').catch(() => {});
          await sock.sendMessage(update.id, { text: XADON_AN(`Anti-${kind}: @${digit(author)} hit 3 warns — removed.`), mentions: [author].filter(Boolean) }).catch(() => {});
          return 'warned x3 (kicked)';
        }
        await sock.sendMessage(update.id, { text: XADON_AN(`Anti-${kind}: unauthorized ${kind} by @${digit(author)} reverted — warn ${n}/3.`), mentions: [author].filter(Boolean) }).catch(() => {});
        return `warned (${n}/3)`;
      }
      return 'reverted';
    } catch { return 'reverted'; }
  };
  for (const participant of update.participants) {
    const jid = typeof participant === 'string' ? participant : participant.id || participant.jid;
    if (!jid) continue;
    const key = `${update.id}:${digit(jid)}`;
    if (update.action === 'add') {
      joinAt.set(key, Date.now()); // newcomer guard timestamp
      // V10 · antihopper: punish rapid leave-and-rejoin cycles
      try {
        const hops = (hopLog.get(key) || []).filter((t) => Date.now() - t < 30 * 60_000);
        if (hops.length >= 2 && modeActive(policy, 'antihopper')) {
          const hmode = modeOf(policy.antihopper);
          const htag = `@${digit(jid)}`;
          const meta = await sock.groupMetadata(update.id).catch(() => null);
          const bot = meta?.participants?.find((p) => [p.id, p.jid, p.lid].filter(Boolean).some((v) => digit(v) === digit(sock.user?.id)));
          if (hmode === 'kick' && bot?.admin) {
            await sock.groupParticipantsUpdate(update.id, [jid], 'remove').catch(() => {});
            await sock.sendMessage(update.id, { text: XADON_AN(`Hopper removed: ${htag} keeps leaving and rejoining.`), mentions: [jid] }).catch(() => {});
          } else {
            await sock.sendMessage(update.id, { text: XADON_AN(`Hopper warning — ${htag}: stop leaving and rejoining (anti-hopper).`), mentions: [jid] }).catch(() => {});
          }
        }
      } catch {}
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
      } else if (db.get('autowelcome', false)) {
        try {
          const meta = await sock.groupMetadata(update.id).catch(() => null);
          const gname = policy.groupName || meta?.subject || 'the group';
          await sock.sendMessage(update.id, { text: `👋 Welcome @${digit(jid)} to *${gname}*!\nRead the rules, introduce yourself and enjoy.`, mentions: [jid] }).catch(() => {});
        } catch {}
      }
    }
    if (update.action === 'remove') {
      joinAt.delete(key);
      try { const arr = (hopLog.get(key) || []).concat(Date.now()).slice(-5); hopLog.set(key, arr); if (hopLog.size > 2000) for (const k of [...hopLog.keys()].slice(0, 500)) hopLog.delete(k); } catch {}
      // V11 · left-vs-kicked tracking: kicked when someone else did the removal.
      const wasKicked = !!(author && digit(author) !== digit(jid));
      try { pushMemberLog(update.id, wasKicked ? 'kicked' : 'left', { jid, by: author || 'unknown', name: '' }); } catch {}
      // V11 · ANTIKICKALL: a rogue admin mass-removing members gets punished fast.
      // Modes: on/demote = demote the rogue · kick = kick the rogue · warn = warn only.
      try {
        if (wasKicked && modeActive(policy, 'antikickall') && !authorPriv) {
          const wk = `${update.id}:${authorNum || digit(author)}`;
          const now = Date.now();
          const limit = Math.max(2, Number(policy.antikickallLimit) || 3);
          const arr = (kickWatch.get(wk) || []).filter((t) => now - t < 120000);
          arr.push(now);
          kickWatch.set(wk, arr);
          if (kickWatch.size > 1000) for (const k of [...kickWatch.keys()].slice(0, 200)) kickWatch.delete(k);
          if (arr.length >= limit) {
            kickWatch.delete(wk);
            const kmode = modeOf(policy.antikickall); // 'on' (legacy) behaves as demote
            const punish = (kmode === 'kick') ? 'kick' : (kmode === 'warn' ? 'warn' : 'demote');
            if (await botIsAdmin()) {
              if (punish === 'kick') {
                await sock.sendMessage(update.id, { text: XADON_AN(`Anti-kickall: @${digit(author)} mass-removed members (${arr.length} in 2 min) — removing them now.`), mentions: [author] }).catch(() => {});
                await sock.groupParticipantsUpdate(update.id, [author], 'remove').catch(() => {});
              } else if (punish === 'warn') {
                const n = await pushAntiWarn(update.id, author, 'antikickall', `mass-removing members (${arr.length} in 2 min)`);
                await sock.sendMessage(update.id, { text: XADON_AN(`Anti-kickall: @${digit(author)} mass-removed members (${arr.length} in 2 min) — warn ${n}/3.`), mentions: [author] }).catch(() => {});
              } else {
                await sock.groupParticipantsUpdate(update.id, [author], 'demote').catch(() => {});
                await sock.sendMessage(update.id, { text: XADON_AN(`Anti-kickall: @${digit(author)} was demoted for mass-removing members (${arr.length} in 2 min).`), mentions: [author] }).catch(() => {});
              }
            } else {
              await sock.sendMessage(update.id, { text: XADON_AN(`Anti-kickall: @${digit(author)} is mass-removing members but I am not admin — make me admin!`), mentions: [author] }).catch(() => {});
            }
            try { await sock.sendMessage(ownerDmJid(), { text: `ANTIKICKALL @ ${policy.groupName || update.id}: ${authorNum} removed ${arr.length} members in 2 min — ${punish}ed.` }).catch(() => {}); } catch {}
          }
        }
      } catch {}
      // V11 · ANTILEFT notice + KICKLOG owner-DM mirror.
      try {
        if (modeActive(policy, 'antileft')) {
          await sock.sendMessage(update.id, { text: wasKicked ? XADON_AN(`Member removed: @${digit(jid)} was taken out by @${digit(author)}.`) : XADON_AN(`Member left: @${digit(jid)} walked out.`), mentions: [jid, author].filter(Boolean) }).catch(() => {});
        }
        if (db.get(`kicklog:${update.id}`, false)) {
          await sock.sendMessage(ownerDmJid(), { text: `${wasKicked ? 'KICK' : 'LEFT'} @ ${policy.groupName || update.id}: ${digit(jid)}${wasKicked ? ` by ${authorNum}` : ''}` }).catch(() => {});
        }
      } catch {}
      if (policy.goodbye) {
        const text = (policy.goodbyeText || 'Goodbye @user.').replace(/@user/g, `@${digit(jid)}`).replace(/@group/g, policy.groupName || 'the group');
        await sock.sendMessage(update.id, { text, mentions: [jid] }).catch(() => {});
      } else if (db.get('autogoodbye', false)) {
        await sock.sendMessage(update.id, { text: `👋 @${digit(jid)} left *${policy.groupName || 'the group'}*. We wish them well.`, mentions: [jid] }).catch(() => {});
      }
    }
    // V11 · ANTIDEMOTE / ANTIPROMOTE: revert unauthorized role changes, then punish the rogue admin per mode.
    // Modes: on = revert only · demote = revert + demote author · kick = revert + kick author · warn = revert + warn.
    if ((update.action === 'demote' || update.action === 'promote') && author && digit(author) !== digit(jid)) {
      try {
        if (update.action === 'demote' && modeActive(policy, 'antidemote') && !authorPriv) {
          const dmode = modeOf(policy.antidemote);
          const ok = await revertRole(jid, true, 'demote');
          let result = 'reverted';
          if (ok) result = await punishAuthor('antidemote', dmode, 'demote');
          else await sock.sendMessage(update.id, { text: XADON_AN(`Anti-demote: unauthorized demote by @${digit(author)} — victim @${digit(jid)} NOT restored (make me admin).`), mentions: [author, jid].filter(Boolean) }).catch(() => {});
          if (dmode === 'on' && ok) await sock.sendMessage(update.id, { text: XADON_AN(`Anti-demote: unauthorized demote by @${digit(author)} reverted (@${digit(jid)} restored). Tip: .antidemote demote or .antidemote kick to also punish the rogue admin.`), mentions: [author, jid].filter(Boolean) }).catch(() => {});
          try {
            if (db.get(`kicklog:${update.id}`, false)) {
              await sock.sendMessage(ownerDmJid(), { text: `Anti-demote @ ${policy.groupName || update.id}: ${authorNum} tried to demote ${digit(jid)} — ${result}.` }).catch(() => {});
            }
          } catch {}
        }
        if (update.action === 'promote' && modeActive(policy, 'antipromote') && !authorPriv) {
          const pmode = modeOf(policy.antipromote);
          const ok = await revertRole(jid, false, 'promote');
          let result = 'reverted';
          if (ok) result = await punishAuthor('antipromote', pmode, 'promote');
          else await sock.sendMessage(update.id, { text: XADON_AN(`Anti-promote: unauthorized promote by @${digit(author)} — victim @${digit(jid)} NOT restored (make me admin).`), mentions: [author, jid].filter(Boolean) }).catch(() => {});
          if (pmode === 'on' && ok) await sock.sendMessage(update.id, { text: XADON_AN(`Anti-promote: unauthorized promote by @${digit(author)} reverted (@${digit(jid)} restored). Tip: .antipromote demote or .antipromote kick to also punish the rogue admin.`), mentions: [author, jid].filter(Boolean) }).catch(() => {});
          try {
            if (db.get(`kicklog:${update.id}`, false)) {
              await sock.sendMessage(ownerDmJid(), { text: `Anti-promote @ ${policy.groupName || update.id}: ${authorNum} tried to promote ${digit(jid)} — ${result}.` }).catch(() => {});
            }
          } catch {}
        }
        if (db.get(`kicklog:${update.id}`, false) && (modeOf(policy.antidemote) === 'off' || modeOf(policy.antipromote) === 'off')) {
          await sock.sendMessage(ownerDmJid(), { text: `${String(update.action).toUpperCase()} @ ${policy.groupName || update.id}: ${authorNum} -> ${digit(jid)}` }).catch(() => {});
        }
      } catch {}
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

module.exports = { handleMessage, handleParticipantsUpdate, startQuiz, scheduleTempKick, savePolicy, groupPolicy, modeOf, policyMode, digit, enforce, guarded, pushMemberLog, getMemberLog, recentBySender, getRecent, isLink, isInvite, isBareLink, isAnyLink, pollText, emojiCount };
