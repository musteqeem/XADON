// XADON V8 · listmod — show all full owners.
const privs = require('../../lib/privs');
module.exports = {
  name: 'listmod',
  alias: ['mods', 'allmods', 'showmod'],
  desc: 'List all mod users',
  usage: '.listmod',
  category: 'owner', owner: true,
  async run({ reply, ui, db, config }) {
    const list = privs.getMods(db).map(privs.digits).filter(Boolean);
    const hard = (config.ownerNumbers || []).map(privs.digits);
    if (!list.length && !hard.length) return reply(ui.notice('info', 'Mod list', 'No mods yet.\nAdd one: .setmod @user'));
    const rows = [...hard.map((n) => ['owner', `+${n}`]), ...list.map((n, i) => [`mod #${i + 1}`, `+${n}`])];
    return reply(ui.card({
      icon: '👑', title: `Privileged owners (${rows.length})`,
      subtitle: 'owner = config · mod = full owner access',
      rows,
      body: 'Add mod: .setmod @user · Remove: .delmod <number>',
    }));
  },
};
