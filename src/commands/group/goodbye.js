// @musteqeem — Configure group departure messages. Supports multiline templates and @placeholders.
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'goodbye', alias: ['setgoodbye'], desc: 'Configure group goodbye messages', group: true, admin: true,
  async run({ sock, m, args, rawText, reply, ui }) {
    const current = groupPolicy(m.chat);
    const mode = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) return reply(ui.notice('info', 'Goodbye setup', 'Use .goodbye on <message> or .goodbye off. New lines are preserved. Tokens: @user @group @date @time @groupp @userpp @members @bot.'));
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    const supplied = String(rawText || '').replace(/^\s*\S+\s*/, '');
    const template = ((supplied || args.slice(1).join(' ')) || current.goodbyeText || 'Goodbye @user.').replace(/\\n/g, '\n');
    savePolicy(m.chat, { goodbye: mode === 'on', goodbyeText: template, groupName: meta?.subject || 'the group' });
    await reply(ui.notice('success', `Goodbye messages ${mode === 'on' ? 'enabled' : 'disabled'}`, mode === 'on' ? `Template saved with ${template.split('\n').length} line(s).` : 'Departing members will not receive an automatic message.'));
  },
};
