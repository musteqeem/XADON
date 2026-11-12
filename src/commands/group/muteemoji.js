// XADON AI · muteemoji — mute ONE member's emoji messages (their plain texts still pass).
// For group-wide emoji-flood blocking use .antiemoji instead.
const digit = (j = '') => String(j).split('@')[0].split(':')[0];
const KEY = (chat) => `muted:emoji:${chat}`;

const getList = (db, chat) => db.get(KEY(chat), []);

module.exports = {
  name: 'muteemoji',
  alias: ['memoji', 'unmuteemoji'],
  desc: "Mute one user's emoji messages — any message with emojis is auto-deleted",
  usage: '.muteemoji @user|reply|number  ·  .muteemoji off @user  ·  .muteemoji list',
  group: true, admin: true, category: 'group',
  async run({ sock, m, args, reply, ui, fail, prefix, db, target, group, used }) {
    const sub = String(args[0] || '').toLowerCase();
    const unmuteMode = String(used || '').startsWith('un') || ['off', 'remove', 'del', 'unmute'].includes(sub);
    const listMode = ['list', 'all', 'show'].includes(sub);

    if (listMode) {
      const list = getList(db, m.chat);
      if (!list.length) return reply(ui.notice('info', 'No emoji-muted users', `Usage: ${prefix}muteemoji @user (or reply to them).`));
      return reply(ui.card({
        icon: '🔇', title: 'Emoji-muted users', subtitle: `${list.length} muted`,
        rows: list.map((n, i) => [`#${i + 1}`, `@${n}`]),
        body: `Unmute: ${prefix}muteemoji off @user\nGroup-wide flood block: ${prefix}antiemoji on`,
      }));
    }

    let jid = null;
    try { jid = target ? target() : null; } catch { jid = null; }
    if (!jid && m.quoted?.sender) jid = m.quoted.sender;
    if (!jid) {
      const num = (unmuteMode ? args.slice(1) : args).join(' ').replace(/\D/g, '');
      if (/^\d{7,15}$/.test(num)) jid = `${num}@s.whatsapp.net`;
    }
    if (!jid) return fail('Who?', `Mention, reply to, or type the number:\n${prefix}muteemoji @user`);

    const num = digit(jid);
    if (num === digit(sock.user?.id)) return fail('Not me', 'I cannot mute myself.');

    try {
      const meta = group || await sock.groupMetadata(m.chat).catch(() => null);
      const part = meta?.participants?.find((p) => [p.id, p.lid, p.phoneNumber].filter(Boolean).some((v) => digit(v) === num));
      if (part?.admin) return fail('Is admin', 'That user is a group admin — demote them first.');
    } catch {}

    let list = getList(db, m.chat);
    if (unmuteMode) {
      if (!list.includes(num)) return reply(ui.notice('info', 'Not muted', `@${num} is not emoji-muted.`));
      db.set(KEY(m.chat), list.filter((n) => n !== num));
      return reply(ui.notice('success', 'Emoji unmuted', `@${num} can use emojis again.`));
    }
    if (list.includes(num)) return reply(ui.notice('info', 'Already muted', `@${num} is already emoji-muted.`));
    list.push(num);
    db.set(KEY(m.chat), list.slice(-100));
    await sock.sendMessage(m.chat, {
      text: `🔇 @${num} is emoji-muted — any message with emojis will be deleted (plain texts still pass).\nUnmute: ${prefix}muteemoji off @${num}`,
      mentions: [`${num}@s.whatsapp.net`],
    }, { quoted: m.raw }).catch(() => {});
  },
};
