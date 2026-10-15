/**
 * XADON V3 · MENU — royal unicode design, supports:
 *  .setbotname <name> · .setmenuimg <url|reply image> · .setmenuaudio <url|reply audio>
 * Defaults: assets/banner.png + assets/xadon.mp3 (XADON-AI/assets/...)
 */
const os = require('os');
const botstate = require('../../lib/botstate');
const readMore = String.fromCharCode(8206).repeat(4000);

const CATEGORY_ICONS_MAP = {
  admin: '⚜️', ai: '🧠', anime: '⧬', anomaly: '⧭', anti: '🛡️', art: '🎨', asset: '🗄️',
  audio: '🎧', bot: '🤖', community: '🏘️', converter: '⧮', core: '֎', 'dev-centre': '🌚',
  documents: '📜', downloader: '📥', economy: '💎', emote: '✨', engine: '⚙️', fetcher: '⟁',
  fun: '🔥', fun2: '🎲', games: '🎮', general: '📜', group: '👥', group2: '👥',
  'hype-fun': '🔥', 'media-modifier': '🎬', media: '🎬', owner: '👑', owner2: '👑',
  privacy: '🔒', rando: '🎲', rich: '💠', search: '🔍', tools: '🧰', tools2: '🧰',
  trivia: '❓', utility: '⧉', voice: '🎙️', 'whatsapp business': '💼'
};
const getCategoryIcon = (c) => CATEGORY_ICONS_MAP[String(c || '').toLowerCase()] || '⧫';

module.exports = {
  name: 'menu',
  alias: ['main', 'list', 'commands'],
  desc: 'View all Bot commands',
  category: 'general',
  usage: '.menu | .menu list | .menu <category>',
  async run({ sock, m, args, prefix, loader, db }) {
    const chatId = m.chat;
    const BOT_NAME = botstate.botName();
    try {
      await sock.sendMessage(chatId, { react: { text: '📜', key: m.key } }).catch(() => {});
      const groups = loader.byCategory();
      const total = loader.commands.size;
      const sub = (args[0] || '').toLowerCase();

      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const phone = (m.sender || '').split('@')[0];
      const pushName = m.pushName || 'User';
      const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2);
      const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const nowLagos = new Date();
      const tz = 'Africa/Lagos';
      const dayName = nowLagos.toLocaleDateString('en-US', { weekday: 'long', timeZone: tz });
      const dayNum = nowLagos.toLocaleDateString('en-US', { day: '2-digit', timeZone: tz });
      const month = nowLagos.toLocaleDateString('en-US', { month: 'long', timeZone: tz });
      const year = nowLagos.toLocaleDateString('en-US', { year: 'numeric', timeZone: tz });
      const timeLagos = nowLagos.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: tz });

      let header = `╭─⭓ 𓆩⚜️𓆪 *֎•${BOT_NAME}* 𓆩⚜️𓆪 ⭔─╮\n`;
      header += `┃ ⫷⫸ ⫷⫸ ⫷⫸ ⫷⫸ ⫷⫸\n`;
      header += `┃ 𒆜 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗕𝗮𝗰𝗸, *${pushName}* 𒆜\n`;
      header += `┃ ⫷⫸ ⫷⫸ ⫷⫸ ⫷⫸ ⫷⫸\n`;
      header += `⌬───❖──➫───➫──✯──➫───➫ ────❖────⌬\n`;
      header += `❒ ✦┃ 𝗡𝘂𝗺𝗯𝗲𝗿 : +${phone}\n`;
      header += `❒ ✦┃ 𝗣𝗿𝗲𝗳𝗶𝘅 : [ ${prefix} ]\n`;
      header += `❒ ✦┃ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 : ${total}\n`;
      header += `❒ ✦┃ 𝗨𝗽𝘁𝗶𝗺𝗲 : ${hours}h ${minutes}m\n`;
      header += `❒ ✦┃ 𝗥𝗔𝗠 : ${ramUsed}GB / ${ramTotal}GB\n`;
      header += `❒ ✦┃ 𝗗𝗮𝘆 : ${dayName} ⏚\n`;
      header += `❒ ✦┃ 𝗗𝗮𝘁𝗲 : ${dayNum} ${month} ${year}\n`;
      header += `❒ ✦┃ 𝗧𝗶𝗺𝗲 : ${timeLagos} 〔𝗟𝗮𝗴𝗼𝘀〕\n`;
      header += `╰❖──────⌬───────✯───────⌬───────❖╯\n\n${readMore}\n`;

      let menu = '';
      const catNames = Object.keys(groups).sort();
      if (sub === 'list' || sub === 'categories') {
        menu = header + `━━〔 *AVAILABLE CATEGORIES* 〕━━━\n`;
        for (const cat of catNames) menu += `❏◦ ${getCategoryIcon(cat)} ➫ ${cat.toUpperCase()} [${groups[cat].length}]\n`;
        menu += `\n━━━✯━━━━✯━━━━━✯━━━━━━━━━🜲\n💡 Use *${prefix}menu <category>* to view commands\n⌬ ══〔 𓆩 *${BOT_NAME}* 𓆪 〕══ ⌬`;
      } else if (sub && groups[sub]) {
        const seen = new Set(); let list = '';
        for (const c of groups[sub]) {
          if (!c?.name || seen.has(c.name)) continue;
          seen.add(c.name); list += `⌘ ➫ ✦┃${prefix}${c.name}\n`;
        }
        const icon = getCategoryIcon(sub);
        menu = header + `━━〔 ${icon} ${sub.toUpperCase()} ${icon} 〕━━━\n❏┃ ✯━━━━━━━✯━━━━━━✯━━━━━\n${list}━━━✯━━━━✯━━━━━✯━━━━━━━━━🜲\n\n💡 Use *${prefix}menu* for full menu\n⌬ ══〔 𓆩 *${BOT_NAME}* 𓆪 〕══ ⌬`;
      } else {
        menu = header + `✨ *❖ Welcome to ${BOT_NAME} ❖*\n\n`;
        for (const cat of catNames) {
          const seen = new Set(); let list = '';
          for (const c of groups[cat]) {
            if (!c?.name || seen.has(c.name)) continue;
            seen.add(c.name); list += `⌘ ➫ ✦┃${prefix}${c.name}\n`;
          }
          if (list) menu += `━━〔 ${getCategoryIcon(cat)} ${cat.toUpperCase()} 〕━━━\n❏┃ ✯━━━━━━━✯━━━━━━✯━━━━━\n${list}⌬━━━━━✯━━━━━━❖━━━━━✯━━━━━🜲\n`;
        }
        menu += `💡 Tips: *${prefix}menu list* | *${prefix}menu ai*\n⌬ ══〔 𓆩 *${BOT_NAME}* 𓆪 〕══ ⌬`;
      }

      // ── image (MENU_IMAGE / assets/banner.png fallback) ──
      const path = require('path');
      const fs = require('fs');
      const imgRef = botstate.menuImage();
      let imageBuffer = null;
      if (/^https?:\/\//i.test(imgRef)) {
        try { const r = await fetch(imgRef); imageBuffer = Buffer.from(await r.arrayBuffer()); } catch (e) { console.error('MENU_IMAGE fetch', e.message); }
      } else {
        const abs = path.isAbsolute(imgRef) ? imgRef : path.join(botstate.ROOT, imgRef);
        const fb = path.join(botstate.ROOT, 'assets/banner.png');
        if (fs.existsSync(abs)) imageBuffer = fs.readFileSync(abs);
        else if (fs.existsSync(fb)) imageBuffer = fs.readFileSync(fb);
      }

      if (imageBuffer) await sock.sendMessage(chatId, { image: imageBuffer, caption: menu }, { quoted: m.raw });
      else await sock.sendMessage(chatId, { text: menu }, { quoted: m.raw });

      // ── audio (MENU_AUDIO / assets/xadon.mp3 fallback) ──
      try {
        const audRef = botstate.menuAudio();
        let audioBuffer = null;
        if (/^https?:\/\//i.test(audRef)) { const r = await fetch(audRef); audioBuffer = Buffer.from(await r.arrayBuffer()); }
        else {
          const abs = path.isAbsolute(audRef) ? audRef : path.join(botstate.ROOT, audRef);
          const fb = path.join(botstate.ROOT, 'assets/xadon.mp3');
          if (fs.existsSync(abs)) audioBuffer = fs.readFileSync(abs);
          else if (fs.existsSync(fb)) audioBuffer = fs.readFileSync(fb);
        }
        if (audioBuffer) await sock.sendMessage(chatId, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: false }, { quoted: m.raw });
      } catch (e) { console.error('MENU_AUDIO send', e.message); }

      await sock.sendMessage(chatId, { react: { text: '✨', key: m.key } }).catch(() => {});
    } catch (err) {
      console.error('[MENU ERROR]', err);
      await sock.sendMessage(chatId, { text: `✘ MENU CRASHED\n${err.message}` }, { quoted: m.raw }).catch(() => {});
    }
  },
};
