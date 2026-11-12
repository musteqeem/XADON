module.exports = {
  name: 'bossmode', alias: ['bosslock2'], desc: 'Boss mode: public/private lockdown', usage: '.bossmode public|private|boss', category: 'boss', owner: true,
  async run({ args, reply, ui, db }) {
    const v = (args[0] || '').toLowerCase();
    if (!['public', 'private', 'boss'].includes(v)) return reply(ui.notice('info', 'Boss mode', 'Use: .bossmode public | private | boss'));
    db.set('mode', v === 'boss' ? 'private' : v);
    if (v === 'boss') db.set('bossOnly', true); else db.set('bossOnly', false);
    return reply(ui.notice('success', 'Boss mode', `Bot is now ${v.toUpperCase()}${v === 'boss' ? ' — only boss/sudo can use it' : ''}.`));
  },
};
