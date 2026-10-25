// XADON V7 · replylist — formats + customs + picture status
const fmt = require('../../lib/format');
module.exports = {
  name: 'replylist', alias: ['replies', 'formatstatus'], desc: 'Show reply format, picture and customs', usage: '.replylist', category: 'owner', owner: true,
  async run({ reply, ui }) {
    const pic = fmt.getReplyPic();
    const all = fmt.listCustom();
    return reply(ui.card({ icon: '◈', title: 'Reply engine', subtitle: `format: ${fmt.getFormat()}`, rows: [['format', fmt.getFormat()], ['picture', pic ? `${pic.kind} set` : 'none'], ['customs', String(all.length)]], body: all.length ? all.map(([c, v]) => `• ${c}: ${String(v).slice(0, 60)}`).join('\n') : 'No custom replies. Try: .setreply ping "PONG {text}"' }));
  },
};
