$if(!m.quoted) return m.reply('Reply to a message first')
let msg = m.quoted
let full = JSON.stringify(msg, null, 2)
await sock.sendMessage(m.chat, { document: Buffer.from(full), fileName: 'message_info.json', mimetype: 'application/json' }, { quoted: m })