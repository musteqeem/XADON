/**
 * XADON V7 · RAWSTORE — in-memory ring buffer of RAW incoming messages
 * (keyed chat:id) so .quotedeep / .quotemedia can fetch the EXACT quoted
 * payload (even nested quotes) without depending on Baileys' multidevice store.
 * Memory-only: oldest entries drop first, nothing sensitive is written to disk.
 */
const MEM = new Map(); // `${chat}:${id}` -> { raw, at }
const MAX = 400;

function push(chat, raw) {
  try {
    if (!chat || !raw?.key?.id) return;
    MEM.set(`${chat}:${raw.key.id}`, { raw, at: Date.now() });
    if (MEM.size > MAX) for (const k of [...MEM.keys()].slice(0, MEM.size - MAX)) MEM.delete(k);
  } catch {}
}
function get(chat, id) {
  try { return MEM.get(`${chat}:${id}`)?.raw || null; } catch { return null; }
}
module.exports = { push, get };
