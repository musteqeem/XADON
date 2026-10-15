/** XADON V3 · 2048 — slide & merge HTML game. */
const { sendHtmlPrimitive } = require('../../lib/rich');
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{margin:0;background:#0b1622;color:#fff;font-family:Arial;text-align:center;padding:10px}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:280px;margin:10px auto}
.t{aspect-ratio:1;display:grid;place-items:center;border-radius:10px;background:#1e2a3a;font-weight:900;font-size:20px}
button{margin:3px;padding:10px 12px;border-radius:10px;border:2px solid #f59e0b;background:#422006;color:#fde68a;font-weight:900}
</style></head><body><h3>🟨 XADON 2048</h3><div id="s">SCORE 0</div><div class="g" id="g"></div>
<div><button id="u">▲</button></div><div><button id="l">◀</button><button id="d">▼</button><button id="r">▶</button></div>
<script>(function(){var g=document.getElementById('g'),s=document.getElementById('s'),a=[],sc=0;
for(var i=0;i<16;i++){var d=document.createElement('div');d.className='t';g.appendChild(d)}a=new Array(16).fill(0);
function ad(){var e=[];a.forEach(function(v,i){if(!v)e.push(i)});if(e.length)a[e[Math.floor(Math.random()*e.length)]]=Math.random()<.9?2:4}
function dr(){var ch=g.children;ch.forEach;for(var i=0;i<16;i++){ch[i].textContent=a[i]||'';ch[i].style.background=a[i]?'#f59e0b':'#1e2a3a'}s.textContent='SCORE '+sc}
function mv(k){var v=[0,1,2,3].map(function(r){return[0,1,2,3].map(function(c){var x=k==2?3-c:(k==0||k==2?c:r),y=k==2?r:(k==0||k==2?r:(k==1?3-c:c));return a[y*4+x]})});
var moved=false;v=v.map(function(row){row=row.filter(Boolean);for(var i=0;i<row.length-1;i++)if(row[i]==row[i+1]){row[i]*=2;sc+=row[i];row.splice(i+1,1)}while(row.length<4)row.push(0);return row});
var na=new Array(16).fill(0);[0,1,2,3].forEach(function(r){[0,1,2,3].forEach(function(c){var x=k==2?3-c:(k==0||k==2?c:r),y=k==2?r:(k==0||k==2?r:(k==1?3-c:c));if(na[y*4+x]!==v[r][c])moved=true;na[y*4+x]=v[r][c]})});a=na;if(moved)ad();dr()}
document.getElementById('u').onclick=function(){mv(0)};document.getElementById('d').onclick=function(){mv(2)};document.getElementById('l').onclick=function(){mv(3)};document.getElementById('r').onclick=function(){mv(1)};
ad();ad();dr()})();</script></body></html>`;
module.exports = { name: 'g2048', alias: ['2048'], desc: 'Slide & merge 2048', category: 'games', usage: '.g2048',
  async run({ sock, m, reply }) { try { await sendHtmlPrimitive(sock, m.chat, html); } catch { return reply('Could not start 2048.'); } } };
