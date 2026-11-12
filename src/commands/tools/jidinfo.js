// Picked from WHATSAPP INVESTIGATION: jid.js — JID / contact inspector (XADON ctx version)
module.exports = {
  name: 'jidinfo', alias: ['jidlookup', 'inspectjid'], desc: 'Inspect a JID / contact', usage: '.jidinfo @user | reply | <number>', category: 'tools',
  async run({ m, text, target, reply, ui, sock }) {
    const jid = target() || m.quoted?.sender || m.sender;
    const num = String(jid).split('@')[0].split(':')[0];
    let pic = null, status = null, exists = null;
    try { pic = await sock.profilePictureUrl(jid, 'image'); } catch {}
    try { status = await sock.fetchStatus(jid).catch(() => null); } catch {}
    try { const r = await sock.onWhatsApp(jid).catch(() => null); exists = Array.isArray(r) ? r[0]?.exists : r?.[0]?.exists ?? null; } catch {}
    return reply(ui.card({ icon: '◈', title: 'JID info', rows: [['jid', jid], ['number', num], ['exists', String(exists ?? 'unknown')], ['status', (status?.status || '—').slice(0, 120)], ['picture', pic ? 'yes' : 'no']], body: `Query: ${(text || '').slice(0, 80) || '(current chat user)'}` }));
  },
};
