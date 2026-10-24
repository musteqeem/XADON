// XADON AI · save — save quoted/recent media to your DM (also keeps chats tidy).
module.exports = {
  name: 'save',
  alias: ['savemsg', 'keep'],
  desc: 'Forward quoted media to your DM',
  usage: 'reply to media with .save',
  category: 'extra',
  async run({ sock, m, reply, ui, fail }) {
    const q = m.quoted;
    const src = (m.isMedia ? m : q && q.isMedia ? q : null);
    if (!src) return fail('Nothing to save', 'Reply to a photo, video, sticker, audio or document with .save.');
    try {
      const buf = await src.download();
      const t = src.type;
      const dest = m.sender;
      if (t === 'imageMessage') await sock.sendMessage(dest, { image: buf, caption: (src.body || '').slice(0, 500) || 'saved' });
      else if (t === 'videoMessage') await sock.sendMessage(dest, { video: buf, caption: (src.body || '').slice(0, 500) || 'saved' });
      else if (t === 'stickerMessage') await sock.sendMessage(dest, { sticker: buf });
      else if (t === 'audioMessage') await sock.sendMessage(dest, { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true });
      else await sock.sendMessage(dest, { document: buf, mimetype: 'application/octet-stream', fileName: 'saved.bin' });
      return reply(ui.notice('success', 'Saved', 'Sent to your DM.'));
    } catch { return fail('Save failed', 'Could not download that media.'); }
  },
};
