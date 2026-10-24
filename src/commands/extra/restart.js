// XADON AI · restart — restart the bot process (host must auto-restart, e.g. panel/pm2).
module.exports = {
  name: 'restart',
  alias: ['reboot', 'rebootbot'],
  desc: 'Restart the bot',
  usage: '.restart',
  owner: true, category: 'extra',
  async run({ reply, ui }) {
    await reply(ui.notice('warn', 'Restarting', 'Back in a few seconds…'));
    setTimeout(() => process.exit(0), 1200);
  },
};
