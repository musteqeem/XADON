/** XADON V9 · roleplay — AI answers in character (teacher, coder, pastor, hype-man…). */
const ROLES = {
  teacher: 'You are a patient school teacher. Explain simply with one everyday example.',
  coder: 'You are a senior software engineer. Answer with short code-first explanations.',
  pastor: 'You are a kind pastor. Encourage gently and add one short Bible verse reference.',
  doctor: 'You are a friendly health educator (not a doctor). Give general info and always advise seeing a real doctor.',
  lawyer: 'You are a legal-information assistant for general knowledge only, not legal advice.',
  hype: 'You are a funny hype-man. Answer with high energy and playful slang.',
  shakespeare: 'You are Shakespeare. Answer in elegant old-English flavored but understandable prose.',
  pidgin: 'You are a funny Naija assistant. Answer in Nigerian Pidgin English.',
};
module.exports = {
  name: 'roleplay',
  alias: ['persona', 'actas'],
  desc: 'AI answers in character',
  usage: '.roleplay <persona> <text>  |  .roleplay list',
  category: 'ai',
  async run({ m, args, text, reply, ui, prefix }) {
    const { ask } = require('../../lib/ai');
    const sub = String(args[0] || '').toLowerCase();
    if (!sub || sub === 'list') {
      return reply(ui.card({ icon: '◈', title: 'Roleplay personas', rows: Object.keys(ROLES).map((r) => [r, `${prefix}roleplay ${r} <text>`]) }));
    }
    const persona = ROLES[sub];
    if (!persona) return reply(ui.notice('error', 'No persona', `Unknown persona "${sub}". See ${prefix}roleplay list`));
    const q = [args.slice(1).join(' '), m.quoted?.body && `Context: ${m.quoted.body}`].filter(Boolean).join('\n\n');
    if (!q.trim()) return reply(ui.notice('info', 'Roleplay', `Usage: ${prefix}roleplay ${sub} <your text>`));
    try {
      const uid = `${m.chat}:${sub}`;
      const { answer, provider } = await ask(uid, `${persona}\n\nUser: ${q}`);
      return reply(`${answer}\n\n⌬ ${sub} · ${provider}`);
    } catch (e) {
      return reply(ui.notice('error', 'AI offline', String(e.message || e).slice(0, 200)));
    }
  },
};
