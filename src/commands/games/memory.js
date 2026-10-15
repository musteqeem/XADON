/** XADON V3 · memory — flip-match HTML game. */
const { sendHtmlPrimitive } = require('../../lib/rich');
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{margin:0;background:#101b2d;color:#fff;font-family:Arial;text-align:center;padding:10px}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:280px;margin:10px auto}
.c{aspect-ratio:1;display:grid;place-items:center;border-radius:10px;background:#1e3a5f;font-size:26px;cursor:pointer}
.c.o{background:#0ea5e9}.c.d{background:#052e16}
</style></head><body><h3>🃏 MEMORY MATCH</h3><div id="s">MOVES 0</div><div class="g" id="g"></div>
<script>(function(){var E=['🍎','🚀','🎮','⚽','🎵','🌙','🐍','⭐'],D=E.concat(E).sort(function(){return Math.random()-.5}),g=document.getElementById('g'),s=document.getElementById('s'),f=[],mv=0,lock=false;
D.forEach(function(e){var d=document.createElement('div');d.className='c';d.dataset.e=e;d.textContent='?';d.onclick=function(){if(lock||d.classList.contains('o')||d.classList.contains('d'))return;d.classList.add('o');d.textContent=d.dataset.e;f.push(d);
if(f.length==2){mv++;s.textContent='MOVES '+mv;lock=true;var a=f[0],b=f[1];f=[];setTimeout(function(){if(a.dataset.e==b.dataset.e){a.classList.add('d');b.classList.add('d')}else{a.classList.remove('o');b.classList.remove('o');a.textContent='?';b.textContent='?'}lock=false;if(document.querySelectorAll('.d').length==16)s.textContent='🎉 DONE in '+mv+' moves!'},600)}};g.appendChild(d)})})();</script></body></html>`;
module.exports = { name: 'memory', alias: ['matchgame'], desc: 'Flip & match cards', category: 'games', usage: '.memory',
  async run({ sock, m, reply }) { try { await sendHtmlPrimitive(sock, m.chat, html); } catch { return reply('Could not start Memory.'); } } };
