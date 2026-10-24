// XADON AI · back — return from AFK.
module.exports = {
  name: 'back',
  alias: ['imback', 'unafk'],
  desc: 'Clear your AFK status',
  usage: '.back',
  category: 'extra',
  async run({ m, reply, ui, db }) {
    if (!db.get(`afk:${m.sender}`, null)) return reply(ui.notice('info', 'Not AFK', 'You were not marked AFK.'));
    db.delete(`afk:${m.sender}`);
    return reply(ui.notice('success', 'Welcome back', `@${m.sender.split('@')[0]} is back.`));
  },
};
