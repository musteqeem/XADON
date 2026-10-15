/** XADON V3 · githubdl — zip download link for any public repo. */
const { sendOpenLink } = require('../../lib/rich');
module.exports = { name: 'githubdl', alias: ['ghdl', 'repozip'], desc: 'Download GitHub repo as zip', usage: '.githubdl owner/repo', category: 'search',
  async run({ sock, m, text, reply, ui, prefix }) {
    const t = (text || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
    if (!/^[\w.-]+\/[\w.-]+$/.test(t)) return reply(ui.notice('info', 'GitHub DL', `Usage: ${prefix}githubdl musteqeem/baileys`));
    const zip = `https://github.com/${t}/archive/refs/heads/main.zip`;
    try {
      const api = await (await fetch(`https://api.github.com/repos/${t}`)).json();
      const info = api?.message ? '' : `\n★ ${api.stargazers_count} · ⑂ ${api.forks_count} · ${api.language || ''}\n${(api.description || '').slice(0, 200)}`;
      await sock.sendMessage(m.chat, { text: `_*亗 GitHub*_ · ${t}${info}\n\n${zip}` }, { quoted: m.raw });
      return sendOpenLink(sock, m.chat, { url: zip, label: '⬇ Download zip', quoted: m.raw });
    } catch { return reply(`${zip}`); }
  } };
