$
if(!m.quoted) return m.reply('Reply to the target message')

let msg = m.quoted
let node = msg?.message || msg?.fakeObj?.message || {}

let protocols = {
  // 1. Basic
  type: Object.keys(node)[0] || 'unknown',
  from: msg.key.participant || msg.key.remoteJid,
  id: msg.key.id,
  
  // 2. Special WA Protocols
  isProtocol: !!node.protocolMessage,
  protocolType: node.protocolMessage?.type, // 2=delete, 14=edit
  protocolKey: node.protocolMessage?.key,
  
  // 3. Codex / Status / LID
  isStatus: msg.key.remoteJid === 'status@broadcast',
  isLID: msg.key.remoteJid?.endsWith('@lid'),
  isInteractive: !!node.interactiveMessage,
  isButtons: !!node.buttonsMessage,
  isTemplate: !!node.templateMessage,
  isEphemeral: !!node.ephemeralMessage,
  isViewOnce: !!node.viewOnceMessage || !!node.viewOnceMessageV2,
  isProduct: !!node.productMessage,
  isPoll: !!node.pollCreationMessageV3,
  
  // 4. Hidden attrs Baileys stores
  messageStubType: msg.messageStubType || 'None',
  messageStubParameters: msg.messageStubParameters || [],
  biz: msg.biz || 'None',
  verified: msg.verifiedBizName || 'None',
  
  // 5. Codex specific
  hasBloks: JSON.stringify(node).includes('bloks'),
  hasAppState: JSON.stringify(node).includes('app_state'),
  hasCAPI: JSON.stringify(node).includes('ctwa'),
}

let text = `╭───[ DEEP PROTOCOL DUMP ]───\n`
for(let k in protocols) text += `│ ${k}: ${JSON.stringify(protocols[k])}\n`
text += `╰─────────────────────\n\n`

text += `RAW NODE KEYS: ${Object.keys(node).join(', ')}\n\n`
text += `FULL JSON:\n\`\`json\n${JSON.stringify(msg, null, 2)}\`\``

await sock.sendMessage(m.chat, { text })