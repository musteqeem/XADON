// XADON V13 · TRACK — person surveillance. The most powerful watch command.
// Whenever the target number talks ANYWHERE (any group or DM), a full copy
// (text + pic/video/audio) is mirrored to the owner DM in real time.
// Matching is LID/JID-proof (suffix digits), so number changes of form don't hide them.
// Usage (owner only): .track 2348012345678 | .track list | .track clear
const digits = (v = '') => String(v).split('@')[0].split(':')[0].replace(/\D/g, '');
const same = (a, b) => {
  const x = digits(a), y = digits(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return x.length >= 10 && y.length >= 10 && x.slice(-9) === y.slice(-9);
};
module.exports = {
  name: 'track',
  alias: ['spy', 'watchman', 'stalk'],
  desc: 'Mirror a person\u2019s every message to owner DM',
  usage: '.track 2348012345678 | .track list | .track clear',
  category: 'owner',
  owner: true,
  sameTarget: same,
  async run({ m, args, reply, ui, db, target }) {
    const sub = String(args[0] || '').toLowerCase();
    const list = db.get('tracklist', []);
    if (!sub || sub === 'list' || sub === 'status') {
      if (!list.length) return reply(ui.notice('info', 'Track list', 'Nobody is being tracked. Usage: .track 2348012345678'));
      return reply(ui.card({
        icon: '👁', title: 'Tracked targets', subtitle: `${list.length} live`,
        rows: list.slice(0, 20).map((d) => ['target', `+${d}`]),
        body: '.track <number> toggles · .track clear wipes all',
      }));
    }
    if (sub === 'clear' || sub === 'wipe') {
      db.set('tracklist', []);
      return reply(ui.notice('warn', 'Track cleared', 'All targets removed.'));
    }
    let d = digits(args[0]);
    if (!d && target()) d = digits(target());
    if (!d && m.quoted?.sender) d = digits(m.quoted.sender);
    if (!/^\d{7,15}$/.test(d)) return reply(ui.notice('error', 'Bad number', 'Usage: .track 2348012345678 (or reply to them with .track).'));
    const next = list.map(digits);
    if (next.some((x) => same(x, d))) {
      db.set('tracklist', next.filter((x) => !same(x, d)));
      return reply(ui.notice('warn', 'Untracked', `+${d} removed — their messages stay private again.`));
    }
    next.push(d);
    db.set('tracklist', next.slice(-20));
    return reply(ui.notice('success', 'Tracking live 👁', `Every message from +${d} (any chat) now mirrors to your DM with media.`));
  },
};
