/** XADON shorten — is.gd free shortener. */
module.exports = {
  name: 'shorten',
  alias: ['short', 'tinyurl', 'link'],
  desc: 'Shorten a long link',
  usage: '.shorten <long url>',
  async run({ args, reply, ui, prefix, m }) {
    const { fonts } = ui;
    const url = (args[0] || m.quoted?.body || '').trim();
    if (!/^https?:\/\/\S+/i.test(url)) return reply(ui.notice('info', 'Shorten', `${fonts.mono(`${prefix}shorten https://very-long-link...`)}`));
    try {
      const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
      const short = (await res.text()).trim();
      if (!short.startsWith('http')) throw new Error(short.slice(0, 80));
      await reply(ui.card({ icon: '✂', title: 'Link shortened', subtitle: 'is.gd', rows: [['short', fonts.bold(short)], ['long', fonts.mono(url.slice(0, 120))]], body: ui.footer() }));
    } catch (e) { await reply(ui.notice('error', 'Shorten failed', 'That URL was rejected.')); }
  },
};
