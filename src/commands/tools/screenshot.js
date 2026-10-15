/** XADON screenshot — free WordPress mShots preview. */
module.exports = {
  name: 'screenshot',
  alias: ['ss', 'webshot', 'snap'],
  desc: 'Screenshot any website',
  usage: '.screenshot <url>',
  async run({ sock, m, args, reply, ui, prefix }) {
    const { fonts } = ui;
    let url = (args[0] || m.quoted?.body || '').trim();
    if (!url) return reply(ui.notice('info', 'Webshot', `${fonts.mono(`${prefix}screenshot github.com`)}`));
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const shot = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1280`;
    await sock.sendMessage(m.chat, { image: { url: shot }, caption: `◉ ${fonts.bold('WEBSHOT')}\n${fonts.smallCaps('site')} ⟶ ${fonts.mono(url.slice(0, 120))}\n\n${ui.footer()}` }, { quoted: m.raw });
  },
};
