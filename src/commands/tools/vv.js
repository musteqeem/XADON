/** XADON · .vv — view-once opener (fixed "media key not found"). */
const KIND = { imageMessage: 'image', videoMessage: 'video', audioMessage: 'audio' };

module.exports = {
  name: 'viewonce',
  alias: ['vv', 'vvopen'],
  desc: 'Open view once media',
  usage: 'reply to a view once photo/video with .vv',
  async run({ sock, m, ui, fail }) {
    const q = m.quoted;
    if (!q) return fail('Reply to view once', 'Reply to a view once photo, video or voice note with .vv');
    let res;
    try {
      const { downloadViewOnce } = require('../../lib/viewonce');
      res = await downloadViewOnce(sock, m);
    } catch (e) {
      return fail('Could not open', String(e.message || e).slice(0, 300));
    }
    const kind = KIND[res.kind] || 'image';
    const originalCaption = res.inner?.caption || q.message?.[q.type]?.caption || '';
    const caption = [
      `◎ ${ui.fonts.bold('VIEW ONCE REVEALED')}`,
      `${ui.fonts.smallCaps('kind')} ⟶ ${ui.fonts.mono(kind)}`,
      originalCaption ? `\n${originalCaption}` : '',
      '',
      ui.footer(),
    ].join('\n');
    try {
      const payload = kind === 'audio'
        ? { audio: res.buf, mimetype: res.inner?.mimetype || 'audio/ogg; codecs=opus', ptt: !!res.inner?.ptt }
        : { [kind]: res.buf, caption };
      await sock.sendMessage(m.chat, payload, { quoted: m.raw });
    } catch (e) {
      return fail('Send failed', String(e.message || e).slice(0, 200));
    }
  },
};
