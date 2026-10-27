// XADON V8 · announceall — broadcast an ad-styled announcement to all groups.
const premium = require('../../lib/premium');
const botstate = require('../../lib/botstate');
module.exports = {
  name: 'announceall', alias: ['gannounce', 'tellall', 'bcast'], desc: 'Announce to all groups', usage: '.announceall <text>', category: 'owner', owner: true,
  async run({ sock, m, text, reply, ui }) {
    const body = (text || '').trim();
    if (!body) return reply(ui.notice('info', 'Announce', 'Usage: .announce Server restarts in 10 minutes'));
    let groups = [];
    try {
      if (typeof sock.groupFetchAllParticipating === 'function') {
        const all = await sock.groupFetchAllParticipating();
        groups = Object.keys(all || {});
      }
    } catch {}
    if (!groups.length) return reply(ui.notice('error', 'No groups', 'Could not list groups on this runtime.'));
    const card = premium.adCard({ title: botstate.botName(), body: body.slice(0, 150) });
    let sent = 0;
    for (const gid of groups.slice(0, 30)) {
      try { await sock.sendMessage(gid, { text: `◈ ${ui.fonts.bold('ANNOUNCEMENT')}\n\n${body.slice(0, 1500)}\n\n${ui.footer()}`, contextInfo: card }); sent++; } catch {}
    }
    return reply(ui.notice('success', 'Announced', `Delivered to ${sent}/${groups.slice(0, 30).length} groups.`));
  },
};
