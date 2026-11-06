/** XADON V9 · websnap — full screenshot of any website as a photo. */
module.exports = {
  name: 'websnap',
  alias: ['sitesnap', 'snapweb'],
  desc: 'Screenshot any website',
  usage: '.websnap <url>',
  category: 'xadon9',
  async run({ sock, m, text, reply, ui, prefix }) {
    let input = (text || m.quoted?.body || '').trim().split(/\s+/)[0] || '';
    if (!input) return reply(ui.notice('info', 'Webshot', `Usage: ${prefix}websnap google.com`));
    if (!/^https?:\/\//i.test(input)) input = `https://${input}`;
    const url = `https://image.thum.io/get/width/800/crop/900/${encodeURIComponent(input)}`;
    try {
      await sock.sendMessage(m.chat, { image: { url }, caption: `◈ 𝗪𝗘𝗕𝗦𝗛𝗢𝗧 ⟶ ${input.slice(0, 100)}\n\n${ui.footer()}` }, { quoted: m.raw });
    } catch {
      return reply(ui.notice('error', 'Snap failed', 'The screenshot service did not respond. Try again.'));
    }
  },
};
