module.exports = {
  name: 'base64',
  alias: ['b64', 'encode', 'decode'],
  desc: 'Base64 encode / decode',
  usage: '.base64 encode hello  ·  .base64 decode aGVsbG8=',
  async run({ args, reply, ui, prefix, m }) {
    const { fonts } = ui;
    const mode = (args[0] || '').toLowerCase();
    const input = args.slice(1).join(' ') || m.quoted?.body || '';
    if (!['encode', 'decode'].includes(mode) || !input) return reply(ui.notice('info', 'Base64', `${fonts.mono(`${prefix}base64 encode hello`)}\n${fonts.mono(`${prefix}base64 decode aGVsbG8=`)}`));
    try {
      const out = mode === 'encode' ? Buffer.from(input).toString('base64') : Buffer.from(input.replace(/\s/g, ''), 'base64').toString('utf8');
      if (!out) throw new Error('empty');
      await reply(ui.card({ icon: '≡', title: `Base64 ${mode}`, subtitle: 'converter', rows: [], body: `${fonts.mono(out.slice(0, 1200))}\n\n${ui.footer()}` }));
    } catch { await reply(ui.notice('error', 'Failed', mode === 'decode' ? 'That is not valid base64.' : 'Could not encode.')); }
  },
};
