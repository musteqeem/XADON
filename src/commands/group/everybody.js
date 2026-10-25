// XADON V7 · everybody - mention all with banner.
module.exports = {
  name: 'everybody', alias: ['everybodies', 'allmembers'], desc: 'Mention everybody with banner', usage: '.everybody [message]', category: 'group', group: true, admin: true,
  async run({ sock, m, text, reply, ui }) {
    try {
      const meta = await sock.groupMetadata(m.chat).catch(() => null);
      const members = (meta?.participants || []).map((p) => p.id || p.jid).filter(Boolean);
      if (!members.length) return reply(ui.notice('error', 'No members', 'Could not read the member list.'));
      const msg = (text || '').trim().slice(0, 500) || 'Hey everyone, read this!';
      const tags = members.map((j) => '@' + String(j).split('@')[0]);
      const head = '\u25C8 EVERYONE \u25C8';
      const chunk = 40;
      for (let i = 0; i < members.slice(0, 200).length; i += chunk) {
        const slice = members.slice(i, i + chunk);
        await sock.sendMessage(m.chat, { text: (i === 0 ? head + '\n' + msg + '\n\n' : '') + slice.map((j) => '@' + String(j).split('@')[0]).join(' '), mentions: slice }, { quoted: m.raw });
        void tags;
      }
      void tags;
    } catch (e) { return reply(ui.notice('error', 'Mention failed', String(e.message || e).slice(0, 200))); }
  },
};
