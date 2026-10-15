// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'githubinfo',
  alias: ['github', 'ghuser'],
  desc: 'GitHub profile lookup',
  usage: '.githubinfo <username>',
  category: 'search',
  async run({ args, reply, ui, prefix, sock, m }) {
    const { fonts } = ui;
    const u = args[0];
    if (!u) return reply(ui.notice('info', 'GitHub lookup', `${fonts.mono(`${prefix}githubinfo torvalds`)}`));
    try {
      const r = await fetch(`https://api.github.com/users/${encodeURIComponent(u)}`, { headers: { 'user-agent': 'XADON-AI' } });
      const j = await r.json();
      if (j.message === 'Not Found') throw new Error('nf');
      const txt = ui.card({ icon: '✣', title: j.login, subtitle: 'github', rows: [['name', fonts.bold(j.name || j.login)], ['repos', fonts.bold(String(j.public_repos))], ['followers', fonts.bold(String(j.followers))], ['following', fonts.bold(String(j.following))]], body: `${fonts.italic((j.bio || 'No bio').slice(0, 200))}\n${fonts.mono(j.html_url)}\n\n${ui.footer()}` });
      if (j.avatar_url) { try { const im = await fetch(j.avatar_url).then((x) => Buffer.from(x.arrayBuffer ? x.arrayBuffer() : [])); } catch {} }
      return reply(txt);
    } catch { return reply(ui.notice('error', 'Not found', 'That GitHub user does not exist.')); }
  },
};
