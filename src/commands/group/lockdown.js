// XADON V8 · lockdown — emergency one-shot: mute + key antis to warn.
const { savePolicy } = require('../../message-handler');
module.exports = {
  name: 'lockdown', alias: ['lockall', 'emergency'], desc: 'Emergency group lockdown', usage: '.lockdown', group: true, admin: true, botAdmin: true, category: 'group',
  async run({ sock, m, reply, ui }) {
    try { await sock.groupSettingUpdate(m.chat, 'announcement').catch(() => {}); } catch {}
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antilink: 'warn', antibadword: 'warn', antiforeign: true, antispam: true, antiug: 'warn', groupName: meta?.subject || 'the group' });
    return reply(ui.notice('success', 'Lockdown active', 'Muted chat + antilink/antibadword/antiug on WARN.\nRelease: .unlockall'));
  },
};
