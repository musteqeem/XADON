// XADON · stopwatch — personal stopwatch (start / stop / lap / reset).
module.exports = {
  name: 'stopwatch',
  alias: ['stopw', 'timer2', 'sw'],
  desc: 'Personal stopwatch with laps',
  usage: '.stopwatch start  ·  .stopwatch stop  ·  .stopwatch lap  ·  .stopwatch status',
  category: 'tools',
  async run({ args, m, reply, ui, db, prefix }) {
    const key = `stopwatch:${m.sender}`;
    const sub = String(args[0] || 'status').toLowerCase();
    const fmtMs = (ms) => {
      ms = Math.max(0, ms);
      const h = Math.floor(ms / 3_600_000); ms %= 3_600_000;
      const min = Math.floor(ms / 60_000); ms %= 60_000;
      const s = Math.floor(ms / 1000); const r = ms % 1000;
      const p = (n, l = 2) => String(n).padStart(l, '0');
      return `${p(h)}:${p(min)}:${p(s)}.${p(r, 3)}`;
    };
    let st = db.get(key, null);
    if (sub === 'start') {
      if (st?.running) return reply(ui.notice('info', 'Already running', `Started ${fmtMs(Date.now() - st.t0)} ago. Use ${prefix}stopwatch stop.`));
      st = { t0: Date.now(), acc: st?.acc || 0, laps: st?.laps || [], running: true };
      db.set(key, st);
      return reply(ui.notice('success', 'Stopwatch started', 'Use .stopwatch lap, .stopwatch stop.'));
    }
    if (!st) return reply(ui.notice('info', 'No stopwatch', `Start one with ${prefix}stopwatch start.`));
    const elapsed = st.acc + (st.running ? Date.now() - st.t0 : 0);
    if (sub === 'stop' || sub === 'pause') {
      if (!st.running) return reply(ui.notice('info', 'Not running', `Frozen at ${fmtMs(elapsed)}.`));
      st.acc = elapsed; st.running = false;
      db.set(key, st);
      return reply(ui.card({ icon: '◷', title: 'Stopped', rows: [['elapsed', fmtMs(elapsed)], ['laps', String(st.laps.length)]], body: `Final time: ${fmtMs(elapsed)}` }));
    }
    if (sub === 'lap') {
      if (!st.running) return reply(ui.notice('info', 'Not running', 'Start it first.'));
      st.laps.push(elapsed); db.set(key, st);
      return reply(ui.card({ icon: '◷', title: `Lap ${st.laps.length}`, rows: st.laps.slice(-8).map((t, i) => [`lap ${st.laps.length - Math.min(st.laps.length, 8) + i + 1}`, fmtMs(t)]), body: `Total: ${fmtMs(elapsed)}` }));
    }
    if (sub === 'reset' || sub === 'clear') {
      db.set(key, null);
      return reply(ui.notice('warn', 'Stopwatch reset', 'Fresh slate.'));
    }
    return reply(ui.card({
      icon: '◷', title: st.running ? 'Running…' : 'Paused',
      rows: [['elapsed', fmtMs(elapsed)], ['laps', String(st.laps.length)]],
      body: st.laps.length ? st.laps.map((t, i) => `${i + 1}. ${fmtMs(t)}`).join('\n') : `Usage: ${prefix}stopwatch start|lap|stop|reset`,
    }));
  },
};
