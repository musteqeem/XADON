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
const privs = require('./lib/privs');
const ui = require('./lib/ui');
const premium = require('./lib/premium');
const { serialize } = require('./lib/serialize');
const loader = require('./loader');
const store = require('./lib/msgstore');
const rawstore = require('./lib/rawstore');
const fmt = require('./lib/format');

const stats = { messages: 0, commands: 0, startedAt: Date.now() };
const cooldowns = new Map();
const groupCache = new Map();
const closeTimeCache = new Map(); // chat -> { at, closed }

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
  // V8 · privilege layer: hard-owner (config/fromMe/self) · mod (full owner) · sudo (near owner)
  const isHardOwner = m.fromMe || m.number === botNumber || privs.isHardOwnerNumber(db, config, m.number);
  const isMod = privs.isModNumber(db, m.number);
  const isSudo = isHardOwner || isMod || privs.isSudoNumber(db, m.number);
  const isOwner = isHardOwner || isMod; // mods = FULL owner access; sudo = near-owner (no owner cmds)
  // V10 · autosleep: the whole bot ignores non-privileged users 23:00–05:00 Lagos
  try {
    if (db.get('autosleep', false) && !isSudo) {
      const hr = Number(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', hour12: false }));
      if ([23, 0, 1, 2, 3, 4].includes(hr)) return;
    }
  } catch {}
  // V7 · format-aware reply: custom per-command text + active reply format (default/mono/media/rich)
  const replyRaw = (text, extra = {}) => {
    try {
      const custom = fmt.getCustom(cmd.name);
      if (custom && typeof text === 'string' && text) {
        const filled = fmt.fillVars(custom, { m, prefix }).replace(/\{text\}/gi, text);
        return fmt.sendFormatted(sock, m.chat, filled, { quoted: premium.settings().verified ? 'verified' : raw, ...extra });
      }
    } catch {}
    return fmt.sendFormatted(sock, m.chat, text, { quoted: premium.settings().verified ? 'verified' : raw, ...extra });
  };
  // V10 · autoclean: auto-delete the bot's own replies 60s after sending
  const reply = async (text, extra = {}) => {
    const sent = await replyRaw(text, extra);
    try {
      if (db.get('autoclean', false) && sent?.key) {
        const k = sent.key;
        setTimeout(() => sock.sendMessage(m.chat, { delete: k }).catch(() => {}), 60000).unref?.();
      }
    } catch {}
    return sent;
  };
  const fail = (title, text) => fmt.sendFormatted(sock, m.chat, ui.notice('error', title, text), { quoted: premium.settings().verified ? 'verified' : raw });

  if (!isOwner && (db.get('banned', []) || []).includes(m.sender)) return;
  // V8 · maintenance: whole bot frozen except hard-owners/mods
  try {
    if (db.get('maintenance', false) && !isOwner) return;
  } catch {}
  // V8 · private mode: sudo/mod/owner always pass; group admins pass too when that group's alladmin is ON
  if (db.get('mode', config.mode) === 'private' && !isSudo) {
    let adminBypass = false;
    try {
      if (m.isGroup) {
        const { groupPolicy } = require('./message-handler');
        if (groupPolicy(m.chat)?.alladmin) {
          const meta = await groupMeta(sock, m.chat).catch(() => null);
          adminBypass = !!findParticipant(meta, [m.sender, m.senderAlt])?.admin;
        }
      }
    } catch {}
    if (!adminBypass) return;
  }
  if (cmd.owner && !isOwner) return fail('Owner only', 'This command is reserved for the bot owner (mods included, sudos excluded). Ask an owner to .setmod you.');
  if (cmd.group && !m.isGroup) return fail('Group only', 'Use this command inside a group.');

  // per-group disabled commands (sudo+ bypasses)
  try {
    if (m.isGroup && !isSudo) {
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
  if (!isSudo && Date.now() - last < config.cooldownMs) return;
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
    isOwner, isHardOwner, isMod, isSudo, role: isHardOwner ? 'owner' : isMod ? 'mod' : privs.isSudoNumber(db, m.number) ? 'sudo' : (isAdmin ? 'admin' : 'user'),
    isAdmin, isBotAdmin, group, target,
    reply, fail, db, ui, config, premium, stats, loader,
  };

  try {
    // auto presence flair (freezeseen keeps DMs offline-looking)
    try {
      if (db.get('freezeseen', false) && !m.isGroup) await sock.sendPresenceUpdate('unavailable').catch(() => {});
      else if (db.get('autotyping', false)) await sock.sendPresenceUpdate('composing', m.chat).catch(() => {});
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
    if (db.get('freezeseen', false) && !m.isGroup) sock.sendPresenceUpdate('unavailable').catch(() => {});
    else sock.sendPresenceUpdate('paused', m.chat).catch(() => {});
  }
}

async function handle(sock, raw) {
  if (!raw?.message || raw.key.remoteJid === 'status@broadcast') return;
  stats.messages++;

  const m = serialize(sock, raw);
  if (config.autoRead) sock.readMessages([raw.key]).catch(() => {});

  // record into msgstore (for .deleted / .quoted) + rawstore (for .quotedeep)
  try { rawstore.push(m.chat, raw); } catch {}
  // V12 · snapshot incoming media (non-blocking) so deletes stay recoverable
  try { require('./lib/mediacache').prefetch(sock, raw, m); } catch {}
  try {
    store.push(m.chat, {
      id: m.id, sender: m.sender, pushName: m.pushName, type: m.type,
      body: (m.body || '').slice(0, 2000), at: Date.now(),
      isMedia: !!m.isMedia,
      quotedId: m.quoted?.id || null, quotedBody: (m.quoted?.body || '').slice(0, 500),
    });
  } catch {}

  // ── XADON · closetime enforcement (.closetime 23:00 05:00) — reconciles the
  // group gate on incoming messages so the schedule survives restarts (no timers).
  try {
    if (m.isGroup) {
      const cfg = db.get(`closetime:${m.chat}`, null);
      if (cfg?.close && cfg?.open) {
        const cached = closeTimeCache.get(m.chat);
        if (!cached || Date.now() - cached.at > 60_000) {
          const { shouldBeClosed } = require('./commands/group/closetime');
          const wantClosed = shouldBeClosed(cfg);
          if (wantClosed !== null && wantClosed !== cached?.closed) {
            const meta = await groupMeta(sock, m.chat).catch(() => null);
            const botJids = [sock.user?.id, sock.user?.lid].filter(Boolean).map(digits);
            const botPart = meta?.participants?.find((p) => botJids.includes(digits(p.id)) || (p.lid && botJids.includes(digits(p.lid))));
            if (botPart?.admin) {
              const isClosed = meta.announce === true || meta.announce === 'true';
              if (wantClosed !== isClosed) {
                await sock.groupSettingUpdate(m.chat, wantClosed ? 'announcement' : 'not_announcement').catch(() => {});
              }
              closeTimeCache.set(m.chat, { at: Date.now(), closed: wantClosed });
            }
          } else if (cached) {
            cached.at = Date.now();
          }
        }
      } else if (closeTimeCache.has(m.chat)) {
        closeTimeCache.delete(m.chat);
      }
    }
  } catch {}

  // ── XADON V9 · auto-responder hooks (no prefix needed) ──
  try {
    const vdb = db;
    const botNum = digits(sock.user?.id);
    const isPriv = m.fromMe || m.number === botNum || privs.isSudoPriv(vdb, config, m.number);
    const px = vdb.get('prefix', config.prefix);
    const isCmd = (m.body || '').startsWith(px);
    const botJids = [sock.user?.id, sock.user?.lid].filter(Boolean).map(digits);
    const tagsBot = (m.mentions || []).some((j) => botJids.includes(digits(j)));
    const repliedBot = m.quoted?.sender && botJids.includes(digits(m.quoted.sender));

    if (!m.isGroup && vdb.get('freezeseen', false)) {
      try { await sock.sendPresenceUpdate('unavailable'); } catch {}
    }

    // V10 · autoblock: strangers DMing the bot get blocked instantly
    try {
      if (!m.isGroup && !m.fromMe && !isPriv && vdb.get('autoblock', false)) {
        await sock.updateBlockStatus(m.chat, 'block').catch(() => {});
        return;
      }
    } catch {}

    if (!m.fromMe && !isCmd && m.type !== 'reactionMessage') {
      // 0 · NODAX agent (no-prefix name chat + owner agent brain) — truthy short-circuits.
      try {
        const nodax = require('../../nodax');
        const handled = await nodax.handle(sock, raw, m, {
          db: vdb, prefix: px, isPriv,
          dispatch: (cmdName, cmdArgs = []) => {
            const c = loader.find(String(cmdName).toLowerCase());
            if (!c) return sock.sendMessage(m.chat, { text: `No command named .${cmdName}.` }, { quoted: raw }).catch(() => {});
            return runCmd(sock, raw, c, m, cmdArgs, cmdName, px);
          },
        });
        if (handled) return;
      } catch {}

      // 1 · owner-tag responder (.mention) + busy fallback (.busymode)
      try {
        const mention = require('./commands/owner/mention');
        if (!isPriv && mention.ownerTagged(m)) {
          const r = await mention.doRespond(sock, raw, m, vdb);
          const busy = vdb.get('busy', {});
          if (busy.on && busy.reason && !(r && r.replied)) {
            let bMentions = [m.sender];
            try { if (typeof mention.mentionJids === 'function') bMentions = mention.mentionJids(m); } catch {}
            await sock.sendMessage(m.chat, { text: `${busy.reason}`, mentions: bMentions }, { quoted: raw }).catch(() => {});
            return;
          }
          if (r && (r.reacted || r.replied)) return;
        }
      } catch {}

      // 2 · DM auto-reply (.autoreply) — owner/sudo exempt
      try {
        if (!m.isGroup && !isPriv) {
          const ar = vdb.get('autoreply', {});
          if (ar.on && ar.text) {
            await sock.sendMessage(m.chat, { text: ar.text }, { quoted: raw }).catch(() => {});
            return;
          }
        }
      } catch {}

      // 3 · smart AI (.smartai) — tags, replies to bot, or any private chat
      try {
        if (!isPriv && m.body && vdb.get('smartai', {}).on) {
          const dm = !m.isGroup;
          if (dm || tagsBot || repliedBot) {
            const { ask } = require('./lib/ai');
            try { await sock.sendPresenceUpdate('composing', m.chat).catch(() => {}); } catch {}
            const prompt = m.isGroup ? `${m.pushName || 'Someone'} says: ${m.body.slice(0, 1200)}` : m.body.slice(0, 2000);
            const { answer, provider } = await ask(m.isGroup ? `${m.chat}:${m.number}` : m.chat, prompt);
            await sock.sendMessage(m.chat, { text: `${answer}\n\n⌬ ${provider}` }, { quoted: raw }).catch(() => {});
            try { await sock.sendPresenceUpdate('paused', m.chat).catch(() => {}); } catch {}
            return;
          }
        }
      } catch {}

      // 4 · autogreet (.autogreet) — greetings in private chats get a canned hello
      try {
        if (!m.isGroup && !isPriv && vdb.get('autogreet', false) && /^(hi|hii+|hello|hey|yo|good\s?(morning|afternoon|evening|day)|sup|how far|howfa)\b/i.test((m.body || '').trim())) {
          await sock.sendMessage(m.chat, { text: `Hello ${m.pushName || 'there'}! I am *${config.botName}*. Send *${px}menu* to see what I can do.` }, { quoted: raw }).catch(() => {});
          return;
        }
      } catch {}

      // 5 · autovv (.autovv) — rescue every incoming view-once to the owner DM
      try {
        if (vdb.get('autovv', false) && !isPriv) {
          const rawStr = (() => { try { return JSON.stringify(raw.message || ''); } catch { return ''; } })();
          if (/viewOnce/i.test(rawStr)) {
            try {
              const { downloadMediaMessage } = require('@musteqeem/baileys');
              const buf = await downloadMediaMessage(raw, 'buffer', {});
              const ownerJid = `${String(config.ownerNumbers[0]).replace(/\D/g, '')}@s.whatsapp.net`;
              const cap = `AUTO-VV from @${digits(m.sender)} (${m.isGroup ? 'group' : 'dm'})`;
              await sock.sendMessage(ownerJid, { image: buf, caption: cap }).catch(async () => { await sock.sendMessage(ownerJid, { video: buf, caption: cap }).catch(() => {}); });
            } catch {}
          }
        }
      } catch {}

      // 6 · autonotify (.autonotify) — owner gets a DM snippet whenever tagged
      // V11 · LID/JID-proof: reuses mention.ownerTagged (tag · reply · raw number).
      try {
        if (m.isGroup && vdb.get('autonotify', false)) {
          const mentionN = require('./commands/owner/mention');
          if (mentionN.ownerTagged(m)) {
            const ownerJid = `${String(config.ownerNumbers[0]).replace(/\D/g, '')}@s.whatsapp.net`;
            const snippet = String(m.body || '[media]').slice(0, 300);
            await sock.sendMessage(ownerJid, { text: `You were tagged by @${digits(m.sender)}:\n\n${snippet}`, mentions: [m.sender] }).catch(() => {});
          }
        }
      } catch {}

      // 7 · autokeyword (.autokeyword) — DM the owner when watched words appear
      try {
        const kw = vdb.get('autokeyword', {});
        if (kw.on && Array.isArray(kw.words) && kw.words.length && !isPriv && m.body) {
          const low = ` ${String(m.body).toLowerCase()} `;
          const hit = kw.words.find((w) => w && low.includes(String(w).toLowerCase()));
          if (hit) {
            const ownerJid = `${String(config.ownerNumbers[0]).replace(/\D/g, '')}@s.whatsapp.net`;
            await sock.sendMessage(ownerJid, { text: `Keyword "${hit}" mentioned by @${digits(m.sender)}${m.isGroup ? ' in a group' : ' in DM'}:\n\n${String(m.body).slice(0, 300)}`, mentions: [m.sender] }).catch(() => {});
          }
        }
      } catch {}

      // 8 · autofwd (.autofwd) — mirror armed chats to the owner DM
      try {
        if (!m.fromMe && vdb.get(`autofwd:${m.chat}`, false)) {
          const ownerJid = `${String(config.ownerNumbers[0]).replace(/\D/g, '')}@s.whatsapp.net`;
          if (m.chat !== ownerJid) {
            try {
              if (typeof sock.copyNForward === 'function') await sock.copyNForward(ownerJid, raw, true).catch(() => {});
              else await sock.sendMessage(ownerJid, { forward: raw }).catch(() => {});
            } catch {}
          }
        }
      } catch {}

      // 9 · V11 autotranslate (.autotranslate) — per-chat live translation.
      // Any message not already in the chat's target language is translated
      // and the translation is posted as a reply. `dm on` also mirrors to owner DM.
      try {
        const atCfg = vdb.get(`autotranslate:${m.chat}`, null);
        if (!m.fromMe && atCfg?.on && m.body && !isCmd && !/^reactionMessage/i.test(m.type || '')) {
          const q = String(m.body).slice(0, 500).trim();
          if (q.length >= 3) {
            const { translate, normLang } = require('./lib/translate');
            const target = normLang(atCfg.lang || 'en') || 'en';
            const r = await translate(q, target).catch(() => null);
            if (r?.text && r.text.trim().toLowerCase() !== q.toLowerCase()) {
              await sock.sendMessage(m.chat, { text: `◐ AUTO-TR · ${r.source || 'auto'} → ${target}\n${r.text.slice(0, 1200)}` }, { quoted: raw }).catch(() => {});
              if (atCfg.dm) {
                const ownerJid = `${String(config.ownerNumbers[0]).replace(/\D/g, '')}@s.whatsapp.net`;
                if (m.chat !== ownerJid) await sock.sendMessage(ownerJid, { text: `AUTO-TR [${m.isGroup ? 'group' : 'dm'}] @${digits(m.sender)} (${r.source || 'auto'}→${target}):\n${r.text.slice(0, 800)}`, mentions: [m.sender] }).catch(() => {});
              }
            }
          }
        }
      } catch {}

      // 10 · V13 track (.track) — mirror a tracked person's messages to owner DM.
      try {
        const list = vdb.get('tracklist', []);
        if (Array.isArray(list) && list.length && !m.fromMe && m.sender) {
          const { sameTarget } = require('./commands/owner/track');
          const hit = list.some((t) => { try { return sameTarget(t, m.number || m.sender); } catch { return false; } });
          if (hit) {
            const ownerJid = `${String(config.ownerNumbers[0]).replace(/\D/g, '')}@s.whatsapp.net`;
            if (m.chat !== ownerJid) {
              const mc = require('./lib/mediacache');
              try {
                if (m.isMedia) {
                  const { downloadMediaMessage } = require('@musteqeem/baileys');
                  const buf = await downloadMediaMessage(raw, 'buffer', {}).catch(() => null);
                  if (buf?.length) mc.save(m.chat, m.id, buf, { type: m.type, caption: (m.body || '').slice(0, 500), sender: m.sender, pushName: m.pushName });
                }
              } catch {}
              const where = m.isGroup ? `group ${(m.chat || '').split('@')[0]}` : 'DM';
              await mc.repost(sock, m.chat, ownerJid, { id: m.id, sender: m.sender, type: m.type, body: (m.body || '').slice(0, 1000) }, `👁 TRACK @ ${where}`).catch(() => {});
            }
          }
        }
      } catch {}
    }
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
