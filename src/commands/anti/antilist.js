// XADON V8 · ANTI — shows all 56 guards with their live mode.
const { groupPolicy, modeOf } = require('../../message-handler');
const KEYS = ['antilink', 'antibadword', 'antibot', 'antiug', 'antitag', 'antispam', 'antiflood', 'antiforward', 'antivv', 'antisticker', 'antiaudio', 'antiimage', 'antivideo', 'antidoc', 'anticontact', 'antipoll', 'antiforeign', 'antidelete', 'antiedit', 'antistatus', 'antimention', 'antiinvite', 'anticall', 'antichannel', 'antievent', 'antigif', 'antihidetag', 'antilocation', 'antinight', 'antipin', 'antireact', 'antishare', 'antidp', 'antiphone', 'antiemail', 'antiemoji', 'antibug', 'antishort', 'antiduplicate', 'anticaps', 'antijoin', 'anticode', 'antifont', 'antiadmin', 'antibroadcast', 'anticloud', 'antiapk', 'antinsfw', 'antisurvey', 'antiwall', 'antibet', 'antidesc', 'antiname', 'antijoinreq', 'antigroupstatus', 'antistatusreply'];
const MODE_LABEL = { off: 'off', on: 'ON', warn: 'WARN', kick: 'KICK' };
module.exports = {
  name: 'antilist',
  alias: ['antilistx', 'antistatus2', 'antilistall'],
  desc: 'Show all 56 anti guards with modes',
  group: true, admin: true, category: 'anti',
  async run({ m, reply, ui }) {
    const { fonts } = ui;
    const p = groupPolicy(m.chat);
    const rows = KEYS.map((k) => {
      const mode = modeOf(p[k]);
      const label = MODE_LABEL[mode] || 'off';
      const pretty = k.replace(/^anti/, '');
      return [pretty, mode === 'off' ? fonts.smallCaps(label) : fonts.bold(label)];
    });
    const active = KEYS.filter((k) => modeOf(p[k]) !== 'off').length;
    return reply(ui.card({
      icon: '⌬', title: 'Anti guards (56)',
      subtitle: `${active} of ${KEYS.length} active · on=delete · warn=3-strike kick · kick=instant kick`,
      rows,
      body: 'Set a mode: .antilink on | .antilink warn | .antilink kick | .antilink off\nMaster shield: .antiug warn',
    }));
  },
};
