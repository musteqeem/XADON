// XADON V8 · pollimg — poll with per-option images (falls back to plain poll).
const botstate = require('../../lib/botstate');
module.exports = {
  name: 'pollimg', alias: ['imgpoll', 'pollx'], desc: 'Poll with option images', usage: '.pollimg Question | Option A | Option B', category: 'rich',
  async run({ sock, m, text, reply, ui }) {
    const parts = String(text || '').split('|').map((s) => s.trim()).filter(Boolean);
    if (parts.length < 3) return reply(ui.notice('info', 'Image poll', 'Usage: .pollimg Best theme? | Stable | Beta'));
    const [name, ...opts] = parts;
    const values = opts.slice(0, 6);
    // thumbnail source honours .setreplypic like .setformat media does
    let imgUrl = null;
    try { const fmt = require('../../lib/format'); const pic = fmt.getReplyPic(); if (pic && pic.kind === 'url') imgUrl = pic.value; } catch {}
    try {
      const payload = imgUrl
        ? { name: name.slice(0, 200), values: values.map((v) => ({ name: v.slice(0, 60), image: { url: imgUrl } })), selectableCount: 1 }
        : { name: name.slice(0, 200), values: values.map((v) => v.slice(0, 60)), selectableCount: 1 };
      await sock.sendMessage(m.chat, { poll: payload });
    } catch (e) { return reply(ui.notice('error', 'Poll failed', String(e.message || e).slice(0, 200))); }
  },
};
