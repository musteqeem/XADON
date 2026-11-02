/**
 * AI engine used by the .ai command.
 * Add ONE of these keys to your .env:
 *   GROQ_API_KEY    (free, fastest)  → https://console.groq.com/keys
 *   GEMINI_API_KEY  (free tier)      → https://aistudio.google.com/apikey
 *   OPENAI_API_KEY                   → https://platform.openai.com/api-keys
 *
 * Each chat keeps a short memory so the AI remembers the conversation.
 */
const config = require('../../config');

const memory = new Map();
const MAX_TURNS = 15;

const PROVIDERS = {
  groq: {
    key: 'GROQ_API_KEY',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  openai: {
    key: 'OPENAI_API_KEY',
    url: 'https://api.openai.com/v1/chat/completions',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
};

function pickProvider() {
  const wanted = config.ai.provider.toLowerCase();
  if (wanted !== 'auto') return wanted;
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

async function openAiCompatible(name, messages) {
  const p = PROVIDERS[name];
  const res = await fetch(p.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env[p.key]}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: p.model, messages, temperature: 0.7, max_tokens: 1024 }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || `${name} HTTP ${res.status}`);
  return json.choices?.[0]?.message?.content?.trim() || '';
}

async function gemini(messages) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const [system, ...chat] = messages;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system.content }] },
      contents: chat.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || `gemini HTTP ${res.status}`);
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim() || '';
}

/**
 * V9 · offline brain — pattern replies so the chatbot ALWAYS answers,
 * even with no API key or no internet. Used as last-resort fallback.
 */
function offlineBrain(prompt = '') {
  const t = String(prompt).toLowerCase();
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  if (/^(hi|hello|hey|good (morning|afternoon|evening)|yo)\b/.test(t.trim())) {
    return pick([
      'Hey! Good to see you. What are we getting into today?',
      'Hello! I am XADON AI, running in offline mode. Ask me anything and I will do my best.',
      'Yo! What is on your mind?',
    ]);
  }
  if (/\b(who are you|your name|about you)\b/.test(t)) return 'I am XADON AI, a WhatsApp assistant. I answer questions, explain things, save notes, set timers and run group tools. Right now I am in offline mode — add an AI key for full superpowers.';
  if (/\b(joke|funny)\b/.test(t)) {
    return pick([
      'Why did the developer go broke? Because he used up all his cache.',
      'Why do programmers prefer dark mode? Because light attracts bugs.',
      'My friend asked if I was ignoring him. I said: seen, no reply — WhatsApp style.',
      'Naija NEPA and WiFi get one thing in common: dem dey disappoint at the worst time.',
    ]);
  }
  if (/\b(time|date|day is it)\b/.test(t)) return `Right now it is ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })} (Lagos time).`;
  if (/\b(thank|thanks)\b/.test(t)) return 'Anytime! That is what I am here for.';
  if (/\b(bye|goodnight|good night)\b/.test(t)) return 'Goodbye for now! Ping me anytime you need me.';
  if (/\b(how are you|how far)\b/.test(t)) return 'Running smooth, battery full, vibes high. How are you doing?';
  if (/\b(love|girlfriend|boyfriend|crush)\b/.test(t)) return 'Love matter? My advice: communicate clearly, respect boundaries, and never double-text in anger. Want me to help you draft the message?';
  if (/\b(money|rich|business)\b/.test(t)) return 'Money rule number one: spend less than you earn, save first, and let patience compound it. Want a simple weekly saving plan?';
  if (t.length < 25) return `Interesting — tell me more about "${String(prompt).slice(0, 60)}". I am in offline mode right now, so give me details and I will reason it through with you.`;
  return `Here is my take: ${String(prompt).slice(0, 120)}${String(prompt).length > 120 ? '…' : ''} — I am currently in offline mode (no AI key set), so I can only reason lightly. Ask the owner to add a GROQ_API_KEY for full deep answers, or use .roleplay, .explain and .promptpack for sharper replies.`;
}

/** Ordered provider attempts: configured → every other key found. */
function providerQueue() {
  const first = pickProvider();
  const avail = [];
  if (process.env.GROQ_API_KEY) avail.push('groq');
  if (process.env.GEMINI_API_KEY) avail.push('gemini');
  if (process.env.OPENAI_API_KEY) avail.push('openai');
  const q = [...new Set([first, ...avail].filter(Boolean))];
  return q.length ? q : [null];
}

async function ask(chatId, prompt) {
  const history = memory.get(chatId) || [];
  const messages = [{ role: 'system', content: config.ai.system }, ...history, { role: 'user', content: String(prompt).slice(0, 6000) }];

  let lastErr = null;
  for (const provider of providerQueue()) {
    if (!provider) break;
    try {
      const answer = provider === 'gemini' ? await gemini(messages) : await openAiCompatible(provider, messages);
      if (!answer) throw new Error(`${provider} returned an empty reply`);
      history.push({ role: 'user', content: prompt }, { role: 'assistant', content: answer });
      memory.set(chatId, history.slice(-MAX_TURNS * 2));
      return { answer, provider };
    } catch (e) { lastErr = e; }
  }

  // V9 · never leave the user hanging: offline brain always answers.
  const fallback = offlineBrain(prompt);
  history.push({ role: 'user', content: prompt }, { role: 'assistant', content: fallback });
  memory.set(chatId, history.slice(-MAX_TURNS * 2));
  if (lastErr || !pickProvider()) return { answer: `${fallback}\n\n⌬ offline mode${lastErr ? ` (${String(lastErr.message || lastErr).slice(0, 80)})` : ' — add GROQ_API_KEY for full power'}`, provider: 'offline' };
  return { answer: fallback, provider: 'offline' };
}

const reset = (chatId) => memory.delete(chatId);
const size = (chatId) => Math.floor((memory.get(chatId) || []).length / 2);

module.exports = { ask, reset, size, pickProvider, offlineBrain };
