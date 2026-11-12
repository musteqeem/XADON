'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_STICKER_MESSAGE = Object.freeze({
    url: 'https://mmg.whatsapp.net/o1/v/t24/f2/m232/AQPEoFVa7kEaTxJ5N4kBacoDZ1k0IzHqkfsmUhLxV8C4xB11yCktX6UEHvkJnmgTsnEhoRW27_Pma0f92oVnKzwBB4YUsMbtz2HlS_Oxeg?ccb=9-4&oh=01_Q5Aa5wEK3E2DIH-ZBY_naItwmTshYSHL2bClVxX2UUGd6_gOyw&oe=6B0DB1D3&_nc_sid=e6ed6c&mms3=true',
    fileSha256: 'BsnVlbXyY2a722AugpS5TLIuxPNmaHRU2Hi9vL90USY=',
    fileEncSha256: 'PQcd/lNPjIt/cbpv3UuTrnd5OH7O1GnASu0C3c+PdQg=',
    mediaKey: 'j6kvKJ0k1eha91lF+ruW+5TPGP5inpuCePSrFs0nhuI=',
    mimetype: 'image/webp',
    height: 64,
    width: 64,
    directPath: '/o1/v/t24/f2/m232/AQPEoFVa7kEaTxJ5N4kBacoDZ1k0IzHqkfsmUhLxV8C4xB11yCktX6UEHvkJnmgTsnEhoRW27_Pma0f92oVnKzwBB4YUsMbtz2HlS_Oxeg?ccb=9-4&oh=01_Q5Aa5wEK3E2DIH-ZBY_naItwmTshYSHL2bClVxX2UUGd6_gOyw&oe=6B0DB1D3&_nc_sid=e6ed6c',
    fileLength: '373112',
    mediaKeyTimestamp: '1793438486',
    firstFrameLength: 372742,
    firstFrameSidecar: 'z4sdmAKy5mcQPA==',
    isAnimated: true,
    isLottie: false,
    isAvatar: false,
    isAiSticker: false,
    premium: 0
});

const CUSTOM_STICKER_FILE = path.join(process.cwd(), 'database', 'sreact-sticker-message.json');
const MAX_STICKER_REACTION_ATTEMPTS = 10;
const STICKER_REACTION_DELAY_MS = 250;

function parseReactionCount(value) {
    if (value === undefined) return 1;
    if (!/^[1-9]\d*$/.test(String(value))) return null;
    const count = Number(value);
    return Number.isSafeInteger(count) && count <= MAX_STICKER_REACTION_ATTEMPTS ? count : null;
}

// FIX 1: Find quoted sticker from EVERY possible XADON shape
function getQuotedStickerMessage(quoted) {
    if (!quoted) return null;
    if (quoted.stickerMessage) return quoted.stickerMessage;
    if (quoted.lottieStickerMessage) return quoted.lottieStickerMessage;
    if (quoted.message?.stickerMessage) return quoted.message.stickerMessage;
    if (quoted.message?.lottieStickerMessage) return quoted.message.lottieStickerMessage;
    if (quoted.quotedMessage?.stickerMessage) return quoted.quotedMessage.stickerMessage;
    if (quoted.mtype === 'stickerMessage' || quoted.mtype === 'lottieStickerMessage') return quoted;
    return null;
}

// FIX 2: Find target key from EVERY possible XADON shape
// This is why it said "Reply to the message" even though you DID reply
function getTargetKey(m) {
    // 1. Standard: m.quoted.key
    if (m.quoted?.key?.id) return m.quoted.key;

    // 2. XADON sometimes puts it in m.quotedMessage
    if (m.quotedMessage?.key?.id) return m.quotedMessage.key;

    // 3. Raw Baileys: m.raw.message.extendedTextMessage.contextInfo
    const ctx = m.raw?.message?.extendedTextMessage?.contextInfo
        || m.message?.extendedTextMessage?.contextInfo
        || m.raw?.message?.imageMessage?.contextInfo
        || m.raw?.message?.videoMessage?.contextInfo
        || m.raw?.message?.stickerMessage?.contextInfo;

    if (ctx?.stanzaId) {
        return {
            remoteJid: m.chat,
            fromMe: ctx.participant ? false : true,
            id: ctx.stanzaId,
            participant: ctx.participant || undefined
        };
    }

    // 4. Some handlers use m.quoted as just the contextInfo
    if (m.quoted?.stanzaId) {
        return {
            remoteJid: m.chat,
            fromMe: false,
            id: m.quoted.stanzaId,
            participant: m.quoted.participant || undefined
        };
    }

    // 5. Direct: m.quoted is the key itself
    if (m.quoted?.id) return m.quoted;

    return null;
}

function loadStickerReactionMessage() {
    try {
        if (!fs.existsSync(CUSTOM_STICKER_FILE)) return DEFAULT_STICKER_MESSAGE;
        const saved = JSON.parse(fs.readFileSync(CUSTOM_STICKER_FILE, 'utf8'));
        if (saved && typeof saved === 'object' && (saved.stickerMessage || saved.lottieStickerMessage)) {
            return saved.stickerMessage || saved.lottieStickerMessage;
        }
        return saved && typeof saved === 'object' ? saved : DEFAULT_STICKER_MESSAGE;
    } catch (error) {
        console.error('[SREACT] Could not load saved sticker:', error.message);
        return DEFAULT_STICKER_MESSAGE;
    }
}

function saveStickerReactionMessage(quoted) {
    const stickerMessage = getQuotedStickerMessage(quoted);
    if (!stickerMessage) return false;
    fs.mkdirSync(path.dirname(CUSTOM_STICKER_FILE), { recursive: true });
    fs.writeFileSync(CUSTOM_STICKER_FILE, JSON.stringify(stickerMessage, null, 2));
    return true;
}

// FIX 3: Build FULL parentMessageKey + fallback if relayMessage fails
async function sendStickerReaction(sock, jid, parentMessageKey, count = 1) {
    const attempts = parseReactionCount(count);
    if (!attempts || !parentMessageKey?.id) return { ok: false, reason: 'no parentMessageKey.id' };

    // WhatsApp needs FULL key, not just id
    const fullKey = {
        remoteJid: parentMessageKey.remoteJid || jid,
        fromMe: parentMessageKey.fromMe ?? false,
        id: parentMessageKey.id,
        participant: parentMessageKey.participant || undefined
    };
    // Remove undefined participant (Baileys hates undefined)
    if (!fullKey.participant) delete fullKey.participant;

    const stickerMessage = loadStickerReactionMessage();
    const payload = {
        messageContextInfo: {
            messageAssociation: {
                associationType: 11,
                parentMessageKey: fullKey
            }
        },
        stickerMessage: { ...stickerMessage }
    };

    for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
            if (typeof sock?.relayMessage === 'function') {
                await sock.relayMessage(jid, payload, {});
            } else if (typeof sock?.sendMessage === 'function') {
                // Fallback: some Baileys forks removed relayMessage
                await sock.sendMessage(jid, payload);
            } else {
                return { ok: false, reason: 'sock.relayMessage and sock.sendMessage both missing' };
            }
        } catch (e) {
            return { ok: false, reason: e.message || String(e), fullKey };
        }

        if (attempt + 1 < attempts) {
            await new Promise(resolve => setTimeout(resolve, STICKER_REACTION_DELAY_MS));
        }
    }
    return { ok: true };
}

module.exports = {
    name: 'sreact',
    alias: ['stickerreact'],
    category: 'owner',
    desc: 'Send the saved sticker reaction to a replied-to message, optionally repeating it',
    usage: '.sreact add (reply to a sticker) | .sreact [count] (reply to a message) | .sreact debug',
    owner: true,

    async run({ sock, m, args, reply: _reply }) {
        const reply = _reply || (async (txt) =>
            sock.sendMessage(m.chat, { text: txt }, { quoted: m.raw || m })
        );

        // DEBUG: Run this to see what XADON actually gives you
        // Reply to your message + .sreact debug
        if (String(args[0] || '').toLowerCase() === 'debug') {
            const target = getTargetKey(m);
            return reply(
                `🔍 SREACT DEBUG\n` +
                `m.quoted exists: ${!!m.quoted}\n` +
                `m.quoted.key?.id: ${m.quoted?.key?.id || 'none'}\n` +
                `m.quotedMessage?.key?.id: ${m.quotedMessage?.key?.id || 'none'}\n` +
                `contextInfo stanzaId: ${m.raw?.message?.extendedTextMessage?.contextInfo?.stanzaId || 'none'}\n` +
                `m.quoted keys: ${m.quoted ? Object.keys(m.quoted).join(', ') : 'none'}\n` +
                `---\n` +
                `getTargetKey() found: ${target ? JSON.stringify(target) : 'NULL'}\n` +
                `relayMessage exists: ${typeof sock?.relayMessage}\n` +
                `sendMessage exists: ${typeof sock?.sendMessage}`
            );
        }

        if (String(args[0] || '').toLowerCase() === 'add') {
            if (args.length !== 1) {
                return reply('Usage: reply to a sticker and send .sreact add.');
            }
            const quotedSticker = getQuotedStickerMessage(m.quoted);
            if (!quotedSticker) {
                return reply('Reply to a sticker and send .sreact add to save it as the new sreact sticker.');
            }
            try {
                saveStickerReactionMessage(m.quoted);
                return reply('✅ New sreact sticker saved.');
            } catch (error) {
                return reply(`Could not save that sticker reaction: ${error.message}`);
            }
        }

        const count = args.length <= 1 ? parseReactionCount(args[0]) : null;
        if (!count) {
            return reply(`Usage: reply to a message and use .sreact [1-${MAX_STICKER_REACTION_ATTEMPTS}].`);
        }

        // FIXED: Use getTargetKey, not m.quoted?.key
        const targetKey = getTargetKey(m);
        if (!targetKey?.id) {
            return reply('*֎ Reply to the message you want to react to, then send .sreact [count].*');
        }

        const quotedSticker = getQuotedStickerMessage(m.quoted);
        if (quotedSticker) {
            try { saveStickerReactionMessage(m.quoted); } catch {}
        }

        const result = await sendStickerReaction(sock, m.chat, targetKey, count);
        if (!result.ok) {
            return reply(`Could not send the sticker reaction in this chat.\nReason: ${result.reason}\nKey used: ${JSON.stringify(result.fullKey || targetKey)}`);
        }
    }
};