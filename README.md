<div align="center">

<a href="https://github.com/musteqeem/XADON">
  <img src="assets/readme/xadon-hero.jpg" width="100%" alt="Custom dark neon XADON AI banner artwork" />
</a>

<a href="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=20&duration=2800&pause=900&color=22D3EE&center=true&vCenter=true&width=820&lines=One+bot.+A+modular+command+universe.;Pair+once.+Keep+your+session+safe.;Built+for+Node.js+20%2B+and+Baileys.">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=20&duration=2800&pause=900&color=22D3EE&center=true&vCenter=true&width=820&lines=One+bot.+A+modular+command+universe.;Pair+once.+Keep+your+session+safe.;Built+for+Node.js+20%2B+and+Baileys." alt="Animated XADON AI tagline" />
</a>

<br />

[![License](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-16a34a?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![WhatsApp](https://img.shields.io/badge/Platform-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://www.whatsapp.com/)
[![Baileys](https://img.shields.io/badge/Engine-WaPlus%20%2F%20Baileys-0891b2?style=for-the-badge)](https://github.com/musteqeem/baileys)
[![Version](https://img.shields.io/badge/version-3.0.0-7c3aed?style=for-the-badge)](https://github.com/musteqeem/XADON/blob/main/package.json)
[![Commands](https://img.shields.io/badge/command%20library-250%20advertised-06b6d4?style=for-the-badge)](https://github.com/musteqeem/XADON/tree/main/src/commands)
[![Stars](https://img.shields.io/github/stars/musteqeem/XADON?style=for-the-badge&logo=github&label=Stars)](https://github.com/musteqeem/XADON/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/musteqeem/XADON?style=for-the-badge&logo=github)](https://github.com/musteqeem/XADON/commits/main)
[![Maintainer](https://img.shields.io/badge/maintainer-Musteqeem-6366f1?style=for-the-badge)](https://github.com/musteqeem)

**The community continuation of XADON AI — a modular WhatsApp bot with AI, group administration, media utilities, games, search, and a web pairing panel.**

[Get started](#-quick-start) · [Deploy](#-hosting-tutorials) · [Configure](#-configuration) · [Security](#-security-first)

</div>

<div align="center">

<sub>MODULAR COMMANDS&nbsp; · &nbsp;OPTIONAL AI&nbsp; · &nbsp;GROUP TOOLS&nbsp; · &nbsp;PERSISTENT SESSION</sub>

</div>

> **Important account-risk notice:** This project connects through the unofficial Baileys WhatsApp Web protocol. It is not the official WhatsApp Business Platform. Automating a personal WhatsApp account may violate WhatsApp terms or trigger restrictions, including a ban. Use a number you can afford to lose, follow WhatsApp policies, and never use this bot for spam or unsolicited bulk messages. Commercial or business-critical messaging should use the official [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/).

## ✨ What is XADON AI?

XADON AI is a Node.js WhatsApp bot maintained by **Musteqeem**, continuing the original project associated with [xadon_ai](https://github.com/xadon_ai). It uses the WaPlus fork of Baileys, loads commands from modules, stores its linked-device credentials on disk, and reconnects when the connection drops.

The repository describes the current release as **XADON AI v3** and advertises 250 commands. Features and command availability can change between revisions; the live command menu and source tree are authoritative.

### At a glance

- **General utilities:** help, status, runtime, information, reports, suggestions, and support commands.
- **Group administration:** anti-link and bad-word controls, warnings, welcome messages, moderation, polls, rules, and group settings.
- **AI and lookup tools:** an optional AI assistant plus web, news, dictionary, country, lyrics, and other search-oriented commands.
- **Media and creativity:** stickers, audio/video conversions, image effects, text styling, and meme tools.
- **Games and everyday tools:** quizzes, puzzles, calculators, QR codes, reminders, notes, and text utilities.
- **Owner controls:** bot identity, language, menu media, settings, and other owner-only actions.
- **Web pairing panel:** the app starts a local web panel alongside the WhatsApp connection.
- **Configurable behavior:** prefix, public/private mode, cooldown, AI provider, language, menu assets, and more.

<div align="center">

<img src="assets/readme/xadon-capabilities.jpg" width="92%" alt="Neon illustration of XADON AI capabilities: chat, AI, security, groups, media, search, games, and settings" />

<sub><strong>One WhatsApp connection. A modular toolkit you can configure around your community.</strong></sub>

</div>

This is not a promise that every command works with every host, API provider, media type, or WhatsApp version. Optional integrations may need their own API keys.

## 🚀 Quick start

### Requirements

- Node.js **20 or newer** (the repository declares `node >=20`).
- npm, included with Node.js.
- A WhatsApp account and a phone with access to **Linked devices**.
- Internet connectivity. Some media and AI commands also need third-party services or API keys.

### Install and run

<details open>
<summary><strong>⌄ Expand the clean-install commands</strong></summary>

```bash
git clone https://github.com/musteqeem/XADON.git
cd XADON
npm ci
cp .env.example .env
```

</details>

Edit `.env` before the first run. At minimum, set your owner number and, for a headless host, the WhatsApp number to pair. Use international digits only: country code plus number, without `+`, spaces, or punctuation.

```dotenv
OWNER_NUMBER=2348012345678
PAIRING_NUMBER=2348012345678
```

Start XADON:

```bash
npm start
```

The repository also provides `npm run check` as a project check command. During local development, `npm run dev` runs the app with nodemon.

### Link WhatsApp

1. Start the bot and watch the terminal or hosting console for the pairing code. If you set `PAIRING_NUMBER`, XADON requests a code for that number automatically. The code can be customized with an eight-character alphanumeric `PAIRING_CODE` or left empty for a generated code.
2. On the phone using the account you want to link, open **WhatsApp → Linked devices → Link a device**. Choose **Link with phone number instead** if WhatsApp presents that option.
3. Enter the code shown by XADON and approve the linked device.
4. Wait for the console to report that the bot is online. Its authentication files are stored in `SESSION_DIR` (default: `session`). Keep that directory persistent and private.

For a local terminal, you can omit `PAIRING_NUMBER` and enter the number when prompted. On hosts that do not provide interactive terminal input, configure `PAIRING_NUMBER` in the host's private environment-variable settings before starting the app.

> Treat the `session/` directory as a password. Anyone who obtains its contents may be able to use your linked WhatsApp session. Do not commit it, publish it, or send it to support chats.

## The Autodeployer Script 
### Save as index.js in your panel it will help clone the repo and start the bot instead of you downloading the zip manually
```bas#!/usr/bin/env node
/**
 * Pterodactyl bootstrapper for XADON (or any git-backed Node app).
 *
 * Behavior:
 *  - On start: clone the repo (if missing) or pull latest (if exists)
 *  - Install dependencies (npm ci if lockfile present, otherwise npm install)
 *  - Exec the repository start command (default: `node index.js`) and forward logs/signals
 *
 * Configure with environment variables:
 *  - REPO_URL      (default: https://github.com/musteqeem/xadon)
 *  - BRANCH        (default: main)
 *  - APP_DIR       (default: app)           Directory to clone into (relative to script)
 *  - GIT_DEPTH     (default: 1)             Use shallow clone depth (set 0 for full)
 *  - INSTALL_CMD   (optional)               Custom install command (overrides npm logic)
 *  - START_CMD     (default: node index.js) Command to launch the app inside APP_DIR
 *  - SKIP_INSTALL  (true/false)             If true, skip dependency install
 *
 * Usage on Pterodactyl:
 *  - Upload this file as your server's "index.js" startup file.
 *  - Set the server startup command to: `node index.js`
 *  - Optional: set environment variables in the panel to customize repo/branch/start command.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_URL = process.env.REPO_URL || 'https://github.com/musteqeem/xadon';
const BRANCH = process.env.BRANCH || 'main';
const APP_DIR = process.env.APP_DIR || 'app';
const GIT_DEPTH = process.env.GIT_DEPTH === '0' ? 0 : Number(process.env.GIT_DEPTH || 1);
const INSTALL_CMD = process.env.INSTALL_CMD || '';
const START_CMD = process.env.START_CMD || 'node index.js';
const SKIP_INSTALL = (process.env.SKIP_INSTALL || '').toLowerCase() === 'true';

function log(...args) { console.log(new Date().toISOString(), ...args); }

function run(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    log(`> ${cmd} ${args.join(' ')}`);
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    p.on('error', (err) => reject(err));
    p.on('exit', (code, sig) => {
      if (sig) return reject(new Error(`Process killed by signal ${sig}`));
      if (code === 0) resolve(code);
      else reject(new Error(`Exit code ${code}`));
    });
  });
}

async function sh(command, opts = {}) {
  // run via shell to allow complex commands
  return new Promise((resolve, reject) => {
    log(`$ ${command}`);
    const p = spawn(command, { stdio: 'inherit', shell: true, ...opts });
    p.on('error', (err) => reject(err));
    p.on('exit', (code, sig) => {
      if (sig) return reject(new Error(`Killed by signal ${sig}`));
      if (code === 0) resolve(code);
      else reject(new Error(`Exit code ${code}`));
    });
  });
}

async function exists(p) { try { await fs.promises.access(p); return true; } catch { return false; } }

async function ensureGit() {
  try {
    await run('git', ['--version']);
  } catch (err) {
    throw new Error('git is required but not available: ' + err.message);
  }
}

async function cloneRepo(dest) {
  const depthArg = GIT_DEPTH && GIT_DEPTH > 0 ? ['--depth', String(GIT_DEPTH)] : [];
  const args = ['clone', ...depthArg, '--branch', BRANCH, REPO_URL, dest].filter(Boolean);
  await run('git', args);
}

async function updateRepo(dest) {
  // Prefer a conservative pull/fast-forward. If pull fails, fall back to fetch+reset.
  try {
    await run('git', ['-C', dest, 'fetch', 'origin', BRANCH, '--depth', String(GIT_DEPTH || 1)]);
    await run('git', ['-C', dest, 'reset', '--hard', 'FETCH_HEAD']);
  } catch (err) {
    log('fetch/reset failed, trying pull...', err.message);
    await run('git', ['-C', dest, 'pull', 'origin', BRANCH]);
  }
}

async function installDeps(dest) {
  if (SKIP_INSTALL) {
    log('SKIP_INSTALL=true, skipping dependency installation');
    return;
  }
  if (INSTALL_CMD) {
    log('Running custom install command:', INSTALL_CMD);
    await sh(INSTALL_CMD, { cwd: dest });
    return;
  }
  const lockfile = await exists(path.join(dest, 'package-lock.json'));
  if (lockfile) {
    log('Found package-lock.json, running: npm ci');
    await run('npm', ['ci'], { cwd: dest });
  } else {
    log('No lockfile found, running: npm install');
    await run('npm', ['install'], { cwd: dest });
  }
}

function spawnApp(dest) {
  // Use shell so START_CMD can contain complex commands; run in cwd=dest
  log('Starting application with:', START_CMD);
  const child = spawn(START_CMD, { shell: true, cwd: dest, stdio: 'inherit' });

  // Forward signals to child
  const forward = (sig) => {
    log(`Forwarding ${sig} to child`);
    try { child.kill(sig); } catch (e) { /* ignore */ }
  };
  process.on('SIGINT', () => forward('SIGINT'));
  process.on('SIGTERM', () => forward('SIGTERM'));
  process.on('SIGHUP', () => forward('SIGHUP'));

  child.on('exit', (code, signal) => {
    if (signal) {
      log(`Child exited due to signal ${signal}`);
      process.exit(1);
    } else {
      log(`Child exited with code ${code}`);
      // Exit with the child's exit code so Pterodactyl can handle restarts.
      process.exit(typeof code === 'number' ? code : 0);
    }
  });

  child.on('error', (err) => {
    log('Failed to start child process:', err);
    process.exit(1);
  });
}

(async () => {
  try {
    const base = process.cwd();
    const dest = path.resolve(base, APP_DIR);

    log('Bootstrap starting');
    log('REPO_URL=', REPO_URL);
    log('BRANCH=', BRANCH);
    log('APP_DIR=', dest);
    log('GIT_DEPTH=', GIT_DEPTH);
    log('START_CMD=', START_CMD);

    await ensureGit();

    const hasDir = await exists(dest);
    if (!hasDir) {
      log('App directory not found — cloning repository...');
      await cloneRepo(dest);
    } else {
      // quick sanity check: is it a git repo?
      const isGit = await (async () => {
        try {
          await run('git', ['-C', dest, 'rev-parse', '--is-inside-work-tree']);
          return true;
        } catch { return false; }
      })();

      if (!isGit) {
        log('Directory exists but is not a git repository. Renaming and re-cloning.');
        const back = `${dest}.backup.${Date.now()}`;
        await fs.promises.rename(dest, back);
        await cloneRepo(dest);
      } else {
        log('Repository found — updating to latest on branch', BRANCH);
        await updateRepo(dest);
      }
    }

    // install deps
    try {
      await installDeps(dest);
    } catch (err) {
      log('Dependency installation failed:', err.message);
      log('You can set SKIP_INSTALL=true to skip install in environments where dependencies are preinstalled.');
      // continue to attempt to start anyway
    }

    // finally start the app inside dest
    spawnApp(dest);
  } catch (err) {
    console.error('Bootstrap failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
```

## 🧭 Hosting tutorials

### Option A — Bot-Hosting.net

Bot-Hosting's current documentation describes account sign-in through Discord or GitHub and requires the linked account email to be verified. Its panel supports creating a deployment from GitHub, uploading files, and setting the startup entry file. Follow the host's current UI because panel names may change.

1. Open the [Bot-Hosting account guide](https://bot-hosting.net/docs/guides/create-an-account) and sign in using Discord or GitHub. Verify the email attached to that account if the service asks.
2. Follow the official [create a deployment guide](https://bot-hosting.net/docs/guides/create-a-deployment) to create a **Node.js** deployment. Choose a Node version compatible with this project (**20+**).
3. For a public GitHub repository, select GitHub as the source or use the Files tab's GitHub option. Enter `https://github.com/musteqeem/XADON` and select the intended branch (normally `main`). Choose **Replace all files** only for a clean deployment; it removes existing server files. Use the provider's [GitHub repository guide](https://bot-hosting.net/docs/guides/clone-a-github-repository) to select a sync strategy.
4. Open the deployment panel and set the startup entry file to `index.js`. The repository includes `package.json`; the host's current guide says Node dependencies are installed from `package.json` or the Packages tab. **Do not upload `node_modules`.**
5. Add the settings you need in the panel's environment-variable interface. Start with `OWNER_NUMBER` and `PAIRING_NUMBER`. Add optional AI credentials only if you intend to use the corresponding AI feature.
6. Start the deployment. Read the console for dependency, pairing, and connection messages. Complete the Linked devices pairing steps above.
7. Confirm the `session/` directory is retained across restarts and redeploys. If the host's Git sync overwrites runtime files, choose a deployment workflow that preserves the session directory or take an appropriate private backup before updating.

Official instructions: [create an account](https://bot-hosting.net/docs/guides/create-an-account) · [create a deployment](https://bot-hosting.net/docs/guides/create-a-deployment) · [set up a deployment](https://bot-hosting.net/docs/guides/set-up-a-deployment) · [clone a GitHub repository](https://bot-hosting.net/docs/guides/clone-a-github-repository).

**Panel limitation:** Bot-Hosting's current setup documentation says its new panel does not include shell access and does not support running install commands from the console. Do not plan on typing `npm install` into that console. Use the deployment's documented dependency installation flow instead.

### Option B — Silly Development

Silly Development's official site offers Node.js hosting and a WhatsApp-specific guide. That guide warns about the account risks of unofficial WhatsApp automation and describes a Node.js deployment using `package.json`, an entry file, and persistent session files.

1. Visit [Silly Development](https://sillydev.co.uk/) and use the site's **Create account** or **Sign in** entry to register and open the panel. Follow the provider's current account-verification steps.
2. Create a **Node.js** server. The provider currently lists Node.js hosting and GitHub-linked deployments; check the panel's available runtime and resource limits before deploying.
3. Link `musteqeem/XADON` from the server's GitHub tab or upload the repository files. Keep `package.json` and `package-lock.json`, but do not upload `node_modules`.
4. Configure the startup entry as `index.js` (or use `npm start` if the panel asks for a startup command). Keep the Node runtime at version 20 or newer.
5. Add `OWNER_NUMBER` and `PAIRING_NUMBER` through the panel's environment settings, then deploy or restart the server.
6. Follow the console output and pair using WhatsApp's Linked devices flow. Verify that `session/` persists on disk through restarts and deployments.

Read the provider's [WhatsApp hosting risk and platform guide](https://sillydev.co.uk/whatsapp-bot-hosting), [Node.js WhatsApp deployment guide](https://sillydev.co.uk/nodejs-whatsapp-bot-hosting), and [GitHub Actions deployment recipe](https://sillydev.co.uk/docs/panel/recipes/deploy-from-github-actions) before automating deployments. The GitHub Actions recipe requires linking the repository to the server and storing the API key as a GitHub Actions secret; never paste that key into source code or a public workflow file.

### Option C — Spaceify

The supplied Spaceify link opens a client portal with a registration entry, but I could not verify public, current documentation for a Node.js deployment or GitHub-sync workflow from the available pages. Use [the Spaceify client portal](https://client.spaceify.eu/) to check account registration and ask the provider which runtime, startup-file, environment-variable, and persistent-storage options are available before using this project there. Do not assume the old generic steps for other panels apply to Spaceify.

### Deploy from a local checkout

```bash
npm ci
npm start
```

For a production host, prefer the lockfile-based install command supported by that host. Keep the runtime session folder persistent. Do not run multiple copies of the same bot against the same WhatsApp account/session simultaneously.

## ⚙️ Configuration

Copy `.env.example` to `.env` for local use, then edit only the values you need. On a hosted server, enter settings through the provider's private environment-variable controls. Never commit `.env`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `BOT_NAME` | `XADON AI` | Display name used by the bot. |
| `OWNER_NAME` | `Musteqeem` | Owner label used by owner-facing features. |
| `OWNER_NUMBER` | `2348000000000` | Owner number(s), including country code, digits only. Multiple numbers may be comma-separated. Replace the example with your own. |
| `PREFIX` | `.` | Prefix for text commands, for example `.menu`. |
| `PAIRING_NUMBER` | empty | WhatsApp number to pair, digits only. Useful for non-interactive hosts. |
| `PAIRING_CODE` | `XADONITE` | Optional custom pairing code. Must be exactly eight letters/numbers; leave empty for a generated code. |
| `SESSION_DIR` | `session` | Directory for WhatsApp authentication files. Keep private and persistent. |
| `MODE` | `public` | Bot mode (`public` or `private`). |
| `AUTO_READ` | `false` | Whether to automatically mark messages as read. |
| `COOLDOWN_MS` | `2500` | Command cooldown in milliseconds. |
| `AI_PROVIDER` | `auto` | AI provider selection: `auto`, `groq`, `gemini`, or `openai`. |
| `GROQ_API_KEY` | empty | Optional key for Groq-backed AI. Keep secret. |
| `GEMINI_API_KEY` | empty | Optional key for Gemini-backed AI. Keep secret. |
| `OPENAI_API_KEY` | empty | Optional key for OpenAI-backed AI. Keep secret. |
| `AI_BADGE` | `true` | Toggle the bot's AI-style badge presentation. |
| `VERIFIED_BADGE` | `true` | Toggle the bot's verified-style reply presentation. This is not official WhatsApp verification. |
| `META_LABEL` | `false` | Toggle a presentation label. It does not confer Meta verification or endorsement. |
| `CHANNEL_FORWARD` | `true` | Toggle channel-forward presentation behavior. |
| `CHANNEL_JID` | project default | WhatsApp channel identifier used by channel-related behavior. |
| `CHANNEL_NAME` | `XADON AI Updates` | Display name for the channel. |
| `WEBSITE_URL` | project default | Website/link value used by the bot. |
| `PORT` | `3000` | Port for the web panel. Use the port expected by your hosting provider if required. |
| `MENU_IMAGE` | `assets/banner.png` | Menu image path. |
| `MENU_AUDIO` | `assets/xadon.mp3` | Menu audio path. |
| `BOT_LANG` | `en` | Default bot language. |
| `BOT_FONT` | `bold` | Default menu font style. |

The `.env.example` may evolve. Check it and `config.js` in the branch you deploy for the latest supported settings. Do not assume environment variables from unrelated deployment scripts are supported by this app.

## 💬 Commands and usage

Use `.menu` to open the command menu and `.help` for help. The default prefix is a period; if you change `PREFIX`, use the new prefix in each command. Examples:

```text
.menu
.help
.ping
.runtime
.ai What is a black hole?
```

Command groups in the repository include general, group administration, media, games, search, rich text, tools, and owner controls. Many group commands require the bot to be an administrator in that group. Owner-only commands are restricted to configured owner numbers. Some commands depend on optional APIs, external sites, or suitable media input; check their implementation and output if a command fails.

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=17&duration=2300&pause=700&color=22D3EE&center=true&vCenter=true&width=760&lines=%24+.menu+%E2%86%92+Explore+the+toolkit;%24+.ping+%E2%86%92+Check+the+connection;%24+.ai+Tell+me+what+you+need" alt="Animated XADON command examples" />

</div>

<p align="center"><sub>Type the configured prefix followed by a command. Start with <code>.menu</code>.</sub></p>

## 🧩 Project layout

```text
.
├── assets/                 # Menu and media assets
├── public/                 # Web panel assets
├── scripts/                # Local check/maintenance scripts
├── src/
│   ├── commands/           # Modular command categories
│   ├── connection.js       # WhatsApp pairing and connection lifecycle
│   ├── handler.js          # Command dispatch
│   ├── panel.js            # Web pairing/status panel
│   └── lib/                # Shared AI, database, media, UI, and utility code
├── .env.example            # Sample environment configuration
├── config.js               # Environment loading and defaults
├── index.js                # Application entry point
├── package.json            # Scripts, dependencies, Node engine
└── package-lock.json       # Reproducible npm dependency lockfile
```

## 🛡️ Security first

“Ultra defense” is a goal, not a guarantee. No README or bot can promise an unbannable WhatsApp account or perfect security. Use these safeguards when you operate XADON:

- **Protect your number:** use a separate number that you can afford to lose. Understand that third-party WhatsApp Web automation can be restricted or banned; an unofficial library is not a supported business integration.
- **Protect the session:** keep `session/` out of Git, public backups, screenshots, and shared hosting accounts. Restrict filesystem access. If a session is exposed, unlink that device in WhatsApp and create a fresh session.
- **Protect API keys:** put AI keys and panel secrets in environment variables or a host secret manager. Do not place keys in commits, issue reports, chat logs, screenshots, or client-side code. Revoke and rotate any exposed key.
- **Protect the panel:** do not expose an unauthenticated pairing or control endpoint to the public internet. Use a host firewall, private access, or the project's supported access controls. Use HTTPS or a trusted reverse proxy if the panel is reachable remotely. Do not assume a setting exists unless the version you run implements it.
- **Limit automation:** do not spam, scrape contacts, message people without permission, or automatically add people to groups. Keep usage human-directed and compliant with applicable policies and law.
- **Keep deployments trustworthy:** deploy only from a repository and branch you control. Review updates and dependency changes. Keep Node.js and npm dependencies current, and use the committed lockfile for repeatable installs.
- **Back up carefully:** preserve a private copy of configuration and required assets. If backing up the session, encrypt the backup and restrict who can restore it. Test that redeploys do not overwrite persistent authentication data.
- **Use one active process:** avoid running multiple replicas with the same session. Concurrent connections can cause session conflicts or unexpected logouts.
- **Review permissions:** grant the bot only the group privileges it needs. Owner-only commands should remain limited to trusted numbers.

For business-critical messaging, use the [official WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/) and its approved integrations rather than linking a personal account with an unofficial client.

## 🧰 Troubleshooting

| Symptom | Checks |
| --- | --- |
| `npm` or Node version errors | Confirm Node.js 20+ is selected and dependencies were installed from `package.json` / `package-lock.json`. |
| `Cannot find module ...` | Confirm the repository root is the working directory, `package.json` is present, and the hosting provider completed its dependency-install step. |
| No pairing code appears | Check `PAIRING_NUMBER` is digits-only and in international format. On an interactive local run, supply the number when prompted. Hosted consoles may not accept interactive input. |
| Pairing code is rejected | Request a fresh code, ensure you are linking the intended account, and complete the step promptly in WhatsApp's Linked devices screen. Do not share the code. |
| Bot asks to pair after every restart | Confirm `SESSION_DIR` points to persistent storage and that deploys are not deleting the session directory. |
| Bot repeatedly reconnects | Check host network access, logs, WhatsApp availability, and whether another process is using the same session. Re-pair only if WhatsApp reports the session logged out. |
| Bot is online but commands do nothing | Check the prefix, current `MODE`, command permissions, group-admin status, and console errors. Try `.menu` and `.ping`. |
| AI command fails | Configure a supported provider and valid API key. Check provider quota, network availability, and the selected `AI_PROVIDER`. |
| Image or media command fails | Check input format and file size, host memory/disk limits, dependency installation, and whether the relevant external service is available. |
| Port or panel unavailable | Confirm `PORT` matches the host's expected port and that the host permits access to the panel. Avoid making a pairing endpoint public. |

When requesting help, include the Node.js version, deployment provider, startup logs with secrets removed, the command or step that failed, and a minimal reproduction. **Never share `.env`, pairing codes, or session files.**

## 🧑‍💻 Development and contributions

```bash
npm ci
cp .env.example .env
npm run check
npm start
```

Please test changes before opening a pull request. Keep secrets, `.env`, `session/`, `node_modules/`, and generated runtime data out of commits. For new commands, follow the existing module conventions and add clear permission checks where a command can affect other users or groups.

1. Fork the repository.
2. Create a focused branch.
3. Make and test the change.
4. Open a pull request with a clear description of behavior and testing.

## 📜 License and attribution

XADON AI is maintained by **Musteqeem** and released under the **MIT License**. See [`LICENSE`](LICENSE) for the complete terms. This project uses the WaPlus/Baileys ecosystem; see the repository's dependency metadata and upstream project for their respective notices and licensing.

## 🔗 Official guides and references

- [XADON source repository](https://github.com/musteqeem/XADON)
- [XADON package manifest](https://github.com/musteqeem/XADON/blob/main/package.json)
- [XADON environment example](https://github.com/musteqeem/XADON/blob/main/.env.example)
- [Bot-Hosting: create an account](https://bot-hosting.net/docs/guides/create-an-account)
- [Bot-Hosting: create a deployment](https://bot-hosting.net/docs/guides/create-a-deployment)
- [Bot-Hosting: set up a deployment](https://bot-hosting.net/docs/guides/set-up-a-deployment)
- [Bot-Hosting: clone a GitHub repository](https://bot-hosting.net/docs/guides/clone-a-github-repository)
- [Silly Development: WhatsApp hosting and risk notice](https://sillydev.co.uk/whatsapp-bot-hosting)
- [Silly Development: Node.js WhatsApp deployment](https://sillydev.co.uk/nodejs-whatsapp-bot-hosting)
- [Silly Development: GitHub Actions deployment](https://sillydev.co.uk/docs/panel/recipes/deploy-from-github-actions)
- [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/)

<div align="center">

**Made with care by Musteqeem and the XADON community.**

<a href="https://github.com/musteqeem/XADON">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22D3EE,50:312E81,100:080B16&height=120&section=footer&animation=twinkling" width="100%" alt="Animated XADON footer" />
</a>

</div>
