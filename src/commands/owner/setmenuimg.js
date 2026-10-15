/** XADON V3 · setmenuimg — menu banner (URL or reply image). */
const botstate = require('../../lib/botstate');
module.exports = {
  name: 'setmenuimg', alias: ['setmenuimage', 'menimg'], desc: 'Change menu banner image', usage: '.setmenuimg <image url> (or reply to image)', category: 'owner', owner: true,
  async run({ m, text, reply, ui }) {
    let url = (text || '').trim();
    if (!url && m.quoted?.isMedia && /image/.test(m.quoted.type || '')) {
      try {
        const buf = await m.quoted.download();
        const fs = require('fs'); const path = require('path');
        const abs = path.join(botstate.ROOT, 'assets/custom-menu.jpg');
        fs.writeFileSync(abs, buf);
        botstate.setMany({ MENU_IMAGE: 'assets/custom-menu.jpg' });
        return reply(ui.notice('success', 'Menu image updated', 'Saved your replied photo as the menu banner.'));
      } catch (e) { return reply(ui.notice('error', 'Save failed', e.message)); }
    }
    if (!/^https?:\/\//i.test(url)) return reply(ui.notice('info', 'Set menu image', 'Usage: .setmenuimg https://...jpg\nOr reply to a photo with .setmenuimg'));
    botstate.setMany({ MENU_IMAGE: url });
    return reply(ui.notice('success', 'Menu image updated', `Banner URL saved.\nPreview with .menu`));
  },
};
