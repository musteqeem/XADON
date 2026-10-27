// XADON V8 · igprofile — Instagram profile card (native when supported, styled fallback).
module.exports = {
  name: 'igprofile', alias: ['igcard', 'instacard'], desc: 'Instagram profile card', usage: '.igprofile <username>', category: 'rich',
  async run({ sock, m, args, reply, ui }) {
    const username = String(args[0] || '').replace(/^@/, '').trim();
    if (!/^[A-Za-z0-9._]{1,30}$/.test(username)) return reply(ui.notice('info', 'IG card', 'Usage: .igprofile cristiano'));
    let imageUrl = `https://unavatar.io/instagram/${encodeURIComponent(username)}`;
    try { const fmt = require('../../lib/format'); const pic = fmt.getReplyPic(); if (pic && pic.kind === 'url') imageUrl = pic.value; } catch {}
    const data = { username, title: username.toUpperCase(), subtitle: 'Instagram profile', imageUrl, entityId: username, entityUrl: `https://www.instagram.com/${username}`, fullName: username, isVerified: false, resultText: 'Open profile' };
    try {
      if (typeof sock.sendInstagramProfile === 'function') return await sock.sendInstagramProfile(m.chat, data);
      throw new Error('no-native');
    } catch {
      return sock.sendMessage(m.chat, { text: `◈ ${ui.fonts.bold('@' + username)}\n${ui.fonts.smallCaps('instagram profile')} ⟶ https://www.instagram.com/${username}\n\n${ui.footer()}` }, { quoted: m.raw });
    }
  },
};
