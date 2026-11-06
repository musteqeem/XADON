/** XADON V9 · audiosave — reply to any voice note/audio, get it back as a file + playable copy. */
module.exports = {
  name: 'audiosave',
  alias: ['saveaudio', 'vnfile'],
  desc: 'Save quoted audio as a file',
  usage: '.audiosave (reply to a voice note)',
  category: 'xadon9',
  async run({ sock, m, reply, ui }) {
    const target = m.quoted?.type?.includes('audio') ? m.quoted : m.type?.includes('audio') ? m : null;
    if (!target) return reply(ui.notice('info', 'Audio save', 'Reply to a voice note or audio file with .audiosave'));
    try {
      const buf = await target.download();
      const name = `audio-${Date.now()}.ogg`;
      await sock.sendMessage(m.chat, { document: buf, mimetype: 'audio/ogg; codecs=opus', fileName: name, caption: `◈ 𝗔𝗨𝗗𝗜𝗢 𝗦𝗔𝗩𝗘𝗗 ⟶ ${name}\n\n${ui.footer()}` }, { quoted: m.raw });
    } catch (e) {
      return reply(ui.notice('error', 'Failed', String(e.message || e).slice(0, 200)));
    }
  },
};
