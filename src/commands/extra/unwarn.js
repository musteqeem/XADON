// XADON AI · unwarn — remove one/all warnings.
module.exports = {
  name: 'unwarn',
  alias: ['removewarn'],
  desc: 'Remove warnings from a member',
  usage: '.unwarn @user | .unwarn @user all',
  group: true, admin: true, category: 'extra',
  async run({ m, args, reply, ui, fail, target, db }) {
    const jid = target();
    if (!jid) return fail('Who?', 'Mention or reply: .unwarn @user');
    const key = `warns:${m.chat}:${jid}`;
    const warns = db.get(key, []);
    if (!warns.length) return reply(ui.notice('info', 'Clean', `@${jid.split('@')[0]} has no warnings.`));
    if (/^all$/i.test(args[1] || args[0] || '')) { db.set(key, []); return reply(ui.notice('success', 'Cleared', `All warnings for @${jid.split('@')[0]} removed.`)); }
    warns.pop();
    db.set(key, warns);
    return reply(ui.notice('success', 'Unwarned', `@${jid.split('@')[0]} now has ${warns.length}/3 warnings.`));
  },
};
