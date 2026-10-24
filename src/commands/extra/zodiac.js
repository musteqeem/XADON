// XADON AI · zodiac (imported format).
module.exports = {
  name: 'zodiac',
  aliases: ['starsign', 'horoscopex'],
  description: 'Zodiac sign from birthdate',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui } = extra;
    const s = String(args[0] || '');
    const mt = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!mt) return reply(ui.notice('info', 'Zodiac', 'Usage: .zodiac 2001-05-14'));
    const mo = +mt[2], d = +mt[3];
    const signs = [[3, 21, 4, 19, 'Aries', 'Bold, energetic, first to act'], [4, 20, 5, 20, 'Taurus', 'Loyal, patient, loves comfort'], [5, 21, 6, 20, 'Gemini', 'Curious, witty, quick mind'], [6, 21, 7, 22, 'Cancer', 'Caring, intuitive, protective'], [7, 23, 8, 22, 'Leo', 'Confident, generous, born to shine'], [8, 23, 9, 22, 'Virgo', 'Precise, helpful, detail lover'], [9, 23, 10, 22, 'Libra', 'Fair, charming, peace maker'], [10, 23, 11, 21, 'Scorpio', 'Intense, brave, deeply loyal'], [11, 22, 12, 21, 'Sagittarius', 'Free, honest, adventure seeker'], [12, 22, 1, 19, 'Capricorn', 'Steady, ambitious, mountain climber']];
    let sign = ['Aquarius', 'Original, calm, future minded'];
    for (const [m1, d1, m2, d2, n, t] of signs) { if ((mo === m1 && d >= d1) || (mo === m2 && d <= d2)) { sign = [n, t]; break; } }
    if ((mo === 1 && d >= 20) || (mo === 2 && d <= 18)) sign = ['Aquarius', 'Original, calm, future minded'];
    if ((mo === 2 && d >= 19) || (mo === 3 && d <= 20)) sign = ['Pisces', 'Gentle, dreamy, old soul'];
    return reply(ui.card({ icon: '\u2726', title: sign[0], subtitle: s, rows: [], body: sign[1] }));
  },
};
