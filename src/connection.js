/**
 * ╭──────────────────────────────────────────────╮
 *   WAPLUS · CONNECTION
 *   Logs in with a pairing code, saves the session,
 *   and reconnects automatically if it drops.
 * ╰──────────────────────────────────────────────╯
 */
const fs = require('fs');
const pino = require('pino');
const readline = require('readline');
const { Boom } = require('@hapi/boom');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
} = require('@musteqeem/baileys');

const config = require('../config');
const premium = require('./lib/premium');
const { handle } = require('./handler');
const messageEvents = require('./message-handler');

const state = { sock: null, status: 'starting', pairingCode: null, number: null, connectedAt: null };
const logger = pino({ level: process.env.LOG_LEVEL || 'silent' });

const ask = (q) =>
  new Promise((resolve) => {
    if (!process.stdin.isTTY) return resolve('');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => { rl.close(); resolve(a); });
  });

async function requestPairing(sock, number) {
  const clean = String(number).replace(/\D/g, '');
  if (!clean) throw new Error('Phone number required (country code, no +)');
  const custom = /^[A-Z0-9]{8}$/i.test(config.pairingCode) ? config.pairingCode.toUpperCase() : undefined;
  const code = await sock.requestPairingCode(clean, custom);
  state.pairingCode = code?.match(/.{1,4}/g)?.join('-') || code;
  state.status = 'pairing';
  console.log(`\n  ╭──────────────────────────╮\n  │  PAIRING CODE  ${state.pairingCode.padEnd(10)}│\n  ╰──────────────────────────╯`);
  console.log('  WhatsApp › Linked devices › Link with phone number\n');
  return state.pairingCode;
}

async function connect() {
  fs.mkdirSync(config.sessionDir, { recursive: true });
  const { state: auth, saveCreds } = await useMultiFileAuthState(config.sessionDir);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));

  const sock = makeWASocket({
    version,
    logger,
    auth: { creds: auth.creds, keys: makeCacheableSignalKeyStore(auth.keys, logger) },
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
    printQRInTerminal: false,
  });
  premium.install(sock);
  state.sock = sock;
  state.status = 'connecting';

  sock.ev.on('creds.update', saveCreds);

  if (!auth.creds.registered) {
    setTimeout(async () => {
      const number = config.pairingNumber || (await ask('  Bot WhatsApp number (e.g. 2348012345678): '));
      if (!number) {
        state.status = 'waiting';
        console.log('  Open the web panel to pair, or set PAIRING_NUMBER in .env');
        return;
      }
      requestPairing(sock, number).catch((err) => console.error('  Pairing failed:', err.message));
    }, 2500);
  }

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      state.status = 'online';
      state.pairingCode = null;
      state.number = sock.user?.id?.split(':')[0];
      state.connectedAt = Date.now();
      console.log(`  ✓ Online as +${state.number}`);
    }
    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        state.status = 'logged-out';
        console.log('  ✗ Logged out. Delete the session folder and start again.');
        return;
      }
      state.status = 'reconnecting';
      console.log(`  ↻ Reconnecting (${code || 'unknown'})`);
      setTimeout(connect, 3000);
    }
  });

  // XADON-50 · deleted/status/call/group-icon hooks (Baileys event search: messages.update,
  // messages.delete, status@broadcast, call events, groups.update). All guarded in try/catch.
  const store = require('./lib/msgstore');
  const { serialize } = require('./lib/serialize');

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try {
        // status updates -> status cache (for .groupstatus / .statuslist)
        if (msg.key?.remoteJid === 'status@broadcast') {
          try {
            const m = serialize(sock, msg);
            store.pushStatus({ sender: m.sender, pushName: m.pushName, type: m.type, body: (m.body || '').slice(0, 500), at: Date.now() });
          } catch {}
          continue;
        }
        const consumed = await messageEvents.handleMessage(sock, msg);
        if (!consumed) await handle(sock, msg);
      } catch (e) { console.error('  handler:', e.message); }
    }
  });

  // deleted messages: Baileys emits messages.update with revoked protocol payloads
  sock.ev.on('messages.update', async (updates) => {
    try {
      const list = Array.isArray(updates) ? updates : [updates];
      for (const u of list) {
        const upd = u?.update || u;
        const key = u?.key || upd?.key;
        if (!key?.remoteJid) continue;
        const isRevoke = upd?.message === null || /revoke|delete/i.test(JSON.stringify(upd).slice(0, 2000));
        if (!isRevoke) continue;
        const chat = key.remoteJid;
        const cached = store.findById(chat, key.id);
        const policy = messageEvents.groupPolicy ? messageEvents.groupPolicy(chat) : {};
        const entry = {
          id: key.id,
          sender: cached?.sender || key.participant || '',
          pushName: cached?.pushName || '',
          type: cached?.type || 'text',
          body: cached?.body || '',
          at: cached?.at || Date.now(),
        };
        store.pushDelete(chat, entry);
        if (chat.endsWith('@g.us') && policy.antidelete) {
          const who = entry.sender ? '@' + String(entry.sender).split('@')[0].split(':')[0] : 'Someone';
          const preview = (entry.body || `[${entry.type}]`).slice(0, 300);
          await sock.sendMessage(chat, { text: `_*亗 deleted message caught*_\n${who}: ${preview}`, mentions: entry.sender ? [entry.sender] : [] }).catch(() => {});
        }
      }
    } catch (e) { console.error('  delete-hook:', e.message); }
  });

  // legacy delete event (some Baileys forks)
  sock.ev.on('messages.delete', async (item) => {
    try {
      const key = item?.keys?.[0] || item?.key;
      if (!key?.remoteJid) return;
      const cached = store.findById(key.remoteJid, key.id);
      if (cached) store.pushDelete(key.remoteJid, cached);
    } catch {}
  });

  // incoming calls -> anticall (reject + delete log if enabled)
  sock.ev.on('call', async (calls) => {
    try {
      const list = Array.isArray(calls) ? calls : [calls];
      for (const call of list) {
        if (call.status !== 'offer') continue;
        const chat = call.chatId || call.from;
        let policy = {};
        try { policy = messageEvents.groupPolicy(chat) || {}; } catch {}
        const needGlobal = require('./lib/database').get('anticall', false);
        if (policy.anticall || needGlobal) {
          await sock.rejectCall(call.id, call.from).catch(() => {});
          if (chat?.endsWith('@g.us')) {
            await sock.sendMessage(chat, { text: '_*亗 call rejected*_\nCalls are disabled in this group.' }).catch(() => {});
          }
        }
      }
    } catch (e) { console.error('  call-hook:', e.message); }
  });

  // group icon / subject / description changes -> antidp / antidesc / antiname guards
  sock.ev.on('groups.update', async (updates) => {
    try {
      const list = Array.isArray(updates) ? updates : [updates];
      const dbo = require('./lib/database');
      for (const g of list) {
        if (!g?.id) continue;
        const policy = messageEvents.groupPolicy(g.id) || {};
        if (policy.antidp && (g.icon || g.subject)) {
          await sock.sendMessage(g.id, { text: '_*亗 group update blocked*_\nGroup icon/subject changes are disabled (antidp is on).' }).catch(() => {});
        }
        try {
          if (policy.antidesc && typeof g.desc === 'string') {
            const old = dbo.get(`gcdesc:${g.id}`, null);
            if (old != null && old !== g.desc && typeof sock.groupUpdateDescription === 'function') {
              await sock.groupUpdateDescription(g.id, old).catch(() => {});
              await sock.sendMessage(g.id, { text: '_*亗 description restored*_\nGroup description changes are blocked (antidesc is on).' }).catch(() => {});
            }
          }
          if (policy.antiname && g.subject) {
            const oldN = dbo.get(`gcname:${g.id}`, null);
            if (oldN && oldN !== g.subject && typeof sock.groupUpdateSubject === 'function') {
              await sock.groupUpdateSubject(g.id, oldN).catch(() => {});
              await sock.sendMessage(g.id, { text: '_*亗 group name restored*_\nGroup name changes are blocked (antiname is on).' }).catch(() => {});
            }
          }
        } catch {}
        // snapshot latest values (restoring the snapshot never loops: equal = no-op)
        try {
          if (typeof g.desc === 'string') dbo.set(`gcdesc:${g.id}`, g.desc);
          if (g.subject) dbo.set(`gcname:${g.id}`, g.subject);
        } catch {}
      }
    } catch {}
  });

  // V7 · join-request sweeper: .autoadd / .autodecline flags + .antijoinreq policy
  try {
    setInterval(async () => {
      try {
        if (!sock?.user) return;
        if (typeof sock.groupRequestParticipantsList !== 'function') return;
        const dbo = require('./lib/database');
        const data = dbo.all();
        const jobs = [];
        for (const [k, v] of Object.entries(data)) {
          let mm = k.match(/^autoadd:(.+@g\.us)$/); if (mm && v) jobs.push(['approve', mm[1]]);
          mm = k.match(/^autodecline:(.+@g\.us)$/); if (mm && v) jobs.push(['decline', mm[1]]);
          mm = k.match(/^groupPolicy:(.+@g\.us)$/); if (mm && v && v.antijoinreq && v.antijoinreq !== 'off' && v.antijoinreq !== false) jobs.push(['decline', mm[1]]);
        }
        for (const [mode, jid] of jobs.slice(0, 20)) {
          try {
            const pending = await sock.groupRequestParticipantsList(jid).catch(() => []);
            if (!pending?.length) continue;
            const delay = Number(dbo.get('autoaddDelay', 0)) || 0;
            const cc = String(dbo.get('autoaddCC', '') || '').replace(/\D/g, '');
            for (const r of pending.slice(0, 10)) {
              const rjid = r.jid || r.id; if (!rjid) continue;
              const num = String(rjid).split('@')[0].split(':')[0];
              if (mode === 'approve') {
                if (cc && !num.startsWith(cc)) continue;
                if (delay > 0) {
                  const wk = `reqwait:${jid}:${num}`;
                  const first = dbo.get(wk, 0);
                  if (!first) { dbo.set(wk, Date.now()); continue; }
                  if (Date.now() - first < delay * 1000) continue;
                  dbo.delete(wk);
                }
                await sock.groupRequestParticipantsUpdate(jid, [rjid], 'approve').catch(() => {});
              } else {
                await sock.groupRequestParticipantsUpdate(jid, [rjid], 'reject').catch(() => {});
              }
              await new Promise((rr) => setTimeout(rr, 800));
            }
          } catch {}
        }
      } catch {}
    }, 45000).unref?.();
  } catch {}

  sock.ev.on('group-participants.update', (update) =>
    messageEvents.handleParticipantsUpdate(sock, update).catch((e) => console.error('  group event:', e.message)),
  );

  return sock;
}

module.exports = { connect, state, requestPairing };
