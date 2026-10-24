// XADON AI · forward — forward a quoted message to someone.
module.exports = {
  name: 'forward',
  alias: ['fwd'],
  desc: 'Forward quoted message to a user',
  usage: 'reply + .forward @user|number',
  category: 'extra',
  async run({ sock, m, args, reply, ui, fail, target }) {
    if (!m.quoted) return fail('Reply first', 'Reply to the message you want to forward.');
    const jid = target();
    if (!jid) return fail('Who?', 'Mention, reply, or give a number: .forward @user');
    try {
      const q = m.quoted;
      const body = q.body || '';
      if (q.isMedia) {
        const buf = await q.download();
        const t = q.type;
        if (t === 'imageMessage') await sock.sendMessage(jid, { image: buf, caption: body.slice(0, 1000) });
        else if (t === 'videoMessage') await sock.sendMessage(jid, { video: buf, caption: body.slice(0, 1000) });
        else if (t === 'stickerMessage') await sock.sendMessage(jid, { sticker: buf });
        else if (t === 'audioMessage') await sock.sendMessage(jid, { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true });
        else await sock.sendMessage(jid, { text: body || '[media]' });
      } else {
        await sock.sendMessage(jid, { text: body || '[empty]', contextInfo: { forwardingScore: 1, isForwarded: true } });
      }
      return reply(ui.notice('success', 'Forwarded', `Sent to @${jid.split('@')[0]}.`));
    } catch { return fail('Forward failed', 'Could not forward that message.'); }
  },
};
