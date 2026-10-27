const botstate = require('../../lib/botstate');
module.exports = {
  name: 'support',
  alias: ['helpdesk', 'contact'],
  desc: 'Get support links',
  async run({ reply, ui, config }) {
    const { fonts } = ui;
    await reply(ui.card({
      icon: '♡',
      title: 'Support',
      subtitle: 'we are here to help',
      rows: [
        ['bot', fonts.bold(botstate.botName())],
        ['owner', fonts.bold(config.ownerName)],
        ['website', fonts.mono(config.links.website)],
      ],
      body: `${fonts.italic('Need commands? Use')} ${fonts.mono('.menu')}\n${fonts.italic('Meet the owner? Use')} ${fonts.mono('.owner')}`,
    }));
  },
};
