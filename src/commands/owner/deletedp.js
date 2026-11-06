// XADON V12 · deletedp — auto-forward EVERY deleted message (+pics/videos)
// straight to the owner's DM the moment someone deletes it.
// Usage (owner only): .deletedp on | .deletedp off | .deletedp status
module.exports = {
  name: 'deletedp',
  alias: ['del2dm', 'deletedm', 'delmirror'],
  desc: 'Forward all deleted messages to owner DM',
  usage: '.deletedp on | .deletedp off | .deletedp status',
  category: 'owner',
  owner: true,
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('deletedp', false);
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '🗑', title: 'Deleted → DM', subtitle: cur ? 'MIRRORING LIVE' : 'off',
        rows: [['mirror', cur ? 'ON' : 'off'], ['includes', 'text + pics + videos + audio']],
        body: '.deletedp on · .deletedp off\nEvery delete lands in your DM with the media attached.',
      }));
    }
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !cur;
    db.set('deletedp', val);
    return reply(ui.notice(val ? 'success' : 'warn', `Deleted→DM ${val ? 'ON' : 'OFF'}`,
      val ? 'All deleted messages (with media) will hit your DM.' : 'Delete mirroring paused.'));
  },
};
