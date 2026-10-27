// XADON V8 · readingtime — estimate reading/speaking time (offline).
module.exports = {
  name: 'readingtime', alias: ['readtime', 'speaktime'], desc: 'Reading time estimate', usage: '.readingtime <text>', category: 'tools',
  async run({ text, m, reply, ui }) {
    const s = (text || m.quoted?.body || '').trim();
    if (!s) return reply(ui.notice('info', 'Reading time', 'Usage: .readingtime <paste text>'));
    const words = (s.match(/\S+/g) || []).length;
    const read = Math.max(1, Math.round(words / 200));
    const speak = Math.max(1, Math.round(words / 130));
    return reply(ui.card({
      icon: '◷', title: `${words} words`, subtitle: 'offline estimate',
      rows: [['read silently', `~${read} min`], ['speak aloud', `~${speak} min`]],
    }));
  },
};
