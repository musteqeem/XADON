// XADON AI · giveaway — pick random winner(s) from group members. Reroll supported.
const crypto = require('crypto');

const pick = (pool, n) => {
  const arr = [...pool];
  const winners = [];
  while (arr.length && winners.length < n) {
    winners.push(arr.splice(crypto.randomInt(arr.length), 1)[0]);
  }
  return winners;
};

module.exports = {
  name: 'giveaway',
  alias: ['gstart', 'gwinner', 'lottery', 'winners'],
  desc: 'Pick random group winner(s) + reroll',
  usage: '.giveaway 1 iPhone 16  ·  .giveaway reroll',
  group: true, admin: true, category: 'group',
  async run({ sock, m, args, reply, ui, fail, prefix, db }) {
    const sub = String(args[0] || '').toLowerCase();
    const KEY = `giveaway:${m.chat}`;

    if (sub === 'reroll' || sub === 'repick') {
      const last = db.get(KEY, null);
      if (!last?.pool?.length) return fail('Nothing to reroll', `Run ${prefix}giveaway 1 <prize> first.`);
      const winners = pick(last.pool, last.count || 1);
      const tags = winners.map((w) => `@${String(w).split('@')[0].split(':')[0]}`);
      return sock.sendMessage(m.chat, {
        text: `🎉 *GIVEAWAY REROLL* 🎉\n\n🏆 Winner${winners.length > 1 ? 's' : ''}: ${tags.join(', ')}\n🎁 Prize: ${last.prize}\n\nCongrats! 🥳`,
        mentions: winners,
      }, { quoted: m.raw });
    }

    let count = Number.parseInt(args[0], 10);
    if (!Number.isSafeInteger(count) || count < 1) count = 1;
    count = Math.min(count, 10);
    const prize = (Number.isSafeInteger(Number.parseInt(args[0], 10)) ? args.slice(1) : args).join(' ').trim() || 'a prize';

    let meta;
    try { meta = await sock.groupMetadata(m.chat); } catch { return fail('No member list', 'Could not read group members. Try again.'); }
    const botIds = [sock.user?.id, sock.user?.lid].filter(Boolean).map((j) => String(j).split(':')[0]);
    const pool = (meta.participants || [])
      .map((p) => p.id)
      .filter((id) => id && !botIds.some((b) => String(id).startsWith(b)));
    if (!pool.length) return fail('Empty pool', 'No eligible members found.');

    const winners = pick(pool, Math.min(count, pool.length));
    db.set(KEY, { pool, count: winners.length, prize, at: Date.now() });
    const tags = winners.map((w) => `@${String(w).split('@')[0].split(':')[0]}`);
    await sock.sendMessage(m.chat, {
      text: `🎉 *GIVEAWAY TIME* 🎉\n\n🎁 Prize: ${prize}\n👥 Entries: ${pool.length}\n🏆 Winner${winners.length > 1 ? 's' : ''}: ${tags.join(', ')}\n\nCongrats! 🥳\n_Reroll anytime: ${prefix}giveaway reroll_`,
      mentions: winners,
    }, { quoted: m.raw });
  },
};
