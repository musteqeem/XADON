// XADON V8 · stickerreact — sticker reaction on a quoted sticker (association + emoji).
module.exports = {
  name: 'stickerreact', alias: ['streact', 'stickreact'], desc: 'React to a sticker with a sticker', usage: 'Reply to a sticker with .stickerreact [emoji]', category: 'rich',
  async run({ sock, m, args, reply, ui }) {
    const q = m.quoted;
    if (!q || q.type !== 'stickerMessage') return reply(ui.notice('info', 'Sticker react', 'Reply to a sticker with .stickerreact ❤️'));
    const emoji = (args[0] || '❤️').slice(0, 8);
    try {
      await sock.sendMessage(m.chat, { react: { text: emoji, key: q.raw.key } }).catch(() => {});
      const buf = await q.download();
      await sock.relayMessage(m.chat, {
        messageContextInfo: { messageAssociation: { associationType: 11, parentMessageKey: q.raw.key } },
        stickerMessage: { sticker: buf, mimetype: 'image/webp', isAnimated: false },
      }, {});
    } catch (e) { return reply(ui.notice('error', 'React failed', String(e.message || e).slice(0, 200))); }
  },
};
