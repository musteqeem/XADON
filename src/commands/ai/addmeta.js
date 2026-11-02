/**
 * XADON V9 · addmeta — add Meta AI to a group.
 * Meta AI JID: 867051314767696@bot (works with groupParticipantsUpdate add).
 */
const META_JID = '867051314767696@bot';
module.exports = {
  name: 'addmeta',
  alias: ['metaadd', 'metainvite', 'addai'],
  desc: 'Add Meta AI to this group',
  usage: '.addmeta',
  category: 'ai',
  group: true, admin: true, botAdmin: true,
  META_JID,
  async run({ sock, m, reply, ui }) {
    try {
      const res = await sock.groupParticipantsUpdate(m.chat, [META_JID], 'add');
      const st = Array.isArray(res) ? res[0]?.status : res?.status;
      if (String(st) === '200' || String(st) === '201' || !st) {
        return reply(ui.card({
          icon: '◈', title: 'Meta AI added',
          subtitle: 'the group now has a second AI',
          rows: [['how to use', 'mention @Meta AI with your question']],
          body: 'Try: @Meta AI who won the last World Cup?\nRemove anytime with .delmeta',
        }));
      }
      return reply(ui.notice('warn', 'Meta says no', `WhatsApp returned status ${st}. The group may block bot adds — try again or add @Meta AI manually from the participant list.`));
    } catch (e) {
      return reply(ui.notice('error', 'Add failed', `${String(e.message || e).slice(0, 250)}\nMake the bot an admin and try again.`));
    }
  },
};
