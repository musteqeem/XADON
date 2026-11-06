// XADON V12 · MEDIACACHE — disk+memory vault for incoming media.
// Every incoming image/video/audio/document/sticker is snapshotted (best-effort,
// size-capped) so .deleted / .quoted / .deletedp can resurrect it AFTER deletion.
// Memory holds hot buffers; disk (database/mediacache/) survives restarts.
// Zero extra npm deps. Fully failure-proof: every step is guarded.
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '../../database/mediacache');
const INDEX_FILE = path.join(DIR, 'index.json');
const MAX_FILE = 12 * 1024 * 1024;   // skip files bigger than 12MB
const MAX_ENTRIES = 150;              // max files kept on disk
const MEM_MAX_FILES = 60;             // max buffers kept in RAM
const MEM_MAX_BYTES = 80 * 1024 * 1024;

const mem = new Map(); // key -> { buffer, meta }
let memBytes = 0;
let index = {}; // key -> meta
try { fs.mkdirSync(DIR, { recursive: true }); } catch {}
try { index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8') || '{}'); } catch { index = {}; }

const safe = (s = '') => String(s).replace(/[^a-zA-Z0-9@._-]/g, '_').slice(0, 80);
const keyOf = (chat, id) => `${safe(chat)}__${safe(id)}`;
function saveIndex() {
  try { fs.writeFileSync(INDEX_FILE, JSON.stringify(index)); } catch {}
}
function prune() {
  try {
    const keys = Object.keys(index).sort((a, b) => (index[a].at || 0) - (index[b].at || 0));
    while (keys.length > MAX_ENTRIES) {
      const k = keys.shift();
      try { fs.unlinkSync(path.join(DIR, k)); } catch {}
      delete index[k];
      if (mem.has(k)) { memBytes -= (mem.get(k).buffer?.length || 0); mem.delete(k); }
    }
    saveIndex();
  } catch {}
}
function memPut(k, buffer, meta) {
  try {
    if (mem.has(k)) memBytes -= (mem.get(k).buffer?.length || 0);
    mem.set(k, { buffer, meta });
    memBytes += buffer.length;
    while ((mem.size > MEM_MAX_FILES || memBytes > MEM_MAX_BYTES) && mem.size) {
      const oldest = mem.keys().next().value;
      memBytes -= (mem.get(oldest).buffer?.length || 0);
      mem.delete(oldest);
    }
  } catch {}
}

/** Snapshot a media buffer. meta: { type, mimetype, fileName, caption, sender, pushName }. */
function save(chat, id, buffer, meta = {}) {
  try {
    if (!chat || !id || !Buffer.isBuffer(buffer) || !buffer.length) return false;
    if (buffer.length > MAX_FILE) return false;
    const k = keyOf(chat, id);
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(path.join(DIR, k), buffer);
    index[k] = { ...(index[k] || {}), ...meta, at: Date.now(), size: buffer.length };
    saveIndex(); prune();
    memPut(k, buffer, index[k]);
    return true;
  } catch { return false; }
}

/** Retrieve a snapshot. Returns { buffer, meta } or null. */
function get(chat, id) {
  try {
    if (!chat || !id) return null;
    const k = keyOf(chat, id);
    if (mem.has(k)) return mem.get(k);
    const meta = index[k];
    if (!meta) return null;
    const buf = fs.readFileSync(path.join(DIR, k));
    memPut(k, buf, meta);
    return { buffer: buf, meta };
  } catch { return null; }
}
function has(chat, id) { try { return !!index[keyOf(chat, id)]; } catch { return false; } }

/** Drop every snapshot of one chat (used by .deleted clear). */
function dropChat(chat) {
  try {
    const pfx = `${safe(chat)}__`;
    for (const k of Object.keys(index)) {
      if (k.startsWith(pfx)) {
        try { fs.unlinkSync(path.join(DIR, k)); } catch {}
        delete index[k];
        if (mem.has(k)) { memBytes -= (mem.get(k).buffer?.length || 0); mem.delete(k); }
      }
    }
    saveIndex();
  } catch {}
}
function stats() {
  try {
    const files = Object.keys(index).length;
    const bytes = Object.values(index).reduce((n, m) => n + (Number(m.size) || 0), 0);
    return { files, bytes, memFiles: mem.size, memBytes };
  } catch { return { files: 0, bytes: 0, memFiles: 0, memBytes: 0 }; }
}
function clearAll() {
  try {
    for (const k of Object.keys(index)) { try { fs.unlinkSync(path.join(DIR, k)); } catch {} }
    index = {}; saveIndex();
    mem.clear(); memBytes = 0;
  } catch {}
}

/**
 * Fire-and-forget snapshotter. Call with (sock, raw, m) for every incoming
 * message; it downloads media in the background WITHOUT blocking the handler.
 */
function prefetch(sock, raw, m) {
  try {
    if (!m?.isMedia || !raw?.message) return;
    const inner = raw.message[m.type] || {};
    const declared = Number(inner.fileLength || inner.fileLength === 0 ? inner.fileLength : 0) || 0;
    if (declared > MAX_FILE) return;
    Promise.resolve().then(async () => {
      try {
        const { downloadMediaMessage } = require('@musteqeem/baileys');
        const buf = await downloadMediaMessage(raw, 'buffer', {});
        if (!buf?.length) return;
        save(m.chat, m.id, buf, {
          type: m.type,
          mimetype: inner.mimetype || '',
          fileName: inner.fileName || '',
          caption: (m.body || '').slice(0, 500),
          sender: m.sender || '',
          pushName: m.pushName || '',
        });
      } catch {}
    }).catch(() => {});
  } catch {}
}

/** Build a sendable payload from a cached snapshot. Returns object or null. */
function toPayload(snap) {
  try {
    const { buffer, meta } = snap || {};
    if (!buffer?.length) return null;
    const t = meta?.type || '';
    const cap = (meta?.caption || '').slice(0, 900);
    if (t === 'imageMessage') return { image: buffer, caption: cap };
    if (t === 'videoMessage') return { video: buffer, caption: cap };
    if (t === 'audioMessage') return { audio: buffer, mimetype: meta?.mimetype || 'audio/ogg; codecs=opus' };
    if (t === 'stickerMessage') return { sticker: buffer };
    if (t === 'documentMessage') return { document: buffer, mimetype: meta?.mimetype || 'application/octet-stream', fileName: meta?.fileName || 'file.bin' };
    return { document: buffer, mimetype: meta?.mimetype || 'application/octet-stream', fileName: meta?.fileName || 'file.bin' };
  } catch { return null; }
}

/**
 * Re-post one deleted entry (text + media) to any target JID.
 * entry: { id, sender, type, body } from msgstore.getDeleted().
 * header: optional intro line prepended to the text part.
 */
async function repost(sock, chat, target, entry, header = '') {
  try {
    const who = entry?.sender ? '@' + String(entry.sender).split('@')[0].split(':')[0] : 'Someone';
    const textPart = `${header ? header + '\n' : ''}♻ ${who}\n${(entry?.body || `[${entry?.type || 'media'}]`).slice(0, 1000)}`;
    const mentions = entry?.sender ? [entry.sender] : [];
    const snap = get(chat, entry?.id);
    const media = toPayload(snap);
    if (media && (media.image || media.video)) {
      await sock.sendMessage(target, { ...media, caption: `${textPart}\n${media.caption || ''}`.slice(0, 1100), mentions }).catch(() => {});
    } else if (media) {
      await sock.sendMessage(target, { text: textPart, mentions }).catch(() => {});
      await sock.sendMessage(target, media).catch(() => {});
    } else {
      await sock.sendMessage(target, { text: textPart, mentions }).catch(() => {});
    }
    return true;
  } catch { return false; }
}

module.exports = { save, get, has, dropChat, stats, clearAll, prefetch, toPayload, repost, MAX_FILE, MAX_ENTRIES };
