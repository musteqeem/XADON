/** XADON calc — safe arithmetic evaluator, no eval(). */
function safeEval(expr) {
  if (!/^[0-9+\-*/().%\s^,]*$/.test(expr)) throw new Error('bad chars');
  const js = expr.replace(/\^/g, '**').replace(/(\d)\s*%/g, '($1/100)');
  if (js.length > 120) throw new Error('too long');
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${js})`);
  const out = fn();
  if (typeof out !== 'number' || !isFinite(out)) throw new Error('bad result');
  return Math.round(out * 1e10) / 1e10;
}
module.exports = {
  name: 'calc',
  alias: ['calculate', 'math', '='],
  desc: 'Scientific calculator',
  usage: '.calc 12 * (5 + 3)',
  async run({ text, reply, ui, prefix, m }) {
    const { fonts } = ui;
    const expr = (text || m.quoted?.body || '').trim();
    if (!expr) return reply(ui.notice('info', 'Calculator', `${fonts.mono(`${prefix}calc 12 * (5 + 3)`)}`));
    try {
      const ans = safeEval(expr);
      await reply(ui.card({ icon: '=', title: 'Calculator', subtitle: 'result', rows: [['input', fonts.mono(expr.slice(0, 80))], ['answer', fonts.bold(String(ans))]], body: ui.footer() }));
    } catch { await reply(ui.notice('error', 'Invalid math', 'Use numbers and + - * / ( ) % ^ only.')); }
  },
};
