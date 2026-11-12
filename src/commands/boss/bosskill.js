// BOSSKILL · kick + ban target in one command
module.exports = {
  name: 'bosskill', alias: ['bkill'], desc: 'Kick and ban a user at once', usage: '.bosskill @user', category: 'boss', group: true, admin: true, botAdmin: true,
  async run({ reply, ui, target, sock, m, db }) {
    const jid = target();
    if (!jid) return reply(ui.notice('info', 'Boss kill', 'Mention or reply to the target.'));
    const banned = db.get('banned', []);
    if (!banned.includes(jid)) { banned.push(jid); db.set('banned', banned); }
    try { await sock.groupParticipantsUpdate(m.chat, [jid], 'remove'); } catch {}
    return reply(ui.notice('success', 'Boss kill', `@${jid.split('@')[0]} removed + banned from bot.`));
  },
};
