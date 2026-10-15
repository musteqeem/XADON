/** XADON V3 · mines — minesweeper HTML game. */
const { sendHtmlPrimitive } = require('../../lib/rich');
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{margin:0;background:#0f172a;color:#e2e8f0;font-family:Arial;text-align:center;padding:10px}
.g{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;max-width:280px;margin:10px auto}
.c{aspect-ratio:1;display:grid;place-items:center;border-radius:8px;background:#1e293b;font-weight:900;cursor:pointer}
.c.o{background:#020617}.c.b{background:#7f1d1d}
</style></head><body><h3>💣 MINES</h3><div id="s">Tap a tile · avoid 6 bombs</div><div class="g" id="g"></div>
<script>(function(){var g=document.getElementById('g'),s=document.getElementById('s'),N=36,B=6,bombs=new Set(),open=0;
while(bombs.size<B)bombs.add(Math.floor(Math.random()*N));
function nb(i){var x=i%6,y=(i/6)|0,c=0;for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){var nx=x+dx,ny=y+dy;if(nx<0||nx>5||ny<0||ny>5)continue;if(bombs.has(ny*6+nx))c++}return c}
for(var i=0;i<N;i++)(function(i){var d=document.createElement('div');d.className='c';d.textContent='·';d.onclick=function(){if(d.classList.contains('o'))return;d.classList.add('o');
if(bombs.has(i)){d.classList.add('b');d.textContent='💣';s.textContent='💥 BOOM! Tap .mines to retry';g.querySelectorAll('.c').forEach(function(x){x.onclick=null});return}
var n=nb(i);d.textContent=n||'✓';open++;if(open==N-B)s.textContent='🎉 YOU WIN!'};g.appendChild(d)})(i)})();</script></body></html>`;
module.exports = { name: 'mines', alias: ['minesweeper'], desc: 'Minesweeper game', category: 'games', usage: '.mines',
  async run({ sock, m, reply }) { try { await sendHtmlPrimitive(sock, m.chat, html); } catch { return reply('Could not start Mines.'); } } };
