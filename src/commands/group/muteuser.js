// XADON AI · muteuser — hard-mute a member: EVERY message they send is deleted.
// Admins / owner-privileged users can never be muted (enforcement exempts them too).
const digit = (j = '') => String(j).split('@')[0].split(':')[0];
const KEY = (chat) => `muted:user:${chat}`;

const getList = (db, chat) => db.get(KEY(chat), []);

module.exports = {
  name: 'muteuser',
  alias: ['muteu', 'silence', 'unmuteuser', 'unmuteu'],
  desc: 'Mute a member — all their messages are auto-deleted',
  usage: '.muteuser @user|reply|number  ·  .muteuser off @user  ·  .muteuser list',
  group: true, admin: true, category: 'group',
  async run({ sock, m, args, reply, ui, fail, prefix, db, target, group, used }) {
    const sub = String(args[0] || '').toLowerCase();
    const unmuteMode = String(used || '').startsWith('un') || ['off', 'remove', 'del', 'unmute'].includes(sub);
    const listMode = ['list', 'all', 'show'].includes(sub);

    if (listMode) {
      const list = getList(db, m.chat);
      if (!list.length) return reply(ui.notice('info', 'No muted users', `Usage: ${prefix}muteuser @user (or reply to them).`));
      return reply(ui.card({
        icon: '🔇', title: 'Muted users', subtitle: `${list.length} muted`,
        rows: list.map((n, i) => [`#${i + 1}`, `@${n}`]),
        body: `Unmute: ${prefix}muteuser off @user`,
      }));
    }

    let jid = null;
    try { jid = target ? target() : null; } catch { jid = null; }
    if (!jid && m.quoted?.sender) jid = m.quoted.sender;
    if (!jid) {
      const num = (unmuteMode ? args.slice(1) : args).join(' ').replace(/\D/g, '');
      if (/^\d{7,15}$/.test(num)) jid = `${num}@s.whatsapp.net`;
    }
    if (!jid) return fail('Who?', `Mention, reply to, or type the number:\n${prefix}muteuser @user\n${prefix}unmuteuser @user`);

    const num = digit(jid);
    if (num === digit(sock.user?.id)) return fail('Not me', 'I cannot mute myself.');

    // refuse to mute group admins (enforcement would exempt them anyway)
    try {
      const meta = group || await sock.groupMetadata(m.chat).catch(() => null);
      const part = meta?.participants?.find((p) => [p.id, p.lid, p.phoneNumber].filter(Boolean).some((v) => digit(v) === num));
      if (part?.admin) return fail('Is admin', 'That user is a group admin — demote them first.');
    } catch {}

    let list = getList(db, m.chat);
    if (unmuteMode) {
      if (!list.includes(num)) return reply(ui.notice('info', 'Not muted', `@${num} is not muted.`));
      db.set(KEY(m.chat), list.filter((n) => n !== num));
      return reply(ui.notice('success', 'Unmuted', `@${num} can talk again.`));
    }
    if (list.includes(num)) return reply(ui.notice('info', 'Already muted', `@${num} is already muted.\nUnmute: ${prefix}muteuser off @user`));
    list.push(num);
    db.set(KEY(m.chat), list.slice(-100));
    await sock.sendMessage(m.chat, {
      text: `🔇 @${num} has been muted — every message they send will be deleted.\nUnmute: ${prefix}muteuser off @${num}`,
      mentions: [`${num}@s.whatsapp.net`],
    }, { quoted: m.raw }).catch(() => {});
  },
};
