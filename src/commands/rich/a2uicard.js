// XADON V8 · a2uicard — live server-inspector A2UI app card (CPU/RAM/disk/network/runtime).
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const botstate = require('../../lib/botstate');
function fmtSize(b) { const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0, v = b; while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; } return `${v.toFixed(i === 0 ? 0 : 2)} ${u[i]}`; }
function fmtDur(ms) { const t = Math.floor(ms / 1000), d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; return [...(d ? [`${d}d`] : []), ...(h ? [`${h}h`] : []), ...(m ? [`${m}m`] : []), `${s}s`].join(' '); }
function net() { try { const ni = os.networkInterfaces(); const ips = []; for (const a of Object.values(ni).flat()) { if (a && !a.internal) ips.push(a.address); } return { count: Object.keys(ni).length, primary: ips.find((x) => x.includes('.')) || ips[0] || '-' }; } catch { return { count: 0, primary: '-' }; } }
module.exports = {
  name: 'a2uicard', alias: ['a2ui', 'syscard', 'pingx'], desc: 'Server inspector app card', usage: '.a2uicard', category: 'rich',
  async run({ sock, m, reply, ui }) {
    const start = Date.now();
    await sock.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } }).catch(() => {});
    const cores = os.cpus().length, load = os.loadavg(), total = os.totalmem(), free = os.freemem(), heap = process.memoryUsage(), n = net();
    const cpuPct = +Math.min(99.9, (load[0] / Math.max(cores, 1)) * 100).toFixed(1);
    const memPct = +(((total - free) / total) * 100).toFixed(1);
    const line = (t, v = 'body') => ({ component: 'Text', id: `f${Math.random().toString(36).slice(2, 8)}`, text: String(t), variant: v });
    const comps = [
      { component: 'Column', id: 'root', children: ['hero', 'sys', 'res', 'run'] },
      { component: 'Card', id: 'hero', child: 'hero_c' },
      { component: 'Column', id: 'hero_c', children: ['hero_t', 'hero_s'] },
      { component: 'Text', id: 'hero_t', text: `${botstate.botName()} · Inspector`, variant: 'h1' },
      { component: 'Text', id: 'hero_s', text: `● ${Date.now() - start}ms · ${os.hostname()}`, variant: 'caption' },
      { component: 'Card', id: 'sys', child: 'sys_c' },
      { component: 'Column', id: 'sys_c', children: ['sys_t', 'sys_1', 'sys_2'] },
      { component: 'Text', id: 'sys_t', text: 'System', variant: 'h2' },
      line(`OS · ${os.type()} ${os.release()} · ${os.arch()}`),
      line(`CPU · ${(os.cpus()[0]?.model || 'Unknown').replace(/\(R\)|\(TM\)/g, '').trim()} · ${cores} cores`),
      { component: 'Card', id: 'res', child: 'res_c' },
      { component: 'Column', id: 'res_c', children: ['res_t', 'res_1', 'res_2'] },
      { component: 'Text', id: 'res_t', text: 'Resources', variant: 'h2' },
      { component: 'Slider', id: 'res_1', label: `CPU · ${cpuPct}%`, max: 100, min: 0, value: cpuPct },
      { component: 'Slider', id: 'res_2', label: `RAM · ${memPct}%`, max: 100, min: 0, value: memPct },
      { component: 'Card', id: 'run', child: 'run_c' },
      { component: 'Column', id: 'run_c', children: ['run_t', 'run_1', 'run_2'] },
      { component: 'Text', id: 'run_t', text: 'Runtime', variant: 'h2' },
      line(`Heap · ${fmtSize(heap.heapUsed)} / ${fmtSize(heap.heapTotal)} · Net ${n.primary}`),
      line(`Uptime · bot ${fmtDur(process.uptime() * 1000)} · sys ${fmtDur(os.uptime() * 1000)}`),
    ];
    // fix auto ids to be unique children refs
    comps.find((c) => c.id === 'sys_c').children = ['sys_t', comps[7].id, comps[8].id];
    const surface = { createSurface: { catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json', components: comps, surfaceId: `xadon-${Date.now()}` }, version: 'v0.9' };
    const fallback = `⚙️ *PONG* · ${Date.now() - start}ms\n🧠 RAM ${memPct}% (${fmtSize(total - free)} / ${fmtSize(total)})\n💻 CPU ${cpuPct}% · ${cores} cores\n⏱️ ${fmtDur(process.uptime() * 1000)}`;
    try {
      const msg = { messageContextInfo: { threadId: [], messageSecret: new Uint8Array(crypto.randomBytes(32)) }, interactiveMessage: { body: { text: '' }, bloksWidget: { uuid: crypto.randomUUID(), data: JSON.stringify(surface), type: 'im_a2ui' }, contextInfo: {}, nativeFlowMessage: { buttons: [{ name: '' }], messageParamsJson: '{}' } } };
      await sock.relayMessage(m.chat, msg, { additionalNodes: [{ tag: 'biz', attrs: {} }] });
    } catch { await sock.sendMessage(m.chat, { text: fallback }, { quoted: m.raw }); }
  },
};
