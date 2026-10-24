// XADON AI · togif — quoted video becomes a GIF (Baileys gifPlayback flag, no ffmpeg).
module.exports = {
  name: 'togif',
  alias: ['gif', 'videogif'],
  desc: 'Convert a short video to GIF',
  usage: 'reply to a video with .togif',
  category: 'extra',
  async run({ sock, m, reply, ui, fail }) {
    const src = m.type === 'videoMessage' ? m : m.quoted?.type === 'videoMessage' ? m.quoted : null;
    if (!src) return fail('Reply to a video', 'Reply to a short video with .togif.');
    try {
      const buf = await src.download();
      await sock.sendMessage(m.chat, { video: buf, gifPlayback: true, caption: (src.body || '').slice(0, 300) }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'GIF failed', 'Could not convert that video.')); }
  },
};
