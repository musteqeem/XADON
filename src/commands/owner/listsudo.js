// XADON V8 · listsudo — show all near-owners.
const privs = require('../../lib/privs');
module.exports = {
  name: 'listsudo',
  alias: ['sudos', 'sudolist', 'showsudo'],
  desc: 'List all sudo users',
  usage: '.listsudo',
  category: 'owner', owner: true,
  async run({ reply, ui, db }) {
    const list = privs.getSudos(db).map(privs.digits).filter(Boolean);
    if (!list.length) return reply(ui.notice('info', 'Sudo list', 'No sudo users yet.\nAdd one: .setsudo @user'));
    return reply(ui.card({
      icon: '◈', title: `Sudo users (${list.length})`,
      subtitle: 'near-owner access · private-mode bypass, no owner commands',
      rows: list.map((n, i) => [`#${i + 1}`, `+${n}`]),
      body: 'Remove: .delsudo <number>',
    }));
  },
};
