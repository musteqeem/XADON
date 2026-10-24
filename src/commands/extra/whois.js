// XADON AI · whois — group member card (join position, admin, number).
module.exports = {
  name: 'whois',
  alias: ['member', 'who'],
  desc: 'Show group member info',
  usage: '.whois @user',
  group: true, category: 'extra',
  async run({ sock, m, reply, ui, target, fail, group }) {
    const jid = target();
    if (!jid) return fail('Who?', 'Mention or reply to a member: .whois @user');
    let meta = group;
    try { if (!meta) meta = await sock.groupMetadata(m.chat); } catch {}
    const p = (meta?.participants || []).find((x) => [x.id, x.jid, x.lid].filter(Boolean).some((v) => String(v).split('@')[0].split(':')[0] === jid.split('@')[0]));
    const rows = [['jid', jid], ['admin', p?.admin || 'member'], ['in group', meta ? 'yes' : 'unknown']];
    return reply(ui.card({ icon: '\u263A', title: 'Member', subtitle: '@' + jid.split('@')[0], rows }), { mentions: [jid] });
  },
};
