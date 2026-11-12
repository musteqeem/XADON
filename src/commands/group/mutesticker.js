// XADON AI · mutesticker — mute ONE member's stickers (their texts still pass).
// For group-wide sticker blocking use .antisticker instead.
const digit = (j = '') => String(j).split('@')[0].split(':')[0];
const KEY = (chat) => `muted:sticker:${chat}`;

const getList = (db, chat) => db.get(KEY(chat), []);

module.exports = {
  name: 'mutesticker',
  alias: ['mutestick', 'msticker', 'unmutesticker'],
  desc: "Mute one user's stickers — their sticker messages are auto-deleted",
  usage: '.mutesticker @user|reply|number  ·  .mutesticker off @user  ·  .mutesticker list',
  group: true, admin: true, category: 'group',
  async run({ sock, m, args, reply, ui, fail, prefix, db, target, group, used }) {
    const sub = String(args[0] || '').toLowerCase();
    const unmuteMode = String(used || '').startsWith('un') || ['off', 'remove', 'del', 'unmute'].includes(sub);
    const listMode = ['list', 'all', 'show'].includes(sub);

    if (listMode) {
      const list = getList(db, m.chat);
      if (!list.length) return reply(ui.notice('info', 'No sticker-muted users', `Usage: ${prefix}mutesticker @user (or reply to them).`));
      return reply(ui.card({
        icon: '🔇', title: 'Sticker-muted users', subtitle: `${list.length} muted`,
        rows: list.map((n, i) => [`#${i + 1}`, `@${n}`]),
        body: `Unmute: ${prefix}mutesticker off @user\nGroup-wide block: ${prefix}antisticker on`,
      }));
    }

    let jid = null;
    try { jid = target ? target() : null; } catch { jid = null; }
    if (!jid && m.quoted?.sender) jid = m.quoted.sender;
    if (!jid) {
      const num = (unmuteMode ? args.slice(1) : args).join(' ').replace(/\D/g, '');
      if (/^\d{7,15}$/.test(num)) jid = `${num}@s.whatsapp.net`;
    }
    if (!jid) return fail('Who?', `Mention, reply to, or type the number:\n${prefix}mutesticker @user`);

    const num = digit(jid);
    if (num === digit(sock.user?.id)) return fail('Not me', 'I cannot mute myself.');

    try {
      const meta = group || await sock.groupMetadata(m.chat).catch(() => null);
      const part = meta?.participants?.find((p) => [p.id, p.lid, p.phoneNumber].filter(Boolean).some((v) => digit(v) === num));
      if (part?.admin) return fail('Is admin', 'That user is a group admin — demote them first.');
    } catch {}

    let list = getList(db, m.chat);
    if (unmuteMode) {
      if (!list.includes(num)) return reply(ui.notice('info', 'Not muted', `@${num} is not sticker-muted.`));
      db.set(KEY(m.chat), list.filter((n) => n !== num));
      return reply(ui.notice('success', 'Stickers unmuted', `@${num} can send stickers again.`));
    }
    if (list.includes(num)) return reply(ui.notice('info', 'Already muted', `@${num} is already sticker-muted.`));
    list.push(num);
    db.set(KEY(m.chat), list.slice(-100));
    await sock.sendMessage(m.chat, {
      text: `🔇 @${num} is sticker-muted — every sticker they send will be deleted (texts still pass).\nUnmute: ${prefix}mutesticker off @${num}`,
      mentions: [`${num}@s.whatsapp.net`],
    }, { quoted: m.raw }).catch(() => {});
  },
};
