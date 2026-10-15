/** XADON V3 · snake — interactive HTML snake (Meta-AI primitive). */
const { sendHtmlPrimitive } = require('../../lib/rich');
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}html,body{margin:0;font-family:Arial,sans-serif;background:radial-gradient(circle at 50% 4%,#075985,#061323 74%)}body{padding:6px}
.card{padding:12px;border:2px solid #38bdf8;border-radius:20px;background:linear-gradient(145deg,#06192d,#0b3551 54%,#061321);color:#dff6ff}
.title{text-align:center;color:#b9efff;font:bold 23px Arial Black,Arial,sans-serif}.sub{text-align:center;color:#7fc2df;font:10px monospace;margin:2px 0 8px}
.board{display:grid;grid-template-columns:repeat(20,1fr);gap:1px;padding:7px;border:2px solid #24874c;border-radius:13px;background:#000}
.cell{aspect-ratio:1;background:#0a1a0a}.cell.s{background:linear-gradient(135deg,#66ff44,#33aa22);border-radius:40%}.cell.h{background:linear-gradient(135deg,#88ff66,#44cc33);border-radius:30%;transform:scale(1.08)}
.cell.f{background:radial-gradient(circle,#ffdd44,#ff8800);border-radius:50%}.msg{height:32px;margin:8px 0;display:grid;place-items:center;border:1px solid #2b8c54;border-radius:8px;background:#031008;color:#bcffc2;font:bold 12px monospace}
.ct{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:260px;margin:0 auto}.ct button{height:42px;border:2px solid #238d50;border-radius:11px;color:#d8ffe0;background:linear-gradient(#155e35,#07341c);font-size:21px;font-weight:900}
</style></head><body><div class="card"><div class="title">🐍 SNAKE</div><div class="sub">XADON AI · SWIPE OR TAP</div>
<div class="msg" id="mg">Tap a control to start</div><div class="board" id="b"></div>
<div class="ct"><button style="grid-column:2" id="u">▲</button><button style="grid-column:1;grid-row:2" id="l">◀</button><button style="grid-column:2;grid-row:2" id="d">▼</button><button style="grid-column:3;grid-row:2" id="r">▶</button></div>
</div><script>(function(){var b=document.getElementById('b'),mg=document.getElementById('mg'),c=[],s=[],f=null,d={x:1,y:0},n={x:1,y:0},t=null,on=false,sc=0,W=20,H=20;
for(var i=0;i<W*H;i++){var e=document.createElement('div');e.className='cell';b.appendChild(e);c.push(e)}
function ix(x,y){return y*W+x}function dr(){c.forEach(function(x){x.className='cell'});s.forEach(function(p,i){c[ix(p.x,p.y)].className='cell '+(i?'s':'h')});if(f)c[ix(f.x,f.y)].className='cell f'}
function pf(){var o=[];for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(!s.some(function(p){return p.x==x&&p.y==y}))o.push({x:x,y:y});f=o.length?o[Math.floor(Math.random()*o.length)]:null}
function st(x,y){clearInterval(t);var cx=10,cy=10;d={x:x,y:y};n={x:x,y:y};s=[{x:cx,y:cy},{x:cx-x,y:cy-y},{x:cx-2*x,y:cy-2*y}];sc=0;on=true;pf();mg.textContent='🐍 Running — SCORE '+sc;dr();t=setInterval(sp,300)}
function sp(){if(!on)return;d=n;var h={x:s[0].x+d.x,y:s[0].y+d.y};if(h.x<0||h.x>=W||h.y<0||h.y>=H||s.some(function(p){return p.x==h.x&&p.y==h.y})){on=false;clearInterval(t);mg.textContent='💀 Game over — score '+sc+' · tap a control to restart';return}s.unshift(h);if(f&&h.x==f.x&&h.y==f.y){sc+=10;mg.textContent='🍽️ +10 · SCORE '+sc;pf()}else s.pop();dr()}
function tn(x,y){if(!on)return st(x,y);if(x!==-d.x||y!==-d.y)n={x:x,y:y}}
document.getElementById('u').onclick=function(){tn(0,-1)};document.getElementById('d').onclick=function(){tn(0,1)};document.getElementById('l').onclick=function(){tn(-1,0)};document.getElementById('r').onclick=function(){tn(1,0)};mg.textContent='Tap a control to start';dr()})();</script></body></html>`;
module.exports = {
  name: 'snake', alias: ['bluesnake', 'snakegame'], desc: 'Interactive Snake game', category: 'games', usage: '.snake',
  async run({ sock, m, reply }) {
    try { await sendHtmlPrimitive(sock, m.chat, html); }
    catch (e) { return reply('🐍 Could not start Snake. Please try again.'); }
  },
};
