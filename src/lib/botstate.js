/** XADON V3 · persistent bot appearance + language state (db-backed, .env compatible). */
const fs = require('fs');
const path = require('path');
const db = require('./database');

const ROOT = path.resolve(__dirname, '../..');
const ENV_FILE = path.join(ROOT, '.env');

function get(key, fallback) {
  const v = db.get(key, process.env[key] ?? fallback);
  return v === undefined || v === '' ? fallback : v;
}
function botName() { return get('BOT_NAME', process.env.BOT_NAME || 'XADON AI'); }
function menuImage() { return get('MENU_IMAGE', process.env.MENU_IMAGE || 'assets/banner.png'); }
function menuAudio() { return get('MENU_AUDIO', process.env.MENU_AUDIO || 'assets/xadon.mp3'); }
function botLang() { return (get('BOT_LANG', process.env.BOT_LANG || 'en') || 'en').toLowerCase(); }
function botFont() { return (get('BOT_FONT', process.env.BOT_FONT || 'bold') || 'bold').toLowerCase(); }

function setMany(pairs) {
  for (const [k, v] of Object.entries(pairs)) db.set(k, v);
  // Best-effort .env sync so restarts keep values even if data.json is wiped.
  try {
    let env = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : '';
    for (const [k, v] of Object.entries(pairs)) {
      const line = `${k}=${String(v).replace(/\n/g, ' ')}`;
      if (new RegExp(`^${k}=`, 'm').test(env)) env = env.replace(new RegExp(`^${k}=.*$`, 'm'), line);
      else env += (env.endsWith('\n') || !env ? '' : '\n') + line + '\n';
    }
    fs.writeFileSync(ENV_FILE, env);
  } catch { /* db is source of truth; .env sync is optional */ }
}

function resolveAsset(p, fallbackAbs) {
  try {
    if (!p) return fs.existsSync(fallbackAbs) ? fs.readFileSync(fallbackAbs) : null;
    if (/^https?:\/\//i.test(p)) return { url: p };
    const abs = path.isAbsolute(p) ? p : path.join(ROOT, p);
    if (fs.existsSync(abs)) return fs.readFileSync(abs);
    if (fs.existsSync(fallbackAbs)) return fs.readFileSync(fallbackAbs);
    return null;
  } catch { return null; }
}

module.exports = { get, setMany, botName, menuImage, menuAudio, botLang, botFont, resolveAsset, ROOT };
