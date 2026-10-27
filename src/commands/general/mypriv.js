// XADON V8 · mypriv — show your privilege level (everyone can use it).
const privs = require('../../lib/privs');
module.exports = {
  name: 'mypriv',
  alias: ['myrole', 'myaccess', 'mystatus'],
  desc: 'Show your bot privilege level',
  usage: '.mypriv',
  category: 'general',
  async run({ m, reply, ui, db, config, group }) {
    const role = privs.roleOf(db, config, m.number);
    const admin = group?.participants?.find((p) => [p.id, p.lid, p.phoneNumber, p.jid].filter(Boolean).some((v) => String(v).split('@')[0].split(':')[0].replace(/\D/g, '') === String(m.number).replace(/\D/g, '')))?.admin;
    const LABEL = {
      owner: ['👑 OWNER', 'hard owner — everything, including .setmod/.delmod'],
      mod: ['👑 MOD', 'full owner access — every owner command + private mode'],
      sudo: ['◈ SUDO', 'near-owner — private-mode bypass, admin/group commands, no owner commands'],
      user: admin ? ['⬡ GROUP ADMIN', 'group admin — admin commands in this group'] : ['○ USER', 'standard commands only'],
    };
    const [title, line] = LABEL[role] || LABEL.user;
    return reply(ui.card({
      icon: '◈', title, subtitle: `+${m.number}`,
      rows: [['role', role], ['private-mode', ['owner', 'mod', 'sudo'].includes(role) ? 'bypasses' : admin ? 'bypasses if .alladmin on' : 'blocked']],
      body: line,
    }));
  },
};
