/**
 * XADON V7 · PREMIUM-FX — all dropped premium functions, re-coded for XADON:
 * image carousels, fake quotes, hidden sticker packs, Meta-style rich tables,
 * sticker-pack relay, WA-in-WA webviews, group-status posts, chat themes,
 * sticker-audio tests and AI-rich streaming.
 *
 * Every helper capability-checks the Baileys fork first and throws a clear
 * Error('needs ...') when the runtime can't do it — callers catch that and
 * fall back to a normal message, so commands NEVER crash the bot.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const botName = () => { try { return require('./botstate').botName(); } catch { return 'XADON AI'; } };
const META_JID = '867051314767696@bot'; // Meta AI renderer JID (rich-message styling trick)

function baileys() {
  try { return require('@musteqeem/baileys'); } catch { throw new Error('Baileys runtime unavailable'); }
}
const need = (cond, what) => { if (!cond) throw new Error(`needs ${what}`); };

// ---------- generic interactive relay (biz node, like all premium cards) ----------
async function relayInteractive(sock, chat, interactiveMessage, { quoted } = {}) {
  const { generateWAMessageFromContent, generateMessageID } = baileys();
  need(typeof sock.relayMessage === 'function', 'relayMessage');
  const msgId = typeof generateMessageID === 'function' ? generateMessageID() : `${Date.now()}`;
  const msg = generateWAMessageFromContent(chat, { interactiveMessage }, { userJid: quoted?.sender || undefined, messageId: msgId });
  await sock.relayMessage(chat, msg.message, {
    messageId: msg.key.id,
    additionalNodes: [{ tag: 'biz', attrs: {}, content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }] }],
  });
  return msg.key.id;
}

// ---------- 1. ALBUMPIC — swipeable image carousel ----------
async function carousel(sock, chat, items, { title, footer, quoted } = {}) {
  const { generateWAMessageContent } = baileys();
  need(typeof sock.waUploadToServer === 'function', 'media upload');
  need(Array.isArray(items) && items.length, 'at least 1 card');
  const cards = [];
  for (let i = 0; i < Math.min(items.length, 10); i++) {
    const it = items[i];
    let buf = it.buffer;
    if (!buf && it.url) {
      const r = await fetch(it.url);
      if (!r.ok) throw new Error(`image ${i + 1} download failed`);
      buf = Buffer.from(await r.arrayBuffer());
    }
    need(buf, `card ${i + 1} image`);
    const content = await generateWAMessageContent({ image: buf }, { upload: sock.waUploadToServer });
    cards.push({
      header: { title: it.title || `Image ${i + 1}`, subtitle: '', imageMessage: content.imageMessage, hasMediaAttachment: true },
      body: { text: it.body || `Card ${i + 1}` },
      footer: { text: it.footer || botName() },
      nativeFlowMessage: {
        buttons: (it.buttons?.length ? it.buttons : [{ text: 'Open', id: `carousel_${i}` }]).slice(0, 2).map((b) => ({
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({ display_text: String(b.text).slice(0, 25), id: `${String(b.id).slice(0, 60)}_${i}` }),
        })),
        messageParamsJson: '{}',
      },
    });
  }
  await relayInteractive(sock, chat, {
    header: { hasMediaAttachment: false },
    body: { text: title || 'Swipe to browse' },
    footer: { text: footer || botName() },
    carouselMessage: { cards },
    contextInfo: {},
  }, { quoted });
}

// ---------- 2. FAKE QUOTE (+ optional TTS voice) ----------
function fakeQuoted(chat, { text, participant, id } = {}) {
  return {
    key: { remoteJid: chat, fromMe: false, participant: participant || chat, id: id || `XADON${Date.now()}` },
    message: { conversation: String(text ?? '') },
  };
}
async function ttsBuffer(text, lang = 'en') {
  const r = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(String(text).slice(0, 180))}&tl=${lang}`);
  if (!r.ok) throw new Error('tts download failed');
  return Buffer.from(await r.arrayBuffer());
}

// ---------- 3. HIDDEN STICKER PACK (generated color/shape pack) ----------
const PACK_COLORS = [
  { name: 'Red', r: 220, g: 0, b: 0 }, { name: 'Yellow', r: 255, g: 210, b: 0 },
  { name: 'Green', r: 0, g: 180, b: 70 }, { name: 'Blue', r: 0, g: 110, b: 220 },
  { name: 'Purple', r: 150, g: 50, b: 200 }, { name: 'Orange', r: 255, g: 120, b: 0 },
];
async function hiddenPack(sock, chat, { name, colors, quoted } = {}) {
  const { prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, proto } = baileys();
  need(typeof sock.waUploadToServer === 'function', 'media upload');
  let sharp = null;
  try { sharp = require('sharp'); } catch { throw new Error('sharp (sticker art)'); }
  const palette = Array.isArray(colors) && colors.length ? colors : PACK_COLORS;
  const stickers = [];
  let packMedia = null;
  for (const color of palette.slice(0, 12)) {
    const webp = await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: color.r, g: color.g, b: color.b, alpha: 1 } } }).webp({ quality: 90 }).toBuffer();
    const media = await prepareWAMessageMedia({ sticker: webp, mimetype: 'image/webp' }, { upload: sock.waUploadToServer });
    need(media?.stickerMessage, 'sticker upload');
    if (!packMedia) packMedia = media.stickerMessage;
    stickers.push({ fileName: `${crypto.randomUUID()}.webp`, isAnimated: false, emojis: [''], accessibilityLabel: color.name || 'XADON', isLottie: false, mimetype: 'image/webp' });
  }
  const pack = proto.Message.StickerPackMessage.fromObject({
    stickerPackId: crypto.randomUUID(), name: name || `${botName()} Colors`, publisher: botName(), stickers,
    fileLength: packMedia.fileLength, fileSha256: packMedia.fileSha256, fileEncSha256: packMedia.fileEncSha256,
    mediaKey: packMedia.mediaKey, directPath: packMedia.directPath, contextInfo: {},
    packDescription: `${botName()} sticker pack`, mediaKeyTimestamp: packMedia.mediaKeyTimestamp,
    stickerPackSize: packMedia.fileLength, stickerPackOrigin: 2,
  });
  const msgId = typeof generateMessageID === 'function' ? generateMessageID() : `${Date.now()}`;
  const msg = generateWAMessageFromContent(chat, { stickerPackMessage: pack }, { userJid: quoted?.sender || undefined, messageId: msgId });
  await sock.relayMessage(chat, msg.message, {
    messageId: msg.key.id,
    additionalNodes: [{ tag: 'biz', attrs: {}, content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }] }],
  });
  return stickers.length;
}
// fallback: send generated stickers one by one (works everywhere)
async function packAsStickers(sock, chat, { colors, quoted } = {}) {
  let sharp = null;
  try { sharp = require('sharp'); } catch { throw new Error('sharp (sticker art)'); }
  const palette = Array.isArray(colors) && colors.length ? colors : PACK_COLORS;
  let n = 0;
  for (const color of palette.slice(0, 6)) {
    const webp = await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: color.r, g: color.g, b: color.b, alpha: 1 } } }).webp({ quality: 90 }).toBuffer();
    await sock.sendMessage(chat, { sticker: webp }, quoted ? { quoted } : undefined);
    n++;
  }
  return n;
}

// ---------- 4. META-STYLE RICH TABLE (markdown + table + code) ----------
const KW = /\b(await|export|import|throw|try|catch|finally|new|delete|do|while|if|else|switch|case|default|for|each|in|of|with|async|class|const|extends|function|let|this|typeof|var|void|break|continue|return|yield)\b/y;
const STR = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/y;
const NUM = /\b(?:0x[a-fA-F0-9]+|0b[01]+|0o[0-7]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/y;
function tokenize(code, language = 'javascript') {
  const rules = [{ type: 'STR', regex: STR }, { type: 'NUMBER', regex: NUM }, { type: 'KEYWORD', regex: KW }];
  const tokens = [];
  let i = 0;
  while (i < code.length) {
    let hit = null;
    for (const r of rules) { r.regex.lastIndex = i; const m2 = r.regex.exec(code); if (m2) { hit = { content: m2[0], type: r.type }; break; } }
    if (hit) { const last = tokens[tokens.length - 1]; if (last && last.type === hit.type) last.content += hit.content; else tokens.push(hit); i += hit.content.length; }
    else { const last = tokens[tokens.length - 1]; if (last && last.type === 'DEFAULT') last.content += code[i]; else tokens.push({ content: code[i], type: 'DEFAULT' }); i++; }
  }
  return { view_model: { primitive: { language, code_blocks: tokens, __typename: 'GenAICodeUXPrimitive' }, __typename: 'GenAISingleLayoutViewModel' } };
}
async function richTable(sock, chat, { heading, intro, rows, code, quoted } = {}) {
  const { generateWAMessageFromContent } = baileys();
  need(typeof sock.relayMessage === 'function', 'relayMessage');
  const sections = [];
  if (heading || intro) sections.push({ view_model: { primitive: { text: `# ${heading || botName()}\n${intro || ''}`.trim(), __typename: 'GenAIMarkdownTextUXPrimitive' }, __typename: 'GenAISingleLayoutViewModel' } });
  if (Array.isArray(rows) && rows.length) sections.push({ view_model: { primitive: { rows: [{ is_header: true, cells: rows[0] }, ...rows.slice(1).map((r) => ({ is_header: false, cells: r }))], __typename: 'GenATableUXPrimitive' }, __typename: 'GenAISingleLayoutViewModel' } });
  if (code) sections.push(tokenize(String(code).slice(0, 1500)));
  const unified = { response_id: crypto.randomUUID(), sections };
  const message = {
    messageContextInfo: { botMessageSecret: crypto.getRandomValues(new Uint8Array(32)) },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          submessages: [], messageType: 1,
          unifiedResponse: { data: Buffer.from(JSON.stringify(unified)) },
          contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: META_JID }, forwardOrigin: 4, botMessageSharingInfo: { botEntryPointOrigin: 2, forwardScore: 1 }, ...(quoted ? { stanzaId: quoted.key?.id, participant: quoted.participant || quoted.key?.participant || quoted.key?.remoteJid, quotedMessage: quoted.message, quotedType: 0 } : {}) },
        },
      },
    },
  };
  const gen = generateWAMessageFromContent(chat, message, {});
  await sock.relayMessage(chat, gen.message, { messageId: gen.key.id });
}
// simple rich text (used by the `rich` reply format) with graceful fallback
async function richText(sock, chat, text, { quoted, mentions } = {}) {
  try {
    await richTable(sock, chat, { heading: botName(), intro: String(text).slice(0, 2000), quoted });
  } catch {
    await sock.sendMessage(chat, { text: `◈ ${botName()}\n\n${text}`, mentions }, quoted ? { quoted } : undefined);
  }
}

// ---------- 5. STICKER-PACK RELAY (Furina-style: named pack payload) ----------
// (Re-coded: builds a pack payload from generated art since foreign packs
// can't be re-uploaded. Same wire shape, same hidden-pack UX.)
async function namedPackRelay(sock, chat, { name, publisher, description, colors, quoted } = {}) {
  return hiddenPack(sock, chat, { name: name || `${botName()} Pack`, colors, quoted });
}

// ---------- 6. WA-IN-WA WEBVIEW (mini HTML app rendered inside chat) ----------
const webAppMessage = (html, { responseId, quoted } = {}) => ({
  messageContextInfo: { threadId: [], deviceListMetadata: { senderKeyIndexes: [], recipientKeyIndexes: [] }, deviceListMetadataVersion: 2, botMetadata: { messageDisclaimerText: '', botResponseId: responseId || `${botName().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` } },
  botForwardedMessage: {
    message: {
      richResponseMessage: {
        submessages: [{ messageType: 2, messageText: `${botName()} • APP` }],
        messageType: 1,
        unifiedResponse: {
          data: Buffer.from(JSON.stringify({
            response_id: responseId || crypto.randomUUID(),
            sections: [{ view_model: { primitive: { __typename: 'GenAIaeacdsnwHtmlPrimitive', payload: String(html).slice(0, 60000) }, __typename: 'GenAISingleLayoutViewModel' } }],
          }), 'utf-8').toString('base64'),
          trusted_sources: [botName().toLowerCase().replace(/\s+/g, '')],
        },
        contextInfo: { mentionedJid: [], groupMentions: [], statusAttributions: [], forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: META_JID }, forwardOrigin: 4 },
      },
    },
  },
});
async function webApp(sock, chat, html, { quoted } = {}) {
  const { generateWAMessageFromContent } = baileys();
  need(typeof sock.relayMessage === 'function', 'relayMessage');
  const gen = generateWAMessageFromContent(chat, webAppMessage(html), {});
  await sock.relayMessage(chat, gen.message, {
    messageId: gen.key.id,
    additionalNodes: [{ tag: 'biz', attrs: {}, content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }] }],
  });
}

// ---------- 7. GROUP STATUS ----------
const GS_DB = path.resolve(__dirname, '../../database/gstatus-ids.json');
const loadIds = () => { try { if (fs.existsSync(GS_DB)) return JSON.parse(fs.readFileSync(GS_DB, 'utf8')); } catch {} return {}; };
function trackId(jid, id) { try { fs.mkdirSync(path.dirname(GS_DB), { recursive: true }); const d = loadIds(); (d[jid] ||= []).push(id); fs.writeFileSync(GS_DB, JSON.stringify(d, null, 2)); } catch {} }
function clearIds(jid) { try { const d = loadIds(); const ids = d[jid] || []; delete d[jid]; fs.writeFileSync(GS_DB, JSON.stringify(d, null, 2)); return ids; } catch {} return []; }
async function sendGroupStatus(sock, jid, content, { backgroundColor } = {}) {
  if (typeof sock.sendGroupStatus === 'function') {
    const sent = await sock.sendGroupStatus(jid, content, backgroundColor ? { backgroundColor } : undefined);
    if (sent?.key?.id) trackId(jid, sent.key.id);
    return sent;
  }
  const { generateWAMessageContent, generateMessageIDV2 } = baileys();
  need(typeof generateWAMessageContent === 'function' && typeof sock.relayMessage === 'function', 'group-status relay');
  const msg = await generateWAMessageContent({ ...content, groupStatus: true }, { upload: sock.waUploadToServer, logger: sock.logger, ...(backgroundColor ? { backgroundColor } : {}), options: sock.config?.options });
  const id = typeof generateMessageIDV2 === 'function' ? generateMessageIDV2(sock.user.id) : `${Date.now()}`;
  await sock.relayMessage(jid, msg, { messageId: id });
  trackId(jid, id);
  return { key: { remoteJid: jid, fromMe: true, id } };
}

// ---------- 8. CHAT THEME / WALLPAPER + STICKER-AUDIO test payloads ----------
const THEME_IDS = ['WhatsApp-Green', 'Pearl-Indigo', 'Tyrian-Purple', 'Sunset-Orange', 'Merino-Teal', 'Royal-Blue', 'Dark-Cerulean', 'Charcoal-Green', 'Persian-Plum', 'Dune-Mono', 'Default-Blue', 'Default-Mono', 'Sky-Blue', 'Brown', 'Cream', 'Emerald', 'Lemon', 'Lime', 'Pink', 'Red', 'Sunrise-Orange', 'Warm-Yellow'];
async function chatTheme(sock, chat, themeId, opts = {}) {
  const hit = THEME_IDS.find((t) => t.toLowerCase() === String(themeId).toLowerCase());
  need(hit, 'a valid theme id (.wallpaperids)');
  await sock.sendMessage(chat, { chatTheme: { chatThemeId: hit } }, opts);
  return hit;
}

// ---------- 9. AI-RICH streaming (chunked send with cursor) ----------
async function aiRich(sock, chat, { heading, table, text, quoted } = {}) {
  try {
    await richTable(sock, chat, { heading, rows: table, code: '', quoted });
  } catch { /* rich unsupported -> stream below */ }
  const full = String(text || '');
  if (full.length > 240) {
    const chunks = full.match(/[\s\S]{1,200}/g) || [full];
    let sent = null;
    for (const c of chunks.slice(0, 6)) {
      if (!sent) sent = await sock.sendMessage(chat, { text: c + ' ▍' }, quoted ? { quoted } : undefined);
      else { try { await sock.sendMessage(chat, { text: (sent._acc = (sent._acc || '') + c) + ' ▍', edit: sent.key }); } catch { sent = await sock.sendMessage(chat, { text: c }, quoted ? { quoted } : undefined); } }
      await new Promise((r) => setTimeout(r, 700));
    }
    try { await sock.sendMessage(chat, { text: chunks.join('').slice(0, 4000), edit: sent.key }); } catch {}
  } else if (full) {
    await sock.sendMessage(chat, { text: `◈ ${heading || botName()}\n\n${full}` }, quoted ? { quoted } : undefined);
  }
}

module.exports = {
  META_JID, THEME_IDS, relayInteractive, carousel, fakeQuoted, ttsBuffer,
  hiddenPack, packAsStickers, namedPackRelay, tokenize, richTable, richText,
  webAppMessage, webApp, sendGroupStatus, trackId, clearIds, chatTheme, aiRich,
};
