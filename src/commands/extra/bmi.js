// XADON AI · bmi (imported format).
module.exports = {
  name: 'bmi',
  aliases: ['bmicalc', 'bodymass'],
  description: 'BMI calculator (kg, cm)',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui } = extra;
    const w = Number(args[0]), h = Number(args[1]);
    if (!w || !h || w < 20 || w > 400 || h < 50 || h > 250) return reply(ui.notice('info', 'BMI', 'Usage: .bmi 70 175  (kg, cm)'));
    const v = w / ((h / 100) ** 2);
    const cat = v < 18.5 ? 'underweight' : v < 25 ? 'healthy' : v < 30 ? 'overweight' : 'obese';
    return reply(ui.card({ icon: '\u25C9', title: 'BMI result', subtitle: cat, rows: [['bmi', v.toFixed(1)], ['weight', w + ' kg'], ['height', h + ' cm']] }));
  },
};
