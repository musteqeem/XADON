// XADON AI · about — fetch anyone's WhatsApp about/status (Baileys fetchStatus).
module.exports = {
  name: 'about',
  alias: ['getabout', 'userbio'],
  desc: "Show a user's about line",
  usage: '.about [@user|number]',
  category: 'extra',
  async run({ sock, m, reply, ui, target }) {
    const jid = target() || m.sender;
    try {
      const st = await sock.fetchStatus(jid).catch(() => null);
      const line = st?.status || '';
      if (!line) return reply(ui.notice('info', 'No about', `@${jid.split('@')[0]} has no visible about line.`));
      return reply(ui.card({ icon: '\u2139', title: 'About', subtitle: '@' + jid.split('@')[0], rows: [], body: line.slice(0, 500) }));
    } catch { return reply(ui.notice('error', 'Fetch failed', 'Could not fetch that about line.')); }
  },
};
