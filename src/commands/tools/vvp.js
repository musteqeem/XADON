/**
 * XADON V9 · vvp — view-once rescue to YOUR DM.
 * Reply to a view-once photo/video/voice note with .vvp and the bot
 * re-sends that media to the owner's DM (permanent copy).
 */
const { downloadMediaMessage } = require('@musteqeem/baileys');
module.exports = {
  name: 'vvp',
  alias: ['vvdm', 'rescuevv', 'savevv'],
  desc: 'Forward view-once media to your DM',
  usage: '.vvp (reply to a view-once message)',
  category: 'tools',
  owner: true,
  async run({ sock, m, reply, ui, db, config }) {
    const rawstore = require('../../lib/rawstore');
    const q = m.quoted;
    const target = q || (m.isMedia ? m : null);
    if (!target) return reply(ui.notice('info', 'View-once rescue', 'Reply to a view-once photo, video or voice note with .vvp and I will send it to your DM.'));
    try {
      const raw = (q && rawstore.get(m.chat, q.id)) || target.raw || m.raw;
      const buf = await downloadMediaMessage(raw, 'buffer', {});
      const ownerJid = `${String(config.ownerNumbers[0]).replace(/\D/g, '')}@s.whatsapp.net`;
      const from = `@${String(m.sender).split('@')[0].split(':')[0]}`;
      const caption = `◈ 𝗩𝗩𝗣 𝗥𝗘𝗦𝗖𝗨𝗘\n┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\nfrom ${from} · ${m.isGroup ? 'group' : 'dm'}\n${new Date().toLocaleString()}\n\n${ui.footer()}`;
      const t = target.type || '';
      const payload =
        t.includes('image') ? { image: buf, caption } :
        t.includes('video') ? { video: buf, caption, gifPlayback: !!target.message?.videoMessage?.gifPlayback } :
        t.includes('audio') ? { audio: buf, mimetype: 'audio/ogg; codecs=opus' } :
        t.includes('sticker') ? { sticker: buf } :
        t.includes('document') ? { document: buf, mimetype: target.message?.documentMessage?.mimetype || 'application/octet-stream', fileName: target.message?.documentMessage?.fileName || 'rescued-file' } :
        { image: buf, caption };
      await sock.sendMessage(ownerJid, payload);
      try {
        const privs = require('../../lib/privs');
        for (const n of privs.getSudos?.(db) || []) {
          const j = `${String(n).replace(/\D/g, '')}@s.whatsapp.net`;
          if (j !== ownerJid) await sock.sendMessage(j, payload).catch(() => {});
        }
      } catch {}
      return reply(ui.notice('success', 'Sent to DM', 'The view-once media is now saved in your DM.'));
    } catch (e) {
      return reply(ui.notice('error', 'Rescue failed', `${String(e.message || e).slice(0, 250)}\nOpen the view-once once first, then reply fast — expired media cannot be recovered.`));
    }
  },
};
