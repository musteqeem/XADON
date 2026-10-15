// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'npminfo',
  alias: ['npmfind'],
  desc: 'NPM package lookup',
  usage: '.npminfo <package>',
  category: 'search',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const p = args[0];
    if (!p) return reply(ui.notice('info', 'NPM lookup', `${fonts.mono(`${prefix}npminfo express`)}`));
    try {
      const r = await fetch(`https://registry.npmjs.org/${encodeURIComponent(p)}/latest`);
      if (!r.ok) throw new Error('nf');
      const j = await r.json();
      return reply(ui.card({ icon: '▣', title: j.name, subtitle: 'npm registry', rows: [['version', fonts.bold(j.version)], ['license', fonts.smallCaps(j.license || 'unknown')]], body: `${fonts.italic((j.description || '').slice(0, 300))}\n${fonts.mono(`npm i ${j.name}`)}\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'Not found', 'No package with that name.')); }
  },
};
