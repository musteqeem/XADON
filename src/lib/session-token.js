const fs = require('fs');
const path = require('path');

const PREFIX = 'xadon~';

function collectFiles(dir, root = dir, output = {}) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) collectFiles(file, root, output);
    else if (stat.isFile()) output[path.relative(root, file)] = fs.readFileSync(file).toString('base64');
  }
  return output;
}

function buildFromDirectory(dir) {
  const payload = { version: 2, type: 'xadon-auth', files: collectFiles(dir) };
  return PREFIX + Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decode(input) {
  const value = String(input || '').trim();
  const raw = value.replace(/^xadon(?:~|:)?/i, '');
  const text = Buffer.from(raw, 'base64url').toString('utf8');
  try {
    const payload = JSON.parse(text);
    if (!payload || payload.type !== 'xadon-auth' || !payload.files) throw new Error('Invalid XADON bundle');
    return payload;
  } catch (_) {
    const creds = Buffer.from(raw, 'base64').toString('utf8');
    JSON.parse(creds);
    return { version: 1, type: 'legacy-creds', files: { 'creds.json': Buffer.from(creds).toString('base64') } };
  }
}

module.exports = { PREFIX, buildFromDirectory, decode };
