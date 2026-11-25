/**
 * XADON · .play — YouTube music with multi-API fallback chain.
 * Search via yt-search, then try several free audio endpoints in order.
 * First endpoint that returns a playable URL wins.
 */
const yts = require('yt-search');
const axios = require('axios');

const ytIdOf = (u = '') => {
  const m = String(u).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};

async function fetchAudioUrl(videoUrl, videoId) {
  const enc = encodeURIComponent(videoUrl);
  // Each entry: { name, get() -> { url, title } }. Shapes differ per provider — normalize.
  const providers = [
    {
      name: 'hector',
      get: async () => {
        const { data } = await axios.get(`https://yt-dl.officialhectormanuel.workers.dev/?url=${enc}`, { timeout: 25000 });
        const u = data?.audio || data?.url || data?.result?.audio || data?.result?.url;
        if (data?.status !== false && u) return { url: u, title: data?.title || '' };
        throw new Error('empty');
      },
    },
    {
      name: 'davidcyril-1',
      get: async () => {
        const { data } = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${enc}`, { timeout: 25000 });
        const r = data?.result || data;
        const u = r?.download_url || r?.downloadUrl || r?.url || r?.audio;
        if (u) return { url: u, title: r?.title || '' };
        throw new Error('empty');
      },
    },
    {
      name: 'davidcyril-2',
      get: async () => {
        const { data } = await axios.get(`https://apis.davidcyriltech.my.id/download/ytmp3?url=${enc}`, { timeout: 25000 });
        const r = data?.result || data;
        const u = r?.download_url || r?.downloadUrl || r?.url || r?.audio;
        if (u) return { url: u, title: r?.title || '' };
        throw new Error('empty');
      },
    },
    {
      name: 'ryzen',
      get: async () => {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${enc}`, { timeout: 25000 });
        const u = data?.url || data?.result?.url || data?.data?.url || data?.audio;
        if (u) return { url: u, title: data?.title || data?.result?.title || '' };
        throw new Error('empty');
      },
    },
    {
      name: 'dreaded',
      get: async () => {
        const { data } = await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${enc}`, { timeout: 25000 });
        const u = data?.result?.download || data?.result?.url || data?.download || data?.url;
        if (u) return { url: u, title: data?.result?.title || data?.title || '' };
        throw new Error('empty');
      },
    },
    {
      name: 'widipe',
      get: async () => {
        const { data } = await axios.get(`https://api.widipe.com/download/ytmp3?url=${enc}`, { timeout: 25000 });
        const r = data?.result || data;
        const u = r?.download_url || r?.url || r?.audio;
        if (u) return { url: u, title: r?.title || '' };
        throw new Error('empty');
      },
    },
  ];
  let lastErr = null;
  for (const p of providers) {
    try {
      const out = await p.get();
      if (out?.url && /^https?:\/\//.test(out.url)) return { ...out, via: p.name };
    } catch (e) { lastErr = e; }
  }
  // Final fallback: Cobalt-style (no key) — returns a stream URL for the video page.
  if (videoId) {
    try {
      const { data } = await axios.post('https://cobalt-api.kwiatekmiki.com/api/json',
        { url: videoUrl, isAudioOnly: true, aFormat: 'mp3' },
        { timeout: 25000, headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });
      if (data?.url) return { url: data.url, title: '', via: 'cobalt' };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('all audio endpoints down');
}

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

    // Resolve video: direct link or search
    let video = null;
    const directId = ytIdOf(query);
    if (directId) {
      video = { url: `https://www.youtube.com/watch?v=${directId}`, title: query, timestamp: '', views: 0, author: { name: 'YouTube' }, thumbnail: `https://i.ytimg.com/vi/${directId}/hqdefault.jpg` };
    } else {
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
    }

    await sock.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    await sock.sendMessage(
      m.chat,
      {
        text: [
          `⊛ ${ui.fonts.bold('SONG FOUND')}`,
          `${ui.fonts.smallCaps('title')}    ⟶ ${String(video.title || query).slice(0, 70)}`,
          video.timestamp ? `${ui.fonts.smallCaps('duration')} ⟶ ${video.timestamp}` : null,
          video.views ? `${ui.fonts.smallCaps('views')}    ⟶ ${Number(video.views).toLocaleString()}` : null,
          `${ui.fonts.smallCaps('channel')}  ⟶ ${video.author?.name || 'Unknown'}`,
          `${ui.fonts.smallCaps('status')}   ⟶ downloading...`,
          '',
          ui.footer(),
        ].filter(Boolean).join('\n'),
        edit: searchingMsg.key,
      }
    );

    await sock.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });

    let data;
    try {
      data = await fetchAudioUrl(video.url, ytIdOf(video.url));
    } catch (e) {
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return fail('Download failed', 'All audio services are busy right now. Try again in a minute or use .song with a different title.');
    }

    await sock.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });

    await sock.sendMessage(
      m.chat,
      {
        text: [
          `♫ ${ui.fonts.bold('READY TO PLAY')}`,
          `${ui.fonts.smallCaps('title')} ⟶ ${data.title || video.title}`,
          `${ui.fonts.smallCaps('link')}  ⟶ ${video.url}`,
          `${ui.fonts.smallCaps('via')}   ⟶ ${data.via || 'cdn'}`,
          '',
          ui.footer(),
        ].join('\n'),
        edit: searchingMsg.key,
      }
    );

    try {
      await sock.sendMessage(
        m.chat,
        {
          audio: { url: data.url },
          mimetype: 'audio/mpeg',
          fileName: `${String(data.title || video.title || 'song').substring(0, 50)}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: ui.fonts.bold('XADON AI MUSIC'),
              body: String(video.title || 'Now playing').slice(0, 40),
              thumbnailUrl: video.thumbnail,
              sourceUrl: 'https://whatsapp.com/channel/0029Vb7ACifD38Cb7Jlj5w3B',
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: m.raw }
      );
    } catch (e) {
      // If URL send fails (expired link), try piping bytes through the bot
      try {
        const res = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
        const buf = Buffer.from(res.data);
        await sock.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg', fileName: `${String(data.title || video.title || 'song').substring(0, 50)}.mp3` }, { quoted: m.raw });
      } catch (e2) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return fail('Send failed', `Got the audio link but WhatsApp refused it. Watch here instead: ${video.url}`);
      }
    }

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
