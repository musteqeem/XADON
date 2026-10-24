/**
 * XADON V3 · HANDLER (upgraded — 50 new commands support)
 * - XADON format:  cmd.run(ctx)
 * - Imported format: cmd.execute(sock, m, extra)  <-- now actually supported
 * - Custom emoji triggers (no prefix): .setemoji ping 😎  ->  sending 😎 runs ping
 * - Custom sticker triggers: .setsticker ping (reply to sticker) -> that sticker runs ping
 * - Per-group disabled commands: .disable / .enable
 * - Auto presence: autotyping / autorecording | autoreact | autosticker
 * - Records every message into lib/msgstore for .deleted / .quoted recovery
 */
const config = require('../config');
const db = require('./lib/database');
const ui = require('./lib/ui');
const premium = require('./lib/premium');
const { serialize } = require('./lib/serialize');
const loader = require('./loader');
const store = require('./lib/msgstore');

const stats = { messages: 0, commands: 0, startedAt: Date.now() };
const cooldowns = new Map();
const groupCache = new Map();

async function groupMeta(sock, jid) {
  const cached = groupCache.get(jid);
  if (cached && Date.now() - cached.at < 60_000) return cached.data;
  const data = await sock.groupMetadata(jid);
  groupCache.set(jid, { data, at: Date.now() });
  return data;
}

const digits = (jid = '') => String(jid).split('@')[0].split(':')[0];

function findParticipant(meta, ids) {
  const wanted = ids.filter(Boolean).map(digits);
  return meta?.participants?.find((p) => [p.id, p.lid, p.phoneNumber, p.jid].some((id) => id && wanted.includes(digits(id))));
}

function stickerHash(m) {
  try {
    if (m.type !== 'stickerMessage') return null;
    const st = m.message?.stickerMessage;
    if (!st) return null;
    const h = st.fileSha256 || st.fileEncSha256 || st.mediaKey;
    if (!h) return null;
    return Buffer.isBuffer(h) ? h.toString('base64') : String(h);
  } catch { return null; }
}

async function runCmd(sock, raw, cmd, m, args, name, prefix) {
  const botNumber = digits(sock.user?.id);
  const isOwner = m.fromMe || m.number === botNumber || config.ownerNumbers.includes(m.number);
  const reply = (text, extra = {}) =>
    sock.sendMessage(m.chat, { text, ...extra }, { quoted: premium.settings().verified ? 'verified' : raw });
  const fail = (title, text) => reply(ui.notice('error', title, text));

  if (!isOwner && (db.get('banned', []) || []).includes(m.sender)) return;
  if (db.get('mode', config.mode) === 'private' && !isOwner) return;
  if (cmd.owner && !isOwner) return fail('Owner only', 'This command is reserved for the bot owner.');
  if (cmd.group && !m.isGroup) return fail('Group only', 'Use this command inside a group.');

  // per-group disabled commands (owner bypasses)
  try {
    if (m.isGroup && !isOwner) {
      const off = db.get(`disabled:${m.chat}`, []);
      if (Array.isArray(off) && off.includes(cmd.name)) return;
    }
  } catch {}

  let group = null;
  let isAdmin = false;
  let isBotAdmin = false;
  if (m.isGroup && (cmd.group || cmd.admin || cmd.botAdmin)) {
    group = await groupMeta(sock, m.chat).catch(() => null);
    isAdmin = !!findParticipant(group, [m.sender, m.senderAlt])?.admin;
    isBotAdmin = !!findParticipant(group, [sock.user?.id, sock.user?.lid])?.admin;
  }
  if (cmd.admin && !isAdmin && !isOwner) return fail('Admins only', 'Only group admins can use this command.');
  if (cmd.botAdmin && !isBotAdmin) return fail('Make me admin', 'I need admin rights to do that.');

  const last = cooldowns.get(m.sender) || 0;
  if (!isOwner && Date.now() - last < config.cooldownMs) return;
  cooldowns.set(m.sender, Date.now());

  const target = () => {
    if (m.mentions[0]) return m.mentions[0];
    if (m.quoted?.sender) return m.quoted.sender;
    const num = args.find((value) => /^@?\+?\d{7,15}$/.test(value || ''))?.replace(/\D/g, '') || '';
    return num ? `${num}@s.whatsapp.net` : null;
  };

  stats.commands++;
  const ctx = {
    sock, m, args, text: args.join(' '), command: cmd.name, used: String(name).toLowerCase(), prefix,
    isOwner, isAdmin, isBotAdmin, group, target,
    reply, fail, db, ui, config, premium, stats, loader,
  };

  try {
    // auto presence flair
    try {
      if (db.get('autotyping', false)) await sock.sendPresenceUpdate('composing', m.chat).catch(() => {});
      else if (db.get('autorecording', false)) await sock.sendPresenceUpdate('recording', m.chat).catch(() => {});
      else await sock.sendPresenceUpdate('composing', m.chat).catch(() => {});
    } catch {}
    if (typeof cmd.run === 'function') await cmd.run(ctx);
    else if (typeof cmd.execute === 'function') {
      // imported format: execute(sock, m, { args, text, reply, fail, ...ctx })
      await cmd.execute(sock, m, { ...ctx, sock, m });
    }
    // autoreact
    try {
      const ar = db.get('autoreact', null);
      if (ar) await sock.sendMessage(m.chat, { react: { text: String(ar).slice(0, 8), key: m.key } }).catch(() => {});
    } catch {}
  } catch (err) {
    console.error(`[${cmd.name}]`, err);
    await fail('Something broke', `${ui.fonts.mono(err.message || String(err)).slice(0, 300)}`).catch(() => {});
  } finally {
    sock.sendPresenceUpdate('paused', m.chat).catch(() => {});
  }
}

async function handle(sock, raw) {
  if (!raw?.message || raw.key.remoteJid === 'status@broadcast') return;
  stats.messages++;

  const m = serialize(sock, raw);
  if (config.autoRead) sock.readMessages([raw.key]).catch(() => {});

  // record into msgstore (for .deleted / .quoted)
  try {
    store.push(m.chat, {
      id: m.id, sender: m.sender, pushName: m.pushName, type: m.type,
      body: (m.body || '').slice(0, 2000), at: Date.now(),
      isMedia: !!m.isMedia,
      quotedId: m.quoted?.id || null, quotedBody: (m.quoted?.body || '').slice(0, 500),
    });
  } catch {}

  // autosticker: any image -> sticker (per-chat or global toggle)
  try {
    const autoS = db.get(`autosticker:${m.chat}`, db.get('autosticker', false));
    if (autoS && m.type === 'imageMessage') {
      const c = loader.find('sticker');
      if (c) { await runCmd(sock, raw, c, m, [], 'sticker', db.get('prefix', config.prefix)); return; }
    }
  } catch {}

  // ---- custom sticker trigger (no prefix) ----
  try {
    if (m.type === 'stickerMessage') {
      const h = stickerHash(m);
      const map = db.get('stickerMap', {});
      const hit = (h && map[h]) || map['__any__'];
      if (hit) {
        const c = loader.find(String(hit).toLowerCase());
        if (c) { await runCmd(sock, raw, c, m, [], c.name, db.get('prefix', config.prefix)); return; }
      }
    }
  } catch {}

  const prefix = db.get('prefix', config.prefix);

  // ---- custom emoji trigger (no prefix, exact message match) ----
  try {
    const bodyTrim = (m.body || '').trim();
    if (bodyTrim && !m.body.startsWith(prefix)) {
      const map = db.get('emojiMap', {});
      const hit = map[bodyTrim];
      if (hit) {
        const c = loader.find(String(hit).toLowerCase());
        if (c) { await runCmd(sock, raw, c, m, [], c.name, prefix); return; }
      }
    }
  } catch {}

  if (!m.body.startsWith(prefix)) return;

  const [name, ...args] = m.body.slice(prefix.length).trim().split(/\s+/);
  const cmd = loader.find(String(name).toLowerCase());
  if (!cmd) return;
  await runCmd(sock, raw, cmd, m, args, name, prefix);
}

module.exports = { handle, stats };
