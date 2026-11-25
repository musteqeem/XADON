// XADON · hidetagall — forward the replied message to EVERY group, tagging all members silently.
// 5s interval between groups to prevent spam/bans. Owner only (broadcast power).
module.exports = {
  name: 'hidetagall',
  alias: ['htagall', 'silenttagall', 'broadcasttag'],
  desc: 'Send replied message to all groups with silent tag (5s gap)',
  usage: '.hidetagall (reply to text/media) [extra caption]',
  category: 'group',
  owner: true,
  async run({ sock, m, ui, text, reply }) {
    const q = m.quoted;
    const extra = (text || '').trim();
    if (!q && !extra) return reply(ui.notice('info', 'Hidetag all', 'Reply to the message you want to blast with .hidetagall [caption].'));
    let groups = {};
    try { groups = await sock.groupFetchAllParticipating().catch(() => ({})); } catch {}
    const ids = Object.keys(groups || {});
    if (!ids.length) return reply(ui.notice('error', 'No groups', 'The bot is not in any group.'));
    // Build one payload factory per target group (mentions must be per-group member list)
    let mediaBuf = null, mediaKind = null;
    if (q?.isMedia) {
      try { mediaBuf = await q.download(); mediaKind = q.type; }
      catch (e) { return reply(ui.notice('error', 'Media failed', 'Could not download the replied media: ' + String(e.message || e).slice(0, 150))); }
    }
    const textBody = extra || q?.body || '';
    await reply(ui.notice('info', 'Blast started', `Sending to ${ids.length} group(s) with silent tag — 5s gap between sends.`));
    let ok = 0, no = 0;
    for (const gid of ids) {
      try {
        const meta = await sock.groupMetadata(gid).catch(() => null);
        const jids = (meta?.participants || []).map((p) => p.id).filter(Boolean);
        if (mediaBuf) {
          if (mediaKind === 'imageMessage') await sock.sendMessage(gid, { image: mediaBuf, caption: textBody, mentions: jids });
          else if (mediaKind === 'videoMessage') await sock.sendMessage(gid, { video: mediaBuf, caption: textBody, mentions: jids });
          else if (mediaKind === 'audioMessage') await sock.sendMessage(gid, { audio: mediaBuf, mimetype: 'audio/ogg; codecs=opus', ptt: true, mentions: jids });
          else if (mediaKind === 'stickerMessage') await sock.sendMessage(gid, { sticker: mediaBuf, mentions: jids });
          else await sock.sendMessage(gid, { text: `${textBody}\n${'󠀠'.repeat(1)}`, mentions: jids });
        } else {
          await sock.sendMessage(gid, { text: `${textBody}\n${'󠀠'.repeat(1)}`, mentions: jids });
        }
        ok++;
      } catch { no++; }
      await new Promise((r) => setTimeout(r, 5000)); // anti-spam gap
    }
    return reply(ui.notice('success', 'Blast done', `Delivered to ${ok} group(s)${no ? `, ${no} failed` : ''}.`));
  },
};
