/**
 * XADON V3 · RICH MESSAGING KIT
 * Meta-AI style rich messaging built on @musteqeem/baileys primitives.
 *
 * Baileys functions used (all supported by @musteqeem/baileys):
 *  - sock.sendMessage(jid, content, options)          → text, image, audio, video, sticker, poll, nativeFlow buttons
 *  - sock.relayMessage(jid, message, {messageId})     → raw relay for HTML primitive
 *  - generateWAMessageFromContent(jid, content, opts) → builds the HTML envelope
 *  - sock.sendPresenceUpdate / sock.readMessages
 *  - contextInfo: forwarding, newsletter, externalAdReply, mentions
 *  - nativeFlow buttons: quick-reply {text,id} · url {text,url} · copy {text,copy} · list {text,sections}
 *
 * Xadon quote style:  _*亗 <text>*_
 * Unicode set allowed: ℘𒆜𓀀∞⌘☽☼✗✐◉❂𓅓𓊈𝑽꯭𝑰꯭𝑷■☉✧◢◤◥◣彡㉨♪✦✯𓉤𓄄✘⚉☬乂亗✪★ ✧✩✫✬✭✮✰✱❍❑❒❓❔❕❖∗⍟◐◑◒◓◔◕◖◗⧬⧭⧮⧉⧫⟢⟡⌬
 */
const crypto = require('crypto');

let _baileys = null;
try { _baileys = require('@musteqeem/baileys'); } catch { _baileys = null; }

/** Xadon-styled quote line: _*亗 text*_ (WhatsApp italic+bold safe, no emoji). */
function xadon(text = '') {
  const t = String(text).replace(/[_*`]/g, '').slice(0, 1500);
  return `_*亗 ${t}*_`;
}

function xadonCard(title = '', body = '', footer = '') {
  const lines = [`_*亗 ${String(title).slice(0, 120)}*_`];
  if (body) lines.push('', String(body).slice(0, 3000));
  if (footer) lines.push('', `⌬ ${footer}`);
  return lines.join('\n');
}

/**
 * Sends an HTML payload through the FOAHtmlPrimitiveDemoDONOTUSE rich-response
 * primitive (same envelope as Meta-AI interactive games). Used by .snake,
 * .tetris, .g2048, .memory, .mines, .tictactoe.
 */
async function sendHtmlPrimitive(sock, jid, html) {
  if (!_baileys?.generateWAMessageFromContent) {
    return sock.sendMessage(jid, { text: xadon('HTML games are not supported on this Baileys build.') });
  }
  const { generateWAMessageFromContent } = _baileys;
  const msg = generateWAMessageFromContent(jid, {
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          unifiedResponse: {
            data: Buffer.from(JSON.stringify({
              __typename: 'GenAIUnifiedResponse',
              response_id: crypto.randomUUID(),
              sections: [{
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                  __typename: 'GenAISingleLayoutViewModel',
                  primitive: { __typename: 'FOAHtmlPrimitiveDemoDONOTUSE', trusted_sources: [], payload: String(html).trim() }
                }
              }]
            })).toString('base64')
          },
          contextInfo: { isForwarded: true, forwardOrigin: 4 }
        }
      }
    }
  }, {});
  return sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
}

/** Big image + caption + native-flow buttons (Meta-AI rich card). */
async function sendRichCard(sock, chat, { image, text, footer, buttons = [], quoted, mentions } = {}) {
  const body = image ? { image, caption: text } : { text };
  try {
    return await sock.sendMessage(chat, {
      ...body, footer, mentions,
      nativeFlow: buttons,
      contextInfo: { ...(buttons.length ? {} : {}) }
    }, quoted ? { quoted } : {});
  } catch {
    const hints = buttons.filter((b) => b.id).map((b) => `  ⌘ ➫ ${b.id}  ·  ${b.text}`).join('\n');
    const fallback = image ? { image, caption: `${text}\n\n${hints}` } : { text: `${text}\n\n${hints}` };
    return sock.sendMessage(chat, fallback, quoted ? { quoted } : {});
  }
}

/** In-app website opener button (nativeFlow url button). */
async function sendOpenLink(sock, chat, { url, label = '☁︎ Open Link', quoted } = {}) {
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    return await sock.sendMessage(chat, {
      text: `♧ *${label}*\n\n_*ⓘ secured link*_`,
      nativeFlow: [{ text: label, url, useWebview: true }]
    }, quoted ? { quoted } : {});
  } catch {
    return sock.sendMessage(chat, { text: xadonCard('Secured link', url, 'XADON AI') }, quoted ? { quoted } : {});
  }
}

/** Copy-code card (nativeFlow copy button). */
async function sendCopyCard(sock, chat, { text, copyText, footer, quoted } = {}) {
  try {
    return await sock.sendMessage(chat, {
      text, footer,
      nativeFlow: [{ text: '⎙ Copy', copy: copyText || text }]
    }, quoted ? { quoted } : {});
  } catch {
    return sock.sendMessage(chat, { text }, quoted ? { quoted } : {});
  }
}

module.exports = { xadon, xadonCard, sendHtmlPrimitive, sendRichCard, sendOpenLink, sendCopyCard };
