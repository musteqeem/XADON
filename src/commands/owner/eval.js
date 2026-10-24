/**
 * XADON V3 · EVAL — pro eval with shell, media helpers & smart filter
 *.eval / > / # = JS | sh = Shell
 */
const util = require('util');
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

module.exports = {
  name: 'eval',
  alias: ['#', '>', 'sh'],
  desc: 'Execute JavaScript code or shell commands',
  category: 'owner',
  usage: '.eval <code> | > <code> | sh <command>',
  owner: true,

  async run({ sock, m, args, prefix, command, reply: _reply, loader, db }) {
    const reply = _reply || (async (txt) => sock.sendMessage(m.chat, { text: txt }, { quoted: m.raw || m }));
    const text = args.join(' ').trim();
    const cmd = (command || '').toLowerCase();

    if (!text) return reply('✦ Usage: `> code` or `sh command`');

    const startTime = Date.now();
    const isShell = cmd === 'sh';

    const box = (title, content) => {
      const line = '─'.repeat(Math.min(title.length + 2, 40));
      return `┌➫─⏚ ${title} ${line}\n${content}\n└${'─'.repeat(42)}`;
    };

    // ── Shell execution mode ──
    if (isShell) {
      try {
        const result = execSync(text, {
          encoding: 'utf8',
          timeout: 30000,
          maxBuffer: 1024 * 1024 * 5
        });
        const timeTaken = Date.now() - startTime;
        const output = (result || 'No output').slice(0, 4000);
        return reply(box(`⚡ SHELL ${timeTaken}ms`, `\`\`\`\n${output}\n\`\`\``));
      } catch (err) {
        const timeTaken = Date.now() - startTime;
        const errOutput = (err.stdout || err.stderr || err.message).slice(0, 4000);
        return reply(box(`✘ SHELL ERROR ${timeTaken}ms`, `\`\`\`\n${errOutput}\n\`\`\``));
      }
    }

    // ── JavaScript execution mode ──
    let consoleOutput = '';
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const capture = (pfx) => (...a) => {
      consoleOutput += pfx + a.map(v => typeof v === 'object'? util.inspect(v, { depth: 3, colors: false }) : String(v)).join(' ') + '\n';
    };

    console.log = capture('📝 ');
    console.error = capture('❌ ');
    console.warn = capture('⚠️ ');

    try {
      // ── Core Media Helpers ──
      const getContent = (source) => {
        if (typeof source === 'string' && source.startsWith('http')) return { url: source };
        if (Buffer.isBuffer(source)) return source;
        return fs.readFileSync(source);
      };

      const sendImage = (source, caption = '') => sock.sendMessage(m.chat, { image: getContent(source), caption }, { quoted: m.raw || m });
      const sendVideo = (source, caption = '') => sock.sendMessage(m.chat, { video: getContent(source), caption }, { quoted: m.raw || m });
      const sendAudio = (source, ptt = false) => sock.sendMessage(m.chat, { audio: getContent(source), ptt }, { quoted: m.raw || m });
      const sendFile = (source, filename = 'file') => sock.sendMessage(m.chat, { document: getContent(source), fileName: filename }, { quoted: m.raw || m });
      const sendSticker = (source) => sock.sendMessage(m.chat, { sticker: getContent(source) }, { quoted: m.raw || m });
      const sendContact = (name, number) => sock.sendMessage(m.chat, { contacts: { displayName: name, contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:${number}\nEND:VCARD` }] } }, { quoted: m.raw || m });
      const sendLocation = (lat, lng, name = 'Location') => sock.sendMessage(m.chat, { location: { degreesLatitude: lat, degreesLongitude: lng, name } }, { quoted: m.raw || m });
      const sendButtons = (txt, buttons = []) => sock.sendMessage(m.chat, { text: txt, footer: 'Pro Eval', buttons: buttons.map((b, i) => ({ buttonId: `btn_${i}`, buttonText: { displayText: b }, type: 1 })), headerType: 1 }, { quoted: m.raw || m });
      const sendList = (txt, sections = []) => sock.sendMessage(m.chat, { text: txt, footer: 'Pro Eval', title: 'Select', buttonText: 'Open', sections }, { quoted: m.raw || m });
      const sendText = (txt) => sock.sendMessage(m.chat, { text: txt }, { quoted: m.raw || m });

      // ── Utility Helpers ──
      const shell = (cmd) => new Promise((resolve, reject) => {
        exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => err? reject(stderr || err.message) : resolve(stdout));
      });
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      const json = (obj) => JSON.stringify(obj, null, 2);
      const inspect = (obj, depth = 4) => util.inspect(obj, { depth, colors: false });
      const readFile = (p) => fs.readFileSync(p, 'utf8');
      const writeFile = (p, d) => fs.writeFileSync(p, d);
      const mem = () => { const u = process.memoryUsage(); return `RSS: ${(u.rss/1024/1024).toFixed(2)}MB | Heap: ${(u.heapUsed/1024/1024).toFixed(2)}MB`; };
      const uptime = () => { const s = process.uptime(); const h = Math.floor(s/3600), mm = Math.floor(s%3600/60), sec = Math.floor(s%60); return `${h}h ${mm}m ${sec}s`; };
      const table = (data) => {
        if (!Array.isArray(data) ||!data.length) return '[]';
        const keys = Object.keys(data[0]);
        const rows = data.map(obj => keys.map(k => String(obj[k]?? '')));
        const colWidths = keys.map((k, i) => Math.max(k.length,...rows.map(r => r[i].length)));
        const sep = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
        const fmt = (row) => '| ' + row.map((c, i) => c.padEnd(colWidths[i])).join(' | ') + ' |';
        return [sep, fmt(keys), sep,...rows.map(fmt), sep].join('\n');
      };

      // Smart wrap
      const isMultiLine = text.includes('\n');
      const hasDeclaration = /^\s*(const|let|var|function|class|if|for|while|try|switch)/m.test(text);
      let wrappedCode = (isMultiLine || hasDeclaration)? `(async () => { ${text} })()` : `(async () => { return ${text} })()`;

      let result = await eval(wrappedCode);

      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;

      const timeTaken = Date.now() - startTime;

      function isWhatsAppSendResponse(r) {
        if (!r) return false;
        if (r.message?.reactionMessage) return true;
        if (r.key && r.messageTimestamp &&!r.conversation &&!r.text) return true;
        return false;
      }

      const wantsRaw = text.includes('.raw') || text.includes('//raw');
      let output = '';
      if (consoleOutput) output += consoleOutput.trimEnd();

      const isSendResponse =!wantsRaw && isWhatsAppSendResponse(result);

      if (isSendResponse) {
        if (!consoleOutput) return;
      } else if (result!== undefined) {
        let resultStr;
        if (Buffer.isBuffer(result)) resultStr = `<Buffer ${result.length} bytes>`;
        else if (typeof result === 'function') resultStr = `[Function: ${result.name || 'anonymous'}]`;
        else if (typeof result === 'object') {
          resultStr = util.inspect(result, { depth: wantsRaw? 5 : 3, colors: false, maxArrayLength: wantsRaw? 50 : 20, breakLength: wantsRaw? 80 : 60 });
          if (resultStr.length > 8000) resultStr = resultStr.slice(0, 8000) + '\n... (truncated)';
        } else resultStr = String(result);
        output = output? output + '\n' + resultStr : resultStr;
      }

      if (output && output.trim() && output.trim()!== 'undefined') {
        const chunks = output.match(/[\s\S]{1,3900}/g) || [output];
        for (let i = 0; i < chunks.length; i++) {
          const header = chunks.length > 1? `✦ RESULT ${i+1}/${chunks.length} ${timeTaken}ms` : `✦ RESULT ${timeTaken}ms`;
          await reply(box(header, `\`\`\`\n${chunks[i]}\n\`\`\``));
          if (i < chunks.length - 1) await sleep(500);
        }
      } else if (!consoleOutput && (result === undefined || isSendResponse)) {
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {});
      }

    } catch (err) {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      const timeTaken = Date.now() - startTime;
      let errMsg = err.stack || err.message || String(err);
      if (consoleOutput) errMsg = consoleOutput.trimEnd() + '\n' + errMsg;
      await reply(box(`✘ ERROR ${timeTaken}ms`, `\`\`\`\n${errMsg.slice(0, 4000)}\n\`\`\``));
    }
  }
};