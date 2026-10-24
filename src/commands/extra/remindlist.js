// XADON AI · remindlist (imported format).
module.exports = {
  name: 'remindlist',
  aliases: ['remins', 'myreminds'],
  description: 'Reminder help + list note (reminders live in-chat)',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui } = extra;
    return reply(ui.notice('info', 'Reminders', 'Set one with .remind 10m drink water. Active timers live in-chat and reset on restart.'));
  },
};
