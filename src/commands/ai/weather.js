/** XADON AI weather — Open-Meteo, no key. */
module.exports = {
  name: 'weather',
  alias: ['wt', 'forecast'],
  desc: 'Current weather + forecast',
  usage: '.weather <city>',
  async run({ text, reply, ui, prefix, m }) {
    const { fonts } = ui;
    const city = text || m.quoted?.body;
    if (!city) return reply(ui.notice('info', 'Weather', `${fonts.mono(`${prefix}weather Lagos`)}`));
    try {
      const g = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`).then((r) => r.json());
      const place = g?.results?.[0];
      if (!place) throw new Error('no place');
      const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`).then((r) => r.json());
      const c = w.current || {};
      const code = { 0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Icy fog', 51: 'Light drizzle', 61: 'Rain', 71: 'Snow', 80: 'Showers', 95: 'Thunderstorm' }[c.weather_code] || '—';
      await reply(ui.card({
        icon: '◍', title: `${place.name}`, subtitle: `${place.country || ''} · weather`,
        rows: [['now', fonts.bold(`${c.temperature_2m ?? '?'}°C · ${code}`)], ['humidity', fonts.mono(`${c.relative_humidity_2m ?? '?'}%`)], ['wind', fonts.mono(`${c.wind_speed_10m ?? '?'} km/h`)], ['today', fonts.mono(`${w.daily?.temperature_2m_min?.[0] ?? '?'}° / ${w.daily?.temperature_2m_max?.[0] ?? '?'}°`)]],
        body: ui.footer(),
      }));
    } catch { await reply(ui.notice('error', 'Weather failed', `Could not find ${fonts.mono(city.slice(0, 40))}.`)); }
  },
};
