// XADON · hidetag — tag everyone silently (invisible mention, no @ list shown).
module.exports = {
  name: 'hidetag',
  alias: ['htag', 'silenttag'],
  desc: 'Tag everyone silently',
  usage: '.hidetag <message>  ·  reply to media with .hidetag [caption]',
  group: true, admin: true, category: 'group',
  async run({ sock, m, ui, group, text, fail }) {
    const members = group?.participants || (await sock.groupMetadata(m.chat).catch(() => null))?.participants || [];
    if (!members.length) return fail('No members', 'Could not read the member list.');
    const jids = members.map((p) => p.id).filter(Boolean);
    if (!jids.length) return fail('No members', 'Could not read the member list.');
    const body = (text || '').trim() || ui.fonts.smallCaps('attention everyone');
    const q = m.quoted;
    try {
      // If replying to media, resend that media with silent tag
      if (q?.isMedia) {
        const buf = await q.download();
        const cap = body;
        if (q.type === 'imageMessage') return await sock.sendMessage(m.chat, { image: buf, caption: cap, mentions: jids }, { quoted: m.raw });
        if (q.type === 'videoMessage') return await sock.sendMessage(m.chat, { video: buf, caption: cap, mentions: jids }, { quoted: m.raw });
        if (q.type === 'audioMessage') return await sock.sendMessage(m.chat, { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true, mentions: jids }, { quoted: m.raw });
        if (q.type === 'stickerMessage') return await sock.sendMessage(m.chat, { sticker: buf, mentions: jids }, { quoted: m.raw });
      }
      await sock.sendMessage(m.chat, { text: `${body}\n${'󠀠'.repeat(1)}`, mentions: jids }, { quoted: m.raw });
    } catch (e) {
      return fail('Tag failed', String(e.message || e).slice(0, 200));
    }
  },
};
