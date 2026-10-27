// XADON V8 · passcheck — offline password strength meter (never sends it anywhere).
module.exports = {
  name: 'passcheck', alias: ['pwcheck', 'strength'], desc: 'Password strength meter', usage: '.passcheck <password>', category: 'tools',
  async run({ text, reply, ui }) {
    const pw = (text || '').split(/\s+/)[0] || '';
    if (!pw) return reply(ui.notice('info', 'Pass check', 'Usage: .passcheck My$ecret123 (checked locally, stays in chat)'));
    let score = 0;
    const rows = [];
    rows.push(['length', `${pw.length} chars`, pw.length >= 12 ? 2 : pw.length >= 8 ? 1 : 0]);
    rows.push(['lower + UPPER', /[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 'yes' : 'no', /[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 1 : 0]);
    rows.push(['digits', /\d/.test(pw) ? 'yes' : 'no', /\d/.test(pw) ? 1 : 0]);
    rows.push(['symbols', /[^A-Za-z0-9]/.test(pw) ? 'yes' : 'no', /[^A-Za-z0-9]/.test(pw) ? 1 : 0]);
    for (const [, , p] of rows) score += p;
    if (/(password|123456|qwerty|letmein)/i.test(pw)) score = Math.min(score, 1);
    const label = score >= 5 ? 'STRONG' : score >= 3 ? 'OKAY' : 'WEAK';
    return reply(ui.card({ icon: '⌑', title: `Password: ${label}`, subtitle: `${score}/5 points`, rows: rows.map(([k, v]) => [k, String(v)]), body: score < 3 ? 'Tip: 14+ chars with upper, lower, digit and symbol.' : '' }));
  },
};
