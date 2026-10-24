/**
 * ╭──────────────────────────────────────────────╮
 *   WAPLUS · PREMIUM LAYER (XADON V6 UPGRADED)
 *   Adds the "premium bot" look to every message
 *   automatically, the same tricks used by
 *   Cody AI, Crysnova AI and Xadon AI:
 *
 *   ◈ AI badge          → content.ai = true (private chats only)
 *   ◈ Verified quote    → reply quotes a verified contact card
 *   ◈ Channel forward   → "Forwarded from <your channel>" header
 *   ◈ Meta label        → secured-by-Meta business label
 *   ◈ Ad card           → big preview card with title + link
 *   ◈ Native buttons    → quick reply / url / copy / list buttons
 *
 *   V6 POWER LAYER — every outgoing text ALSO passes through:
 *     1. normalize  (strip old unicode styles so fonts never stack)
 *     2. translate  (live BOT_LANG from .setlang — instant, no restart)
 *     3. font       (live BOT_FONT from .setfont — 100 styles, instant)
 *     4. live name  (verified card + ad cards use .setbotname value)
 *
 *   Toggle any of them live with: .premium <name> on|off
 *   Bypass the power layer for one message with { noTransform: true }.
 * ╰──────────────────────────────────────────────╯
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('../../config');
const db = require('./database');
const fonts = require('./fonts');

const liveName = () => {
  try { return require('./botstate').botName() || config.botName; } catch { return config.botName; }
};
const liveLang = () => {
  try { return require('./botstate').botLang() || 'en'; } catch { return 'en'; }
};
const liveFont = () => {
  try { return require('./botstate').botFont() || 'plain'; } catch { return 'plain'; }
};

const BANNER_PATH = path.resolve(__dirname, '../../assets/banner.png');
const assets = { banner: null, thumb: null };

async function loadAssets() {
  if (!fs.existsSync(BANNER_PATH)) return assets;
  assets.banner = await sharp(BANNER_PATH).jpeg({ quality: 88 }).toBuffer();
  assets.thumb = await sharp(BANNER_PATH).resize(320, 180, { fit: 'cover' }).jpeg({ quality: 70 }).toBuffer();
  return assets;
}

const settings = () => ({ ...config.premium, ...db.get('premium', {}) });

const isPrivate = (jid = '') => jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid');

/** Quoted contact from the verified Meta AI number, shows a blue tick on top of the reply. */
function verifiedQuote(name) {
  const live = name || liveName();
  return {
    key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net', fromMe: false, id: `WAPLUS${Date.now()}` },
    message: {
      contactMessage: {
        displayName: live,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${live};;;\nFN:${live}\nORG:${live} Verified\nitem1.TEL;waid=13135550002:+1 313 555 0002\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
      },
    },
  };
}

function channelContext() {
  if (!settings().channel || !config.channel.jid) return {};
  return {
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
      newsletterJid: config.channel.jid,
      newsletterName: config.channel.name,
      serverMessageId: 143,
    },
  };
}

/** Big link preview card. Spread it into contextInfo. */
function adCard({ title, body = 'Premium WhatsApp Engine', url = config.links.website, large = true } = {}) {
  return {
    externalAdReply: {
      title: title || liveName(),
      body,
      mediaType: 1,
      thumbnail: large ? assets.banner || undefined : assets.thumb || undefined,
      sourceUrl: url,
      renderLargerThumbnail: large,
      showAdAttribution: false,
    },
  };
}

const SKIP = ['react', 'delete', 'edit', 'pin', 'protocolMessage', 'disappearingMessagesInChat'];

// ── power-layer caches ──
const tCache = new Map(); // `${lang} ${text}` -> translated
const withTimeout = (p, ms) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error('translate timeout')), ms || 6000)),
]);

async function transformText(str) {
  let out = fonts.normalize(String(str ?? ''));
  if (!out) return out;
  const lang = liveLang();
  if (lang && lang !== 'en') {
    // hide links / mentions / .commands behind placeholders so translators keep them intact
    const tokens = [];
    const masked = out.replace(/(https?:\/\/\S+|www\.\S+|chat\.whatsapp\.com\/\S+|wa\.me\/\S+|t\.me\/\S+|discord\.gg\/\S+|@\d+|[./!#][A-Za-z][A-Za-z0-9_-]*)/gi, (tok) => {
      tokens.push(tok);
      return `\uE000${tokens.length - 1}\uE001`;
    });
    const key = `${lang}\0${masked.slice(0, 1200)}`;
    if (tCache.has(key)) {
      out = tCache.get(key);
    } else {
      try {
        const { translate } = require('./translate');
        const r = await withTimeout(translate(masked.slice(0, 1500), lang), 6500);
        if (r?.text) {
          out = r.text.replace(/\uE000(\d+)\uE001/g, (_, i) => tokens[Number(i)] ?? '');
          if (tCache.size > 500) tCache.clear();
          tCache.set(key, out);
        }
      } catch { /* offline / provider down -> send original English */ }
    }
  }
  const font = liveFont();
  if (font && font !== 'plain') {
    try { out = fonts.applyFont(font, out); } catch { /* keep translated text */ }
  }
  return out;
}

const TEXT_KEYS = ['text', 'caption'];

function decorate(jid, content, options) {
  const s = settings();
  const next = { ...content };
  const opts = { ...options };

  if (s.aiBadge && isPrivate(jid) && next.ai === undefined) next.ai = true;
  if (s.metaLabel && next.secureMetaServiceLabel === undefined) next.secureMetaServiceLabel = true;
  if (!next.poll && !next.sticker && !next.contacts) next.contextInfo = { ...channelContext(), ...next.contextInfo };
  if (opts.quoted === 'verified') {
    if (s.verified) opts.quoted = verifiedQuote();
    else delete opts.quoted;
  }
  return { content: next, options: opts };
}

/** Wraps sock.sendMessage so every message gets the premium look automatically. */
function install(sock) {
  const original = sock.sendMessage.bind(sock);
  sock.sendRaw = original;
  sock.sendMessage = async (jid, content = {}, options = {}) => {
    if (SKIP.some((k) => k in content)) return original(jid, content, options);
    const bypass = options?.noTransform || content?.noTransform || content?._noTransform;
    let out = { ...content };
    const opts = { ...options };
    delete out.noTransform; delete out._noTransform; delete opts.noTransform;
    if (!bypass) {
      try {
        for (const k of TEXT_KEYS) {
          if (typeof out[k] === 'string' && out[k].trim()) out[k] = await transformText(out[k]);
        }
      } catch { /* never let the power layer break a send */ }
    }
    const enhanced = decorate(jid, out, opts);
    try {
      return await original(jid, enhanced.content, enhanced.options);
    } catch (err) {
      // If WhatsApp rejects a premium field, send the plain message instead.
      const plainOptions = { ...options };
      if (plainOptions.quoted === 'verified') delete plainOptions.quoted;
      return original(jid, content, plainOptions);
    }
  };

  /**
   * Native flow buttons. Each button is ONE of:
   *   { text, id }        quick reply (runs a command, e.g. id: '.ping')
   *   { text, url }       open link
   *   { text, copy }      copy text
   *   { text, sections }  list menu
   */
  sock.sendButtons = async (jid, { text, footer, image, buttons = [], title, contextInfo }, options = {}) => {
    const body = image ? { image, caption: text, title } : { text };
    try {
      return await sock.sendMessage(jid, { ...body, footer, nativeFlow: buttons, contextInfo }, options);
    } catch {
      const hints = buttons.filter((b) => b.id).map((b) => `  ▸ ${b.id}  ${b.text}`).join('\n');
      return sock.sendMessage(jid, { ...(image ? { image, caption: `${text}\n\n${hints}` } : { text: `${text}\n\n${hints}` }), contextInfo }, options);
    }
  };
  return sock;
}

module.exports = { install, loadAssets, assets, verifiedQuote, adCard, channelContext, settings, transformText };
