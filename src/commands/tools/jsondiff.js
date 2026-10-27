// XADON V8 · jsondiff — compare two JSON objects key by key.
module.exports = {
  name: 'jsondiff', alias: ['diffjson', 'cmpjson'], desc: 'Diff two JSON objects', usage: '.jsondiff {"a":1} || {"a":2}', category: 'tools',
  async run({ text, reply, ui }) {
    const parts = String(text || '').split('||').map((s) => s.trim());
    if (parts.length !== 2) return reply(ui.notice('info', 'JSON diff', 'Usage: .jsondiff {"a":1} || {"a":2}'));
    let a, b;
    try { a = JSON.parse(parts[0]); b = JSON.parse(parts[1]); }
    catch (e) { return reply(ui.notice('error', 'Invalid JSON', String(e.message).slice(0, 200))); }
    const keys = [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])].slice(0, 30);
    const rows = keys.map((k) => {
      const x = JSON.stringify(a?.[k]), y = JSON.stringify(b?.[k]);
      return [k.slice(0, 18), x === y ? '= same' : `${String(x ?? '∅').slice(0, 20)} → ${String(y ?? '∅').slice(0, 20)}`];
    });
    const diff = rows.filter(([, v]) => !v.startsWith('=')).length;
    return reply(ui.card({ icon: '◐', title: `${diff} difference(s)`, subtitle: `${keys.length} keys compared`, rows }));
  },
};
