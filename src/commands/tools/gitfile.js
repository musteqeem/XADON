/** XADON AI · gitfile — download any public GitHub repo as a ZIP. */
module.exports = {
  name: 'gitfile',
  alias: ['repozip', 'ziprepo', 'gitclone'],
  desc: 'Download a GitHub repo as ZIP',
  usage: '.gitfile https://github.com/user/repo',
  category: 'tools',
  async run({ sock, m, args, reply, ui }) {
    const { fonts } = ui;
    if (!args[0]) {
      return reply(ui.card({ icon: '\u272A', title: 'XADON AI • GITFILE', rows: [], body: `${fonts.smallCaps('provide github repo link')}\n\n${fonts.mono('.gitfile https://github.com/user/repo')}\n\n${ui.footer()}` }));
    }
    let url = String(args[0]).replace(/\.git$/, '').replace(/\/$/, '');
    if (!url.includes('github.com')) return reply(ui.notice('error', 'Invalid URL', 'Send a github.com repo link.'));
    const parts = url.split('/').filter(Boolean);
    const repo = parts.pop() || 'repo';
    const tryBranches = ['main', 'master'];
    await reply(ui.notice('info', 'Preparing ZIP', `${url}`));
    for (const br of tryBranches) {
      try {
        const zipUrl = `${url}/archive/refs/heads/${br}.zip`;
        const head = await fetch(zipUrl, { method: 'HEAD' });
        if (!head.ok) continue;
        await sock.sendMessage(m.chat, {
          document: { url: zipUrl }, mimetype: 'application/zip',
          fileName: `${repo}-${br}.zip`,
          caption: `\u272A *XADON AI • REPO ZIP* \u272A\n\n\u2705 ${repo} (${br})\n\n${ui.footer()}`,
        }, { quoted: m.raw });
        return;
      } catch {}
    }
    return reply(ui.notice('error', 'Fetch failed', 'Could not fetch that repo (private, renamed, or no main/master branch).'));
  },
};
