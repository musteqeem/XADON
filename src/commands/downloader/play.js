/** XADON V3 · play — real song audio by name or link. No API key. */
const { YT_ID, searchYouTube, resolveAudio } = require('../../lib/yt');
const { xadon, xadonCard } = require('../../lib/rich');

module.exports = {
  name: 'play',
  alias: ['song', 'songdl', 'music'],
  desc: 'Play any song by name or YouTube link',
  usage: '.play Tiki tiki  ·  .play Lonely at the top  ·  .play <youtube link>',
  category: 'downloader',
  async run({ sock, m, args, text, reply, ui, prefix }) {
    const { fonts } = ui;
    const query = (text || '').trim() || (m.quoted?.body || '').trim();
    if (!query) return reply(ui.notice('info', 'Play music', `${fonts.mono(`${prefix}play Lonely at the top`)}\n${fonts.smallCaps('or')} ${fonts.mono(`${prefix}play Tiki tiki`)}`));
    try {
      const directId = YT_ID(query);
      let video = null;
      if (directId) {
        video = { id: directId, title: query.slice(0, 80), url: `https://www.youtube.com/watch?v=${directId}` };
      } else {
        await sock.sendPresenceUpdate('composing', m.chat).catch(() => {});
        const results = await searchYouTube(query, 4);
        if (!results.length) {
          const q = encodeURIComponent(query);
          return sock.sendMessage(m.chat, {
            text: xadonCard('Song search', `No direct match for "${query.slice(0, 60)}". Tap below to open results.`, 'XADON AI · music'),
            nativeFlow: [
              { text: '▶ YouTube results', url: `https://www.youtube.com/results?search_query=${q}`, useWebview: true },
              { text: '♪ Spotify search', url: `https://open.spotify.com/search/${q}`, useWebview: true },
            ]
          }, { quoted: m.raw });
        }
        video = results[0];
      }
      // Try to resolve real audio
      try {
        const audio = await resolveAudio(video.url);
        await sock.sendMessage(m.chat, {
          audio: { url: audio.url }, mimetype: 'audio/mpeg', ptt: false,
          contextInfo: { externalAdReply: { title: (audio.title || video.title || query).slice(0, 60), body: 'XADON AI · now playing', mediaType: 1, sourceUrl: video.url, renderLargerThumbnail: false, showAdAttribution: false } }
        }, { quoted: m.raw });
        return sock.sendMessage(m.chat, {
          text: xadonCard('Now playing', `${video.title}\n${video.url}`, 'XADON AI · music'),
          nativeFlow: [{ text: '▶ Watch video', url: video.url, useWebview: true }]
        }, { quoted: m.raw });
      } catch {
        const q = encodeURIComponent(video.title || query);
        return sock.sendMessage(m.chat, {
          text: xadon(`Found "${(video.title || query).slice(0, 80)}" — audio servers are busy, tap to listen:`) + `\n${video.url}`,
          nativeFlow: [
            { text: '▶ Play on YouTube', url: video.url, useWebview: true },
            { text: '♪ Spotify search', url: `https://open.spotify.com/search/${q}`, useWebview: true },
          ]
        }, { quoted: m.raw });
      }
    } catch (e) {
      return reply(ui.notice('error', 'Play failed', `Could not fetch that song. Try ${fonts.mono(`${prefix}yts ${query.slice(0, 30)}`)}`));
    }
  },
};
