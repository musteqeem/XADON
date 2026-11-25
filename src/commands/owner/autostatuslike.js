// XADON · autostatuslike — auto-like every incoming status with an emoji.
module.exports = {
  name: 'autostatuslike',
  alias: ['statuslike', 'autolike', 'staslike', 'likestatus'],
  desc: 'Auto-like statuses with an emoji',
  usage: '.autostatuslike on|off  ·  .autostatuslike ❤️  ·  .autostatuslike',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db }) {
    const raw = String(args[0] || '').trim();
    const low = raw.toLowerCase();
    const isToggleWord = /^(on|off|1|0|yes|no)$/.test(low);
    if (raw && !isToggleWord) {
      const emoji = [...raw].slice(0, 2).join('');
      db.set('statuslikeEmoji', emoji || '❤️');
      db.set('autostatuslike', true);
      return reply(ui.notice('success', 'Status like ON', `Every new status gets ${emoji} automatically.`));
    }
    const cur = !!db.get('autostatuslike', false);
    const val = /^(on|1|yes)$/.test(low) ? true : /^(off|0|no)$/.test(low) ? false : !cur;
    db.set('autostatuslike', val);
    const emoji = db.get('statuslikeEmoji', '❤️');
    return reply(ui.notice('success', `Status auto-like ${val ? 'ON' : 'OFF'}`, val ? `I will like every new status with ${emoji}. Change it: .autostatuslike 💚` : 'I will no longer like statuses automatically.'));
  },
};
