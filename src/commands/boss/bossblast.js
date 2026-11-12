// BOSSBLAST · send announcement to every group (owner only)
module.exports = {
  name: 'bossblast', alias: ['bblast'], desc: 'Broadcast text to all groups', usage: '.bossblast <message>', category: 'boss', owner: true,
  async run({ text, reply, ui, sock, fail }) {
    if (!text) return reply(ui.notice('info', 'Boss blast', 'Type the message: .bossblast Hello team'));
    let groups = [];
    try { groups = await sock.groupFetchAllParticipating().then((g) => Object.keys(g || {})); } catch {}
    if (!groups.length) return fail('No groups', 'The bot is not in any group yet.');
    let sent = 0;
    for (const g of groups) { try { await sock.sendMessage(g, { text: `♛ BOSS ANNOUNCEMENT\n\n${text.slice(0, 1500)}` }); sent++; await new Promise((r) => setTimeout(r, 800)); } catch {} }
    return reply(ui.notice('success', 'Blasted', `Delivered to ${sent}/${groups.length} groups.`));
  },
};
