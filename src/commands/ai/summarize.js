/** XADON AI summarize — condenses quoted/long text using the configured AI provider. */
const ai = require('../../lib/ai');
module.exports = {
  name: 'summarize',
  alias: ['sum', 'summary', 'tl;dr'],
  desc: 'Summarize long text with AI',
  usage: '.summarize <text>  |  reply with .summarize',
  async run({ m, text, reply, ui, prefix }) {
    const { fonts } = ui;
    const input = text || m.quoted?.body;
    if (!input) return reply(ui.notice('info', 'Summarize', `${fonts.mono(`${prefix}summarize <long text>`)} ${fonts.smallCaps('or reply to a message')}`));
    if (input.length < 40) return reply(ui.notice('warn', 'Too short', 'Give me a longer text to summarize.'));
    try {
      const { answer, provider } = await ai.ask(`${m.chat}:sum`, `Summarize this in 5 short bullet points, plain text, no emojis:\n\n${input.slice(0, 5000)}`);
      await reply([`⟢ ${fonts.bold('XADON SUMMARY')}  ${fonts.smallCaps(`· ${provider}`)}`, ui.DOTS, '', answer, '', ui.footer()].join('\n'));
    } catch (e) { await reply(ui.notice('error', 'AI offline', String(e.message).slice(0, 250))); }
  },
};
