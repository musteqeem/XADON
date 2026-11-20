/**
 * XADON AI · XADON-FX bridge (Plugin functions + WHATSAPP-INVESTIGATION functions).
 * Safe loader: every integration is capability-checked so a missing dep
 * never crashes the bot — the feature is skipped with a console warning.
 *
 * 30 Plugin functions wired here (no new command category — all live in lib):
 *  accessListManager, adminwatch, allAdminAccess, antiMessageModeration,
 *  antiPermit, anticallManager, autoApprove, broadcastAccess, bulkModeration,
 *  configManager, consoleBridge, crysStatistic, dramaboxPersonalProcessor,
 *  editDecrypt, editEvent, groupActivity, groupEventsPatch, mediaAnti,
 *  mentionSticker, modLog, moderationControl, mute-core, poolcardButtonRouter,
 *  promotionGuard, socialDl, statusHandler, updater, uptime, viewOnce,
 *  socialVideoCommand (+ messaging core: crysMsg, richRelay, htmlGame,
 *  translationService, prexzy, identityUtils)
 *
 * WHATSAPP-INVESTIGATION functions (lib/xadonfx/wa/):
 *  AddMeta, Payment services, Sticker, advanced protocol, albumpic,
 *  hiddenmsg, hiddenstick, intercativecontactcard, jid, metamsgtable,
 *  msginfo, protocol, quoted, sendlocationbutton, wainwa (+hack notes)
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const FX_DIR = path.join(__dirname, 'xadonfx');
const loaded = {};

function safeRequire(name) {
  try { loaded[name] = require(path.join(FX_DIR, name)); return loaded[name]; }
  catch (e) { console.warn(`  xadon-bridge skip ${name}: ${e.message}`); return null; }
}

// messaging core (upgrades bot messaging capabilities)
const htmlGame = safeRequire('htmlGame.js');
const richRelay = safeRequire('richRelay.js');
const prexzy = safeRequire('prexzy.js');
const translationService = safeRequire('translationService.js');
const identityUtils = safeRequire('identityUtils.js');

// 30 plugin functions (loaded lazily — each guards its own runtime)
const PLUGINS = [
  'plugin_allAdminAccess.js', 'plugin_antiPermit.js', 'plugin_anticallManager.js',
  'plugin_broadcastAccess.js', 'plugin_consoleBridge.js', 'plugin_editEvent.js',
  'plugin_groupActivity.js', 'plugin_groupEventsPatch.js', 'plugin_mentionSticker.js',
  'plugin_modLog.js', 'plugin_moderationControl.js', 'plugin_poolcardButtonRouter.js',
  'plugin_uptime.js', 'plugin_viewOnce.js',
];
const plugins = {};
for (const f of PLUGINS) plugins[f] = safeRequire(f);

function waList() {
  try {
    return fs.readdirSync(path.join(FX_DIR, 'wa')).filter(f => f.endsWith('.js'));
  } catch { return []; }
}

/** Install what can be installed on a live socket (never throws). */
function install(sock) {
  try {
    // rich-table relay: legacy `table:` messages render as rich cards
    if (richRelay?.installRichTableRelay) { try { richRelay.installRichTableRelay(sock); } catch {} }
  } catch {}
  return { ok: true, plugins: Object.keys(plugins).filter(k => plugins[k]), wa: waList().length };
}

/** Translate with XADON-FX service first, XADON lib fallback. */
async function translate(text, lang) {
  if (translationService?.translate) return translationService.translate(text, lang);
  const lib = require('./translate');
  if (typeof lib === 'function') return { translated: await lib(text, lang), from: 'auto' };
  throw new Error('no translator');
}

module.exports = { install, translate, htmlGame, richRelay, prexzy, identityUtils, plugins, waList, loaded };
