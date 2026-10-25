// XADON V7 · stickerfx — sticker-with-audio test payload.
module.exports = {
  name: 'stickerfx', alias: ['sticketestaudio', 'stickerx'], desc: 'Sticker + embedded audio test', usage: '.stickerfx (reply to a sticker)', category: 'owner', owner: true,
  async run({ sock, m, reply, ui }) {
    try {
      let buf = null;
      if (m.quoted?.type === 'stickerMessage') buf = await m.quoted.download().catch(() => null);
      if (!buf) {
        const sharp = require('sharp');
        buf = await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 168, b: 132, alpha: 1 } } }).webp({ quality: 90 }).toBuffer();
      }
      try {
        await sock.sendMessage(m.chat, { sticker: buf, stickerAudio: { url: 'https://cdn.pixabay.com/audio/test.mp3' } }, { quoted: m.raw });
      } catch { await sock.sendMessage(m.chat, { sticker: buf }, { quoted: m.raw }); }
      return reply(ui.notice('success', 'Sticker sent', 'Sticker (+audio where supported) delivered.'));
    } catch (e) { return reply(ui.notice('error', 'Sticker FX failed', String(e.message || e).slice(0, 200))); }
  },
};
