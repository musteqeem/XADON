// XADON V8 · groupstats — members, admins, guards, warns snapshot.
const { groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'groupstats', alias: ['gcstats', 'groupstat'], desc: 'Group statistics snapshot', usage: '.groupstats', group: true, category: 'group',
  async run({ sock, m, reply, ui }) {
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return reply(ui.notice('error', 'No metadata', 'Could not read group info.'));
    const p = groupPolicy(m.chat);
    const admins = meta.participants.filter((x) => x.admin).length;
    const guards = Object.keys(p).filter((k) => k.startsWith('anti') && p[k] && p[k] !== 'off' && p[k] !== false).length;
    return reply(ui.card({
      icon: '⬡', title: meta.subject || 'Group stats', subtitle: `${meta.participants.length} members · ${admins} admins`,
      rows: [['members', String(meta.participants.length)], ['admins', String(admins)], ['active guards', String(guards)], ['alladmin', p.alladmin ? 'ON' : 'off'], ['welcome', p.welcome ? 'ON' : 'off']],
      body: `Created: ${meta.creation ? new Date(meta.creation * 1000).toLocaleDateString('en-GB') : 'unknown'}`,
    }));
  },
};
