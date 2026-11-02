/**
 * XADON V9 · promptpack — save reusable AI prompt templates, run them anytime.
 *   .promptpack save homework <template with {q} or plain instructions>
 *   .promptpack homework what is algebra?
 *   .promptpack list | del <name>
 */
module.exports = {
  name: 'promptpack',
  alias: ['prompts', 'aitemplate'],
  desc: 'Saved AI prompt templates',
  usage: '.promptpack save <name> <template> | .promptpack <name> <question>',
  category: 'ai',
  owner: true,
  async run({ m, args, reply, ui, db, prefix }) {
    const { ask } = require('../../lib/ai');
    const pack = () => db.get('promptpack', {});
    const sub = String(args[0] || '').toLowerCase();
    if (!sub || sub === 'list') {
      const names = Object.keys(pack());
      if (!names.length) return reply(ui.notice('info', 'Prompt pack', `No templates yet.\n${prefix}promptpack save homework Summarize {q} in 3 bullets`));
      return reply(ui.card({ icon: '◈', title: 'Prompt templates', rows: names.map((n) => [n, `${prefix}promptpack ${n} <question>`]) }));
    }
    if (sub === 'save') {
      const name = String(args[1] || '').toLowerCase();
      const tpl = args.slice(2).join(' ').trim();
      if (!name || !tpl) return reply(ui.notice('info', 'Save template', `Usage: ${prefix}promptpack save homework Summarize {q} in 3 bullets`));
      const p = pack(); p[name] = tpl.slice(0, 1000); db.set('promptpack', p);
      return reply(ui.notice('success', 'Template saved', `"${name}" is ready. Run: ${prefix}promptpack ${name} <question>`));
    }
    if (sub === 'del' || sub === 'delete') {
      const p = pack(); delete p[String(args[1] || '').toLowerCase()]; db.set('promptpack', p);
      return reply(ui.notice('success', 'Deleted', 'Template removed.'));
    }
    const tpl = pack()[sub];
    if (!tpl) return reply(ui.notice('error', 'No template', `No template named "${sub}". See ${prefix}promptpack list`));
    const q = [args.slice(1).join(' '), m.quoted?.body && `Context: ${m.quoted.body}`].filter(Boolean).join('\n\n');
    if (!q.trim()) return reply(ui.notice('info', 'Ask', `Usage: ${prefix}promptpack ${sub} <your question>`));
    try {
      const prompt = tpl.includes('{q}') ? tpl.replace(/\{q\}/g, q) : `${tpl}\n\nUser: ${q}`;
      const { answer, provider } = await ask(`${m.chat}:pp:${sub}`, prompt);
      return reply(`${answer}\n\n⌬ ${sub} · ${provider}`);
    } catch (e) {
      return reply(ui.notice('error', 'AI offline', String(e.message || e).slice(0, 200)));
    }
  },
};
