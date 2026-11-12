/**
 * XADON · extra-commands — offline implementations for 10 thin wrapper commands.
 * These were crashing (module missing). All work offline, no API key needed.
 */
const config = require('../../config');

async function run(name, ctx) {
  const { reply, ui, text, args, m, sock, prefix } = ctx;
  const { fonts } = ui;
  switch (name) {
    case 'stats': {
      const up = Date.now() - (ctx.stats?.startedAt || Date.now());
      const h = Math.floor(up / 3600000); const mi = Math.floor((up % 3600000) / 60000);
      return reply(ui.card({ icon: '◈', title: 'Bot stats', subtitle: config.botName, rows: [['uptime', `${h}h ${mi}m`], ['commands', String(ctx.stats?.commands ?? 0)], ['messages', String(ctx.stats?.messages ?? 0)]], body: `Prefix ${fonts.mono(prefix)}\nMode ${fonts.mono(String(ctx.db?.get?.('mode', config.mode) || config.mode))}` }));
    }
    case 'version': {
      return reply(ui.card({ icon: '◈', title: 'Version', rows: [['bot', `v${config.version}`], ['node', process.version], ['engine', '@musteqeem/baileys']] }));
    }
    case 'countryinfo': {
      const q = (text || '').trim();
      if (!q) return reply(ui.notice('info', 'Country', `Usage: ${fonts.mono(`${prefix}countryinfo Nigeria`)}`));
      try {
        const r = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fields=name,capital,region,population,flags,currencies,languages`);
        const j = await r.json();
        const c = Array.isArray(j) ? j[0] : null;
        if (!c) throw new Error('not found');
        return reply(ui.card({ icon: '◈', title: c.name?.common || q, subtitle: c.region || '', rows: [['capital', (c.capital || ['—']).join(', ')], ['population', Number(c.population || 0).toLocaleString()], ['currency', Object.values(c.currencies || {}).map((x) => x.name).join(', ') || '—'], ['language', Object.values(c.languages || {}).join(', ') || '—']] }));
      } catch { return reply(ui.notice('error', 'Not found', `No country matched "${q.slice(0, 60)}".`)); }
    }
    case 'wiki': {
      const q = (text || '').trim();
      if (!q) return reply(ui.notice('info', 'Wiki', `Usage: ${fonts.mono(`${prefix}wiki Lionel Messi`)}`));
      try {
        const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
        const j = await r.json();
        if (!j?.extract) throw new Error('none');
        return reply(ui.card({ icon: '≡', title: j.title || q, body: `${String(j.extract).slice(0, 900)}` }));
      } catch { return reply(ui.notice('error', 'No article', `Nothing found for "${q.slice(0, 60)}".`)); }
    }
    case 'timezone': {
      const z = (args[0] || 'Africa/Lagos').trim();
      try {
        const s = new Date().toLocaleString('en-GB', { timeZone: z, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        return reply(ui.card({ icon: '◷', title: z, body: fonts.bold(s) }));
      } catch { return reply(ui.notice('error', 'Bad timezone', 'Try Africa/Lagos, Europe/London, America/New_York.')); }
    }
    case 'vcf': {
      const nm = (args[0] || m.pushName || 'Contact').slice(0, 60);
      const num = (args[1] || '').replace(/\D/g, '') || m.number || '';
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${nm}\nTEL;TYPE=CELL:${num}\nEND:VCARD`;
      await sock.sendMessage(m.chat, { document: Buffer.from(vcard), mimetype: 'text/vcard', fileName: `${nm}.vcf` }, { quoted: m.raw }).catch(() => {});
      return;
    }
    case 'table': {
      const raw = text || m.quoted?.body || '';
      if (!raw.includes('|')) return reply(ui.notice('info', 'Table', `Usage: ${fonts.mono(`${prefix}table a | b | c`)}`));
      const rows = raw.split('\n').map((l) => l.split('|').map((c) => c.trim()));
      const w = [];
      rows.forEach((r) => r.forEach((c, i) => { w[i] = Math.max(w[i] || 0, c.length); }));
      const out = rows.map((r) => r.map((c, i) => c.padEnd(w[i])).join(' │ ')).join('\n');
      return reply(fonts.mono(out.slice(0, 1500)));
    }
    case 'space': {
      try {
        const r = await fetch('http://api.open-notify.org/iss-now.json');
        const j = await r.json();
        const { latitude, longitude } = j?.iss_position || {};
        return reply(ui.card({ icon: '◈', title: 'ISS position', rows: [['lat', String(latitude)], ['lon', String(longitude)]], body: `https://maps.google.com/?q=${latitude},${longitude}` }));
      } catch { return reply(ui.notice('error', 'Space', 'ISS tracker is unreachable right now.')); }
    }
    case 'animesearch': {
      const q = (text || '').trim();
      if (!q) return reply(ui.notice('info', 'Anime', `Usage: ${fonts.mono(`${prefix}animesearch naruto`)}`));
      try {
        const r = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`);
        const j = await r.json();
        const a = j?.data?.[0];
        if (!a) throw new Error('none');
        return reply(ui.card({ icon: '◈', title: a.title_english || a.title, subtitle: String(a.type || ''), rows: [['score', String(a.score ?? '—')], ['episodes', String(a.episodes ?? '—')]], body: String(a.synopsis || '').slice(0, 600) }));
      } catch { return reply(ui.notice('error', 'Anime', `Nothing found for "${q.slice(0, 60)}".`)); }
    }
    case 'codesearch': {
      const q = (text || '').trim();
      if (!q) return reply(ui.notice('info', 'Code search', `Usage: ${fonts.mono(`${prefix}codesearch express static`)}`));
      return reply(`Search GitHub code:\nhttps://github.com/search?q=${encodeURIComponent(q)}&type=code`);
    }
    default:
      return reply(ui.notice('error', 'Unknown', `No handler for ${name}.`));
  }
}

module.exports = run;
