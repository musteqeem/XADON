/** XADON AI · screenrecord — record any website as a clean MP4 (snapshot API). */
const axios = require('axios');

const SNAPSHOT_API = 'https://snapshot.xwolf.space/api';
const RECORD_ENDPOINT = `${SNAPSHOT_API}/record`;
const URL_PATTERN = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/g;

function normalizeUrl(value) {
  const candidate = String(value || '').trim().replace(/[),.;!?]+$/, '');
  if (!candidate) return null;
  const url = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch { return null; }
}
function extractUrls(sources) {
  return [...new Set((String(sources || '').match(URL_PATTERN) || []).map(normalizeUrl).filter(Boolean))];
}
function recordingViewport(command) {
  const n = String(command || '').toLowerCase();
  return (n === 'wssrmobile' || n === 'screenrecordmobile') ? 'mobile' : 'desktop';
}
async function downloadRecording(targetUrl, viewport = 'desktop', httpClient = axios) {
  const metaRes = await httpClient.get(RECORD_ENDPOINT, { params: { siteUrl: targetUrl, viewport }, timeout: 120000 });
  const metadata = metaRes?.data;
  if (!metadata || metadata.status === 'failed') throw new Error(metadata?.error || 'Snapshot could not record the site.');
  if (metadata.status && metadata.status !== 'completed') throw new Error(`Snapshot recording did not complete (status: ${metadata.status}).`);
  if (!metadata.videoUrl) throw new Error('Snapshot returned no video URL.');
  const videoUrl = new URL(metadata.videoUrl, `${SNAPSHOT_API}/`).toString();
  const videoRes = await httpClient.get(videoUrl, { responseType: 'arraybuffer', timeout: 120000, maxContentLength: 50 * 1024 * 1024, maxBodyLength: 50 * 1024 * 1024 });
  const ct = String(videoRes.headers?.['content-type'] || '').toLowerCase();
  if (ct && !ct.includes('video') && !ct.includes('octet-stream')) throw new Error(`Snapshot video endpoint returned ${ct}, not an MP4.`);
  const buffer = Buffer.from(videoRes.data);
  if (!buffer.length) throw new Error('Snapshot returned an empty video.');
  return buffer;
}

module.exports = {
  name: 'screenrecord',
  alias: ['wssr', 'screenrec', 'recordsite', 'wssrmobile', 'screenrecordmobile'],
  desc: 'Record a website and return a clean MP4 video',
  usage: '.screenrecord <link>  ·  .wssrmobile <link> (mobile viewport)',
  category: 'tools',
  async run({ sock, m, args, reply, prefix, ui }) {
    const used = String(m.body || '').trim().split(/\s+/)[0].replace(prefix, '').toLowerCase();
    const sources = [args.join(' '), m.quoted?.body || '', m.quoted?.text || '', m.quoted?.caption || ''].join(' ').trim();
    const urls = extractUrls(sources);
    if (!sources) return reply(ui.notice('info', 'Screen record', `${ui.fonts.mono(`${prefix}screenrecord https://example.com`)}`));
    if (!urls.length) return reply(ui.notice('error', 'No valid URLs', 'Reply to or type a valid website link.'));
    const viewport = recordingViewport(used);
    for (const targetUrl of urls.slice(0, 2)) {
      try {
        const buffer = await downloadRecording(targetUrl, viewport);
        await sock.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: 'website-screen-recording.mp4' }, { quoted: m.raw });
      } catch (e) { await reply(ui.notice('error', 'Record failed', `${targetUrl}\n${String(e.message || e).slice(0, 200)}`)); }
    }
  },
};
