// XADON AI · getsession — owner-only session backup. Refuses to run in groups
// so your login keys are never exposed where others can see them.
const fs = require('fs');
const path = require('path');
const config = require('../../../config');

module.exports = {
  name: 'getsession',
  alias: ['savesession', 'sessionbak', 'backupsession'],
  desc: 'Send your login session file (DM only — keep it private)',
  usage: '.getsession',
  owner: true, category: 'owner',
  async run({ sock, m, reply, ui, fail }) {
    if (m.isGroup) return fail('DM only', 'For your safety this command works in the bot DM only — session keys must never appear in a group.');
    const dir = path.resolve(process.cwd(), config.sessionDir || 'session');
    const creds = path.join(dir, 'creds.json');
    if (!fs.existsSync(creds)) return fail('No session yet', `No creds.json found in ${config.sessionDir || 'session'}/. Pair the bot first, then retry.`);
    let files = [];
    try { files = fs.readdirSync(dir); } catch {}
    try {
      await sock.sendMessage(m.chat, {
        document: fs.readFileSync(creds),
        mimetype: 'application/json',
        fileName: 'creds.json',
        caption: `🔐 SESSION BACKUP — ${files.length} file(s)\n\nKeep this file SECRET. Anyone with it can log in as your bot.\nTo restore: stop the bot, put this file back in ${config.sessionDir || 'session'}/creds.json, start again.\n\n${ui.footer()}`,
      }, { quoted: m.raw });
    } catch (e) {
      console.error('[GETSESSION]', e);
      return reply(ui.notice('error', 'Send failed', 'Could not send the session file. Check host storage/permissions.'));
    }
    return reply(ui.notice('warn', 'Keep it private', 'Delete this file from chat after saving it somewhere safe.'));
  },
};
