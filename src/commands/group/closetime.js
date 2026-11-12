// XADON AI · closetime — auto close/open the group on a daily schedule (Lagos time).
// Enforced by the message handler on every incoming group message, so it
// survives restarts with no timers. First message after a boundary flips the gate.
const HHMM = /^([01]?\d|2[0-3]):([0-5]\d)$/;

const toMin = (s) => {
  const [, h, mi] = String(s).match(HHMM) || [];
  return Number(h) * 60 + Number(mi);
};

const lagosMin = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === 'hour')?.value || 0);
  const mi = Number(parts.find((p) => p.type === 'minute')?.value || 0);
  return h * 60 + mi;
};

// exported for the handler hook
const shouldBeClosed = (cfg, nowMin = lagosMin()) => {
  if (!cfg?.close || !cfg?.open) return null;
  const c = toMin(cfg.close);
  const o = toMin(cfg.open);
  if (c === o) return null;
  return c < o ? (nowMin >= c && nowMin < o) : (nowMin >= c || nowMin < o);
};

module.exports = {
  name: 'closetime',
  alias: ['autoclose', 'closeopen', 'gcschedule'],
  desc: 'Auto-close/open group daily (Lagos time)',
  usage: '.closetime 23:00 05:00  ·  .closetime off  ·  .closetime',
  group: true, admin: true, botAdmin: true, category: 'group',
  shouldBeClosed, lagosMin, KEY: (chat) => `closetime:${chat}`,
  async run({ sock, m, args, reply, ui, fail, prefix, db }) {
    const KEY = `closetime:${m.chat}`;
    const sub = String(args[0] || '').toLowerCase();

    if (!sub || sub === 'status' || sub === 'info') {
      const cfg = db.get(KEY, null);
      if (!cfg) return reply(ui.notice('info', 'Close time: off', `Usage: ${prefix}closetime 23:00 05:00\nCloses at 23:00, reopens at 05:00 (Africa/Lagos).\n${prefix}closetime off — disable.`));
      return reply(ui.notice('success', `Close time: ${cfg.close} → ${cfg.open}`, 'Africa/Lagos · enforced automatically.\n' + `${prefix}closetime off — disable.`));
    }
    if (['off', 'disable', 'stop', 'cancel'].includes(sub)) {
      db.delete(KEY);
      try { await sock.groupSettingUpdate(m.chat, 'not_announcement'); } catch {}
      return reply(ui.notice('warn', 'Close time off', 'The group stays open.'));
    }

    const [close, open] = args;
    if (!HHMM.test(close || '') || !HHMM.test(open || '')) {
      return fail('Bad time', `Use 24h HH:MM. Example:\n${prefix}closetime 23:00 05:00\n${prefix}closetime off`);
    }
    db.set(KEY, { close, open, by: m.sender, at: Date.now() });
    return reply(ui.notice('success', `Close time set: ${close} → ${open}`, 'Africa/Lagos · the gate flips automatically.\nMake sure I stay admin or I cannot open/close.'));
  },
};
