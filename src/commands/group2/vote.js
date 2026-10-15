// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'groupvote',
  alias: [],
  desc: 'Yes/No vote poll',
  usage: '.vote <question>',
  group: true, category: 'group2',
  async run({ sock, m, text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Vote', `${fonts.mono(`${prefix}vote Movie night?`)}`));
    return sock.sendMessage(m.chat, { poll: { name: text.slice(0, 300), values: ['Yes', 'No'], selectableCount: 1 } }, { quoted: m.raw });
  },
};
