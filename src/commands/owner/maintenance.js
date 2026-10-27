// XADON V8 · maintenance — freeze the bot for everyone except owners/mods.
module.exports = {
  name: 'maintenance', alias: ['maint', 'botfreeze'], desc: 'Freeze bot (owners/mods only)', usage: '.maintenance on | .maintenance off', category: 'owner', owner: true,
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    if (/^(on|enable|yes|1)$/.test(a)) { db.set('maintenance', true); return reply(ui.notice('warn', 'Maintenance ON', 'Bot frozen: only owners and mods can use it now.\nRelease: .maintenance off')); }
    if (/^(off|disable|no|0)$/.test(a)) { db.set('maintenance', false); return reply(ui.notice('success', 'Maintenance OFF', 'Bot is open to everyone again.')); }
    return reply(ui.notice('info', 'Maintenance', `Currently: ${db.get('maintenance', false) ? 'ON (frozen)' : 'OFF (open)'}\nUsage: .maintenance on | off`));
  },
};
