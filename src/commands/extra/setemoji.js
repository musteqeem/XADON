// XADON AI · setemoji — map an emoji to a command. Type the emoji (no prefix) to run it.
// Usage: .setemoji ping 😎   |   just send 😎 to run ping
module.exports = {
  name: 'setemoji',
  alias: ['addemoji', 'setemojis'],
  desc: 'Map an emoji trigger to a command',
  usage: '.setemoji <command> <emoji>',
  category: 'extra',
  async run({ args, reply, ui, db, loader, prefix }) {
    const cmdName = String(args[0] || '').toLowerCase();
    const emoji = args.slice(1).join(' ').trim();
    if (!cmdName || !emoji) return reply(ui.notice('info', 'Set emoji', `Usage: ${prefix}setemoji ping \u{1F60E}\nThen just send \u{1F60E} (no prefix) to run ping.`));
    const cmd = loader.find(cmdName);
    if (!cmd) return reply(ui.notice('error', 'No command', `Command "${cmdName}" not found.`));
    if (['setemoji', 'delemoji', 'emojilist'].includes(cmd.name)) return reply(ui.notice('error', 'Blocked', 'That command cannot be emoji-mapped.'));
    const map = db.get('emojiMap', {});
    map[emoji] = cmd.name;
    db.set('emojiMap', map);
    return reply(ui.notice('success', 'Emoji saved', `${emoji}  ⟶  ${prefix}${cmd.name}\nJust send ${emoji} to run it.`));
  },
};
