// XADON AI · birthday — group birthday book (db-backed).
module.exports = {
  name: 'birthday',
  alias: ['bday', 'birthdays'],
  desc: 'Save and list birthdays',
  usage: '.birthday set @user 2001-05-14 | .birthday list | .birthday today | .birthday del @user',
  group: true, category: 'extra',
  async run({ m, args, reply, ui, fail, target, db }) {
    const key = `birthdays:${m.chat}`;
    const book = db.get(key, {});
    const sub = String(args[0] || 'list').toLowerCase();
    if (sub === 'set' || sub === 'add') {
      const jid = target();
      const date = (args.find((x) => /^\d{4}-\d{2}-\d{2}$/.test(x || '')) || '').trim();
      if (!jid || !date) return fail('Usage?', '.birthday set @user 2001-05-14');
      const d = new Date(date + 'T00:00:00Z');
      if (Number.isNaN(d.getTime())) return fail('Bad date', 'Use YYYY-MM-DD.');
      book[jid] = date; db.set(key, book);
      return reply(ui.notice('success', 'Birthday saved', `@${jid.split('@')[0]} — ${date}`));
    }
    if (sub === 'del' || sub === 'delete' || sub === 'remove') {
      const jid = target();
      if (!jid || !book[jid]) return fail('Not found', 'That user has no saved birthday.');
      delete book[jid]; db.set(key, book);
      return reply(ui.notice('success', 'Removed', 'Birthday deleted.'));
    }
    const ids = Object.keys(book);
    if (sub === 'today') {
      const md = new Date().toISOString().slice(5, 10);
      const hits = ids.filter((j) => String(book[j]).slice(5, 10) === md);
      if (!hits.length) return reply(ui.notice('info', 'No birthdays today', 'Nobody celebrates today.'));
      return reply(ui.card({ icon: '\u2665', title: 'Birthdays today', subtitle: `${hits.length} celebrant(s)`, rows: hits.map((j) => ['@' + j.split('@')[0], book[j]]) }), { mentions: hits });
    }
    if (!ids.length) return reply(ui.notice('info', 'Empty book', 'Save one: .birthday set @user 2001-05-14'));
    return reply(ui.card({ icon: '\u2665', title: 'Birthday book', subtitle: `${ids.length} saved`, rows: ids.slice(0, 25).map((j) => ['@' + j.split('@')[0], book[j]]) }), { mentions: ids.slice(0, 25) });
  },
};
