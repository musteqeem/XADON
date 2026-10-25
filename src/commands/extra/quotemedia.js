// XADON V7 · quotemedia — re-send media from inside a quote (even nested).
const rawstore = require('../../lib/rawstore');
module.exports = {
  name: 'quotemedia', alias: ['getmedia', 'quotem'], desc: 'Re-send media hidden in a quote', usage: 'reply to a message with .quotemedia', category: 'extra',
  async run({ sock, m, reply, ui }) {
    if (!m.quoted) return reply(ui.notice('info', 'Quote media', 'Reply to a message with .quotemedia'));
    // 1) direct quote is media -> use live downloader
    if (m.quoted.isMedia) {
      try {
        const buf = await m.quoted.download();
        const kind = m.quoted.type === 'imageMessage' ? 'image' : m.quoted.type === 'videoMessage' ? 'video' : m.quoted.type === 'audioMessage' ? 'audio' : 'document';
        const payload = kind === 'image' ? { image: buf, caption: (m.quoted.body || '').slice(0, 500) } : kind === 'video' ? { video: buf, caption: (m.quoted.body || '').slice(0, 500) } : kind === 'audio' ? { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: !!m.quoted.message?.audioMessage?.ptt } : { document: buf, mimetype: 'application/octet-stream', fileName: 'quoted.bin' };
        return sock.sendMessage(m.chat, payload, { quoted: m.raw });
      } catch {}
    }
    // 2) nested media inside the raw payload
    try {
      const raw = rawstore.get(m.chat, m.quoted.id);
      const B = require('@musteqeem/baileys');
      const inner = raw?.message; const type = B.getContentType(inner);
      const mediaMsg = inner?.[type];
      const kind = { imageMessage: 'image', videoMessage: 'video', audioMessage: 'audio', documentMessage: 'document', stickerMessage: 'sticker' }[type];
      if (!kind || typeof B.downloadContentFromMessage !== 'function') throw new Error('no nested media');
      let buf = Buffer.alloc(0);
      for await (const chunk of await B.downloadContentFromMessage(mediaMsg, kind === 'sticker' ? 'sticker' : kind)) buf = Buffer.concat([buf, chunk]);
      if (kind === 'image') return sock.sendMessage(m.chat, { image: buf, caption: mediaMsg.caption || '' }, { quoted: m.raw });
      if (kind === 'video') return sock.sendMessage(m.chat, { video: buf, caption: mediaMsg.caption || '', gifPlayback: !!mediaMsg.gifPlayback }, { quoted: m.raw });
      if (kind === 'audio') return sock.sendMessage(m.chat, { audio: buf, mimetype: mediaMsg.mimetype || 'audio/ogg; codecs=opus', ptt: !!mediaMsg.ptt }, { quoted: m.raw });
      if (kind === 'document') return sock.sendMessage(m.chat, { document: buf, mimetype: mediaMsg.mimetype || 'application/octet-stream', fileName: mediaMsg.fileName || 'quoted.bin' }, { quoted: m.raw });
      if (kind === 'sticker') return sock.sendMessage(m.chat, { sticker: buf }, { quoted: m.raw });
    } catch {}
    return reply(ui.notice('info', 'No media', 'No downloadable media found in that quote.'));
  },
};
