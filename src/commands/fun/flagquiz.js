// XADON V8 · flagquiz — offline flag + capital quiz card.
const crypto = require('crypto');
const DATA = [['🇳🇬 Nigeria', 'Abuja'], ['🇬🇭 Ghana', 'Accra'], ['🇰🇪 Kenya', 'Nairobi'], ['🇿🇦 South Africa', 'Pretoria'], ['🇪🇬 Egypt', 'Cairo'], ['🇫🇷 France', 'Paris'], ['🇬🇧 United Kingdom', 'London'], ['🇺🇸 United States', 'Washington DC'], ['🇨🇦 Canada', 'Ottawa'], ['🇧🇷 Brazil', 'Brasilia'], ['🇮🇳 India', 'New Delhi'], ['🇯🇵 Japan', 'Tokyo'], ['🇩🇪 Germany', 'Berlin'], ['🇮🇹 Italy', 'Rome'], ['🇪🇸 Spain', 'Madrid'], ['🇦🇺 Australia', 'Canberra']];
module.exports = {
  name: 'flagquiz', alias: ['flagq', 'capquiz'], desc: 'Flag + capital quiz', usage: '.flagquiz', category: 'fun',
  async run({ reply, ui }) {
    const [flag, cap] = DATA[crypto.randomInt(DATA.length)];
    const others = DATA.map((d) => d[1]).filter((c) => c !== cap).sort(() => Math.random() - 0.5).slice(0, 2);
    const opts = [cap, ...others].sort(() => Math.random() - 0.5);
    return reply(ui.card({
      icon: '🌍', title: `Which capital? ${flag}`, subtitle: 'quiz — answer below',
      rows: opts.map((o, i) => [`option ${String.fromCharCode(65 + i)}`, o]),
      body: `Answer: || ${cap} ||`,
    }));
  },
};
