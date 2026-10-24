/**
 * XADON AI · MSGSTORE — message cache for .deleted / .quoted / .groupstatus / .statuslist
 * - Keeps last 50 messages per chat in memory (+ body/type/sender in db for restart survival)
 * - Keeps last 5 DELETED messages per chat (db `deleted:<chat>`)
 * - Keeps last 30 status updates (db `statusCache`)
 * No external deps. Safe to call from handler/connection/message-handler.
 */
const db = require('./database');

const MEM = new Map(); // chat -> [{...}]
const MAX_MEM = 50;
const MAX_DEL = 5;
const MAX_STATUS = 30;

function now() { return Date.now(); }
function memList(chat) {
  if (!MEM.has(chat)) MEM.set(chat, []);
  return MEM.get(chat);
}

function push(chat, entry) {
  try {
    if (!chat) return;
    const list = memList(chat);
    list.push({ ...entry, at: entry.at || now() });
    while (list.length > MAX_MEM) list.shift();
    if (MEM.size > 500) for (const k of [...MEM.keys()].slice(0, 100)) MEM.delete(k);
  } catch {}
}

function findById(chat, id) {
  try {
    const list = MEM.get(chat) || [];
    return list.find((e) => e.id === id) || null;
  } catch { return null; }
}

function pushDelete(chat, entry) {
  try {
    if (!chat) return;
    const key = `deleted:${chat}`;
    const arr = db.get(key, []);
    arr.push({ ...entry, deletedAt: now() });
    db.set(key, arr.slice(-MAX_DEL));
  } catch {}
}

function getDeleted(chat, n = 5) {
  try {
    const arr = db.get(`deleted:${chat}`, []);
    return arr.slice(-n).reverse();
  } catch { return []; }
}

function clearDeleted(chat) {
  try { db.set(`deleted:${chat}`, []); } catch {}
}

function pushStatus(entry) {
  try {
    const arr = db.get('statusCache', []);
    arr.push({ ...entry, at: entry.at || now() });
    db.set('statusCache', arr.slice(-MAX_STATUS));
  } catch {}
}

function getStatuses(n = 20) {
  try {
    const arr = db.get('statusCache', []);
    return arr.slice(-n).reverse();
  } catch { return []; }
}

module.exports = { push, findById, pushDelete, getDeleted, clearDeleted, pushStatus, getStatuses };
