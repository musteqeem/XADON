const axios = require('axios');

function extractOgImage(html) {
    const patterns = [
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
        /<meta[^>]*property=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']twitter:image["']/i,
        /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    ];
    for (const p of patterns) {
        const m = html.match(p);
        if (m && m[1] && m[1].startsWith('http')) return m[1];
    }
    return null;
}

async function downloadBuffer(url) {
    try {
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 8000
        });
        return Buffer.from(res.data);
    } catch { return null; }
}

async function getFaviconBuffer(url) {
    try {
        const domain = new URL(url).origin;
        const res = await axios.get(`https://www.google.com/s2/favicons?sz=256&domain_url=${domain}`, {
            responseType: 'arraybuffer',
            timeout: 8000
        });
        return Buffer.from(res.data);
    } catch { return null; }
}

// GOOD API - Bing Search Scraper + DuckDuckGo Fallback
async function bingSearch(query) {
    const results = [];
    try {
        const res = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(query)}&mkt=en-US`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 15000
        });

        const html = res.data;
        // Parse Bing results: <li class="b_algo"> <h2><a href="URL">Title</a>
        const regex = /<li class="b_algo"[^>]*>[\s\S]*?<h2[^>]*><a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = regex.exec(html)) !== null && results.length < 10) {
            const url = match[1];
            const title = match[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
            if (url && title && !url.includes('bing.com') && !results.find(r => r.url === url)) {
                results.push({ title, url });
            }
        }
    } catch (e) {
        console.log('Bing search failed:', e.message);
    }

    // Fallback to DuckDuckGo API if Bing fails
    if (results.length === 0) {
        try {
            const res = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1&no_redirect=1`, {
                timeout: 10000
            });
            const data = res.data;
            if (data.Results && data.Results.length) {
                data.Results.slice(0, 10).forEach(r => {
                    if (r.FirstURL && r.Text) results.push({ title: r.Text, url: r.FirstURL });
                });
            }
            if (data.RelatedTopics) {
                data.RelatedTopics.slice(0, 10).forEach(r => {
                    if (r.FirstURL && r.Text && !results.find(x => x.url === r.FirstURL)) {
                        results.push({ title: r.Text.slice(0, 80), url: r.FirstURL });
                    }
                });
            }
        } catch {}
    }

    return results;
}

module.exports = {
  name: 'chrome',
  alias: ['get', 'search', 'web', 'google'],
  desc: 'Advanced web search with detailed results',
  usage: '.chrome <query>',
  category: 'search',
  async run({ sock, m, ui, args, fail }) {
    const query = args.join(' ').trim();
    if (!query) {
      return fail(
        'What should I search?',
        `Usage: ${ui.fonts.mono('.chrome ai news')}\n${ui.fonts.mono('.chrome javascript tutorial')}`
      );
    }

    await sock.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    let results;
    try {
      results = await bingSearch(query);
      if (!results || results.length === 0) {
        await sock.sendMessage(m.chat, { react: { text: '❔', key: m.key } });
        return fail('No results found', `No results for ${ui.fonts.mono(query)} - Try different keywords`);
      }
    } catch (e) {
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return fail('Search failed', e.message);
    }

    const selected = results.slice(0, 8);

    // Fetch pages for content + og:image
    const pages = await Promise.all(
      selected.map(r =>
        axios.get(r.url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 6000
        }).then(res => res.data).catch(() => null)
      )
    );

    let textLines = [];
    textLines.push(`⌬ ${ui.fonts.bold(`SEARCH RESULTS`)}`);
    textLines.push(`${ui.fonts.smallCaps('query')} ⟶ ${ui.fonts.mono(query)}`);
    textLines.push(`${ui.fonts.smallCaps('found')} ⟶ ${selected.length} results`);
    textLines.push('');
    
    selected.forEach((r, i) => {
      let snippet = '';
      if (pages[i]) {
        snippet = pages[i]
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 150);
      }
      textLines.push(`${ui.fonts.bold(`${i + 1}.`)} ${r.title}`);
      textLines.push(`${ui.fonts.smallCaps('link')} ⟶ ${r.url}`);
      if (snippet) textLines.push(`${ui.fonts.smallCaps('desc')} ⟶ ${snippet}...`);
      textLines.push('');
    });
    textLines.push(ui.footer());

    // Thumbnail logic - og:image first
    let thumbnail = null;
    let ogImageUrl = null;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i]) {
        ogImageUrl = extractOgImage(pages[i]);
        if (ogImageUrl) break;
      }
    }

    if (ogImageUrl) thumbnail = await downloadBuffer(ogImageUrl);
    if (!thumbnail) thumbnail = await getFaviconBuffer(selected[0].url);

    const sourceUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

    await sock.sendMessage(
      m.chat,
      {
        text: textLines.join('\n'),
        contextInfo: {
          externalAdReply: {
            title: selected[0].title.slice(0, 50),
            body: `Top result for ${query}`,
            sourceUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
            thumbnail: thumbnail || undefined,
          },
        },
      },
      { quoted: m.raw }
    );

    await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
  },
};