// XADON V8 · colorcard — coloured GenAI label card (green/red/blue/gold).
const fmt = require('../../lib/format');
const COLORS = {
  green: ['#0E7C61FF', '#FFFFFFFF'], red: ['#FF0000FF', '#000000FF'],
  blue: ['#1A73E8FF', '#FFFFFFFF'], gold: ['#B8860BFF', '#000000FF'],
  purple: ['#7B1FA2FF', '#FFFFFFFF'],
};
module.exports = {
  name: 'colorcard', alias: ['colourcard', 'labelcard'], desc: 'Coloured label card', usage: '.colorcard <text> | .colorcard red | <text>', category: 'rich',
  async run({ sock, m, text, reply, ui }) {
    let color = 'green', body = (text || '').trim();
    const first = body.split('|')[0].trim().toLowerCase();
    if (COLORS[first] && body.includes('|')) { color = first; body = body.slice(body.indexOf('|') + 1).trim(); }
    if (!body) return reply(ui.notice('info', 'Colour card', 'Usage: .colorcard hello | .colorcard red | hello\nColours: green red blue gold purple'));
    const [bg, fg] = COLORS[color];
    try {
      const payload = { __typename: 'GenAIUnifiedResponse', response_id: `xadon-${Date.now()}`, sections: [{ __typename: 'GenAIUnifiedResponseSection', view_model: { __typename: 'GenAISingleLayoutViewModel', primitive: { __typename: 'GenAILabelPrimitive', text: body.slice(0, 800), variant: 'POSITIVE', background_color_override: bg, text_color_override: fg } } }] };
      await sock.relayMessage(m.chat, { botForwardedMessage: { message: { richResponseMessage: { messageType: 1, unifiedResponse: { data: Buffer.from(JSON.stringify(payload)) }, contextInfo: { isForwarded: true, forwardOrigin: 4 } } } } }, {});
    } catch { return reply(body); }
  },
};
