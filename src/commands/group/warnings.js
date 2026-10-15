module.exports = {
  name: 'warnings',
  alias: ['warns', 'warnlist'],
  desc: 'Check member warnings',
  usage: '.warnings @user',
  group: true,
  async run({ reply, ui, target, m, db }) {
    const { fonts } = ui;
    const jid = target() || m.sender;
    const warns = db.get(`warns:${m.chat}:${jid}`, []);
    if (!warns.length) return reply(ui.notice('success', 'Clean record', `@${jid.split('@')[0]} has no warnings.`));
    await reply(ui.card({ icon: '⚠', title: `Warnings ${warns.length}/3`, subtitle: `@${jid.split('@')[0]}`, rows: [], body: warns.map((w, i) => `${fonts.mono(`${i + 1}.`)} ${w.reason} ${fonts.smallCaps(`· ${new Date(w.at).toLocaleDateString('en-GB')}`)}`).join('\n') + `\n\n${ui.footer()}` }));
  },
};
