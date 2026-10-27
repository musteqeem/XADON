// XADON V8 · langdetect — offline script-based language hint (no API).
module.exports = {
  name: 'langdetect', alias: ['detectlang', 'whatlang'], desc: 'Guess text script/language', usage: '.langdetect <text>', category: 'tools',
  async run({ text, m, reply, ui }) {
    const s = (text || m.quoted?.body || '').trim();
    if (!s) return reply(ui.notice('info', 'Lang detect', 'Usage: .langdetect Bonjour le monde'));
    const hits = [];
    if (/[\u0600-\u06FF]/.test(s)) hits.push('Arabic');
    if (/[\u4E00-\u9FFF]/.test(s)) hits.push('Chinese');
    if (/[\u3040-\u30FF]/.test(s)) hits.push('Japanese');
    if (/[\uAC00-\uD7AF]/.test(s)) hits.push('Korean');
    if (/[\u0E00-\u0E7F]/.test(s)) hits.push('Thai');
    if (/[\u0900-\u097F]/.test(s)) hits.push('Hindi/Devanagari');
    if (/[А-Яа-яЁё]/.test(s)) hits.push('Russian/Cyrillic');
    if (/[α-ωΑ-Ω]/.test(s)) hits.push('Greek');
    const latin = (s.match(/[A-Za-z]/g) || []).length;
    if (!hits.length && latin >= 3) {
      if (/\b(the|and|you|your|hello|what|this|that)\b/i.test(s)) hits.push('English (likely)');
      else if (/\b(le|la|les|bonjour|merci|vous)\b/i.test(s)) hits.push('French (likely)');
      else if (/\b(el|los|hola|gracias|que)\b/i.test(s)) hits.push('Spanish (likely)');
      else hits.push('Latin script (unknown)');
    }
    return reply(ui.card({ icon: '🌐', title: 'Language hint', subtitle: `${s.length} chars analysed`, rows: [['script', hits.join(' + ') || 'unknown']], body: s.slice(0, 300) }));
  },
};
