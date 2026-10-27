// XADON V8 · pluglist — loaded plugin categories with counts.
module.exports = {
  name: 'pluglist', alias: ['plugins', 'pluginlist'], desc: 'List loaded plugin packs', usage: '.pluglist', category: 'general',
  async run({ reply, ui, loader }) {
    const groups = loader.byCategory();
    const cats = Object.keys(groups).sort();
    return reply(ui.card({
      icon: '🧩', title: `Plugins (${loader.commands.size})`, subtitle: `${cats.length} categories loaded`,
      rows: cats.map((c) => [c, String(groups[c].length)]),
      body: 'Reload: restart the bot. Add: drop a .js file in src/commands/<cat>/',
    }));
  },
};
