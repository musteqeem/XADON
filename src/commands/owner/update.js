/**
 * XADON AI · update — safe self-updater from GitHub.
 *
 *   .update          check for updates (safe, changes nothing)
 *   .update now      download + install + auto-restart
 *
 * Source: https://github.com/musteqeem/xadon
 *
 * NEVER touches: .env · session/ · database/ · node_modules/
 * (they are git-ignored AND snapshotted + verified before/after)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const REPO_URL = 'https://github.com/musteqeem/xadon.git';
const REPO_WEB = 'https://github.com/musteqeem/xadon';
const PROTECTED = ['.env', 'session', 'database', 'node_modules'];
const ROOT = path.resolve(__dirname, '../../..');

const run = (cmd, args, opts = {}) => new Promise((resolve, reject) => {
  execFile(cmd, args, { cwd: ROOT, timeout: opts.timeout || 120_000, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) return reject(new Error(`${cmd} ${args.join(' ')}\n${(stderr || err.message).slice(0, 1500)}`));
    resolve(String(stdout || '').trim());
  });
});

const snapshotProtected = () => {
  const snap = {};
  try { snap.env = fs.existsSync(path.join(ROOT, '.env')) ? fs.readFileSync(path.join(ROOT, '.env'), 'utf8') : null; } catch { snap.env = null; }
  try { snap.session = fs.existsSync(path.join(ROOT, 'session')) ? fs.readdirSync(path.join(ROOT, 'session')).length : 0; } catch { snap.session = 0; }
  try { snap.db = fs.existsSync(path.join(ROOT, 'database', 'data.json')); } catch { snap.db = false; }
  return snap;
};

const verifyProtected = (snap) => {
  const issues = [];
  try {
    if (snap.env !== null && !fs.existsSync(path.join(ROOT, '.env'))) {
      fs.writeFileSync(path.join(ROOT, '.env'), snap.env);
      issues.push('.env was missing — restored from pre-update backup');
    }
  } catch (e) { issues.push(`.env restore failed: ${e.message}`); }
  try {
    if (snap.session > 0 && (!fs.existsSync(path.join(ROOT, 'session')) || fs.readdirSync(path.join(ROOT, 'session')).length === 0)) {
      issues.push('WARNING: session folder looks empty after update — DO NOT scan a new code, restore your session backup first');
    }
  } catch {}
  if (issues.length) return issues.join('\n');
  return `Kept safe: .env ✓ · session (${snap.session} files) ✓ · database ${snap.db ? '✓' : '(none yet) ✓'}`;
};

const currentBranch = async () => {
  try {
    const b = await run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    if (b && b !== 'HEAD') return b;
  } catch {}
  for (const fallback of ['main', 'master']) {
    try { await run('git', ['show-ref', '--verify', `refs/heads/${fallback}`]); return fallback; } catch {}
  }
  return 'main';
};

const ensureOrigin = async () => {
  try {
    const url = await run('git', ['remote', 'get-url', 'origin']);
    return url;
  } catch {
    await run('git', ['remote', 'add', 'origin', REPO_URL]);
    return REPO_URL + ' (just added)';
  }
};

const gitStatus = async () => {
  const branch = await currentBranch();
  const origin = await ensureOrigin();
  await run('git', ['fetch', 'origin', branch]);
  const local = await run('git', ['rev-parse', 'HEAD']);
  let remote = '';
  try { remote = await run('git', ['rev-parse', 'FETCH_HEAD']); } catch { remote = local; }
  let behind = 0;
  try { behind = Number(await run('git', ['rev-list', '--count', `HEAD..FETCH_HEAD`])) || 0; } catch {}
  let log = '';
  try { log = await run('git', ['log', '--oneline', '-12', 'HEAD..FETCH_HEAD']); } catch {}
  return { branch, origin, local, remote, behind, log };
};

// ── Fallback for hosts deployed from a zip (no .git): pull the branch tarball ──
const tarballUpdate = async (reply) => {
  for (const cmd of ['tar']) {
    try { await run(cmd, ['--version'], { timeout: 15000 }); } catch { throw new Error('No git and no tar binary on this host — upload the new files manually from ' + REPO_WEB); }
  }
  let branch = 'main';
  let res = await fetch(`https://github.com/musteqeem/xadon/archive/refs/heads/main.tar.gz`, { method: 'HEAD' }).catch(() => null);
  if (!res || !res.ok) branch = 'master';
  await reply(`⬇️ Downloading latest ${branch} from GitHub…`);
  const url = `https://github.com/musteqeem/xadon/archive/refs/heads/${branch}.tar.gz`;
  const tmp = path.join(os.tmpdir(), `xadon-update-${Date.now()}`);
  const tgz = `${tmp}.tar.gz`;
  fs.mkdirSync(tmp, { recursive: true });
  const dl = await fetch(url);
  if (!dl.ok) throw new Error(`GitHub download failed (HTTP ${dl.status})`);
  fs.writeFileSync(tgz, Buffer.from(await dl.arrayBuffer()));
  await run('tar', ['-xzf', tgz, '-C', tmp, '--strip-components=1'], { timeout: 120_000 });
  const entries = fs.readdirSync(tmp).filter((e) => !PROTECTED.includes(e));
  for (const entry of entries) {
    const src = path.join(tmp, entry);
    const dest = path.join(ROOT, entry);
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(src, dest, { recursive: true });
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  try { fs.unlinkSync(tgz); } catch {}
  return { branch, files: entries.length };
};

module.exports = {
  name: 'update',
  alias: ['upgrade', 'syncbot', 'updateme'],
  desc: 'Safe bot updater — checks/installs latest GitHub code, never touches .env/session/database',
  usage: '.update  ·  .update now',
  owner: true, category: 'owner',
  async run({ sock, m, args, reply, ui, prefix }) {
    const sub = String(args[0] || '').toLowerCase();
    const fonts = ui.fonts;

    let inGit = true;
    try { await run('git', ['rev-parse', '--is-inside-work-tree'], { timeout: 15000 }); } catch { inGit = false; }

    try {
      // ── CHECK MODE ──
      if (!['now', 'confirm', 'yes', 'install', 'go'].includes(sub)) {
        await sock.sendMessage(m.chat, { react: { text: '🔍', key: m.key } }).catch(() => {});
        if (!inGit) {
          return reply(ui.card({
            icon: '◈', title: 'Update check', subtitle: REPO_WEB,
            rows: [['Mode', fonts.bold('zip deploy (no git)')], ['Protected', fonts.mono('.env · session/ · database/')]],
            body: `This copy has no git history, so updates install straight from the latest source zip.\n\nRun ${fonts.bold(`${prefix}update now`)} to install it now.`,
          }));
        }
        const st = await gitStatus();
        if (st.behind <= 0) {
          return reply(ui.notice('success', 'Already up to date', `Branch ${st.branch} · ${st.local.slice(0, 7)}\nProtected: .env · session/ · database/ (never touched)`));
        }
        return reply(ui.card({
          icon: '⬆', title: `${st.behind} update${st.behind > 1 ? 's' : ''} available`, subtitle: `${st.branch} · ${st.local.slice(0, 7)} → ${st.remote.slice(0, 7)}`,
          rows: [['Branch', fonts.bold(st.branch)], ['Behind', fonts.bold(String(st.behind) + ' commit(s)')]],
          body: (st.log ? fonts.mono(st.log.slice(0, 900)) + '\n\n' : '') + `Run ${fonts.bold(`${prefix}update now`)} to install + restart.\n.env · session/ · database/ are always kept.`,
        }));
      }

      // ── INSTALL MODE ──
      await sock.sendMessage(m.chat, { react: { text: '⬆️', key: m.key } }).catch(() => {});
      const snap = snapshotProtected();
      await reply(ui.notice('info', 'Updating…', 'Fetching latest code. The bot restarts itself when done.'));

      if (!inGit) {
        const t = await tarballUpdate(reply);
        let npmTail = '';
        try {
          const out = await run('npm', ['install', '--omit=dev', '--no-audit', '--no-fund'], { timeout: 300_000 });
          npmTail = out.split('\n').slice(-4).join('\n');
        } catch (e) { npmTail = `npm install warning: ${e.message.slice(0, 300)}`; }
        const kept = verifyProtected(snap);
        await reply(ui.card({
          icon: '✨', title: 'Update installed', subtitle: `${t.branch} · ${t.files} paths refreshed`,
          rows: [['Source', fonts.mono(REPO_WEB)], ['Safety', fonts.bold('protected files kept')]],
          body: `${kept}\n${npmTail ? fonts.mono(npmTail.slice(0, 600)) + '\n' : ''}Restarting now…`,
        }));
        setTimeout(() => process.exit(0), 2000);
        return;
      }

      const st = await gitStatus();
      if (st.behind <= 0) return reply(ui.notice('success', 'Already up to date', `Branch ${st.branch} · ${st.local.slice(0, 7)} — nothing to install.`));

      let pulled = '';
      try {
        pulled = await run('git', ['pull', '--ff-only', 'origin', st.branch], { timeout: 180_000 });
      } catch (e) {
        return reply(ui.notice('error', 'Update blocked safely', `Your local files differ from GitHub and git refused to merge (nothing was changed).\n\n${fonts.mono(String(e.message).slice(0, 700))}\n\nFix: back up your edits, then run ${fonts.bold(`${prefix}update now`)} again — or update manually from ${REPO_WEB}`));
      }

      let npmTail = '';
      try {
        const out = await run('npm', ['install', '--omit=dev', '--no-audit', '--no-fund'], { timeout: 300_000 });
        npmTail = out.split('\n').slice(-4).join('\n');
      } catch (e) { npmTail = `npm install warning: ${e.message.slice(0, 300)}`; }

      const kept = verifyProtected(snap);
      const nowHash = await run('git', ['rev-parse', '--short', 'HEAD']).catch(() => 'new');
      await reply(ui.card({
        icon: '✨', title: 'Update installed', subtitle: `${st.branch} · ${st.local.slice(0, 7)} → ${nowHash}`,
        rows: [['Commits', fonts.bold(String(st.behind))], ['Origin', fonts.mono(String(st.origin).slice(0, 60))]],
        body: `${(st.log ? fonts.mono(st.log.slice(0, 700)) + '\n\n' : '')}${kept}\n${npmTail ? fonts.mono(npmTail.slice(0, 500)) + '\n' : ''}Restarting now…`,
      }));
      setTimeout(() => process.exit(0), 2000);
    } catch (err) {
      console.error('[UPDATE]', err);
      return reply(ui.notice('error', 'Update failed', `${fonts.mono(String(err.message || err).slice(0, 900))}\n\nNothing was restarted. Your .env · session/ · database/ are untouched.`));
    }
  },
};
