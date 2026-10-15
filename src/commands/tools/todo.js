/** XADON todo list — per user, with done/undone ticks. */
module.exports = {
  name: 'todo',
  alias: ['todos', 'tasks', 'task'],
  desc: 'Your personal todo list',
  usage: '.todo add call mum  ·  .todo list  ·  .todo done 1  ·  .todo clear',
  async run({ args, reply, ui, prefix, m, db }) {
    const { fonts } = ui;
    const key = `todo:${m.sender}`;
    const list = db.get(key, []);
    const sub = (args[0] || 'list').toLowerCase();
    if (sub === 'add' || sub === 'new') {
      const body = args.slice(1).join(' ').trim();
      if (!body) return reply(ui.notice('info', 'Todo', `${fonts.mono(`${prefix}todo add finish assignment`)}`));
      list.push({ t: body.slice(0, 300), done: false });
      db.set(key, list.slice(-30));
      return reply(ui.notice('success', 'Task added', fonts.italic(body.slice(0, 120))));
    }
    if (sub === 'done' || sub === 'check') {
      const i = Number(args[1]) - 1;
      if (!list[i]) return reply(ui.notice('error', 'No task', 'Use .todo list to see numbers.'));
      list[i].done = !list[i].done;
      db.set(key, list);
      return reply(ui.notice('success', list[i].done ? 'Completed' : 'Reopened', fonts.italic(list[i].t)));
    }
    if (sub === 'clear') { db.set(key, []); return reply(ui.notice('success', 'Cleared', 'All tasks removed.')); }
    if (!list.length) return reply(ui.notice('info', 'Empty list', `${fonts.mono(`${prefix}todo add <task>`)} ${fonts.smallCaps('to start')}`));
    await reply(ui.card({ icon: '✓', title: 'Todo list', subtitle: `${list.filter((t) => t.done).length}/${list.length} done`, rows: [], body: list.map((t, i) => `${t.done ? '✓' : '○'} ${fonts.mono(`${i + 1}.`)} ${t.done ? fonts.smallCaps(t.t.slice(0, 90)) : t.t.slice(0, 90)}`).join('\n') + `\n\n${ui.footer()}` }));
  },
};
