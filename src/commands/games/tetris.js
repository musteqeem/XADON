/** XADON V3 · tetris — falling blocks HTML game. */
const { sendHtmlPrimitive } = require('../../lib/rich');
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{margin:0;background:#061323;color:#dff6ff;font-family:Arial;text-align:center;padding:8px}
.board{display:grid;grid-template-columns:repeat(10,1fr);gap:1px;background:#000;border:2px solid #38bdf8;border-radius:10px;padding:6px;max-width:260px;margin:0 auto}
.cell{aspect-ratio:1;background:#0a1626}.cell.f{background:#38bdf8;box-shadow:0 0 8px #38bdf8}.cell.p{background:#facc15;box-shadow:0 0 8px #facc15}
button{margin:4px;padding:10px 14px;border-radius:10px;border:2px solid #38bdf8;background:#0b3551;color:#dff6ff;font-weight:900}
</style></head><body><h3>🟪 XADON TETRIS</h3><div id="sc">SCORE 0</div><div class="board" id="b"></div>
<div><button id="l">◀</button><button id="r">▶</button><button id="d">▼</button><button id="o">⟳</button></div>
<script>(function(){var W=10,H=18,b=document.getElementById('b'),sc=document.getElementById('sc'),g=[],cur=null,s=0,t=null;
for(var i=0;i<W*H;i++){var d=document.createElement('div');d.className='cell';b.appendChild(d)}
g=new Array(W*H).fill(0);var SH=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0],[1,0],[1,1]],[[0,1],[0,1],[1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
function dr(){var ch=b.children;for(var i=0;i<W*H;i++)ch[i].className='cell'+(g[i]?' f':'');if(cur)cur.s.forEach(function(r,ry){r.forEach(function(v,rx){if(v){var x=cur.x+rx,y=cur.y+ry;if(y>=0)ch[y*W+x].className='cell p'}})});sc.textContent='SCORE '+s}
function nw(){var s0=SH[Math.floor(Math.random()*SH.length)];cur={s:s0,x:3,y:0};if(col(0,0)){clearInterval(t);alert('Game over — score '+s)}}
function col(dx,dy,sh){sh=sh||cur.s;for(var y=0;y<sh.length;y++)for(var x=0;x<sh[y].length;x++)if(sh[y][x]){var nx=cur.x+x+dx,ny=cur.y+y+dy;if(nx<0||nx>=W||ny>=H||(ny>=0&&g[ny*W+nx]))return true}return false}
function mg(){for(var y=0;y<cur.s.length;y++)for(var x=0;x<cur.s[y].length;x++)if(cur.s[y][x]){var ny=cur.y+y;if(ny>=0)g[ny*W+cur.x+x]=1}for(var r=H-1;r>=0;r--){if(g.slice(r*W,r*W+W).every(Boolean)){g.splice(r*W,W);g.unshift.apply(g,new Array(W).fill(0));s+=100;r++}}nw();dr()}
function sp(){if(!cur)nw();if(col(0,1))mg();else cur.y++;dr()}
document.getElementById('l').onclick=function(){if(cur&&!col(-1,0))cur.x--;dr()};document.getElementById('r').onclick=function(){if(cur&&!col(1,0))cur.x++;dr()};
document.getElementById('d').onclick=function(){sp()};document.getElementById('o').onclick=function(){var r=cur.s[0].map(function(_,i){return cur.s.map(function(row){return row[i]}).reverse()});if(!col(0,0,r))cur.s=r;dr()};
nw();t=setInterval(sp,600);dr()})();</script></body></html>`;
module.exports = { name: 'tetris', alias: ['tetrisgame'], desc: 'Falling blocks game', category: 'games', usage: '.tetris',
  async run({ sock, m, reply }) { try { await sendHtmlPrimitive(sock, m.chat, html); } catch { return reply('Could not start Tetris.'); } } };
