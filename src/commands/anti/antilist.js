// XADON AI · ANTI — premium unicode card, no emojis.
const { groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'antilist',
  alias: ['antilistx', 'antistatus2'],
  desc: 'Show all anti guards',
  group: true, admin: true, category: 'anti',
  async run({ m, reply, ui }) {
    const { fonts } = ui;
    const p = groupPolicy(m.chat);
    const keys = ['antilink','antibadword','antitag','antispam','antiforward','antivv','antisticker','antiaudio','antiimage','antivideo','antidoc','anticontact','antipoll','antibot','antiforeign','antidelete','antiedit','antistatus','antimention','antiflood','antiinvite'];
    const rows = keys.map((k) => [k.replace(/^anti/, ''), p[k] ? fonts.bold('ON') : fonts.smallCaps('off')]);
    return reply(ui.card({ icon: '⌬', title: 'Anti guards', subtitle: `${keys.filter((k) => p[k]).length} of ${keys.length} active`, rows }));
  },
};
