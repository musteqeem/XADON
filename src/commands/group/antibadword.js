// Toggle the bad-word filter enforced by src/message-handler.js
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'antibadword',
  alias: ['antibad', 'antiword'],
  desc: 'Toggle bad-word filter',
  usage: '.antibadword on|off',
  group: true, admin: true,
  async run({ sock, m, args, reply, ui }) {
    const current = !!groupPolicy(m.chat).antibadword;
    const v = /^(on|enable|yes)$/i.test(args[0] || '') ? true : /^(off|disable|no)$/i.test(args[0] || '') ? false : !current;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antibadword: v, groupName: meta?.subject || 'the group' });
    await reply(ui.notice('success', `Bad-word filter ${v ? 'enabled' : 'disabled'}`, v ? 'Offensive messages from non-admins will be removed (bot must be admin).' : 'Members may send anything.'));
  },
};
