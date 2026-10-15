module.exports = {
  name: 'ship',
  alias: ['couple', 'match', 'love'],
  desc: 'Ship two people',
  usage: '.ship @a @b  |  reply with .ship',
  async run({ sock, m, ui, reply, target, args }) {
    const { fonts } = ui;
    const a = target() || m.sender;
    const num = args.find((v) => /^\+?\d{7,15}$/.test(v || ''))?.replace(/\D/g, '');
    const b = m.mentions[1] || (num ? `${num}@s.whatsapp.net` : m.quoted?.sender) || m.sender;
    const score = (Number(a.split('@')[0].slice(-2)) + Number(b.split('@')[0].slice(-2)) + a.length + b.length) % 101;
    const bar = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10));
    const verdict = score > 85 ? 'PERFECT MATCH' : score > 65 ? 'GREAT PAIR' : score > 40 ? 'TRY YOUR LUCK' : 'JUST FRIENDS';
    await sock.sendMessage(m.chat, { text: [`♥ ${fonts.bold('LOVE SHIP')} ♥`, '', `@${a.split('@')[0]}  ✦  @${b.split('@')[0]}`, '', `${bar}  ${fonts.bold(`${score}%`)}`, `${fonts.smallCaps(verdict.toLowerCase())}`, '', ui.footer()].join('\n'), mentions: [a, b] }, { quoted: m.raw });
  },
};
