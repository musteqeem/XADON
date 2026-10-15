/**
 * npm run check
 * Runs every command against a fake WhatsApp socket and prints the replies.
 * No login needed — perfect for previewing your UI while you edit.
 */
process.env.AI_PROVIDER = process.env.AI_PROVIDER || 'none';
const config = require('../config');
const loader = require('../src/loader');
const { handle } = require('../src/handler');
const premium = require('../src/lib/premium');

const OWNER = `${config.ownerNumbers[0]}@s.whatsapp.net`;
const GROUP = '120363000000000000@g.us';
const sent = [];

const sock = {
  user: { id: `${config.ownerNumbers[0]}:1@s.whatsapp.net`, name: config.botName },
  async sendMessage(jid, content) {
    sent.push(content);
    return { key: { id: 'TEST', remoteJid: jid } };
  },
  sendPresenceUpdate: async () => {},
  readMessages: async () => {},
  profilePictureUrl: async () => { throw new Error('no picture'); },
  groupMetadata: async () => ({
    id: GROUP, subject: 'WaPlus Lab', creation: 1700000000, desc: 'Test group',
    participants: [{ id: OWNER, admin: 'superadmin' }, { id: '2348111111111@s.whatsapp.net', admin: null }],
  }),
  groupParticipantsUpdate: async (_jid, users) => users.map((u) => ({ jid: u, status: '200' })),
  groupSettingUpdate: async () => ({}),
};

const fake = (text, chat = OWNER) => ({
  key: { remoteJid: chat, fromMe: true, id: Math.random().toString(36).slice(2), participant: chat.endsWith('@g.us') ? OWNER : undefined },
  pushName: config.ownerName,
  message: { conversation: text },
});

const CASES = [
  ['menu'], ['ping'], ['alive'], ['runtime'], ['owner'],
  ['ai'], ['fancy WaPlus'], ['sticker'], ['vv'], ['getpp'],
  ['groupinfo', GROUP], ['tagall hello team', GROUP], ['kick 2348111111111', GROUP],
  ['premium'], ['settings'],
  ['antilink on', GROUP], ['welcome on Welcome @user to @group!', GROUP],
  ['goodbye off', GROUP], ['quiz What is 2 + 2? | 4 | Basic arithmetic.', GROUP],
  ['tempkick 2348111111111 10s', GROUP],
  ['help ping'], ['info'], ['id'], ['support'], ['donate'],
  ['calc 12 * (5 + 3)'], ['base64 encode hello'], ['password 16'], ['countdown 2027-01-01 Party'],
  ['note save test note'], ['todo add test task'], ['remind 5s hello'],
  ['translate en | hello'], ['define hello'],
  ['warn 2348111111111 stop spam', GROUP], ['warnings 2348111111111', GROUP],
  ['poll Best day? | Monday | Friday', GROUP], ['mute', GROUP], ['unmute', GROUP],
  ['hidetag hello all', GROUP], ['promote 2348111111111', GROUP], ['demote 2348111111111', GROUP],
  ['del', GROUP], ['setdesc hello', GROUP], ['antibadword on', GROUP],
  ['joke'], ['quote'], ['fact'], ['truth'], ['dare'], ['ship 2348111111111', GROUP],
  ['rate XADON'], ['coin'], ['dice 6'], ['8ball will I win?'], ['roast 2348111111111'],
  ['ban 2348111111111'], ['unban 2348111111111'], ['broadcast hello fans'],
];

(async () => {
  await premium.loadAssets();
  premium.install(sock);
  const total = loader.load().size;
  console.log(`Loaded ${total} commands\n`);
  let failed = 0;
  let crashed = false;
  const logError = console.error;
  console.error = (...a) => { crashed = true; logError(...a); };
  for (const [input, chat] of CASES) {
    sent.length = 0;
    crashed = false;
    await handle(sock, fake(`${config.prefix}${input}`, chat));
    const out = sent.map((c) => [c.text || c.caption || Object.keys(c).join(','), c.nativeFlow && `[buttons] ${c.nativeFlow.map((b) => b.text).join(' | ')}`].filter(Boolean).join('\n')).join('\n---\n');
    const broke = !sent.length || crashed;
    if (broke) failed++;
    console.log(`━━━━ ${config.prefix}${input} ${broke ? '[FAIL]' : '[OK]'}\n${out || '(no reply)'}\n`);
  }
  console.log(failed ? `${failed} command(s) failed` : 'All commands replied');
  process.exit(failed ? 1 : 0);
})();
