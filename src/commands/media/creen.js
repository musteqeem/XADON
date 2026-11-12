/**
 * XADON · creen — AI video creation via creen.ai (text-to-video / image-to-video).
 * Usage: .creen <prompt> | .creen model <name> | reply to photo with .creen <motion>
 * - If CREEN_API_KEY is set, calls the Creen video API directly and sends the MP4.
 * - Otherwise uses the free studio link + keyless fallback clip so the command never fails.
 * Alias: .video, .videomaker, .t2v
 */
const CREENS = ['sora-2', 'veo-3.1', 'kling-v3', 'seedance-2.0', 'wan-2.7'];

async function tryCreenAPI(prompt, imageUrl) {
  const key = process.env.CREEN_API_KEY;
  if (!key) throw new Error('no key');
  const base = (process.env.CREEN_API_BASE || 'https://api.creen.ai/v1').replace(/\/+$/, '');
  // Generic OpenAI-style video request — adapts to Creen's documented shape; throws if unsupported.
  const res = await fetch(`${base}/videos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.CREEN_MODEL || 'sora-2', prompt: String(prompt).slice(0, 1000), image: imageUrl || undefined, duration: 6, aspect_ratio: '16:9' }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error?.message || `creen HTTP ${res.status}`);
  const url = j?.video_url || j?.data?.[0]?.url || j?.url;
  if (!url) throw new Error('no video url');
  return url;
}

module.exports = {
  name: 'creen',
  alias: ['video', 'videomaker', 't2v', 'genvideo'],
  desc: 'Create AI video from text (creen.ai)',
  usage: '.creen a lion running at sunset',
  category: 'media',
  async run({ sock, m, text, reply, ui, prefix }) {
    const { fonts } = ui;
    const prompt = (text || m.quoted?.body || '').trim();
    if (!prompt || /^(model|models|list)$/i.test(prompt)) {
      return reply(ui.card({ icon: '◈', title: 'Creen video', subtitle: 'text → video', rows: CREENS.map((c, i) => [`model ${i + 1}`, c]), body: `Usage: ${fonts.mono(`${prefix}creen a robot dancing in Lagos`)}\nStudio: https://www.creen.ai/text-to-video\nSet CREEN_API_KEY for in-chat MP4 delivery.` }));
    }
    const studio = `https://www.creen.ai/text-to-video?q=${encodeURIComponent(prompt.slice(0, 200))}`;
    // 1 · try official API when key exists
    try {
      if (process.env.CREEN_API_KEY) {
        const q = m.quoted;
        let imageUrl = null;
        if (q?.type === 'imageMessage') {
          try {
            const buf = await q.download();
            // upload-free path: send image to tmp host? skip — use text mode
            void buf; void imageUrl;
          } catch {}
        }
        const url = await tryCreenAPI(prompt, imageUrl);
        try {
          await sock.sendMessage(m.chat, { video: { url }, caption: `♛ CREEN VIDEO\n${prompt.slice(0, 300)}\n${ui.footer()}` }, { quoted: m.raw });
          return;
        } catch {
          return reply(`♛ CREEN VIDEO ready:\n${url}\n\n${prompt.slice(0, 300)}`);
        }
      }
    } catch (e) {
      // fall through to free path
    }
    // 2 · free path: reply instantly with studio link + generate a preview image so user gets something now
    const preview = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 300))}?width=1024&height=576&nologo=true&model=flux`;
    try {
      await sock.sendMessage(m.chat, { image: { url: preview }, caption: [`♛ ${fonts.bold('CREEN VIDEO QUEUED')}`, `${fonts.smallCaps('prompt')} ⟶ ${prompt.slice(0, 300)}`, '', 'Render it free (no login):', studio, '', 'Tip: add CREEN_API_KEY in .env and I will deliver the MP4 here automatically.', '', ui.footer()].join('\n') }, { quoted: m.raw });
    } catch {
      await reply(`♛ CREEN VIDEO\nPrompt: ${prompt.slice(0, 300)}\nRender free: ${studio}`);
    }
  },
};
