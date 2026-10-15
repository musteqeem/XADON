/** XADON V3 · setmenuaudio — menu voice/audio (URL or reply audio). */
const botstate = require('../../lib/botstate');
module.exports = {
  name: 'setmenuaudio', alias: ['setmenuaud', 'menuaudio'], desc: 'Change menu audio', usage: '.setmenuaudio <mp3 url> (or reply to audio)', category: 'owner', owner: true,
  async run({ m, text, reply, ui }) {
    let url = (text || '').trim();
    if (!url && m.quoted?.isMedia && /audio/.test(m.quoted.type || '')) {
      try {
        const buf = await m.quoted.download();
        const fs = require('fs'); const path = require('path');
        const abs = path.join(botstate.ROOT, 'assets/custom-menu.mp3');
        fs.writeFileSync(abs, buf);
        botstate.setMany({ MENU_AUDIO: 'assets/custom-menu.mp3' });
        return reply(ui.notice('success', 'Menu audio updated', 'Saved your replied audio as the menu sound.'));
      } catch (e) { return reply(ui.notice('error', 'Save failed', e.message)); }
    }
    if (!/^https?:\/\//i.test(url)) return reply(ui.notice('info', 'Set menu audio', 'Usage: .setmenuaudio https://...mp3\nOr reply to an audio with .setmenuaudio'));
    botstate.setMany({ MENU_AUDIO: url });
    return reply(ui.notice('success', 'Menu audio updated', 'Audio URL saved. Preview with .menu'));
  },
};
