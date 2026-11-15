// @musteqeem — Configure group join messages. Supports multiline templates and @placeholders.
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'welcome', alias: ['setwelcome'], desc: 'Configure group welcome messages', group: true, admin: true,
  async run({ sock, m, args, rawText, reply, ui }) {
    const current = groupPolicy(m.chat);
    const mode = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) return reply(ui.notice('info', 'Welcome setup', 'Use .welcome on <message> or .welcome off. New lines are preserved. Tokens: @user @group @date @time @groupp @userpp @members @bot.'));
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    const supplied = String(rawText || '').replace(/^\s*\S+\s*/, '');
    const template = ((supplied || args.slice(1).join(' ')) || current.welcomeText || 'Welcome @user to @group!').replace(/\\n/g, '\n');
    savePolicy(m.chat, { welcome: mode === 'on', welcomeText: template, groupName: meta?.subject || 'the group' });
    await reply(ui.notice('success', `Welcome messages ${mode === 'on' ? 'enabled' : 'disabled'}`, mode === 'on' ? `Template saved with ${template.split('\n').length} line(s).` : 'New members will not receive an automatic greeting.'));
  },
};
