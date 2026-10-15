/** XADON V3 · brand card. */
const botstate = require('../../lib/botstate');
module.exports = { name: 'xadon', alias: ['xadonv3', 'v3'], desc: 'About XADON V3', category: 'general', usage: '.xadon',
  async run({ sock, m, ui, prefix, loader }) {
    const n = loader.commands.size;
    return sock.sendMessage(m.chat, { text: `╭─⭓ 𓆩⚜️𓆪 *֎•${botstate.botName()} V3* 𓆩⚜️𓆪 ⭔─╮\n┃ 𒆜 250 premium commands 𒆜\n┃ ⌘ ${n} loaded · prefix [ ${prefix} ]\n┃ ✦ HTML games · rich cards · real .play audio\n┃ ✦ 100+ language .translate + .setlang\n╰❖──────⌬───────✯───────⌬───────❖╯`, nativeFlow: [{ text: '📜 Menu', id: `${prefix}menu` }, { text: '▶ Play music', id: `${prefix}play Lonely at the top` }] }, { quoted: m.raw });
  } };
