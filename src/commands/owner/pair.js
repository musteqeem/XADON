// XADON AI · pair — generate a WhatsApp linking code for any number (owner only).
// Links a new device/bot number without touching the current session.
module.exports = {
  name: 'pair',
  alias: ['paircode', 'linkcode', 'getcode'],
  desc: 'Get an 8-char linking code for a number (Settings > Linked devices > Link with code)',
  usage: '.pair 2348012345678',
  owner: true, category: 'owner',
  async run({ sock, m, args, reply, ui, fail, target }) {
    const num = (target ? target() : null)?.split('@')[0].replace(/\D/g, '')
      || String(args[0] || '').replace(/\D/g, '');
    if (!/^\d{7,15}$/.test(num)) return fail('Which number?', 'Send a full international number, no +.\nExample: .pair 2348012345678');
    try {
      await sock.sendMessage(m.chat, { react: { text: '🔗', key: m.key } }).catch(() => {});
      const raw = await sock.requestPairingCode(num);
      const code = String(raw || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const pretty = code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
      return reply(ui.card({
        icon: '🔗', title: 'Linking code', subtitle: `+${num}`,
        rows: [['Code', ui.fonts.bold(pretty)], ['Valid for', 'a few minutes']],
        body: `On that phone: WhatsApp > Settings > Linked devices > Link a device > Link with phone number instead > enter the code.\n\n${ui.footer()}`,
      }));
    } catch (e) {
      const msg = String(e?.message || e);
      if (/already|conflict|logged|401|exists/i.test(msg)) {
        return reply(ui.notice('warn', 'Number already linked', 'That number is already running WhatsApp somewhere. Log it out there first, then try again.'));
      }
      if (/rate|limit|429|try again/i.test(msg)) {
        return reply(ui.notice('warn', 'Rate limited', 'WhatsApp throttled code requests. Wait a few minutes and try once more.'));
      }
      console.error('[PAIR]', e);
      return reply(ui.notice('error', 'Pairing failed', ui.fonts.mono(msg.slice(0, 400))));
    }
  },
};
