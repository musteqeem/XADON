// XADON AI · MEDIA — premium unicode card, no emojis.
module.exports = {
  name: 'emojimix',
  alias: ['mixemoji'],
  desc: 'Mix two emojis (kitchen)',
  usage: '.emojimix <e1> <e2>',
  category: 'media',
  async run({ args, reply, ui, prefix, sock, m }) {
    const { fonts } = ui;
    if (args.length < 2) return reply(ui.notice('info', 'Emoji mix', `${fonts.mono(`${prefix}emojimix ☺ ♥`)}`));
    const cp = (e) => [...e].map((c) => 'u' + c.codePointAt(0).toString(16)).join('-');
    const url = `https://emojik.vercel.app/s/${encodeURIComponent(args[0])}_${encodeURIComponent(args[1])}?size=512`;
    try {
      await sock.sendMessage(m.chat, { image: { url }, caption: ui.card({ icon: '◈', title: 'Emoji mix', subtitle: `${args[0]} + ${args[1]}`, rows: [], body: ui.footer() }) }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Mix failed', 'Those two emojis cannot mix.')); }
  },
};
