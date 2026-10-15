/** XADON V3 · yts — real YouTube search results (no key). */
const { searchYouTube } = require('../../lib/yt');
const { xadonCard } = require('../../lib/rich');

module.exports = {
  name: 'yts',
  alias: ['ytsearch'],
  desc: 'Search YouTube videos',
  usage: '.yts Alan Walker Faded',
  category: 'downloader',
  async run({ sock, m, text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'YouTube search', `${fonts.mono(`${prefix}yts alan walker faded`)}`));
    try {
      const results = await searchYouTube(text, 5);
      if (!results.length) {
        const q = encodeURIComponent(text);
        return reply(xadonCard('YouTube search', `https://www.youtube.com/results?search_query=${q}`, 'XADON AI'));
      }
      const lines = results.map((v, i) => `${i + 1}. ▸ ${v.title.slice(0, 70)}\n   ${v.author ? `◈ ${v.author} · ` : ''}${v.url}`).join('\n\n');
      const body = `${xadonCard(`YouTube · ${text.slice(0, 50)}`, lines, 'XADON AI · tap to watch')}`;
      const btns = results.slice(0, 3).map((v, i) => ({ text: `▶ Result ${i + 1}`, url: v.url, useWebview: true }));
      return sock.sendMessage(m.chat, { text: body, nativeFlow: btns }, { quoted: m.raw });
    } catch {
      const q = encodeURIComponent(text);
      return reply(xadonCard('YouTube search', `https://www.youtube.com/results?search_query=${q}\nhttps://music.youtube.com/search?q=${q}`, 'XADON AI'));
    }
  },
};
