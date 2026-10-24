const yts = require('yt-search');
const axios = require('axios');

module.exports = {
  name: 'play',
  alias: ['song', 'music', 'ytplay'],
  desc: 'Download and play YouTube music',
  usage: '.play faded alan walker',
  category: 'downloader',
  async run({ sock, m, ui, args, fail }) {
    const query = args.join(' ').trim();
    if (!query) {
      return fail(
        'Need a song name',
        `Example: ${ui.fonts.mono('.play faded alan walker')}\n${ui.fonts.mono('.play calm down')}`
      );
    }

    await sock.sendMessage(m.chat, { react: { text: '🎶', key: m.key } });

    const searchingMsg = await sock.sendMessage(
      m.chat,
      {
        text: [
          `⌬ ${ui.fonts.bold('XADON MUSIC SEARCH')}`,
          `${ui.fonts.smallCaps('query')}  ⟶ ${ui.fonts.mono(query)}`,
          `${ui.fonts.smallCaps('status')} ⟶ searching...`,
          '',
          ui.footer(),
        ].join('\n'),
      },
      { quoted: m.raw }
    );

    let video;
    try {
      const { videos } = await yts(query);
      if (!videos || videos.length === 0) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return fail('No results found', `Couldn't find anything for ${ui.fonts.mono(query)}`);
      }
      video = videos[0];
    } catch (e) {
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return fail('Search failed', e.message);
    }

    await sock.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    await sock.sendMessage(
      m.chat,
      {
        text: [
          `⊛ ${ui.fonts.bold('SONG FOUND')}`,
          `${ui.fonts.smallCaps('title')}    ⟶ ${video.title.slice(0, 70)}`,
          `${ui.fonts.smallCaps('duration')} ⟶ ${video.timestamp}`,
          `${ui.fonts.smallCaps('views')}    ⟶ ${video.views.toLocaleString()}`,
          `${ui.fonts.smallCaps('channel')}  ⟶ ${video.author?.name || 'Unknown'}`,
          `${ui.fonts.smallCaps('status')}   ⟶ downloading...`,
          '',
          ui.footer(),
        ].join('\n'),
        edit: searchingMsg.key,
      }
    );

    await sock.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });

    let data;
    try {
      const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(video.url)}`;
      const response = await axios.get(apiUrl, { timeout: 30000 });
      data = response.data;

      if (!data?.status || !data.audio) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return fail('Download failed', 'Audio service is currently unavailable. Try again in a few minutes.');
      }
    } catch (e) {
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return fail('Download error', e.message);
    }

    await sock.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });

    await sock.sendMessage(
      m.chat,
      {
        text: [
          `♫ ${ui.fonts.bold('READY TO PLAY')}`,
          `${ui.fonts.smallCaps('title')} ⟶ ${data.title || video.title}`,
          `${ui.fonts.smallCaps('link')}  ⟶ ${video.url}`,
          '',
          ui.footer(),
        ].join('\n'),
        edit: searchingMsg.key,
      }
    );

    await sock.sendMessage(
      m.chat,
      {
        audio: { url: data.audio },
        mimetype: 'audio/mpeg',
        fileName: `${(data.title || video.title).substring(0, 50)}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: ui.fonts.bold('XADON AI MUSIC'),
            body: video.title.slice(0, 40),
            thumbnailUrl: video.thumbnail,
            sourceUrl: 'https://whatsapp.com/channel/0029Vb7ACifD38Cb7Jlj5w3B',
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m.raw }
    );

    await sock.sendMessage(
      m.chat,
      {
        text: [
          `✔ ${ui.fonts.bold('MUSIC DELIVERED')}`,
          `${ui.fonts.smallCaps('song')} ⟶ ${data.title || video.title}`,
          `${ui.fonts.smallCaps('by')}   ⟶ ${m.pushName}`,
          '',
          ui.footer(),
        ].join('\n'),
      },
      { quoted: m.raw }
    );

    await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  },
};