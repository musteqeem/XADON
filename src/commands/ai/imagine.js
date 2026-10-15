/** XADON AI imagine — free Pollinations image generation, no API key. */
module.exports = {
  name: 'imagine',
  alias: ['img', 'genimg', 'draw'],
  desc: 'Generate an image with AI',
  usage: '.imagine a lion wearing a crown',
  async run({ sock, m, text, reply, ui, prefix, fail }) {
    const { fonts } = ui;
    const prompt = text || m.quoted?.body;
    if (!prompt) return reply(ui.notice('info', 'Imagine', `${fonts.mono(`${prefix}imagine a futuristic city at sunset`)}`));
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 400))}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
    try {
      await sock.sendMessage(m.chat, { image: { url }, caption: [`⟢ ${fonts.bold('XADON IMAGINE')}`, `${fonts.smallCaps('prompt')} ⟶ ${fonts.italic(prompt.slice(0, 300))}`, '', ui.footer()].join('\n') }, { quoted: m.raw });
    } catch (e) { return fail('Generation failed', 'The image service is busy. Try again in a minute.'); }
  },
};
