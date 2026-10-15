/** XADON countdown — days left to a date or New Year. */
module.exports = {
  name: 'countdown',
  alias: ['count', 'daysleft'],
  desc: 'Countdown to any date',
  usage: '.countdown 2027-01-01 New Year',
  async run({ args, text, reply, ui, prefix }) {
    const { fonts } = ui;
    const match = text.match(/(\d{4}-\d{2}-\d{2})/);
    const now = new Date();
    let target = match ? new Date(match[1] + 'T00:00:00') : new Date(now.getFullYear() + 1, 0, 1);
    if (isNaN(target)) return reply(ui.notice('error', 'Bad date', `Use ${fonts.mono('YYYY-MM-DD')}, e.g. ${fonts.mono(`${prefix}countdown 2027-01-01`)}`));
    const label = (text.replace(match?.[0] || '', '').trim() || (match ? 'Target day' : `New Year ${target.getFullYear()}`)).slice(0, 60);
    const diff = target - now;
    if (diff <= 0) return reply(ui.notice('success', label, 'That day has already arrived.'));
    const d = Math.floor(diff / 864e5); const h = Math.floor((diff % 864e5) / 36e5); const mi = Math.floor((diff % 36e5) / 6e4);
    await reply(ui.card({ icon: '◷', title: label, subtitle: target.toDateString(), rows: [['left', fonts.bold(`${d}d ${h}h ${mi}m`)], ['date', fonts.mono(target.toISOString().slice(0, 10))]], body: ui.bar(Math.min(99, Math.max(2, 100 - (d / 365) * 100))) + `\n${ui.footer()}` }));
  },
};
