module.exports = {
  name: 'joke',
  alias: ['laugh', 'funny'],
  desc: 'Random joke',
  async run({ reply, ui }) {
    const { fonts } = ui;
    const fallback = ['Why do programmers prefer dark mode? Because light attracts bugs.', 'Why did the phone wear glasses? It lost its contacts.'];
    try {
      const j = await fetch('https://official-joke-api.appspot.com/random_joke').then((r) => r.json());
      await reply([`◉ ${fonts.bold('XADON JOKE')}`, '', fonts.italic(j.setup || fallback[0]), fonts.bold(j.punchline || fallback[1]), '', ui.footer()].join('\n'));
    } catch { await reply(`◉ ${fonts.bold('XADON JOKE')}\n\n${fallback[0]}\n\n${ui.footer()}`); }
  },
};
