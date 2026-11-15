/** XADON V3 · setmenuimg — menu banner (URL or reply image/GIF/video). */
const botstate = require('../../lib/botstate');
module.exports = {
  name: 'setmenuimg', alias: ['setmenuimage', 'menimg', 'setmenumedia'], desc: 'Change menu banner image, GIF, or video', usage: '.setmenuimg <image|gif|mp4 url> (or reply to media)', category: 'owner', owner: true,
  async run({ m, text, reply, ui }) {
    let url = (text || '').trim();
    if (!url && m.quoted?.isMedia && /image|video/.test(m.quoted.type || '')) {
      try {
        const buf = await m.quoted.download();
        const fs = require('fs'); const path = require('path');
        const ext = /video/.test(m.quoted.type || '') ? '.mp4' : (m.quoted.message?.imageMessage?.mimetype || '').includes('gif') ? '.gif' : '.jpg';
        const abs = path.join(botstate.ROOT, `assets/custom-menu${ext}`);
        fs.writeFileSync(abs, buf);
        botstate.setMany({ MENU_IMAGE: 'assets/custom-menu.jpg' });
        return reply(ui.notice('success', 'Menu media updated', 'Saved your replied image, GIF, or video as the menu media.'));
      } catch (e) { return reply(ui.notice('error', 'Save failed', e.message)); }
    }
    if (!/^https?:\/\//i.test(url)) return reply(ui.notice('info', 'Set menu media', 'Usage: .setmenuimg https://...jpg|gif|mp4\nOr reply to an image, GIF, or video with .setmenuimg'));
    botstate.setMany({ MENU_IMAGE: url });
    return reply(ui.notice('success', 'Menu image updated', `Banner URL saved.\nPreview with .menu`));
  },
};
