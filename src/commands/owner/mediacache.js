// XADON V12 · mediacache — inspect / clear the media snapshot vault.
// Usage (owner only): .mediacache | .mediacache clear
const cache = require('../../lib/mediacache');
const fmtBytes = (n = 0) => (n > 1048576 ? `${(n / 1048576).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`);
module.exports = {
  name: 'mediacache',
  alias: ['mediavault', 'cachestats'],
  desc: 'Media snapshot vault stats + clear',
  usage: '.mediacache | .mediacache clear',
  category: 'owner',
  owner: true,
  async run({ args, reply, ui }) {
    if (/^(clear|clean|wipe|flush)$/.test(String(args[0] || '').toLowerCase())) {
      cache.clearAll();
      return reply(ui.notice('warn', 'Vault cleared', 'All media snapshots wiped from memory + disk.'));
    }
    const s = cache.stats();
    return reply(ui.card({
      icon: '▣', title: 'Media vault', subtitle: 'powers .deleted / .quoted / .deletedp',
      rows: [
        ['snapshots', `${s.files} files`],
        ['disk used', fmtBytes(s.bytes)],
        ['in memory', `${s.memFiles} bufs · ${fmtBytes(s.memBytes)}`],
        ['cap/file', fmtBytes(cache.MAX_FILE)],
      ],
      body: '.mediacache clear — wipe the vault\nSnapshots auto-expire past 150 files (oldest first).',
    }));
  },
};
