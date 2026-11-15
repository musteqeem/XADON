const path = require('path');
const config = require('../../config');

const digits = (jid = '') => String(jid).split('@')[0].split(':')[0];

function localDateTime(now = new Date()) {
  const timeZone = process.env.BOT_TIMEZONE || 'Africa/Lagos';
  return {
    date: now.toLocaleDateString('en-GB', { timeZone }),
    time: now.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }),
  };
}

async function profileUrl(sock, jid) {
  if (!jid || typeof sock?.profilePictureUrl !== 'function') return '';
  try { return await sock.profilePictureUrl(jid, 'image'); } catch { return ''; }
}

async function renderGroupTemplate(template, { sock, groupJid, userJid, groupName, memberCount } = {}) {
  const now = localDateTime();
  const safeGroup = groupName || 'the group';
  const user = `@${digits(userJid) || 'user'}`;
  let resolvedMemberCount = memberCount;
  if (!Number.isFinite(resolvedMemberCount)) {
    try { resolvedMemberCount = (await sock.groupMetadata(groupJid)).participants?.length; } catch {}
  }
  const [userpp, groupp] = await Promise.all([
    profileUrl(sock, userJid),
    profileUrl(sock, groupJid),
  ]);
  const values = {
    user,
    group: safeGroup,
    date: now.date,
    time: now.time,
    number: digits(userJid),
    bot: config.botName,
    userpp: userpp || 'not available',
    groupp: groupp || 'not available',
    members: Number.isFinite(resolvedMemberCount) ? String(resolvedMemberCount) : 'unknown',
  };
  const rendered = String(template || '')
    .replace(/@(userpp|groupp|members|number|group|user|date|time|bot)\b/gi, (_, key) => values[key.toLowerCase()] ?? '');
  return { text: rendered, mentions: userJid ? [userJid] : [], userpp, groupp };
}

function mediaContent(url, fallbackText) {
  if (!url) return { text: fallbackText };
  return { image: { url }, caption: fallbackText };
}

module.exports = { digits, profileUrl, renderGroupTemplate, mediaContent };
