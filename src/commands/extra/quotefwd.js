// XADON V7 · quotefwd — forward the quoted message onward.
module.exports = {
  name: 'quotefwd', alias: ['fwdquote', 'resendquote'], desc: 'Forward a quoted message', usage: 'reply with .quotefwd [@number]', category: 'extra',
  async run({ sock, m, args, reply, ui, target }) {
    if (!m.quoted?.body && !m.quoted?.isMedia) return reply(ui.notice('info', 'Forward quote', 'Reply to a message with .quotefwd'));
    const dest = target() || m.chat;
    try {
      if (m.quoted.isMedia) {
        const buf = await m.quoted.download();
        const kind = m.quoted.type === 'imageMessage' ? 'image' : m.quoted.type === 'videoMessage' ? 'video' : m.quoted.type === 'audioMessage' ? 'audio' : 'document';
        const payload = kind === 'image' ? { image: buf, caption: (m.quoted.body || '').slice(0, 500) } : kind === 'video' ? { video: buf, caption: (m.quoted.body || '').slice(0, 500) } : kind === 'audio' ? { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: false } : { document: buf, mimetype: 'application/octet-stream', fileName: 'forwarded.bin' };
        await sock.sendMessage(dest, payload);
      } else {
        await sock.sendMessage(dest, { text: m.quoted.body.slice(0, 4000) });
      }
      if (dest !== m.chat) await reply(ui.notice('success', 'Forwarded', 'Quote forwarded.'));
    } catch { return reply(ui.notice('error', 'Forward failed', 'Could not forward that quote.')); }
  },
};
