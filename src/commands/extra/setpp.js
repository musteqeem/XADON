// XADON AI · setpp — set group icon from quoted image.
module.exports = {
  name: 'setpp',
  alias: ['seticon', 'groupicon'],
  desc: 'Set the group icon',
  usage: 'reply to an image with .setpp',
  group: true, admin: true, botAdmin: true, category: 'extra',
  async run({ sock, m, reply, ui, fail }) {
    const src = m.type === 'imageMessage' ? m : m.quoted?.type === 'imageMessage' ? m.quoted : null;
    if (!src) return fail('Reply to an image', 'Reply to a photo with .setpp.');
    try {
      const buf = await src.download();
      if (typeof sock.updateProfilePicture !== 'function') return reply(ui.notice('error', 'Not supported', 'This Baileys build has no icon API.'));
      await sock.updateProfilePicture(m.chat, { img: buf });
      return reply(ui.notice('success', 'Icon updated', 'Group icon changed.'));
    } catch { return reply(ui.notice('error', 'Icon failed', 'Could not set the icon. The bot needs admin rights.')); }
  },
};
