// XADON AI · AUDIO — premium unicode card, no emojis.
const { execFile } = require('child_process');
module.exports = {
  name: 'bass',
  alias: ['bassx'],
  desc: 'Deep bass tag',
  usage: 'Reply to a voice note with .bass',
  category: 'audio',
  async run({ sock, m, reply, ui }) {
    const { fonts } = ui;
    const q = m.quoted && /audio|voice/i.test(m.quoted.type + ' ' + (m.quoted.message?.audioMessage?.ptt ? 'ptt' : '')) ? m.quoted : (/audio/i.test(m.type) ? m : null);
    if (!q) return reply(ui.notice('info', 'Deep bass tag', `${fonts.mono('.bass')}${fonts.smallCaps(' — reply to a voice note or audio')}`));
    try {
      const buf = await q.download();
      const fs = require('fs'), os = require('os'), path = require('path');
      const inp = path.join(os.tmpdir(), `xadon_${Date.now()}_in.ogg`);
      const out = path.join(os.tmpdir(), `xadon_${Date.now()}_out.ogg`);
      fs.writeFileSync(inp, buf);
      const ok = await new Promise((res) => execFile('ffmpeg', ['-y', '-i', inp, '-af equalizer=f=60:width_type=o:width=2:g=12'.split(' '), out].flat(), () => res(require('fs').existsSync(out))));
      const finalBuf = ok ? require('fs').readFileSync(out) : buf;
      try { require('fs').unlinkSync(inp); } catch {}
      try { if (ok) require('fs').unlinkSync(out); } catch {}
      await sock.sendMessage(m.chat, { audio: finalBuf, mimetype: 'audio/ogg; codecs=opus', ptt: true, contextInfo: {} }, { quoted: m.raw });
      return reply(ui.card({ icon: '♪', title: 'bass ' + (ok ? 'applied' : 'passthrough'), subtitle: 'deep bass tag', rows: [['engine', fonts.mono(ok ? 'ffmpeg' : 'direct')]], body: ui.footer() }));
    } catch { return reply(ui.notice('error', 'Audio failed', 'Could not process that audio.')); }
  },
};
