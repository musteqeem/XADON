const fs = require('fs');
const path = require('path');

function decodeSession(value) {
  const input = String(value || '').trim();
  const raw = input.replace(/^xadon(?:~|:)?/i, '');
  let text;
  try { text = Buffer.from(raw, 'base64url').toString('utf8'); } catch (_) { text = Buffer.from(raw, 'base64').toString('utf8'); }
  try {
    const payload = JSON.parse(text);
    if (payload?.type === 'xadon-auth' && payload.files) return payload;
  } catch (_) {}
  const creds = Buffer.from(raw, 'base64').toString('utf8');
  JSON.parse(creds);
  return { type: 'legacy-creds', files: { 'creds.json': Buffer.from(creds).toString('base64') } };
}

function importSession(value, dir) {
  if (!value || fs.existsSync(path.join(dir, 'creds.json'))) return false;
  const payload = decodeSession(value);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, encoded] of Object.entries(payload.files)) {
    const safe = path.normalize(name);
    if (safe.startsWith('..') || path.isAbsolute(safe)) throw new Error('Invalid Session ID file path');
    const target = path.join(dir, safe);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(encoded, 'base64'));
  }
  return true;
}
module.exports = { importSession };
