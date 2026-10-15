// XADON AI · OWNER — premium unicode card, no emojis.
module.exports = {
  name: 'sysinfo',
  alias: ['sysstat'],
  desc: 'Server diagnostics',
  owner: true, category: 'owner2',
  async run({ reply, ui, stats }) {
    const { fonts } = ui;
    const mem = process.memoryUsage();
    return reply(ui.card({ icon: '\u2699', title: 'System', subtitle: 'diagnostics', rows: [['uptime', fonts.bold(ui.duration(process.uptime() * 1000))], ['messages', fonts.bold(String(stats.messages))], ['commands', fonts.bold(String(stats.commands))], ['heap', fonts.mono(ui.bytes(mem.heapUsed))], ['node', fonts.mono(process.version)]], body: ui.footer() }));
  },
};
