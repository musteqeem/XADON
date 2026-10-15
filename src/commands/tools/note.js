/** XADON personal notes — stored per user in the JSON db. */
module.exports = {
  name: 'note',
  alias: ['notes', 'mynote'],
  desc: 'Save and read personal notes',
  usage: '.note save shopping eggs milk  ·  .note list  ·  .note read 1  ·  .note del 1',
  async run({ args, reply, ui, prefix, m, db }) {
    const { fonts } = ui;
    const key = `notes:${m.sender}`;
    const notes = db.get(key, []);
    const sub = (args[0] || 'list').toLowerCase();
    if (sub === 'save' || sub === 'add') {
      const body = args.slice(1).join(' ').trim();
      if (!body) return reply(ui.notice('info', 'Notes', `${fonts.mono(`${prefix}note save buy data before Friday`)}`));
      notes.push({ t: body.slice(0, 800), at: Date.now() });
      db.set(key, notes.slice(-30));
      return reply(ui.notice('success', 'Note saved', `${fonts.bold(`#${notes.length}`)} ${fonts.italic(body.slice(0, 120))}`));
    }
    if (sub === 'del' || sub === 'delete') {
      const i = Number(args[1]) - 1;
      if (!notes[i]) return reply(ui.notice('error', 'No note', 'Check the number with .note list.'));
      notes.splice(i, 1);
      db.set(key, notes);
      return reply(ui.notice('success', 'Deleted', 'Note removed.'));
    }
    if (sub === 'read') {
      const i = Number(args[1]) - 1;
      if (!notes[i]) return reply(ui.notice('error', 'No note', 'Check the number with .note list.'));
      return reply(ui.card({ icon: '✎', title: `Note #${i + 1}`, subtitle: new Date(notes[i].at).toLocaleString('en-GB'), rows: [], body: `${notes[i].t}\n\n${ui.footer()}` }));
    }
    if (!notes.length) return reply(ui.notice('info', 'No notes', `${fonts.mono(`${prefix}note save <text>`)} ${fonts.smallCaps('to start')}`));
    await reply(ui.card({ icon: '✎', title: 'My notes', subtitle: `${notes.length} saved`, rows: [], body: notes.map((n, i) => `${fonts.mono(`${i + 1}.`)} ${n.t.slice(0, 90)}`).join('\n') + `\n\n${ui.footer()}` }));
  },
};
