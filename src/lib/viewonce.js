/**
 * XADON · VIEWONCE HELPER (fixes ".vv media key not found").
 * WhatsApp strips media keys from quoted context for view-once media,
 * so m.quoted.download() alone often throws "media key not found".
 * Strategy (first success wins):
 *   1. Full raw from rawstore (has real mediaKey/directPath) — BEST.
 *   2. Unwrap viewOnce/ephemeral wrappers and re-try download.
 *   3. q.download() direct.
 *   4. Re-upload request via sock.updateMediaMessage when supported.
 */
const { downloadMediaMessage } = require('@musteqeem/baileys');

function normalizeContent(msg) {
  try {
    const { normalizeMessageContent } = require('@musteqeem/baileys');
    return normalizeMessageContent(msg) || msg;
  } catch { return msg; }
}

// Unwrap viewOnceMessage / viewOnceMessageV2 / ephemeralMessage wrappers.
function unwrap(msg) {
  let cur = msg;
  for (let i = 0; i < 5 && cur; i++) {
    if (cur.viewOnceMessage?.message) { cur = cur.viewOnceMessage.message; continue; }
    if (cur.viewOnceMessageV2?.message) { cur = cur.viewOnceMessageV2.message; continue; }
    if (cur.ephemeralMessage?.message) { cur = cur.ephemeralMessage.message; continue; }
    if (cur.documentWithCaptionMessage?.message) { cur = cur.documentWithCaptionMessage.message; continue; }
    break;
  }
  return cur;
}

function innerKind(unwrapped) {
  const keys = Object.keys(unwrapped || {});
  return keys.find((k) => /imageMessage|videoMessage|audioMessage|stickerMessage|documentMessage/.test(k)) || null;
}

async function tryDownload(raw, opts = {}) {
  // opts: { reupload: sock.updateMediaMessage bound }
  try {
    return await downloadMediaMessage(raw, 'buffer', {}, opts.reupload ? { reuploadRequest: opts.reupload } : undefined);
  } catch (e1) {
    // retry without extra options (older forks throw on 4th arg)
    try {
      return await downloadMediaMessage(raw, 'buffer', {});
    } catch (e2) {
      const err = new Error(e2?.message || e1?.message || 'download failed');
      err.cause = e1;
      throw err;
    }
  }
}

async function downloadViewOnce(sock, m) {
  const q = m.quoted;
  if (!q) throw new Error('Reply to a view-once photo, video or voice note.');
  const rawstore = require('./rawstore');
  const candidates = [];
  // 1. full raw from ring buffer
  try {
    const full = rawstore.get(m.chat, q.id);
    if (full?.message) candidates.push({ raw: full, why: 'rawstore' });
  } catch {}
  // 2. q.raw as-is
  if (q.raw?.message) candidates.push({ raw: q.raw, why: 'quoted-raw' });
  // 3. unwrapped quoted message rebuilt as a standalone raw
  try {
    const qMsg = normalizeContent(q.raw?.message || q.message);
    const un = unwrap(qMsg);
    if (un && un !== qMsg) {
      candidates.push({ raw: { key: q.raw.key, message: un }, why: 'unwrapped' });
    }
  } catch {}
  // 4. current message itself (sender sent view-once directly without reply context)
  if (m.raw?.message && /viewOnce/i.test(JSON.stringify(m.raw.message).slice(0, 4000))) {
    candidates.push({ raw: m.raw, why: 'current-raw' });
  }
  // 5. target fallback for vvdl-style (m.isMedia)
  if (m.isMedia && m.raw?.message) candidates.push({ raw: m.raw, why: 'self-media' });

  if (!candidates.length) throw new Error('media key not found — open the view-once first, then reply fast. Expired media cannot be recovered.');

  const reupload = sock?.updateMediaMessage?.bind(sock) || null;
  let lastErr = null;
  for (const c of candidates) {
    try {
      const buf = await tryDownload(c.raw, { reupload });
      if (buf?.length) {
        const norm = normalizeContent(c.raw.message);
        const un = unwrap(norm);
        const kind = innerKind(un) || q.type || m.type || 'imageMessage';
        const inner = un[kind] || {};
        return { buf, kind, inner, source: c.why };
      }
    } catch (e) { lastErr = e; }
  }
  const msg = String(lastErr?.message || 'download failed');
  if (/media key|not found|decrypt|bad mac|invalid/i.test(msg)) {
    throw new Error('media key not found — the view-once key expired or was already opened. Ask the sender to resend, then reply .vv BEFORE opening it.');
  }
  throw new Error(msg.slice(0, 250));
}

module.exports = { downloadViewOnce, unwrap, innerKind };
