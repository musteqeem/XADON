/**
 * Loads every .js file inside src/commands (and its sub folders).
 * Drop a new file in that folder and restart: it becomes a command.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, 'commands');
const commands = new Map();
const aliases = new Map();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.js') ? [full] : [];
  });
}

function load() {
  commands.clear();
  aliases.clear();
  for (const file of walk(DIR).sort()) {
    delete require.cache[require.resolve(file)];
    try {
      const cmd = require(file);
      if (!cmd?.name || typeof cmd.run !== 'function') {
        console.warn(`  skip  ${path.relative(DIR, file)} (needs "name" and "run")`);
        continue;
      }
      cmd.name = String(cmd.name).toLowerCase().trim();
      if (commands.has(cmd.name)) {
        console.warn(`  collision ${path.relative(DIR, file)}: command name '${cmd.name}' already registered; skipped`);
        continue;
      }
      cmd.category ||= path.basename(path.dirname(file)) === 'commands' ? 'general' : path.basename(path.dirname(file));
      commands.set(cmd.name, cmd);
      for (const rawAlias of cmd.alias || []) {
        const alias = String(rawAlias).trim().toLowerCase();
        if (!alias || alias === cmd.name) continue;
        if (commands.has(alias) || aliases.has(alias)) {
          console.warn(`  collision ${path.relative(DIR, file)}: alias '${alias}' already registered; skipped`);
          continue;
        }
        aliases.set(alias, cmd.name);
      }
    } catch (err) {
      console.error(`  fail  ${path.relative(DIR, file)}: ${err.message}`);
    }
  }
  return commands;
}

const find = (name) => { const key = String(name || '').toLowerCase().trim(); return commands.get(key) || commands.get(aliases.get(key)); };

function byCategory() {
  const groups = {};
  for (const cmd of commands.values()) (groups[cmd.category] ||= []).push(cmd);
  return groups;
}

module.exports = { load, find, byCategory, commands };
