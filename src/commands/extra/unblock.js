// XADON AI · unblock — unblock a WhatsApp user via Baileys.
module.exports = {
  name: 'unblock',
  alias: ['unblk', 'unblocknum'],
  desc: 'Unblock a WhatsApp user',
  usage: '.unblock @user | 2348012345678',
  owner: true, category: 'extra',
  async run({ sock, m, reply, ui, fail, target }) {
    const jid = target();
    if (!jid) return fail('Who?', 'Mention, reply, or type the number: .unblock 2348012345678');
    try {
      if (typeof sock.updateBlockStatus !== 'function') return reply(ui.notice('error', 'Not supported', 'This Baileys build has no block API.'));
      await sock.updateBlockStatus(jid, 'unblock');
      return reply(ui.notice('success', 'Unblocked', `@${jid.split('@')[0]} unblocked.`));
    } catch { return reply(ui.notice('error', 'Unblock failed', 'Could not unblock that user.')); }
  },
};
