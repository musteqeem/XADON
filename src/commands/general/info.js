module.exports = {
const botstate = require('../../lib/botstate');
  name: 'info',
  alias: ['about', 'xadon'],
  desc: 'About XADON AI',
  async run({ reply, ui, config, db, prefix, loader }) {
    const { fonts } = ui;
    const text = ui.card({
      icon: '✦',
      title: botstate.botName(),
      subtitle: 'xadon ai v2 · premium engine',
      rows: [
        ['version', fonts.mono(`v${config.version}`)],
        ['prefix', `「 ${prefix} 」`],
        ['mode', fonts.smallCaps(db.get('mode', config.mode))],
        ['commands', fonts.bold(String(loader.commands.size))],
        ['uptime', fonts.mono(ui.duration(process.uptime() * 1000))],
        ['owner', fonts.bold(config.ownerName)],
      ],
      body: `${fonts.italic('AI · group tools · media · fun · utilities.')}\n${fonts.mono(`${prefix}menu`)} ${fonts.smallCaps('to explore everything')}`,
    });
    await reply(text);
  },
};
