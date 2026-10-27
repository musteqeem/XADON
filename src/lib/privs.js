/**
 * XADON V8 · PRIVILEGE LAYER (sudo / mod / alladmin)
 *
 * Roles (highest first):
 *   hard-owner — numbers in config.ownerNumbers (+ bot itself / fromMe). Full control, can manage mods.
 *   mod        — db `mods` list. FULL OWNER ACCESS (treated as owner everywhere, incl. private mode).
 *   sudo       — db `sudos` list. NEAR-OWNER ACCESS: bypasses private mode + cooldown + per-group
 *                disabled commands, can use admin/group commands, but CANNOT use owner-only commands.
 *   admin      — group admins. Normally can use admin commands in their group. If that group's
 *                `alladmin` policy is ON, group admins ALSO bypass private mode inside that group.
 *   user       — everyone else.
 *
 * Storage: digits-only strings, e.g. "2348000000000".
 *   db `sudos` -> ["234..."]
 *   db `mods`  -> ["234..."]
 *   groupPolicy.alladmin -> true/false per group (see message-handler savePolicy/groupPolicy)
 */
const digits = (v = '') => String(v).split('@')[0].split(':')[0].replace(/\D/g, '');

function getSudos(db) { return db.get('sudos', []); }
function getMods(db) { return db.get('mods', []); }

function isHardOwnerNumber(db, config, number) {
  const d = digits(number);
  return (config.ownerNumbers || []).map(digits).includes(d);
}
function isModNumber(db, number) {
  const d = digits(number);
  return getMods(db).map(digits).includes(d);
}
function isSudoNumber(db, number) {
  const d = digits(number);
  return getSudos(db).map(digits).includes(d);
}

/** Full owner access = hard owner OR mod (mods are full owners). */
function isOwnerPriv(db, config, number) {
  return isHardOwnerNumber(db, config, number) || isModNumber(db, number);
}
/** Near-owner access = owner-priv OR sudo (can drive the bot in private mode). */
function isSudoPriv(db, config, number) {
  return isOwnerPriv(db, config, number) || isSudoNumber(db, number);
}

function roleOf(db, config, number) {
  if (isHardOwnerNumber(db, config, number)) return 'owner';
  if (isModNumber(db, number)) return 'mod';
  if (isSudoNumber(db, number)) return 'sudo';
  return 'user';
}

function addUnique(db, key, number) {
  const d = digits(number);
  if (!/^\d{7,15}$/.test(d)) return { ok: false, reason: 'bad-number' };
  const list = (db.get(key, []) || []).map(digits);
  if (list.includes(d)) return { ok: false, reason: 'exists', list };
  list.push(d);
  db.set(key, list);
  return { ok: true, list };
}
function delEntry(db, key, number) {
  const d = digits(number);
  const list = (db.get(key, []) || []).map(digits);
  const next = list.filter((x) => x !== d);
  db.set(key, next);
  return { removed: list.length !== next.length, list: next };
}

const parseTarget = (args = [], m) => {
  if (m?.mentions?.[0]) return digits(m.mentions[0]);
  if (m?.quoted?.sender) return digits(m.quoted.sender);
  const raw = (args[0] || '').replace(/^@/, '');
  if (/^\+?\d{7,15}$/.test(raw)) return digits(raw);
  return '';
};

module.exports = {
  digits, getSudos, getMods, isHardOwnerNumber, isModNumber, isSudoNumber,
  isOwnerPriv, isSudoPriv, roleOf, addUnique, delEntry, parseTarget,
};
