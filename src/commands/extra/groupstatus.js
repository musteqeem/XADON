// XADON AI · groupstatus — group member status/about report (Baileys: groupMetadata, fetchStatus, profilePictureUrl + status cache).
const store = require('../../lib/msgstore');
module.exports = {
  name: 'groupstatus',
  alias: ['gstatus', 'gcstatus'],
  desc: 'Show member statuses in this group',
  usage: '.groupstatus',
  group: true, category: 'extra',
  async run({ sock, m, reply, ui }) {
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return reply(ui.notice('error', 'No metadata', 'Could not fetch group info.'));
    const parts = (meta.participants || []).slice(0, 30);
    const recent = store.getStatuses(30);
    const recentBy = {};
    for (const s of recent) if (!recentBy[s.sender]) recentBy[s.sender] = s;
    const rows = [];
    for (const p of parts) {
      const jid = p.id || p.jid;
      if (!jid) continue;
      const num = String(jid).split('@')[0].split(':')[0];
      let about = '';
      try { const st = await sock.fetchStatus(jid).catch(() => null); about = (st?.status || '').slice(0, 40); } catch {}
      if (!about && recentBy[jid]?.body) about = 'posted: ' + String(recentBy[jid].body).slice(0, 30);
      rows.push([num.slice(-4) + ' ' + (p.admin ? '(' + p.admin + ')' : 'member'), about || 'no status']);
      if (rows.length >= 20) break;
    }
    return reply(ui.card({
      icon: '\u25C9', title: 'Group status', subtitle: `${meta.subject || 'group'} — ${meta.participants?.length || 0} members`,
      rows: rows.length ? rows : [['members', String(meta.participants?.length || 0)]],
      body: 'About lines via Baileys fetchStatus. Recent status posts merged from cache.',
    }));
  },
};
