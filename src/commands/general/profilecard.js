/** XADON V9 · profilecard — neat identity card for you, a tag or a reply. */
module.exports = {
  name: 'profilecard',
  alias: ['whoisx', 'idcard', 'pinfo'],
  desc: 'Identity card for any user',
  usage: '.profilecard [@user]  (or reply)',
  category: 'general',
  async run({ sock, m, reply, ui, isAdmin }) {
    let jid = m.sender;
    let name = m.pushName || 'User';
    if (m.mentions?.[0]) jid = m.mentions[0];
    else if (m.quoted?.sender) { jid = m.quoted.sender; }
    const num = String(jid).split('@')[0].split(':')[0];
    let about = '';
    try { const st = await sock.fetchStatus(jid).catch(() => null); about = st?.status || ''; } catch {}
    let pic = null;
    try { pic = await sock.profilePictureUrl(jid, 'image'); } catch {}
    const caption = ui.card({
      icon: '◈', title: 'Profile card',
      rows: [
        ['name', name.slice(0, 40)],
        ['number', `+${num}`],
        ['role', jid === m.sender ? 'you' : isAdmin ? 'group admin' : 'member'],
        ['about', about.slice(0, 90) || '—'],
      ],
    });
    try {
      if (pic) await sock.sendMessage(m.chat, { image: { url: pic }, caption }, { quoted: m.raw });
      else await sock.sendMessage(m.chat, { text: caption }, { quoted: m.raw });
    } catch {
      return reply(caption);
    }
  },
};
