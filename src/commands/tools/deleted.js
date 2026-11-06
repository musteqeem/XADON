// XADON V12 · deleted — recover deleted messages WITH pictures/videos.
// Media is snapshotted at receive-time (lib/mediacache), so even after the
// sender deletes a photo/video, .deleted re-sends the actual media here.
// Usage: .deleted [1-5] | .deleted clear
const store = require('../../lib/msgstore');
const cache = require('../../lib/mediacache');
const short = (j = '') => String(j).split('@')[0].split(':')[0];
module.exports = {
  name: 'deleted',
  alias: ['dels', 'antidel', 'showdeleted'],
  desc: 'Show + resend deleted messages (text, pics, videos)',
  usage: '.deleted [1-5] | .deleted clear',
  category: 'tools',
  async run({ sock, m, args, reply, ui }) {
    const t = String(args[0] || '').toLowerCase();
    if (t === 'clear' || t === 'clean') {
      store.clearDeleted(m.chat);
      try { cache.dropChat(m.chat); } catch {}
      return reply(ui.notice('success', 'Cleared', 'Deleted-message log + cached media for this chat were cleared.'));
    }
    let n = parseInt(args[0] || '5', 10);
    if (!Number.isFinite(n)) n = 5;
    n = Math.max(1, Math.min(5, n));
    const list = store.getDeleted(m.chat, 5).slice(0, n);
    if (!list.length) return reply(ui.notice('info', 'No deleted messages', 'Nothing deleted here yet. Text is always logged; photos/videos are recovered when the bot saw them before deletion.'));
    const lines = list.map((d, i) => {
      const who = d.sender ? '@' + short(d.sender) : 'unknown';
      const when = d.deletedAt ? new Date(d.deletedAt).toLocaleTimeString('en-GB') : '';
      const mediaMark = cache.has(m.chat, d.id) ? ' 📎[media recovered]' : '';
      const body = (d.body || `[${d.type || 'media'}]`).slice(0, 300);
      return `${i + 1}. ${who} ${when ? '(' + when + ')' : ''}${mediaMark}\n   ${body}`;
    });
    const mentions = list.map((d) => d.sender).filter(Boolean);
    await reply(ui.card({ icon: '♻', title: 'Deleted messages', subtitle: `${list.length} of last 5 in this chat`, rows: [], body: lines.join('\n\n') }), { mentions });
    // re-send every recovered media item, newest first
    for (const d of list) {
      const snap = cache.get(m.chat, d.id);
      const payload = cache.toPayload(snap);
      if (!payload) continue;
      try {
        const who = d.sender ? '@' + short(d.sender) : 'Someone';
        if (payload.image || payload.video) {
          await sock.sendMessage(m.chat, { ...payload, caption: `♻ ${who}${payload.caption ? '\n' + payload.caption : ''}`.slice(0, 1000), mentions: d.sender ? [d.sender] : [] }, { quoted: m.raw });
        } else {
          await sock.sendMessage(m.chat, payload).catch(() => {});
        }
        await new Promise((r) => setTimeout(r, 600));
      } catch {}
    }
  },
};
