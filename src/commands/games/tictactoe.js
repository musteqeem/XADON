/** XADON V3 · tictactoe — Xs & Os vs bot (HTML). */
const { sendHtmlPrimitive } = require('../../lib/rich');
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{margin:0;background:#111827;color:#fff;font-family:Arial;text-align:center;padding:12px}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:240px;margin:10px auto}
.c{aspect-ratio:1;display:grid;place-items:center;font-size:34px;font-weight:900;border-radius:12px;background:#1f2937;cursor:pointer}
</style></head><body><h3>⭕ TIC-TAC-TOE</h3><div id="s">You are X — tap a square</div><div class="g" id="g"></div>
<script>(function(){var g=document.getElementById('g'),s=document.getElementById('s'),a=new Array(9).fill(''),done=false;
function win(p){var W=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];return W.some(function(w){return w.every(function(i){return a[i]==p})})}
function bot(){var e=[];a.forEach(function(v,i){if(!v)e.push(i)});if(!e.length)return;var i=e[Math.floor(Math.random()*e.length)];a[i]='O';dr();if(win('O')){s.textContent='🤖 Bot wins!';done=true}else if(!a.includes('')){s.textContent='🤝 Draw!';done=true}}
function dr(){var ch=g.children;for(var i=0;i<9;i++)ch[i].textContent=a[i]}
for(var i=0;i<9;i++)(function(i){var d=document.createElement('div');d.className='c';d.onclick=function(){if(done||a[i])return;a[i]='X';dr();if(win('X')){s.textContent='🎉 You win!';done=true;return}if(!a.includes('')){s.textContent='🤝 Draw!';done=true;return}bot()};g.appendChild(d)})(i)})();</script></body></html>`;
module.exports = { name: 'tictactoe', alias: ['ttt', 'xoxo'], desc: 'Tic-tac-toe vs bot', category: 'games', usage: '.tictactoe',
  async run({ sock, m, reply }) { try { await sendHtmlPrimitive(sock, m.chat, html); } catch { return reply('Could not start TicTacToe.'); } } };
