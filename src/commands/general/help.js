module.exports = {
  name: 'help',
  alias: ['h', 'how', 'usage'],
  desc: 'How to use a command',
  usage: '.help <command>',
  async run({ args, reply, ui, prefix, loader, m }) {
    const { fonts } = ui;
    const q = String(args[0] || '').toLowerCase().replace(/^\./, '');
    if (!q) {
      return reply(ui.notice('info', 'Help', `${fonts.smallCaps('type')} ${fonts.mono(`${prefix}menu`)} ${fonts.smallCaps('to see everything, or')} ${fonts.mono(`${prefix}help ping`)}`));
    }
    const cmd = loader.find(q);
    if (!cmd) return reply(ui.notice('error', 'Not found', `No command named ${fonts.mono(q)}.`));
    const text = ui.card({
      icon: '?',
      title: `${prefix}${cmd.name}`,
      subtitle: cmd.category || 'command',
      rows: [
        ['name', fonts.bold(cmd.name)],
        ['alias', fonts.mono((cmd.alias || []).join(', ') || 'none')],
        ['about', fonts.smallCaps(cmd.desc || '')],
      ],
      body: `${fonts.smallCaps('usage')}\n${fonts.mono(cmd.usage || `${prefix}${cmd.name}`)}${cmd.owner ? `\n${fonts.smallCaps('owner only')}` : ''}${cmd.admin ? `\n${fonts.smallCaps('group admins only')}` : ''}${cmd.group ? `\n${fonts.smallCaps('groups only')}` : ''}`,
    });
    await reply(text);
  },
};
