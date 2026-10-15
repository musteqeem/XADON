/**
 * XADON V3 · YOUTUBE / PLAY ENGINE (no API key)
 * .play <song name or youtube link> → real audio in chat.
 *
 * Strategy (all free, no key):
 *  1. If input is a YouTube URL → try direct audio APIs.
 *  2. Else search YouTube via Invidious/Piped public instances + YouTube oEmbed fallback,
 *     resolve best videoId, then fetch audio download link from public Cobalt-style
 *     endpoints (ordered fallbacks). If every downloader is down, reply with rich
 *     watch/listen buttons so the song is still one tap away.
 */
const YT_ID = (u = '') => {
  const m = String(u).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};

async function jget(url, opts = {}) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 XADON-AI/3.0' }, ...opts });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function searchYouTube(query, limit = 5) {
  const q = encodeURIComponent(query);
  const instances = [
    `https://invidious.snopyta.org/api/v1/search?q=${q}&type=video&page=1`,
    `https://vid.puffyan.us/api/v1/search?q=${q}&type=video&page=1`,
    `https://inv.inproject.xyz/api/v1/search?q=${q}&type=video&page=1`,
  ];
  for (const u of instances) {
    try {
      const j = await jget(u);
      const vids = (Array.isArray(j) ? j : []).filter((v) => v.videoId).slice(0, limit).map((v) => ({
        id: v.videoId, title: v.title || 'Unknown', author: v.author || '', duration: v.lengthSeconds || 0,
        url: `https://www.youtube.com/watch?v=${v.videoId}`
      }));
      if (vids.length) return vids;
    } catch { /* next instance */ }
  }
  // Final fallback: Piped
  try {
    const j = await jget(`https://pipedapi.kavin.rocks/search?q=${q}&filter=videos`);
    const items = (j?.items || []).slice(0, limit).map((v) => ({
      id: (v.url || '').split('v=')[1] || '', title: v.title || 'Unknown',
      author: v.uploaderName || '', duration: v.duration || 0,
      url: `https://www.youtube.com${v.url || ''}`
    })).filter((v) => v.id);
    if (items.length) return items;
  } catch { /* ignore */ }
  return [];
}

async function resolveAudio(youtubeUrl) {
  const encoded = encodeURIComponent(youtubeUrl);
  // Ordered free download endpoints (first success wins)
  const tries = [
    async () => {
      const j = await jget(`https://api.davidcyriltech.my.id/download/ytmp3?url=${encoded}`);
      const u = j?.result?.download_url || j?.result?.url || j?.url;
      if (u) return { url: u, title: j?.result?.title || '' };
      throw new Error('dc1 empty');
    },
    async () => {
      const j = await jget(`https://apis.davidcyriltech.my.id/download/ytmp3?url=${encoded}`);
      const u = j?.result?.download_url || j?.result?.url || j?.url;
      if (u) return { url: u, title: j?.result?.title || '' };
      throw new Error('dc2 empty');
    },
    async () => {
      const j = await jget(`https://api.neoxr.eu/api/youtube?url=${encoded}&type=audio&apikey=demo`);
      const u = j?.data?.url || j?.url;
      if (u) return { url: u, title: j?.data?.title || '' };
      throw new Error('neoxr empty');
    },
  ];
  let last = null;
  for (const fn of tries) {
    try { return await fn(); } catch (e) { last = e; }
  }
  throw last || new Error('all audio endpoints down');
}

module.exports = { YT_ID, searchYouTube, resolveAudio };
