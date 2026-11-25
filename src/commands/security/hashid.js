/** XADON AI · security — ethical, defensive recon only. Educational use. */
module.exports = {
  name: 'hashid', alias: ['hashinfo', 'identifyhash'], desc: 'Identify a hash type from its shape (educational)',
  usage: '.hashid <hash>', category: 'security',
  async run({ args, reply, ui }) {
    const h = String(args[0] || '').trim();
    if (!h) return reply(ui.notice('info', 'Hash ID', `${ui.fonts.mono('.hashid 5d41402abc4b2a76b9719d911017c592')}`));
    const out = [];
    if (/^[a-f0-9]{32}$/i.test(h)) out.push('MD5 / NTLM / LM');
    if (/^[a-f0-9]{40}$/i.test(h)) out.push('SHA-1');
    if (/^[a-f0-9]{64}$/i.test(h)) out.push('SHA-256');
    if (/^[a-f0-9]{128}$/i.test(h)) out.push('SHA-512');
    if (/^\$2[aby]\$\d{2}\$.{53}$/.test(h)) out.push('bcrypt');
    if (/^\$argon2/.test(h)) out.push('Argon2');
    if (/^\$1\$.{1,8}\$.{22}$/.test(h)) out.push('MD5-crypt');
    if (/^[a-zA-Z0-9+/]{43}=$/.test(h)) out.push('Base64-encoded 32-byte value');
    if (!out.length) out.push('Unknown — not a common hash shape');
    await reply(ui.card({ icon: '\uD83D\uDD11', title: 'Hash ID', rows: [], body: out.map((o) => `\u2022 ${o}`).join('\n') + `\n\n${ui.footer()}` }));
  },
};
