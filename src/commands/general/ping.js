/** XADON V7 · ping — customizable via .setreply ping + honors .setformat. */
const fmt = require('../../lib/format');
const grade = (ms) => (ms < 150 ? 'excellent' : ms < 400 ? 'stable' : ms < 900 ? 'average' : 'slow');

module.exports = {
  name: 'ping',
  alias: ['speed', 'p'],
  desc: 'Check bot speed',
  async run({ sock, m, ui, prefix }) {
    const { fonts } = ui;
    const start = Date.now();
    const sent = await sock.sendMessage(m.chat, { text: `⟳ ${fonts.smallCaps('measuring signal')} ${ui.DOTS.slice(0, 8)}` });
    const latency = Date.now() - start;
    const score = Math.max(5, 100 - Math.round(latency / 12));

    const text = [
      `◉ ─── ${fonts.bold('P O N G')} ─── ◉`,
      '',
      `   ${fonts.serif(String(latency))} ${fonts.smallCaps('ms')}`,
      `   ${ui.bar(score)}`,
      '',
      `◇ ${fonts.smallCaps('signal')}   ${fonts.bold(grade(latency).toUpperCase())}`,
      `◇ ${fonts.smallCaps('process')}  ${fonts.mono(`${(process.cpuUsage().user / 1e6).toFixed(2)}s cpu`)}`,
      `◇ ${fonts.smallCaps('memory')}   ${fonts.mono(ui.bytes(process.memoryUsage().rss))}`,
      '',
      ui.footer(),
    ].join('\n');

    // custom override (.setreply ping "... {text} ...") + active reply format
    let out = text;
    try {
      const custom = fmt.getCustom('ping');
      if (custom) out = fmt.fillVars(custom, { m, prefix }).replace(/\{text\}/gi, text);
    } catch {}
    await fmt.sendFormatted(sock, m.chat, out, { quoted: m.raw }).catch(() => sock.sendMessage(m.chat, { text }).catch(() => {}));
    await sock.sendMessage(m.chat, { delete: sent.key }).catch(() => {});
  },
};
