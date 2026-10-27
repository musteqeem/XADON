// XADON V8 · fmtpreview — preview the reply formats live.
const fmt = require('../../lib/format');
module.exports = {
  name: 'fmtpreview', alias: ['formatpreview', 'previewfmt'], desc: 'Preview all reply formats', usage: '.fmtpreview', category: 'owner', owner: true,
  async run({ sock, m, reply, ui }) {
    const sample = 'Preview · the quick brown fox jumps over the lazy dog 1234567890';
    for (const f of ['default', 'mono', 'rich', 'color', 'html', 'a2ui', 'ads']) {
      try { await fmt.sendFormatted(sock, m.chat, `[${f}] ${sample}`, { quoted: m.raw, format: f }); } catch {}
      await new Promise((r) => setTimeout(r, 600));
    }
    return reply(ui.notice('success', 'Preview done', `Current saved format is still: ${fmt.getFormat()}\nSwitch: .setformat <name>`));
  },
};
