// XADON V8 · timecalc — add/subtract durations (e.g. ".timecalc 2h30m + 45m - 10m").
module.exports = {
  name: 'timecalc', alias: ['durcalc', 'addtime'], desc: 'Duration arithmetic', usage: '.timecalc 2h30m + 45m', category: 'tools',
  async run({ text, reply, ui }) {
    const expr = (text || '').trim();
    if (!expr) return reply(ui.notice('info', 'Time calc', 'Usage: .timecalc 2h30m + 45m - 10m'));
    const toMin = (chunk) => { let t = 0, ok = false; for (const m2 of chunk.matchAll(/(\d+(?:\.\d+)?)\s*(d|h|m|s)/gi)) { ok = true; const v = Number(m2[1]); t += m2[2].toLowerCase() === 'd' ? v * 1440 : m2[2].toLowerCase() === 'h' ? v * 60 : m2[2].toLowerCase() === 's' ? v / 60 : v; } return ok ? t : null; };
    const tokens = expr.replace(/\+/g, ' + ').replace(/-/g, ' - ').split(/\s+/).filter(Boolean);
    let total = 0, op = '+', used = false;
    for (const tk of tokens) {
      if (tk === '+' || tk === '-') { op = tk; continue; }
      const v = toMin(tk);
      if (v === null) return reply(ui.notice('error', 'Bad chunk', `Could not read "${tk}". Use d/h/m/s units.`));
      total += op === '+' ? v : -v; used = true;
    }
    if (!used) return reply(ui.notice('info', 'Time calc', 'Usage: .timecalc 2h30m + 45m - 10m'));
    const neg = total < 0; total = Math.abs(total);
    const d = Math.floor(total / 1440), h = Math.floor((total % 1440) / 60), mnt = Math.floor(total % 60), s = Math.round((total % 1) * 60);
    const out = `${neg ? '-' : ''}${d ? `${d}d ` : ''}${h ? `${h}h ` : ''}${mnt ? `${mnt}m ` : ''}${s ? `${s}s` : ''}`.trim() || '0m';
    return reply(ui.card({ icon: '◷', title: out, subtitle: `${Math.round((neg ? -1 : 1) * total * 60)} seconds total`, rows: [['expression', expr.slice(0, 80)]] }));
  },
};
