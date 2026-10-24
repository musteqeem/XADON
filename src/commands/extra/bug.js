// XADON AI · bug — send a bug report straight to the owner DM.
module.exports = {
  name: 'bug',
  alias: ['reportbug', 'bugrep'],
  desc: 'Report a bot bug to the owner',
  usage: '.bug <what broke>',
  category: 'extra',
  async run({ sock, m, text, reply, ui, fail, config }) {
    if (!text) return fail('Describe it', 'Usage: .bug menu shows no commands');
    const owner = (config.ownerNumbers || [])[0];
    if (!owner) return fail('No owner', 'Owner number is not configured.');
    const jid = `${String(owner).replace(/\D/g, '')}@s.whatsapp.net`;
    try {
      await sock.sendMessage(jid, { text: `${ui.fonts.bold('BUG REPORT')}\n${ui.fonts.smallCaps('from')} @${m.sender.split('@')[0]} ${m.isGroup ? 'in ' + m.chat : '(private)'}\n\n${text.slice(0, 800)}` });
      return reply(ui.notice('success', 'Reported', 'The owner got your bug report.'));
    } catch { return reply(ui.notice('error', 'Send failed', 'Could not reach the owner.')); }
  },
};
