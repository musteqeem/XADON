// BOSSNICK · rename bot + set bio instantly
module.exports = {
  name: 'bossnick', alias: ['bnick'], desc: 'Rename bot + bio', usage: '.bossnick NewName | bio text', category: 'boss', owner: true,
  async run({ text, reply, ui, sock, db }) {
    if (!text) return reply(ui.notice('info', 'Boss nick', 'Use: .bossnick MyBot | best bot alive'));
    const [name, ...bioParts] = text.split('|');
    const bio = bioParts.join('|').trim();
    if (name.trim()) { db.set('botName', name.trim().slice(0, 30)); try { await sock.updateProfileName(name.trim().slice(0, 30)); } catch {} }
    if (bio) { try { await sock.updateProfileStatus(bio.slice(0, 139)); } catch {} }
    return reply(ui.notice('success', 'Boss nick', `Name: ${name.trim() || '(kept)'}${bio ? `\nBio: ${bio.slice(0, 100)}` : ''}`));
  },
};
