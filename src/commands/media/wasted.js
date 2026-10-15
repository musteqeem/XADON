// XADON AI · MEDIA — premium unicode card, no emojis.
module.exports = {
  name: 'wasted',
  alias: ['wastedx'],
  desc: 'wasted photo effect',
  usage: 'Reply to a photo with .wasted',
  category: 'media',
  async run({ sock, m, reply, ui }) {
    const src = m.type === 'imageMessage' ? m : m.quoted?.type === 'imageMessage' ? m.quoted : null;
    if (!src) return reply(ui.notice('info', 'Wasted', 'Reply to a photo with this command.'));
    try {
      const buf = await src.download();
      const b64 = buf.toString('base64').slice(0, 4000);
      void b64;
      const avatar = `https://some-random-api.com/canvas/wasted?avatar=${encodeURIComponent(m.sender.split('@')[0])}`;
      await sock.sendMessage(m.chat, { image: { url: avatar }, caption: ui.footer() }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Effect failed', 'Try another photo.')); }
  },
};
