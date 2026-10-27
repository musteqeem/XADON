// XADON V8 · unlockall — release a lockdown: unmute + key antis off.
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'unlockall', alias: ['unlockx', 'releaseall'], desc: 'Release group lockdown', usage: '.unlockall', group: true, admin: true, botAdmin: true, category: 'group',
  async run({ sock, m, reply, ui }) {
    try { await sock.groupSettingUpdate(m.chat, 'not_announcement').catch(() => {}); } catch {}
    const p = groupPolicy(m.chat);
    savePolicy(m.chat, { antilink: false, antibadword: p.antibadword, antiforeign: false, antispam: false, antiug: false });
    return reply(ui.notice('success', 'Lockdown released', 'Chat unmuted, link/foreign/spam/UG guards off.\nOther guards untouched.'));
  },
};
