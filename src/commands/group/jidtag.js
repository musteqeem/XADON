// XADON · jidtag — tag that renders as "@<your text>" using the GROUP JID as the mention.
// Like CODY's jid-tag: `.jidtag how are you` shows "@how are you" (one mention pill).
module.exports = {
  name: 'jidtag',
  alias: ['gjidtag', 'groupjidtag', 'tagjid'],
  desc: 'Tag with custom @text using the group JID',
  usage: '.jidtag how are you',
  group: true, admin: true, category: 'group',
  async run({ sock, m, ui, text, fail }) {
    const label = (text || '').trim().slice(0, 60) || 'everyone';
    // The mention target is the group itself — renders as a single @pill with your text.
    const pill = `@${label}`;
    try {
      await sock.sendMessage(m.chat, { text: pill, mentions: [m.chat] }, { quoted: m.raw });
    } catch (e) {
      return fail('Tag failed', String(e.message || e).slice(0, 200));
    }
  },
};
