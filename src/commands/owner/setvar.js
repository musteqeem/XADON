/** XADON V3 · setvar — change any .env variable live. e.g. .setvar BOT_NAME=META AI */
const botstate = require('../../lib/botstate');
const ALLOWED = new Set(['BOT_NAME','OWNER_NAME','PREFIX','MODE','AUTO_READ','COOLDOWN_MS','AI_BADGE','VERIFIED_BADGE','META_LABEL','CHANNEL_FORWARD','CHANNEL_JID','CHANNEL_NAME','WEBSITE_URL','AI_PROVIDER','AI_SYSTEM_PROMPT','MENU_IMAGE','MENU_AUDIO','BOT_LANG','BOT_FONT','PORT']);
module.exports = {
  name: 'setvar', alias: ['setenv', 'var'], desc: 'Change any bot variable', usage: '.setvar BOT_NAME=META AI | .setvar list', category: 'owner', owner: true,
  async run({ text, reply, ui, db }) {
    const t = (text || '').trim();
    if (!t || /^list$/i.test(t)) {
      const cur = ['BOT_NAME','PREFIX','MODE','MENU_IMAGE','MENU_AUDIO','BOT_LANG','BOT_FONT'].map((k) => `${k}=${botstate.get(k, '')}`).join('\n');
      return reply(ui.card({ icon: '⊛', title: 'Bot variables', subtitle: '.setvar KEY=value', rows: [], body: cur }));
    }
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/s);
    if (!m) return reply(ui.notice('info', 'Set var', 'Usage: .setvar BOT_NAME=META AI'));
    const key = m[1].toUpperCase(); const val = m[2].trim();
    if (!ALLOWED.has(key)) return reply(ui.notice('error', 'Blocked key', `${key} is not changeable. Allowed: ${[...ALLOWED].slice(0, 12).join(', ')}...`));
    botstate.setMany({ [key]: val });
    if (key === 'PREFIX') db.set('prefix', val);
    if (key === 'MODE') db.set('mode', val.toLowerCase());
    return reply(ui.notice('success', 'Variable saved', `${key}=${val.slice(0, 120)}`));
  },
};
