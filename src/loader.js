/**
 * Loads every .js file inside src/commands (and its sub folders).
 * Drop a new file in that folder and restart: it becomes a command.
 *
 * XADON recognises TWO command formats here, so a file can come from
 * either the native XADON command set or an imported pack and still load:
 *
 *   XADON format    module.exports = { name, run(ctx) {...}, group, admin, ... }
 *   Imported format module.exports = { name, execute(sock, m, extra) {...}, groupOnly, adminOnly, ... }
 *
 * Both are normalised to the same internal shape (group/admin/botAdmin/owner booleans)
 * so the handler and .help/.menu don't need to care which format a file was written in.
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

// Pull a command out of whatever shape the file exports it in (some imported
// packs export the command directly, others wrap it as { command } or default).
function unwrap(mod) {
  if (!mod) return null;
  if (typeof mod.run === 'function' || typeof mod.execute === 'function') return mod;
  if (mod.default && (typeof mod.default.run === 'function' || typeof mod.default.execute === 'function')) return mod.default;
  if (mod.command && (typeof mod.command.run === 'function' || typeof mod.command.execute === 'function')) return mod.command;
  return null;
}

function normalize(cmd) {
  // Imported-format flags -> XADON-native flags. Keep whichever is already set.
  cmd.group = cmd.group ?? cmd.groupOnly ?? false;
  cmd.admin = cmd.admin ?? cmd.adminOnly ?? false;
  cmd.botAdmin = cmd.botAdmin ?? cmd.requireBotAdmin ?? false;
  cmd.owner = cmd.owner ?? cmd.ownerOnly ?? false;
  cmd.alias = cmd.alias || cmd.aliases || [];
  cmd.desc = cmd.desc || cmd.description || '';
  return cmd;
}

function load() {
  commands.clear();
  aliases.clear();
  const stats = { xadon: 0, imported: 0, skipped: 0, failed: 0 };
  for (const file of walk(DIR).sort()) {
    delete require.cache[require.resolve(file)];
    try {
      const mod = unwrap(require(file));
      if (!mod?.name || (typeof mod.run !== 'function' && typeof mod.execute !== 'function')) {
        console.warn(`  skip  ${path.relative(DIR, file)} (needs "name" and either "run" or "execute")`);
        stats.skipped++;
        continue;
      }
      const cmd = normalize(mod);
      cmd.format = typeof cmd.run === 'function' ? 'xadon' : 'imported';
      cmd.name = String(cmd.name).toLowerCase().trim();
      if (commands.has(cmd.name)) {
        console.warn(`  collision ${path.relative(DIR, file)}: command name '${cmd.name}' already registered; skipped`);
        stats.skipped++;
        continue;
      }
      cmd.category ||= path.basename(path.dirname(file)) === 'commands' ? 'general' : path.basename(path.dirname(file));
      cmd.category = String(cmd.category).toLowerCase();
      commands.set(cmd.name, cmd);
      cmd.format === 'xadon' ? stats.xadon++ : stats.imported++;
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
      stats.failed++;
    }
  }
  console.log(`  ◈ ${stats.xadon} native + ${stats.imported} imported = ${commands.size} commands  (${stats.skipped} skipped, ${stats.failed} failed)`);
  return commands;
}

const find = (name) => { const key = String(name || '').toLowerCase().trim(); return commands.get(key) || commands.get(aliases.get(key)); };

function byCategory() {
  const groups = {};
  for (const cmd of commands.values()) (groups[cmd.category] ||= []).push(cmd);
  return groups;
}

module.exports = { load, find, byCategory, commands };
