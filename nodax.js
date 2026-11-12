// nodax.js — NODAX AI V1 · agent chatbot engine (JARVIS-style).
//
// NODAX chats like a human, remembers people, and (owner/sudo only) controls
// the bot in plain English: run commands, toggle commands, create/fix/delete
// command files, reload, restart, test code, dev mode.
//
// ─────────────────────────────────────────────────────────────
// 5 FIRST-GRADE PUBLIC APIs (all FREE, all KEYLESS, no signup)
// ─────────────────────────────────────────────────────────────
//  1. Pollinations AI  — chat brain + intent classifier + code writer + image gen
//     POST https://text.pollinations.ai/openai   (OpenAI-compatible, keyless)
//     GET  https://text.pollinations.ai/{prompt}  (fallback)
//     IMG  https://image.pollinations.ai/prompt/{prompt}
//  2. Wikipedia REST   — knowledge facts (who is / what is)
//     GET https://en.wikipedia.org/api/rest_v1/page/summary/{title}
//  3. DuckDuckGo Instant Answers — quick answers, abstracts, definitions
//     GET https://api.duckduckgo.com/?q=..&format=json&no_html=1&skip_disambig=1
//  4. Open-Meteo        — weather (geocoding + forecast, keyless, unlimited)
//     GET https://geocoding-api.open-meteo.com/v1/search?name=..&count=1
//     GET https://api.open-meteo.com/v1/forecast?..
//  5. Translate (Google gtx + MyMemory fallback) — auto-detect, keyless
//     GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=..&dt=t&q=..
//     GET https://api.mymemory.translated.net/get?q=..&langpair=..|..
//
// Everything degrades gracefully: if the net/AI is down, NODAX still answers
// from its offline brain + memory and NEVER crashes the bot.
//
// ─────────────────────────────────────────────────────────────
// WIRING (already done in src/handler.js — step 0 of the auto-hooks):
//   const nodax = require('../../nodax');
//   const handled = await nodax.handle(sock, raw, m, { db, config, prefix, isPriv, dispatch });
//   if (handled) return;   // truthy = NODAX handled it, skip other handlers
// `.nodax ...` command comes via src/commands/ai/nodax.js (thin bridge).
//
// @musteqeem — Owner / Creator of NODAX

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFile } = require('child_process');

const ROOT = __dirname;
const DB_DIR = path.join(ROOT, 'database');
const COMMANDS_DIR = path.join(ROOT, 'src', 'commands');
const BACKUP_DIR = path.join(DB_DIR, 'nodax_backup');
const MEM_FILE = path.join(DB_DIR, 'nodax_memory.json');
const OPS_FILE = path.join(DB_DIR, 'nodax_ops.json');

// ── identity ──────────────────────────────────────────────────
const SELF_NAMES = ['nodax', 'ndx', 'nod', 'boss', 'jarvis'];
const CREATOR = 'Musteqeem';
const MODEL = process.env.NODAX_MODEL || 'openai';

// ── tiny helpers ──────────────────────────────────────────────
const digits = (v = '') => String(v).split('@')[0].split(':')[0].replace(/\D/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (s, n) => String(s || '').slice(0, n);

function loadJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return fallback; }
}
function saveJson(file, data) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch { return false; }
}

async function fetchTimeout(url, opts = {}, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally { clearTimeout(t); }
}
async function getJson(url, ms) {
  const res = await fetchTimeout(url, { headers: { 'user-agent': 'NODAX/1.0', accept: 'application/json' } }, ms || 12000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function getText(url, ms) {
  const res = await fetchTimeout(url, { headers: { 'user-agent': 'NODAX/1.0' } }, ms || 12000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.text()).trim();
}

// ═════════════════════════════════════════════════════════════
// API 1 · POLLINATIONS AI (chat brain, classifier, code writer)
// ═════════════════════════════════════════════════════════════
async function pollinationsChat(messages, opts = {}) {
  const body = {
    model: opts.model || MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens || 800,
  };
  try {
    const res = await fetchTimeout('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }, opts.timeout || 30000);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
    const text = json?.choices?.[0]?.message?.content?.trim();
    if (text) return text;
    throw new Error('empty reply');
  } catch (e) {
    // fallback: keyless GET endpoint
    const last = [...messages].reverse().find((x) => x.role === 'user');
    const sys = messages.find((x) => x.role === 'system');
    const url = `https://text.pollinations.ai/${encodeURIComponent(clamp(last?.content || 'hi', 1500))}`
      + `?model=${encodeURIComponent(opts.model || MODEL)}`
      + (sys ? `&system=${encodeURIComponent(clamp(sys.content, 800))}` : '');
    return getText(url, opts.timeout || 30000);
  }
}
const imagineUrl = (prompt) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(clamp(prompt, 400))}?width=1024&height=1024&nologo=true&model=flux`;

// ═════════════════════════════════════════════════════════════
// API 1B · GROQ (free, fast) — used FIRST when GROQ_API_KEY is set
// ═════════════════════════════════════════════════════════════
const GROQ_MODEL = process.env.GROQ_MODEL || process.env.NODAX_GROQ_MODEL || 'llama-3.3-70b-versatile';
async function groqChat(messages, opts = {}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('no GROQ_API_KEY');
  const res = await fetchTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: opts.model || GROQ_MODEL, messages, temperature: opts.temperature ?? 0.7, max_tokens: opts.maxTokens || 800 }),
  }, opts.timeout || 30000);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message || `groq HTTP ${res.status}`);
  const text = json?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('groq empty reply');
  return text;
}
// Smart brain router: GROQ first (if key), then Pollinations, then offline.
async function brainChat(messages, opts = {}) {
  if (process.env.GROQ_API_KEY) {
    try { return await groqChat(messages, opts); } catch {}
  }
  return pollinationsChat(messages, opts);
}

// ═════════════════════════════════════════════════════════════
// API 2 · WIKIPEDIA (knowledge facts)
// ═════════════════════════════════════════════════════════════
async function wikiSummary(query) {
  const title = encodeURIComponent(String(query).trim().replace(/\s+/g, '_').slice(0, 200));
  try {
    const j = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    if (j?.extract) return { title: j.title, extract: j.extract, url: j?.content_urls?.desktop?.page || '' };
  } catch {}
  // fallback: search then summary
  const s = await getJson(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1&origin=*`).catch(() => null);
  const hit = s?.query?.search?.[0]?.title;
  if (!hit) throw new Error('no wiki page');
  const j = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit)}`);
  if (!j?.extract) throw new Error('no wiki extract');
  return { title: j.title, extract: j.extract, url: j?.content_urls?.desktop?.page || '' };
}

// ═════════════════════════════════════════════════════════════
// API 3 · DUCKDUCKGO INSTANT ANSWERS (quick answers)
// ═════════════════════════════════════════════════════════════
async function duckAnswer(query) {
  const j = await getJson(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
  if (j?.Answer) return String(j.Answer).replace(/<[^>]+>/g, '').trim();
  if (j?.AbstractText) return `${j.AbstractText} (Source: ${j.AbstractURL || 'DuckDuckGo'})`.trim();
  const rel = (j?.RelatedTopics || []).find((t) => t?.Text)?.Text;
  if (rel) return String(rel).slice(0, 600);
  throw new Error('no instant answer');
}

// ═════════════════════════════════════════════════════════════
// API 4 · OPEN-METEO (weather, keyless)
// ═════════════════════════════════════════════════════════════
const WMO = { 0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Light showers', 81: 'Showers', 82: 'Violent showers', 95: 'Thunderstorm', 96: 'Storm + hail', 99: 'Severe storm' };
async function weatherFor(place) {
  const g = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`);
  const loc = g?.results?.[0];
  if (!loc) throw new Error('place not found');
  const f = await getJson(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`);
  const c = f.current || {};
  const d = f.daily || {};
  const days = (d.time || []).slice(0, 3).map((t, i) => `${t}: ${d.temperature_2m_min?.[i]}–${d.temperature_2m_max?.[i]}°C, rain ${d.precipitation_probability_max?.[i] ?? '?'}%`).join('\n');
  return { name: `${loc.name}${loc.country ? `, ${loc.country}` : ''}`, cur: `${WMO[c.weather_code] || '—'}, ${c.temperature_2m}°C (feels ${c.apparent_temperature}°C), humidity ${c.relative_humidity_2m}%, wind ${c.wind_speed_10m} km/h`, days };
}

// ═════════════════════════════════════════════════════════════
// API 5 · TRANSLATE (Google gtx primary, MyMemory fallback — both keyless)
// ═════════════════════════════════════════════════════════════
const LANGS = { english: 'en', french: 'fr', spanish: 'es', german: 'de', italian: 'it', portuguese: 'pt', arabic: 'ar', hausa: 'ha', yoruba: 'yo', igbo: 'ig', pidgin: 'en', swahili: 'sw', chinese: 'zh', hindi: 'hi', russian: 'ru', dutch: 'nl', turkish: 'tr', japanese: 'ja', korean: 'ko', amharic: 'am', urdu: 'ur' };
async function translateText(q, target) {
  const tl = (LANGS[String(target).toLowerCase()] || String(target).toLowerCase()).slice(0, 5);
  try {
    const j = await getJson(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(q)}`);
    const text = (j?.[0] || []).map((x) => x?.[0]).filter(Boolean).join('');
    const src = j?.[2] || 'auto';
    if (text) return { text, source: src, target: tl };
    throw new Error('empty');
  } catch {
    const j = await getJson(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=autodetect|${encodeURIComponent(tl)}`);
    const text = j?.responseData?.translatedText;
    if (!text) throw new Error('translate failed');
    return { text, source: 'auto', target: tl };
  }
}

// ═════════════════════════════════════════════════════════════
// MEMORY (persistent per-user chat memory + ops log)
// ═════════════════════════════════════════════════════════════
function memAll() { return loadJson(MEM_FILE, { users: {} }); }
function memGet(id) { return memAll().users?.[String(id)] || null; }
function memSave(id, patch) {
  const all = memAll();
  all.users = all.users || {};
  all.users[String(id)] = { ...(all.users[String(id)] || {}), ...patch };
  saveJson(MEM_FILE, all);
}
function memPush(id, role, content) {
  const u = memGet(id) || {};
  const history = [...(u.history || []), { role, content: clamp(content, 800), at: Date.now() }].slice(-20);
  memSave(id, { ...u, history });
}
function opsLog() { return loadJson(OPS_FILE, []); }
function opsAdd(entry) {
  const arr = opsLog();
  arr.push({ at: new Date().toISOString(), ...entry });
  saveJson(OPS_FILE, arr.slice(-200));
}

// ── offline brain: NODAX always answers, even with zero internet ──
function offlineBrain(text = '', u = {}) {
  const t = String(text).toLowerCase().trim();
  const name = u.name ? ` ${u.name}` : '';
  if (!t || /^(hi|hello|hey|yo|good (morning|afternoon|evening)|how far|howfa)\b/.test(t)) {
    return pick([
      `Hey${name}! NODAX here. What are we getting into today?`,
      `Yo${name}! Good to see you. Talk to me.`,
      `Hello${name}! I'm NODAX, built by ${CREATOR}. What's on your mind?`,
    ]);
  }
  if (/\b(who (are|r) you|your name|about you|who made you|who created you)\b/.test(t)) return `I'm NODAX — your personal AI, created by ${CREATOR}. I chat, I remember you, and for my boss I can even run this bot.`;
  if (/\b(joke|funny|laugh)\b/.test(t)) {
    return pick([
      'Why did the developer go broke? He used up all his cache.',
      'NEPA and WiFi get one thing in common: dem dey fail at the worst time.',
      'My phone battery lasts longer than some relationships. No shade.',
      'Why do programmers prefer dark mode? Because light attracts bugs.',
      'I told my laptop I needed space. Now it charges me rent in fan noise.',
    ]);
  }
  if (/\b(time|date|day is it)\b/.test(t)) return `Right now: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })} (Lagos).`;
  if (/\b(thank|thanks)\b/.test(t)) return 'Anytime! That is literally what I exist for.';
  if (/\b(bye|good ?night)\b/.test(t)) return 'Alright, I go dey here when you need me. Later!';
  if (/\b(how are you|how far|how bodi)\b/.test(t)) return 'System cool, vibes high, battery full. How your side?';
  if (/\b(sad|depress|lonely|heart ?break|gf left|bf left|breakfast)\b/.test(t)) return 'Omo, sorry. That kind pain dey real. Take your time, no rush yourself — and if you wan talk, I dey listen. Want gist or distraction?';
  if (/\b(love|girlfriend|boyfriend|crush|relationship)\b/.test(t)) return 'Love matter? My rule: talk clear, respect boundaries, never double-text in anger. Want make I help you draft the message?';
  if (/\b(money|rich|business|bet|loan)\b/.test(t)) return 'Money rule: spend less than you earn, save first, compound the rest. Want a simple weekly saving plan?';
  if (t.length < 30) return `Hmm, "${String(text).slice(0, 60)}" — tell me more, I dey listen. (offline mode: connect me to the net for full superpowers.)`;
  return `I hear you. I'm in offline mode right now so I fit only reason lightly — gist me with details and we go reason am together.`;
}

const JOKES = null; // (served from offlineBrain to stay dependency-free)

// ── chat brain prompt ─────────────────────────────────────────
function systemPrompt(u = {}, opts = {}) {
  const facts = (u.facts || []).slice(-6).join(' | ');
  return [
    `You are NODAX, a premium WhatsApp AI created by ${CREATOR}. You are chatting on WhatsApp — be HUMAN: short replies most times (1-3 lines), funny, loyal, a little teasing. Emojis sparingly (max 1-2). NEVER say "as an AI language model", never claim Meta/OpenAI made you. Your maker is ${CREATOR}, full stop.`,
    `Mirror the user's language: English→English, Pidgin→Pidgin, Hausa→Hausa, Yoruba→Yoruba.`,
    u.name ? `User's name: ${u.name}.` : 'You do not know the user\'s name yet.',
    u.mood ? `Recent mood: ${u.mood}.` : '',
    facts ? `Remembered about user: ${facts}.` : '',
    `If asked to do bot-owner stuff (files, restart, eval), say only the boss (${CREATOR}) can approve that.`,
    opts.toolContext ? `Live tool results for this question:\n${opts.toolContext}` : '',
  ].filter(Boolean).join('\n');
}

async function chatBrain(text, u = {}, toolContext = '') {
  const messages = [
    { role: 'system', content: systemPrompt(u, { toolContext }) },
    ...((u.history || []).slice(-10).map((h) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content }))),
    { role: 'user', content: clamp(text, 2000) },
  ];
  try {
    return await brainChat(messages, { maxTokens: 600 });
  } catch {
    return offlineBrain(text, u);
  }
}

// ── intent classifier: LLM first, regex fallback (FIX-NODAX-02) ──
const CLASSIFY_PROMPT = `You classify a WhatsApp bot owner's message into ONE JSON action. Reply with ONLY JSON, no other text.
Actions: CHAT, RUN_COMMAND{cmd,args}, CREATE_FILE{name,desc}, EDIT_FILE{file,instruction}, DELETE_FILE{file}, FIX_CODE{file,problem}, TOGGLE_COMMAND{cmd,state}, RELOAD{}, RESTART{}, TEST_CODE{code}, TOGGLE_DEV{state}, WEATHER{place}, WIKI{query}, TRANSLATE{text,target}, IMAGINE{prompt}, STATUS{}, HELP{}, AUTO{state}, FORGET{}, OPS{}
Examples:
"run ping" -> {"action":"RUN_COMMAND","args":{"cmd":"ping","args":[]}}
"turn off tagall" -> {"action":"TOGGLE_COMMAND","args":{"cmd":"tagall","state":"off"}}
"make a command that tells jokes" -> {"action":"CREATE_FILE","args":{"name":"joke","desc":"sends a random joke"}}
"sticker command is broken, fix it" -> {"action":"FIX_CODE","args":{"file":"sticker","problem":"user reports it is broken"}}
"weather in Lagos" -> {"action":"WEATHER","args":{"place":"Lagos"}}
"who is Wizkid" -> {"action":"WIKI","args":{"query":"Wizkid"}}
"translate good morning to French" -> {"action":"TRANSLATE","args":{"text":"good morning","target":"French"}}
"draw a flying car" -> {"action":"IMAGINE","args":{"prompt":"a flying car"}}`;

async function classifyIntent(text) {
  const t = String(text).trim();
  try {
    const out = await brainChat(
      [{ role: 'system', content: CLASSIFY_PROMPT }, { role: 'user', content: clamp(t, 800) }],
      { temperature: 0, maxTokens: 200, timeout: 20000 }
    );
    const m = out.match(/\{[\s\S]*\}/);
    if (m) {
      const j = JSON.parse(m[0]);
      if (j?.action) return { action: String(j.action).toUpperCase(), args: j.args || j.params || {} };
    }
  } catch {}
  return regexIntent(t);
}

function regexIntent(t) {
  const low = t.toLowerCase().trim();
  let m;
  if ((m = low.match(/^(?:please\s+)?(?:run|execute|call)\s+\.?([a-z0-9_]+)\s*(.*)$/))) return { action: 'RUN_COMMAND', args: { cmd: m[1], args: (m[2] || '').split(/\s+/).filter(Boolean) } };
  if ((m = low.match(/^(?:turn|switch|put)\s+(off|on|disable|enable)\s+\.?([a-z0-9_]+)$/))) return { action: 'TOGGLE_COMMAND', args: { cmd: m[2], state: /off|disable/.test(m[1]) ? 'off' : 'on' } };
  if ((m = low.match(/^(?:add|create|make|build)\s+(?:a\s+)?command\s+\.?([a-z0-9_]+)?\s*(?:that|which|to|for)?\s*(.*)$/))) return { action: 'CREATE_FILE', args: { name: m[1] || '', desc: m[2] || t } };
  if ((m = low.match(/^(?:fix|repair|debug)\s+(?:the\s+)?\.?([a-z0-9_]+)(?:\s+(?:command|cmd|file))?\s*(.*)$/))) return { action: 'FIX_CODE', args: { file: m[1], problem: m[2] || 'reported broken' } };
  if ((m = low.match(/^(?:delete|remove)\s+(?:the\s+)?\.?([a-z0-9_]+)(?:\s+(?:command|cmd))?$/))) return { action: 'DELETE_FILE', args: { file: m[1] } };
  if (/^reload|refresh commands/.test(low)) return { action: 'RELOAD', args: {} };
  if (/^restart|reboot/.test(low)) return { action: 'RESTART', args: {} };
  if ((m = low.match(/^dev\s+(on|off)$/)) || (m = low.match(/^developer\s+mode\s+(on|off)$/))) return { action: 'TOGGLE_DEV', args: { state: m[1] } };
  if ((m = t.match(/^test\s+([\s\S]+)$/i))) return { action: 'TEST_CODE', args: { code: m[1] } };
  if ((m = low.match(/^weather(?:\s+in|\s+for)?\s+(.+)$/))) return { action: 'WEATHER', args: { place: m[1] } };
  if ((m = low.match(/^(?:who|what)\s+is\s+(.+)$/))) return { action: 'WIKI', args: { query: m[1].replace(/\?$/, '') } };
  if ((m = low.match(/^(?:define|meaning of)\s+(.+)$/))) return { action: 'WIKI', args: { query: m[1] } };
  if ((m = t.match(/^translate\s+"?(.+?)"?\s+to\s+([a-z]+)\s*$/i))) return { action: 'TRANSLATE', args: { text: m[1], target: m[2] } };
  if ((m = low.match(/^(?:imagine|draw|generate image|create image)(?:\s+of)?\s+(.+)$/))) return { action: 'IMAGINE', args: { prompt: m[1] } };
  if (/^status|bot status/.test(low)) return { action: 'STATUS', args: {} };
  if (/^(help|what can you do|commands)$/.test(low)) return { action: 'HELP', args: {} };
  if ((m = low.match(/^auto\s+(on|off)$/))) return { action: 'AUTO', args: { state: m[1] } };
  if (/^forget me|clear memory|forget/.test(low)) return { action: 'FORGET', args: {} };
  if (/^(ops|op log|what did you change|history)/.test(low)) return { action: 'OPS', args: {} };
  return { action: 'CHAT', args: {} };
}

// ── agent file ops (FIX-NODAX-03: backup + node --check + 5-try AI fix) ──
function safeCommandPath(name) {
  const base = String(name || '').toLowerCase().replace(/\.js$/, '').replace(/[^a-z0-9_-]/g, '');
  if (!base) return null;
  // search existing file (any category folder) or default to general/
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { const hit = walk(full); if (hit) return hit; }
      else if (e.name.toLowerCase() === `${base}.js`) return full;
    }
    return null;
  };
  try {
    const hit = walk(COMMANDS_DIR);
    if (hit) return hit;
  } catch {}
  return path.join(COMMANDS_DIR, 'general', `${base}.js`);
}
function nodeCheck(file) {
  return new Promise((resolve) => {
    execFile(process.execPath, ['--check', file], { timeout: 15000 }, (err) => resolve(err ? String(err.message || err).slice(0, 500) : null));
  });
}
function backupFile(file) {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const dst = path.join(BACKUP_DIR, `${Date.now()}-${path.basename(file)}`);
    fs.copyFileSync(file, dst);
    return dst;
  } catch { return null; }
}
async function aiWriteCode(task, oldCode = '') {
  const prompt = `Write a complete XADON WhatsApp bot command file. Rules: CommonJS, module.exports = { name, desc, usage, category, async run({ sock, m, args, text, reply, ui, db, prefix }) {...} }. Use reply(ui.notice(...)) for output. No external npm packages (only built-in node + global fetch). Keep it under 120 lines.\nTASK: ${clamp(task, 1500)}${oldCode ? `\nEXISTING CODE (edit this):\n${clamp(oldCode, 4000)}` : ''}\nReply with ONLY the JS code, no markdown fences.`;
  const out = await brainChat([{ role: 'user', content: prompt }], { maxTokens: 3000, timeout: 45000 });
  return out.replace(/^```(?:js|javascript)?/i, '').replace(/```$/i, '').trim();
}

// ═════════════════════════════════════════════════════════════
// CORE: process one text through NODAX
// ═════════════════════════════════════════════════════════════
async function handleText(sock, raw, m, text, env = {}) {
  const { db = null, prefix = '.', dispatch = null } = env;
  const cfg = (() => { try { return require('./config'); } catch { return {}; } })();
  const privs = (() => { try { return require('./src/lib/privs'); } catch { return null; } })();
  const uid = digits(m?.sender || m?.number || '');
  const isPriv = !!(env.isPriv ?? (privs && db && privs.isSudoPriv(db, cfg, m?.number || uid)));

  // memory load + light profile learning
  let u = memGet(uid) || { history: [] };
  const nameHit = String(text).match(/(?:my name is|call me|i am|i'm)\s+([A-Za-z]{2,20})/i);
  if (nameHit && !u.name) { u.name = nameHit[1]; memSave(uid, u); }
  if (/pidgin|nawa|omo|wahala|dey\b/.test(String(text).toLowerCase())) u.lang = 'pidgin';
  else if (/[\u0600-\u06FF]/.test(String(text))) u.lang = 'hausa';

  const send = (msg) => sock.sendMessage(m.chat, msg, { quoted: raw }).catch(() => {});
  const dev = !!(db && db.get('nodax:dev', false));

  // FIX-NODAX-01: bare self-name never dumps a menu
  if (/^(nodax|ndx|nod|boss|jarvis)[!?.\s]*$/i.test(String(text).trim())) {
    const r = isPriv ? `Yes boss? I'm here. What do you need?` : `Yes? I'm NODAX, built by ${CREATOR}. Ask me anything — or try "nodax help".`;
    memPush(uid, 'user', text); memPush(uid, 'assistant', r);
    await send({ text: r });
    return true;
  }

  const { action, args } = await classifyIntent(text);
  const PRIV_ONLY = ['RUN_COMMAND', 'CREATE_FILE', 'EDIT_FILE', 'DELETE_FILE', 'FIX_CODE', 'TOGGLE_COMMAND', 'RELOAD', 'RESTART', 'TEST_CODE', 'TOGGLE_DEV', 'OPS', 'AUTO'];

  // ── agent actions (owner/sudo only — FIX-NODAX-06) ──
  if (PRIV_ONLY.includes(action) && !isPriv) {
    const r = `Sorry, only my boss can do that 😅 (that one na owner-level action). But I fit still gist, answer questions, check weather, translate, anything — try me.`;
    await send({ text: r });
    return true;
  }

  try {
    switch (action) {
      case 'RUN_COMMAND': {
        const cmd = String(args.cmd || '').toLowerCase();
        const cArgs = Array.isArray(args.args) ? args.args : String(args.args || '').split(/\s+/).filter(Boolean);
        if (!cmd) { await send({ text: 'Which command make I run? Example: "nodax run ping".' }); return true; }
        if (dispatch) { await dispatch(cmd, cArgs); opsAdd({ by: uid, action, cmd, args: cArgs, ok: true }); return true; }
        await send({ text: `Dispatch not wired in this context — use .${cmd} ${cArgs.join(' ')} directly.`.trim() });
        return true;
      }
      case 'TOGGLE_COMMAND': {
        const cmd = String(args.cmd || '').toLowerCase();
        const on = args.state !== 'off';
        if (db) {
          const key = `disabled:${m.chat}`;
          const off = db.get(key, []);
          if (on) db.set(key, off.filter((x) => x !== cmd));
          else if (!off.includes(cmd)) db.set(key, [...off, cmd]);
        }
        opsAdd({ by: uid, action, cmd, state: on ? 'on' : 'off', ok: true });
        await send({ text: on ? `Done boss — .${cmd} is back ON.` : `Done boss — .${cmd} is now OFF${m.isGroup ? ' in this group' : ''}.` });
        return true;
      }
      case 'CREATE_FILE': {
        let name = String(args.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!name) {
          const g = String(args.desc || '').match(/(?:command\s+)?\.?([a-z0-9_]+)/i);
          name = (g?.[1] || 'custom').toLowerCase();
        }
        const file = safeCommandPath(name);
        if (fs.existsSync(file)) { await send({ text: `That command already exists (${path.basename(file)}). Tell me to "fix ${name}" instead, or pick another name.` }); return true; }
        await send({ text: `On am — I dey build .${name} now…` });
        let code;
        try { code = await aiWriteCode(`Create a command named "${name}": ${args.desc || text}`); }
        catch { code = fallbackCommandCode(name, args.desc); }
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, code);
        let err = await nodeCheck(file);
        let tries = 0;
        while (err && tries < 5) {
          tries++;
          try {
            const fixed = await aiWriteCode(`Fix this JS file (syntax error: ${err}). Return ONLY fixed code.`, code);
            code = fixed; fs.writeFileSync(file, code);
            err = await nodeCheck(file);
          } catch { break; }
        }
        if (err) {
          try { fs.unlinkSync(file); } catch {}
          opsAdd({ by: uid, action, file, ok: false, error: err });
          await send({ text: `I tried 5 times boss, e no gree compile. I removed the file so nothing break. Error:${dev ? `\n${err}` : ' (turn on "nodax dev on" to see it)'}` });
          return true;
        }
        try { require('./src/loader').load(); } catch {}
        opsAdd({ by: uid, action, file, ok: true });
        await send({ text: `Done boss ✅ .${name} is live. Try am now.` });
        return true;
      }
      case 'FIX_CODE':
      case 'EDIT_FILE': {
        const file = safeCommandPath(args.file || '');
        if (!file || !fs.existsSync(file)) { await send({ text: `I no fit find that file. Which command exactly? (e.g. "fix sticker")` }); return true; }
        const old = fs.readFileSync(file, 'utf8');
        backupSafe(file);
        await send({ text: `Copy — I dey fix ${path.basename(file)}…` });
        let code = old; let err = null; let tries = 0;
        while (tries < 5) {
          tries++;
          try { code = await aiWriteCode(`${action === 'FIX_CODE' ? `Fix this command (${args.problem || 'user reports bug'})` : `Apply this change: ${args.instruction || text}`}`, code); }
          catch (e) { err = String(e.message || e); break; }
          fs.writeFileSync(file, code);
          err = await nodeCheck(file);
          if (!err) break;
        }
        if (err) {
          const latest = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(path.basename(file))).sort().pop();
          try { if (latest) fs.copyFileSync(path.join(BACKUP_DIR, latest), file); } catch {}
          opsAdd({ by: uid, action, file, ok: false, error: err });
          await send({ text: `I tried 5 times, I restored the old version, here is the error:${dev ? `\n${err}` : `\n${clamp(err, 200)}\n("nodax dev on" for full gist)`}` });
          return true;
        }
        try { require('./src/loader').load(); } catch {}
        opsAdd({ by: uid, action, file, ok: true });
        await send({ text: `Fixed ✅ ${path.basename(file)} reloaded. Test am.` });
        return true;
      }
      case 'DELETE_FILE': {
        const file = safeCommandPath(args.file || '');
        if (!file || !fs.existsSync(file)) { await send({ text: `No file like that. Tell me the exact command name.` }); return true; }
        backupSafe(file);
        try { fs.unlinkSync(file); } catch (e) { await send({ text: `Could not delete: ${clamp(e.message, 150)}` }); return true; }
        try { require('./src/loader').load(); } catch {}
        opsAdd({ by: uid, action, file, ok: true });
        await send({ text: `Deleted 🗑 ${path.basename(file)} (backup saved, I fit restore am if you change mind).` });
        return true;
      }
      case 'RELOAD': {
        try { require('./src/loader').load(); } catch (e) { await send({ text: `Reload failed: ${clamp(e.message, 200)}` }); return true; }
        opsAdd({ by: uid, action, ok: true });
        await send({ text: 'Reloaded ✅ all commands fresh.' });
        return true;
      }
      case 'RESTART': {
        opsAdd({ by: uid, action, ok: true });
        await send({ text: 'Restarting… give me a few seconds, I go soon land. ♻️' });
        setTimeout(() => process.exit(0), 1500);
        return true;
      }
      case 'TEST_CODE': {
        const out = await sandboxRun(String(args.code || ''));
        await send({ text: `Test result:\n${clamp(out, 1200)}` });
        return true;
      }
      case 'TOGGLE_DEV': {
        if (db) db.set('nodax:dev', args.state !== 'off');
        await send({ text: args.state !== 'off' ? 'Dev mode ON — I go show errors and code gist.' : 'Dev mode off.' });
        return true;
      }
      case 'AUTO': {
        if (db) db.set('nodax:auto', { on: args.state !== 'off' });
        await send({ text: args.state !== 'off' ? 'Auto-chat ON — I go reply DMs, tags and replies by myself.' : 'Auto-chat off — call my name ("nodax …") or use .nodax when you need me.' });
        return true;
      }
      case 'FORGET': {
        memSave(uid, { history: [] });
        await send({ text: 'Forgotten 🧠 fresh start. Who be this?' });
        return true;
      }
      case 'OPS': {
        const ops = opsLog().slice(-10).reverse();
        await send({ text: ops.length ? `Last changes:\n${ops.map((o) => `• ${o.at?.slice(0, 16)} ${o.action} ${o.file || o.cmd || ''} ${o.ok === false ? '❌' : '✅'}`).join('\n')}` : 'I never change anything yet.' });
        return true;
      }
      case 'STATUS': {
        const mem = memAll();
        await send({ text: `NODAX V1 online ✅\nBrain: " + (process.env.GROQ_API_KEY ? ('Groq (' + GROQ_MODEL + ') + Pollinations') : ('Pollinations (' + MODEL + ')')) + " + offline backup\nMemory: ${Object.keys(mem.users || {}).length} users\nDev: ${dev ? 'on' : 'off'} · Auto: ${db?.get('nodax:auto', {}).on ? 'on' : 'off'}\nTry: "nodax weather Lagos" · "nodax who is Burna Boy" · "nodax draw a robot"` });
        return true;
      }
      case 'HELP': {
        await send({
          text: [
            `I'm NODAX, built by ${CREATOR}. I fit gist like human — plus tools:`,
            `• nodax weather <city> · nodax who is < gist> · nodax translate <text> to <lang> · nodax draw <idea>`,
            isPriv ? `• Boss only: "nodax run .ping" · "turn off tagall" · "add command .x that…" · "fix sticker" · "delete song command" · "reload" · "restart" · "test 2+2" · "dev on"` : `• (Owner-level file/system actions na for my boss only 😅)`,
          ].join('\n'),
        });
        return true;
      }
      // ── tools (everyone) ──
      case 'WEATHER': {
        try {
          const w = await weatherFor(args.place || 'Lagos');
          const r = await chatBrain(`User asked for weather. Give it short and human with these facts: ${w.name}: ${w.cur}. Next days:\n${w.days}`, u);
          memPush(uid, 'user', text); memPush(uid, 'assistant', r);
          await send({ text: `${r}\n\n⌬ open-meteo` });
        } catch { await send({ text: `I no fit find "${args.place}" — check spelling and try again.` }); }
        return true;
      }
      case 'WIKI': {
        const tc = await toolContext(args.query);
        const r = await chatBrain(`Answer briefly and human: "${args.query}"`, u, tc);
        memPush(uid, 'user', text); memPush(uid, 'assistant', r);
        await send({ text: `${r}\n\n⌬ wikipedia + duckduckgo` });
        return true;
      }
      case 'TRANSLATE': {
        try {
          const r = await translateText(args.text, args.target);
          memPush(uid, 'user', text); memPush(uid, 'assistant', r.text);
          await send({ text: `${r.text}\n\n⌬ ${r.source} → ${r.target}` });
        } catch { await send({ text: 'Translation fail — try again shortly.' }); }
        return true;
      }
      case 'IMAGINE': {
        const url = imagineUrl(args.prompt || text);
        memPush(uid, 'user', text); memPush(uid, 'assistant', '[image]');
        await sock.sendMessage(m.chat, { image: { url }, caption: `${args.prompt || text}\n\n⌬ pollinations` }, { quoted: raw }).catch(async () => {
          await send({ text: `Your image is ready 🎨\n${url}` });
        });
        return true;
      }
      default: break; // CHAT falls through
    }
  } catch (e) {
    await send({ text: `Omo, something jam — but I still dey. Try again.${dev ? `\n${clamp(e.message, 300)}` : ''}` });
    return true;
  }

  // ── CHAT (everyone): tools assist, brain replies ──
  try {
    const tc = await maybeTools(text);
    const r = await chatBrain(text, u, tc);
    memPush(uid, 'user', text); memPush(uid, 'assistant', r);
    await send({ text: r });
  } catch {
    await send({ text: offlineBrain(text, u) });
  }
  return true;
}

function backupSafe(file) { return backupFile(file); }

// live tool context for knowledge questions
async function toolContext(query) {
  const q = String(query || '').slice(0, 200);
  const parts = [];
  try { const w = await wikiSummary(q); parts.push(`Wikipedia — ${w.title}: ${clamp(w.extract, 700)}`); } catch {}
  if (!parts.length) { try { parts.push(`DuckDuckGo: ${clamp(await duckAnswer(q), 500)}`); } catch {} }
  return parts.join('\n');
}
async function maybeTools(text) {
  const low = String(text).toLowerCase();
  if (/^(who|what)\s+is\b/.test(low.trim()) || /\b(define|meaning of)\b/.test(low)) {
    const q = text.replace(/^(who|what)\s+is\s+/i, '').replace(/\?$/, '').slice(0, 200);
    try { return await toolContext(q); } catch { return ''; }
  }
  if (/weather|temperature|rain|forecast/.test(low)) {
    const place = (text.match(/(?:in|for|at)\s+([A-Za-z ]{2,30})/i)?.[1] || 'Lagos').trim();
    try { const w = await weatherFor(place); return `Current weather ${w.name}: ${w.cur}. Ahead:\n${w.days}`; } catch { return ''; }
  }
  return '';
}

// ── safe sandbox for "test <code>" (FIX-NODAX-06: no require, 5s timeout) ──
function sandboxRun(code) {
  return new Promise((resolve) => {
    const logs = [];
    const sandbox = {
      console: { log: (...a) => logs.push(a.map((x) => { try { return typeof x === 'string' ? x : JSON.stringify(x); } catch { return String(x); } }).join(' ')) },
      Math, JSON, String, Number, Boolean, Array, Object, Date,
      result: undefined,
    };
    try {
      const script = new vm.Script(`result = (function(){ ${clamp(code, 2000)} })()`);
      script.runInNewContext(sandbox, { timeout: 5000 });
      const out = [...logs];
      if (sandbox.result !== undefined) { try { out.push(`=> ${JSON.stringify(sandbox.result)}`); } catch { out.push(`=> ${String(sandbox.result)}`); } }
      resolve(out.join('\n').slice(0, 1200) || '(no output)');
    } catch (e) { resolve(`Error: ${clamp(e.message, 400)}`); }
  });
}

function fallbackCommandCode(name, desc) {
  return `'use strict';\n// NODAX-generated command: ${name}\nmodule.exports = {\n  name: '${name}',\n  desc: ${JSON.stringify(clamp(desc || 'custom command', 120))},\n  usage: '.${name}',\n  category: 'general',\n  async run({ reply, ui }) {\n    return reply(ui.notice('success', '${name}', ${JSON.stringify(clamp(desc || 'Done.', 200))}));\n  },\n};\n`;
}

// ── trigger Gate (FIX-NODAX-01: never hijack normal chat) ──
function isTriggered(m, text, db) {
  const t = String(text || '');
  if (!t || m.fromMe) return false;
  const low = t.toLowerCase().trim();
  if (SELF_NAMES.some((n) => low === n || low.startsWith(`${n} `) || low.startsWith(`${n},`) || low.startsWith(`@${n}`))) return true;
  try {
    if (db?.get('nodax:auto', {}).on) {
      if (!m.isGroup) return true; // every DM
      const botIds = [];
      try { const cfg = require('./config'); botIds.push(cfg.ownerNumbers?.[0] && `${cfg.ownerNumbers[0]}@s.whatsapp.net`); } catch {}
      if ((m.mentions || []).length) {
        try {
          const sockIds = (globalThis.__nodaxBotJids || []).map(digits);
          if ((m.mentions || []).some((j) => sockIds.includes(digits(j)))) return true;
        } catch {}
      }
      if (m.quoted?.sender) {
        try {
          const sockIds = (globalThis.__nodaxBotJids || []).map(digits);
          if (sockIds.includes(digits(m.quoted.sender))) return true;
        } catch {}
      }
    }
  } catch {}
  return false;
}

/** No-prefix hook for src/handler.js. Returns true when NODAX handled it. */
async function handle(sock, raw, m, env = {}) {
  try {
    try {
      if (sock?.user?.id) {
        globalThis.__nodaxBotJids = [sock.user.id, sock.user.lid].filter(Boolean);
      }
    } catch {}
    const prefix = env.prefix || (() => { try { return require('./config').prefix; } catch { return '.'; } })();
    const text = String(m.body || '');
    if (!text || text.startsWith(prefix)) return false;
    if (m.type === 'reactionMessage') return false;
    if (!isTriggered(m, text, env.db)) return false;
    // strip the name ("nodax weather Lagos" -> "weather Lagos")
    const stripped = text.replace(/^(nodax|ndx|nod|boss|jarvis)[,:\s@]*/i, '').trim() || text;
    try { await sock.sendPresenceUpdate('composing', m.chat).catch(() => {}); } catch {}
    await handleText(sock, raw, m, stripped, env);
    try { await sock.sendPresenceUpdate('paused', m.chat).catch(() => {}); } catch {}
    return true;
  } catch { return false; }
}

// ── `.nodax ...` command (loaded via src/commands/ai/nodax.js bridge) ──
const command = {
  name: 'nodax',
  alias: ['ndx', 'nod', 'boss', 'jarvis'],
  desc: 'NODAX AI — chat, tools, and owner-level bot control',
  usage: '.nodax <message> | .nodax status | .nodax auto on/off | .nodax forget | .nodax ops',
  category: 'ai',
  async run(ctx) {
    const { sock, m, args, text, reply, ui, db, prefix } = ctx;
    if (!text) {
      return reply(ui.card({
        icon: '◈', title: 'NODAX AI', subtitle: `built by ${CREATOR}`,
        rows: [['chat', '.nodax who is Burna Boy'], ['tools', 'weather · translate · draw'], ['boss', 'run · fix · add · reload']],
        body: 'Gist me in plain English. In DMs/tags just call my name: "nodax …".',
      }));
    }
    void prefix;
    try { await sock.sendPresenceUpdate('composing', m.chat).catch(() => {}); } catch {}
    const sub = String(args[0] || '').toLowerCase();
    const priv = (() => { try { return require('./src/lib/privs').isSudoPriv(db, require('./config'), m.number); } catch { return false; } })();
    if ((sub === 'auto' || sub === 'forget' || sub === 'ops' || sub === 'status') && !priv && (sub === 'ops')) {
      return reply(ui.notice('error', 'Boss only', 'That one na owner-level. 😅'));
    }
    await handleText(sock, ctx.raw || m.raw, m, text, { db, prefix: ctx.prefix || '.', isPriv: priv, dispatch: ctx.dispatch || null });
    try { await sock.sendPresenceUpdate('paused', m.chat).catch(() => {}); } catch {}
  },
};

module.exports = { command, handle, handleText, classifyIntent, weatherFor, wikiSummary, duckAnswer, translateText, imagineUrl, offlineBrain, SELF_NAMES };
