// XADON V8 · emojicount — count and list emojis in text.
module.exports = {
  name: 'emojicount', alias: ['emojistat', 'countemoji'], desc: 'Count emojis in text', usage: '.emojicount I ❤️ WA 🔥🔥', category: 'tools',
  async run({ text, m, reply, ui }) {
    const s = (text || m.quoted?.body || '').trim();
    if (!s) return reply(ui.notice('info', 'Emoji count', 'Usage: .emojicount hello 🌍🔥'));
    const found = s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu) || [];
    const freq = {};
    for (const e of found) freq[e] = (freq[e] || 0) + 1;
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return reply(ui.card({
      icon: '✨', title: `${found.length} emoji(s)`, subtitle: `${Object.keys(freq).length} unique`,
      rows: top.length ? top.map(([e, c]) => [e, `×${c}`]) : [['scan', 'no emojis found']],
    }));
  },
};
