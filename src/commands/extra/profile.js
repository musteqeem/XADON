// XADON AI · profile — user card: number, name, about, admin state (Baileys fetchStatus + profilePictureUrl).
module.exports = {
  name: 'profile',
  alias: ['myprofile', 'uprofile'],
  desc: 'Show a user profile card',
  usage: '.profile [@user]',
  category: 'extra',
  async run({ sock, m, reply, ui, target }) {
    const jid = target() || m.sender;
    const num = String(jid).split('@')[0];
    let about = '';
    try { const st = await sock.fetchStatus(jid).catch(() => null); about = (st?.status || '').slice(0, 120); } catch {}
    let hasPp = false;
    try { await sock.profilePictureUrl(jid, 'image'); hasPp = true; } catch {}
    const rows = [['number', '+' + num], ['name', m.quoted?.sender === jid ? 'quoted user' : (jid === m.sender ? m.pushName : num)], ['about', about || '—'], ['photo', hasPp ? 'yes' : 'none']];
    return reply(ui.card({ icon: '\u263A', title: 'Profile', subtitle: jid === m.sender ? 'you' : num, rows }));
  },
};
