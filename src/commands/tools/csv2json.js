// XADON V8 · csv2json — convert CSV text (or quoted) to JSON.
module.exports = {
  name: 'csv2json', alias: ['csvjson', 'tojson'], desc: 'Convert CSV to JSON', usage: '.csv2json name,age\\nAda,30', category: 'tools',
  async run({ text, m, reply, ui }) {
    const raw = (text || m.quoted?.body || '').trim();
    if (!raw.includes(',')) return reply(ui.notice('info', 'CSV to JSON', 'Usage: .csv2json name,age (newline) Ada,30'));
    const lines = raw.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return reply(ui.notice('error', 'Need rows', 'Supply a header line plus at least one data row.'));
    const split = (l) => l.split(',').map((c) => c.trim());
    const head = split(lines[0]);
    const out = lines.slice(1, 21).map((l) => Object.fromEntries(head.map((h, i) => [h || `col${i + 1}`, split(l)[i] ?? ''])));
    return reply(ui.card({ icon: '▦', title: `${out.length} row(s)`, subtitle: `${head.length} columns`, body: '```json\n' + JSON.stringify(out, null, 1).slice(0, 2500) + '\n```' }));
  },
};
