/** XADON AI · md — syntax-highlighted code block card (deobfuscated CODY md, XADON edition). */
const LANGS = {
  js: 'javascript', javascript: 'javascript', py: 'python', python: 'python',
  java: 'java', cpp: 'cpp', 'c++': 'cpp', c: 'c', html: 'html', css: 'css',
  json: 'json', ts: 'typescript', typescript: 'typescript', go: 'go',
  rust: 'rust', php: 'php', ruby: 'ruby', swift: 'swift', kotlin: 'kotlin',
  sql: 'sql', shell: 'bash', bash: 'bash', sh: 'bash',
};
const codeblock = (lang, code) => `\u256D\u2500\u274D *CODE BLOCK*\n\u2502\n\u2502 \uD83D\uDCBB *Lang:* ${lang}\n\u2502 \`\`\`${lang}\n${code}\n\u2502 \`\`\`\n\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`;

module.exports = {
  name: 'md',
  alias: ['markdown', 'code', 'syntax'],
  desc: 'Send a syntax-highlighted code block',
  usage: '.md <language> | <code>',
  category: 'tools',
  async run({ sock, m, args, text, reply, ui, prefix }) {
    const raw = (text || '').trim();
    if (!raw) {
      return reply(`\u256D\u2500\u274D *CODE BLOCK*\n\u2502\n\u2502 \u2689 *Usage:*\n\u2502 ${prefix}md javascript | console.log('Hello!')\n\u2502 \u272A *Example:*\n\u2502 ${prefix}md python | print("Hello World")\n\u2502\n\u2502 \uD83D\uDCDD *Languages:* js, py, java, cpp, html, css, etc.\n\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`);
    }
    const bar = raw.indexOf('|');
    let lang, code;
    if (bar !== -1) { lang = raw.slice(0, bar).trim().toLowerCase(); code = raw.slice(bar + 1).trim(); }
    else { lang = 'javascript'; code = raw; }
    lang = LANGS[lang] || lang || 'javascript';
    const Title = lang.charAt(0).toUpperCase() + lang.slice(1);
    await sock.sendMessage(m.chat, { react: { text: '\uD83D\uDCBB', key: m.key } }).catch(() => {});
    try {
      await sock.sendMessage(m.chat, {
        headerText: `## \uD83D\uDCDD ${Title} Code`,
        contentText: '---',
        code, language: lang,
        footerText: `${ui.fonts ? '' : ''}XADON AI • verified`,
      }, { quoted: m.raw });
      await sock.sendMessage(m.chat, { react: { text: '\uD83D\uDC7E', key: m.key } }).catch(() => {});
    } catch (e) {
      console.error('[MD ERROR]', e.message);
      await sock.sendMessage(m.chat, { react: { text: '\uD83D\uDE4A', key: m.key } }).catch(() => {});
      await reply(codeblock(lang, code.slice(0, 3500)));
    }
  },
};
