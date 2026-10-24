// XADON AI · checkbots — list suspected bot accounts in the group (about-line scan via Baileys fetchStatus).
module.exports = {
  name: 'checkbots',
  alias: ['listbots', 'botscan'],
  desc: 'List suspected bots in the group',
  usage: '.checkbots',
  group: true, category: 'extra',
  async run({ sock, m, reply, ui }) {
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return reply(ui.notice('error', 'No metadata', 'Could not fetch group info.'));
    const parts = (meta.participants || []).slice(0, 25);
    const found = [];
    for (const p of parts) {
      const jid = p.id || p.jid;
      if (!jid) continue;
      let about = '';
      try { about = (await sock.fetchStatus(jid).catch(() => null))?.status || ''; } catch {}
      const num = jid.split('@')[0];
      if (/bot/i.test(about) || /bot$/i.test(num) || /cody|kord|wolf|xadon|ai[_-]?bot/i.test(about + ' ' + num)) found.push([num.slice(-6), about.slice(0, 40) || 'no about']);
    }
    if (!found.length) return reply(ui.notice('success', 'Clean scan', 'No suspected bots among the first 25 members.'));
    return reply(ui.card({ icon: '\u25A3', title: 'Suspected bots', subtitle: `${found.length} flagged`, rows: found }));
  },
};
