// XADON V12 · getdeleted — pull one deleted item (with its pic/video)
// straight into YOUR DM. .deleted shows it here, .getdeleted 2 DMs it to you.
// Usage: .getdeleted 1 | .getdeleted 2
const store = require('../../lib/msgstore');
const cache = require('../../lib/mediacache');
module.exports = {
  name: 'getdeleted',
  alias: ['fetchdeleted', 'dmdeleted'],
  desc: 'Send a deleted item (with media) to your DM',
  usage: '.getdeleted 2',
  category: 'tools',
  async run({ sock, m, args, reply, ui }) {
    let n = parseInt(args[0] || '1', 10);
    if (!Number.isFinite(n)) n = 1;
    n = Math.max(1, Math.min(5, n));
    const list = store.getDeleted(m.chat, 5);
    const entry = list[n - 1];
    if (!entry) return reply(ui.notice('info', 'Nothing there', `No deleted message #${n} in this chat. See .deleted first.`));
    const target = m.sender;
    const ok = await cache.repost(sock, m.chat, target, entry, `🗑 deleted #${n} from ${(m.isGroup ? 'group' : 'chat')}`);
    if (!ok) return reply(ui.notice('error', 'DM failed', 'I could not DM you (privacy?). It is still visible via .deleted.'));
    return reply(ui.notice('success', 'Sent to your DM', `Deleted #${n}${cache.has(m.chat, entry.id) ? ' with its media 📎' : ''} — check your DM.`));
  },
};
