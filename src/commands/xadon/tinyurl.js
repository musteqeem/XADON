/** XADON V9 · tinyurl — shorten any link (tinyurl → is.gd fallback). */
module.exports = {
  name: 'tinyurl',
  alias: ['short2', 'minilink'],
  desc: 'Shorten a long link',
  usage: '.tinyurl <link>',
  category: 'xadon9',
  async run({ m, text, reply, ui, prefix }) {
    const input = (text || m.quoted?.body || '').trim().split(/\s+/)[0] || '';
    if (!/^https?:\/\//i.test(input)) return reply(ui.notice('info', 'Shorten', `Usage: ${prefix}tinyurl https://very-long-link…`));
    const get = async (u) => (await (await fetch(u)).text()).trim();
    try {
      let short = await get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(input)}`).catch(() => '');
      if (!short.startsWith('http')) short = await get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(input)}`);
      if (!short.startsWith('http')) throw new Error('no service');
      return reply(ui.card({ icon: '◈', title: 'Link shortened', rows: [['short', short], ['long', input.slice(0, 80) + (input.length > 80 ? '…' : '')]] }));
    } catch {
      return reply(ui.notice('error', 'Shorten failed', 'Both shorteners are down. Try again later.'));
    }
  },
};
