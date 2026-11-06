/** XADON V9 · styletext — turn any text into 8 fancy font styles at once. */
module.exports = {
  name: 'styletext',
  alias: ['fancymaker', 'textfx'],
  desc: 'Restyle text in fancy fonts',
  usage: '.styletext <text>  (or reply with .styletext)',
  category: 'xadon9',
  async run({ m, text, reply, ui, prefix }) {
    const fonts = require('../../lib/fonts');
    const input = (text || m.quoted?.body || '').trim().slice(0, 80);
    if (!input) return reply(ui.notice('info', 'Style text', `Usage: ${prefix}styletext hello boss`));
    const styles = ['bold', 'serif', 'italic', 'mono', 'fullwidth', 'circled', 'upside', 'strike'];
    const lines = styles.map((s, i) => {
      let out = input;
      try { out = (typeof fonts[s] === 'function' ? fonts[s](input) : fonts.get(s)(input)); } catch {}
      return `${i + 1}. ${out}`;
    });
    return reply(ui.card({ icon: '◈', title: 'Font styles', subtitle: input.slice(0, 40), rows: [], body: lines.join('\n') }));
  },
};
