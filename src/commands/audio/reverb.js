// XADON V8 · AUDIO reverb — hall reverb (ffmpeg, passthrough fallback).
const { execFile } = require('child_process');
module.exports = {
  name: 'reverb', alias: ['hall', 'echo2'],
  desc: 'Hall reverb audio',
  usage: 'Reply to a voice note with .reverb',
  category: 'audio',
  async run({ sock, m, reply, ui }) {
    const { fonts } = ui;
    const q = m.quoted && /audio|voice/i.test(m.quoted.type + ' ' + (m.quoted.message?.audioMessage?.ptt ? 'ptt' : '')) ? m.quoted : (/audio/i.test(m.type) ? m : null);
    if (!q) return reply(ui.notice('info', 'Reverb', `${fonts.mono('.reverb')}${fonts.smallCaps(' — reply to a voice note or audio')}`));
    try {
      const buf = await q.download();
      const fs = require('fs'), os = require('os'), path = require('path');
      const inp = path.join(os.tmpdir(), `xadon_${Date.now()}_in.ogg`);
      const out = path.join(os.tmpdir(), `xadon_${Date.now()}_out.ogg`);
      fs.writeFileSync(inp, buf);
      const ok = await new Promise((res) => execFile('ffmpeg', ['-y', '-i', inp, '-af', 'aecho=0.8:0.9:180:0.3,aecho=0.7:0.8:380:0.25', out], () => res(require('fs').existsSync(out))));
      const finalBuf = ok ? require('fs').readFileSync(out) : buf;
      try { require('fs').unlinkSync(inp); } catch {}
      try { if (ok) require('fs').unlinkSync(out); } catch {}
      await sock.sendMessage(m.chat, { audio: finalBuf, mimetype: 'audio/ogg; codecs=opus', ptt: true, contextInfo: {} }, { quoted: m.raw });
      return reply(ui.card({ icon: '♪', title: 'reverb ' + (ok ? 'applied' : 'passthrough'), subtitle: 'hall echo', rows: [['engine', fonts.mono(ok ? 'ffmpeg' : 'direct')]], body: ui.footer() }));
    } catch { return reply(ui.notice('error', 'Audio failed', 'Could not process that audio.')); }
  },
};
