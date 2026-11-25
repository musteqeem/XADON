// XADON · tourl — upload replied media and get a shareable link (catbox.moe, no key).
const axios = require('axios');
module.exports = {
  name: 'tourl',
  alias: ['tourlink', 'uploadurl', 'catbox'],
  desc: 'Upload replied media, get a link',
  usage: '.tourl (reply to image/video/audio/document/sticker)',
  category: 'tools',
  async run({ sock, m, reply, ui }) {
    const q = m.quoted;
    if (!q?.isMedia) return reply(ui.notice('info', 'To URL', 'Reply to an image, video, audio, document or sticker with .tourl'));
    let buf;
    try { buf = await q.download(); }
    catch (e) { return reply(ui.notice('error', 'Download failed', String(e.message || e).slice(0, 200))); }
    if (!buf?.length) return reply(ui.notice('error', 'Download failed', 'Got an empty file. Try again.'));
    if (buf.length > 190 * 1024 * 1024) return reply(ui.notice('error', 'Too big', 'That file is over the 190MB upload limit.'));
    const inner = q.message?.[q.type] || {};
    const extOf = () => {
      const fn = String(inner.fileName || '');
      const mExt = fn.match(/\.([a-z0-9]{2,5})$/i);
      if (mExt) return mExt[1].toLowerCase();
      if (q.type === 'imageMessage') return (inner.mimetype || '').includes('png') ? 'png' : 'jpg';
      if (q.type === 'videoMessage') return 'mp4';
      if (q.type === 'audioMessage') return (inner.mimetype || '').includes('mp4') ? 'm4a' : 'ogg';
      if (q.type === 'stickerMessage') return 'webp';
      return 'bin';
    };
    const mimeOf = () => inner.mimetype || 'application/octet-stream';
    const ext = extOf();
    try {
      await sock.sendMessage(m.chat, { react: { text: '⬆️', key: m.key } }).catch(() => {});
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', new Blob([buf], { type: mimeOf() }), `xadon-${Date.now()}.${ext}`);
      const { data } = await axios.post('https://catbox.moe/user/api.php', form, { timeout: 90_000, maxBodyLength: Infinity });
      const url = String(data || '').trim();
      if (!/^https?:\/\//.test(url)) throw new Error('Upload rejected: ' + url.slice(0, 120));
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {});
      try {
        const { sendCopyCard } = require('../../lib/rich');
        await sendCopyCard(sock, m.chat, { text: `◈ FILE LINK ⟶\n${url}\n(${(buf.length / 1024).toFixed(0)} KB · .${ext})`, copyText: url, footer: ui.footer(), quoted: m.raw });
      } catch { await reply(`${url}`); }
    } catch (e) {
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {});
      return reply(ui.notice('error', 'Upload failed', String(e.message || e).slice(0, 250)));
    }
  },
};
