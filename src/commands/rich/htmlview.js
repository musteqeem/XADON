// XADON V8 · htmlview — render raw HTML inside WhatsApp (FOA HTML primitive).
const crypto = require('crypto');
module.exports = {
  name: 'htmlview', alias: ['htmlgoon', 'htmlrender'], desc: 'Render HTML inside chat', usage: '.htmlview <h1>Hi</h1>', category: 'rich',
  async run({ sock, m, text, reply, ui }) {
    const html = (text || '').trim();
    if (!html) return reply(ui.notice('info', 'HTML view', 'Usage: .htmlview <h1>Hello</h1><p>styled card</p>'));
    try {
      let genFn;
      try { ({ generateWAMessageFromContent: genFn } = require('@musteqeem/baileys')); } catch { throw new Error('Baileys runtime cannot build HTML views'); }
      const payload = { __typename: 'GenAIUnifiedResponse', response_id: crypto.randomUUID(), sections: [{ __typename: 'GenAIUnifiedResponseSection', view_model: { __typename: 'GenAISingleLayoutViewModel', primitive: { __typename: 'FOAHtmlPrimitiveDemoDONOTUSE', trusted_sources: [], payload: html.slice(0, 60000) } } }] };
      const content = { botForwardedMessage: { message: { richResponseMessage: { messageType: 1, unifiedResponse: { data: Buffer.from(JSON.stringify(payload)).toString('base64') }, contextInfo: { isForwarded: true, forwardOrigin: 4 } } } } };
      const gen = genFn(m.chat, content, {});
      await sock.relayMessage(m.chat, gen.message, { messageId: gen.key.id });
    } catch (e) { return reply(ui.notice('error', 'HTML failed', String(e.message || e).slice(0, 200))); }
  },
};
