// XADON AI · block — block a user via Baileys (mention/reply/number).
module.exports = {
  name: 'block',
  alias: ['blk', 'blocknum'],
  desc: 'Block a WhatsApp user',
  usage: '.block @user | 2348012345678',
  owner: true, category: 'extra',
  async run({ sock, m, reply, ui, fail, target }) {
    const jid = target();
    if (!jid) return fail('Who?', 'Mention, reply, or type the number: .block 2348012345678');
    try {
      if (typeof sock.updateBlockStatus !== 'function') return reply(ui.notice('error', 'Not supported', 'This Baileys build has no block API.'));
      await sock.updateBlockStatus(jid, 'block');
      return reply(ui.notice('success', 'Blocked', `@${jid.split('@')[0]} blocked.`));
    } catch { return reply(ui.notice('error', 'Block failed', 'Could not block that user.')); }
  },
};
