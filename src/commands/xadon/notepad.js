/**
 * XADON V9 · notepad — your personal notes on the bot.
 *   .notepad save buy airtime tomorrow  |  .notepad list
 *   .notepad read 1  |  .notepad del 1  |  .notepad clear
 */
module.exports = {
  name: 'notepad',
  alias: ['mynotes', 'notesx'],
  desc: 'Personal notes saved on the bot',
  usage: '.notepad save <text> | list | read <n> | del <n>',
  category: 'xadon9',
  async run({ m, args, reply, ui, db, prefix }) {
    const key = `notes:${m.number}`;
    const notes = () => db.get(key, []);
    const sub = String(args[0] || 'list').toLowerCase();
    if (sub === 'save' || sub === 'add') {
      const text = args.slice(1).join(' ').trim();
      if (!text) return reply(ui.notice('info', 'Notepad', `Usage: ${prefix}notepad save buy airtime tomorrow`));
      const list = notes(); list.push({ text: text.slice(0, 500), at: Date.now() });
      db.set(key, list.slice(-30));
      return reply(ui.notice('success', 'Saved', `Note #${list.length} saved.`));
    }
    if (sub === 'list' || sub === 'all') {
      const list = notes();
      if (!list.length) return reply(ui.notice('info', 'Notepad', `No notes yet. Save one: ${prefix}notepad save <text>`));
      const body = list.map((n, i) => `${i + 1}. ${n.text}${n.at ? `  (${new Date(n.at).toLocaleDateString()})` : ''}`).join('\n');
      return reply(ui.card({ icon: '◈', title: 'My notes', subtitle: `${list.length} saved`, rows: [], body }));
    }
    if (sub === 'read' || sub === 'get') {
      const i = parseInt(args[1], 10) - 1;
      const list = notes();
      if (!list[i]) return reply(ui.notice('error', 'No note', `Note ${args[1]} does not exist.`));
      return reply(ui.card({ icon: '◈', title: `Note ${i + 1}`, rows: [], body: list[i].text }));
    }
    if (sub === 'del' || sub === 'delete' || sub === 'rm') {
      const i = parseInt(args[1], 10) - 1;
      const list = notes();
      if (!list[i]) return reply(ui.notice('error', 'No note', `Note ${args[1]} does not exist.`));
      list.splice(i, 1); db.set(key, list);
      return reply(ui.notice('success', 'Deleted', 'Note removed.'));
    }
    if (sub === 'clear') {
      db.set(key, []);
      return reply(ui.notice('success', 'Cleared', 'All your notes were deleted.'));
    }
    return reply(ui.notice('info', 'Notepad', `Usage: ${prefix}notepad save <text> | list | read <n> | del <n>`));
  },
};
