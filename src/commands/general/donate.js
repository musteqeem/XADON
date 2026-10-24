module.exports = {
const botstate = require('../../lib/botstate');
  name: 'donate',
  alias: ['supportus', 'sponsor'],
  desc: 'Support XADON AI',
  async run({ reply, ui, config }) {
    const { fonts } = ui;
    await reply(ui.card({
      icon: '♦',
      title: 'Donate',
      subtitle: 'keep xadon ai alive',
      rows: [
        ['project', fonts.bold(botstate.botName())],
        ['owner', fonts.bold(config.ownerName)],
      ],
      body: `${fonts.italic('Your support keeps the bot free and online.')}\n${fonts.smallCaps('message the owner with')} ${fonts.mono('.owner')} ${fonts.smallCaps('to donate')}`,
    }));
  },
};
