// BOSSSTATS · boss-level health report
module.exports = {
  name: 'bossstats', alias: ['bstats'], desc: 'Boss health + usage stats', usage: '.bossstats', category: 'boss', owner: true,
  async run({ reply, ui, db, stats, sock }) {
    let groups = 0;
    try { groups = Object.keys(await sock.groupFetchAllParticipating()).length; } catch {}
    const banned = (db.get('banned', []) || []).length;
    return reply(ui.card({ icon: '♛', title: 'Boss stats', rows: [['groups', String(groups)], ['banned', String(banned)], ['commands', String(stats.commands)], ['messages', String(stats.messages)], ['format', String(db.get('replyFormat', 'default'))], ['mode', String(db.get('mode', 'public'))]], body: `Memory ${ui.bytes(process.memoryUsage().rss)} · up ${ui.duration(Date.now() - stats.startedAt)}` }));
  },
};
