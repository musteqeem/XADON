/** XADON AI · chess (IMPROVED) — full rules + pass-and-play + vs-AI + HTML board.
 *  Integrated from CODY chess engine, rewritten for XADON:
 *  - complete legal-move engine (castling, en-passant, promotion)
 *  - chat commands: .chess new | .chess move e2e4 | .chess board | .chess ai | .chess undo
 *  - unicode board preview in chat (simple clean reply, ping-style, no UI spam)
 *  - interactive HTML board via rich.sendHtmlPrimitive (tap to move)
 *  Category: games (existing — no new category created).
 */
const { sendHtmlPrimitive } = require('../../lib/rich');

// ---------- engine (ported from CODY, trimmed for XADON) ----------
function chessEngineFactory() {
  const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const at = (r, c) => r * 8 + c;
  const row = i => Math.floor(i / 8), col = i => i % 8;
  const colorOf = p => p ? (p === p.toUpperCase() ? 'w' : 'b') : null;
  const clone = g => ({ ...g, board: g.board.slice(), history: (g.history || []).slice(), captured: (g.captured || []).slice() });
  function createGame() {
    return { board: 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR'.split('').map(p => p === '.' ? '' : ''), turn: 'w', castling: 'KQkq', enPassant: null, history: [], captured: [], lastMove: null, fullmove: 1 };
  }
  function isSquareAttacked(game, square, byColor) {
    const r = row(square), c = col(square), b = game.board;
    const pawnRow = r + (byColor === 'w' ? 1 : -1);
    for (const dc of [-1, 1]) if (inside(pawnRow, c + dc)) { const p = b[at(pawnRow, c + dc)]; if (p && colorOf(p) === byColor && p.toLowerCase() === 'p') return true; }
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) if (inside(r + dr, c + dc)) { const p = b[at(r + dr, c + dc)]; if (p && colorOf(p) === byColor && p.toLowerCase() === 'n') return true; }
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]) {
      let rr = r + dr, cc = c + dc, d = 1;
      while (inside(rr, cc)) { const p = b[at(rr, cc)]; if (p) { if (colorOf(p) === byColor) { const t = p.toLowerCase(); if (t === 'q' || (d === 1 && t === 'k') || (dr === 0 || dc === 0 ? t === 'r' : t === 'b')) return true; } break; } rr += dr; cc += dc; d++; }
    }
    return false;
  }
  const kingSquare = (game, color) => game.board.findIndex(p => p && p.toLowerCase() === 'k' && colorOf(p) === color);
  const isInCheck = (game, color = game.turn) => { const k = kingSquare(game, color); return k < 0 || isSquareAttacked(game, k, color === 'w' ? 'b' : 'w'); };
  function pseudoMoves(game, from) {
    const b = game.board, p = b[from]; if (!p) return [];
    const color = colorOf(p), type = p.toLowerCase(), r = row(from), c = col(from), out = [];
    const add = (rr, cc, extra = {}) => { if (!inside(rr, cc)) return false; const to = at(rr, cc), t = b[to]; if (t && (colorOf(t) === color || t.toLowerCase() === 'k')) return false; out.push({ from, to, ...extra }); return !t; };
    if (type === 'p') {
      const dir = color === 'w' ? -1 : 1, start = color === 'w' ? 6 : 1, end = color === 'w' ? 0 : 7;
      if (inside(r + dir, c) && !b[at(r + dir, c)]) { out.push({ from, to: at(r + dir, c), ...(r + dir === end ? { promotion: true } : {}) }); if (r === start && !b[at(r + 2 * dir, c)]) out.push({ from, to: at(r + 2 * dir, c), doublePawn: true }); }
      for (const dc of [-1, 1]) if (inside(r + dir, c + dc)) { const to = at(r + dir, c + dc), t = b[to]; if (t && colorOf(t) !== color && t.toLowerCase() !== 'k') out.push({ from, to, ...(r + dir === end ? { promotion: true } : {}) }); else if (to === game.enPassant) out.push({ from, to, enPassant: true }); }
      return out;
    }
    if (type === 'n') { for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) add(r + dr, c + dc); return out; }
    if (type === 'k') {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dr || dc) add(r + dr, c + dc);
      const home = color === 'w' ? 60 : 4, foe = color === 'w' ? 'b' : 'w';
      if (from === home && !isSquareAttacked(game, home, foe)) {
        if (game.castling.includes(color === 'w' ? 'K' : 'k') && !b[home+1] && !b[home+2] && (color === 'w' ? b[home+3] === 'R' : b[home+3] === 'r') && !isSquareAttacked(game, home+1, foe) && !isSquareAttacked(game, home+2, foe)) out.push({ from, to: home + 2, castle: 'king' });
        if (game.castling.includes(color === 'w' ? 'Q' : 'q') && !b[home-1] && !b[home-2] && !b[home-3] && (color === 'w' ? b[home-4] === 'R' : b[home-4] === 'r') && !isSquareAttacked(game, home-1, foe) && !isSquareAttacked(game, home-2, foe)) out.push({ from, to: home - 2, castle: 'queen' });
      }
      return out;
    }
    const dirs = type === 'r' ? [[-1,0],[1,0],[0,-1],[0,1]] : type === 'b' ? [[-1,-1],[-1,1],[1,-1],[1,1]] : [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    for (const [dr, dc] of dirs) { let rr = r + dr, cc = c + dc; while (inside(rr, cc)) { if (!add(rr, cc)) break; rr += dr; cc += dc; } }
    return out;
  }
  function applyUnchecked(game, move) {
    const next = clone(game), b = next.board, piece = b[move.from], target = b[move.to];
    b[move.from] = '';
    if (move.enPassant) b[move.to + (colorOf(piece) === 'w' ? 8 : -8)] = '';
    b[move.to] = move.promotion ? (colorOf(piece) === 'w' ? String(move.promotion).toUpperCase() : String(move.promotion).toLowerCase()) : piece;
    if (move.castle) { const home = colorOf(piece) === 'w' ? 60 : 4; const rf = move.castle === 'king' ? home + 3 : home - 4, rt = move.castle === 'king' ? home + 1 : home - 1; b[rt] = b[rf]; b[rf] = ''; }
    const rights = new Set(next.castling.split(''));
    const kill = sq => ({ 60: ['K','Q'], 63: ['K'], 56: ['Q'], 4: ['k','q'], 7: ['k'], 0: ['q'] })[sq] || [];
    for (const x of [...kill(move.from), ...kill(move.to)]) rights.delete(x);
    next.castling = 'KQkq'.split('').filter(x => rights.has(x)).join('');
    next.enPassant = move.doublePawn ? (move.from + move.to) / 2 : null;
    if (next.turn === 'b') next.fullmove++;
    next.turn = next.turn === 'w' ? 'b' : 'w';
    next.lastMove = { from: move.from, to: move.to };
    return next;
  }
  function legalMoves(game, from) {
    const starts = from === undefined ? game.board.map((p, i) => p && colorOf(p) === game.turn ? i : -1).filter(i => i >= 0) : [from];
    const moves = [];
    for (const s of starts) for (const mv of pseudoMoves(game, s)) {
      const choices = mv.promotion ? ['q', 'r', 'b', 'n'] : [null];
      for (const pr of choices) { const cand = pr ? { ...mv, promotion: pr } : mv; if (!isInCheck(applyUnchecked(game, cand), game.turn)) moves.push(cand); }
    }
    return moves;
  }
  function parseSq(s) { s = String(s || '').toLowerCase().trim(); if (!/^[a-h][1-8]$/.test(s)) return -1; return (8 - Number(s[1])) * 8 + (s.charCodeAt(0) - 97); }
  function makeMove(game, fromSq, toSq, promo = 'q') {
    const from = typeof fromSq === 'number' ? fromSq : parseSq(fromSq);
    const to = typeof toSq === 'number' ? toSq : parseSq(toSq);
    if (from < 0 || to < 0) return null;
    const mv = legalMoves(game, from).find(x => x.to === to && (!x.promotion || String(x.promotion).toLowerCase() === String(promo || 'q').toLowerCase()));
    if (!mv) return null;
    const cap = mv.enPassant ? game.board[mv.to + (game.turn === 'w' ? 8 : -8)] : game.board[mv.to];
    const next = applyUnchecked(game, mv);
    if (cap) next.captured = [...(game.captured || []), cap];
    next.history = [...(game.history || []), clone({ ...game, history: [] })];
    return next;
  }
  function gameStatus(game) {
    const check = isInCheck(game, game.turn), moves = legalMoves(game);
    if (!moves.length) return check ? { over: true, result: game.turn === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate' } : { over: true, result: 'Draw by stalemate' };
    return { over: false, check, result: check ? 'Check' : '' };
  }
  return { createGame, legalMoves, makeMove, parseSq, gameStatus, isInCheck };
}
const E = chessEngineFactory();
const sessions = new Map(); // chat -> { game, ai: bool }
const GLYPH = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
function boardText(game) {
  const files = '  a b c d e f g h';
  const lines = [files];
  for (let r = 0; r < 8; r++) {
    let line = `${8 - r} `;
    for (let c = 0; c < 8; c++) {
      const p = game.board[r * 8 + c];
      line += (p ? GLYPH[p] : (r + c) % 2 ? '·' : '⁢·') + ' ';
    }
    line += `${8 - r}`;
    lines.push(line);
  }
  lines.push(files);
  const st = E.gameStatus(game);
  const side = game.turn === 'w' ? 'White' : 'Black';
  const cap = (game.captured || []).join(' ');
  return `*_֎ CHESS · ${side} to move${st.check ? ' · CHECK' : ''} · move ${game.fullmove}_*\n${lines.join('\n')}${cap ? `\n*_֎ captured: ${cap}_*` : ''}${st.over ? `\n*_֎ ${st.result}_*` : ''}`;
}
function aiReply(game) {
  const moves = E.legalMoves(game);
  if (!moves.length) return null;
  // easy AI: prefer captures, else random
  const caps = moves.filter(mv => game.board[mv.to]);
  const pick = (caps.length ? caps : moves)[Math.floor(Math.random() * (caps.length ? caps.length : moves.length))];
  const promo = pick.promotion ? 'q' : undefined;
  const from = pick.from, to = pick.to;
  const files = 'abcdefgh';
  const sq = i => files[i % 8] + (8 - Math.floor(i / 8));
  const next = E.makeMove(game, from, to, promo || 'q');
  return { next, label: `${sq(from)}${sq(to)}` };
}
const htmlBoard = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#0b141a;color:#e9edef;font-family:sans-serif;text-align:center;padding:12px}.b{display:grid;grid-template-columns:repeat(8,1fr);max-width:320px;margin:10px auto;border:2px solid #315d49;border-radius:10px;overflow:hidden}.s{aspect-ratio:1;display:grid;place-items:center;font-size:26px;cursor:pointer}.l{background:#eee9d9;color:#111}.d{background:#77977e;color:#111}.sel{outline:3px solid #e9b957;outline-offset:-3px}</style></head><body><h3>♞ CHESS · tap to play</h3><div id="t">White to move</div><div class="b" id="b"></div><div><button onclick="location.reload()">New board view</button></div><script>(function(){var b=document.getElementById('b'),t=document.getElementById('t');var p='rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR'.split('');var G={K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};var sel=null;function draw(){b.innerHTML='';for(var i=0;i<64;i++)(function(i){var d=document.createElement('div');d.className='s '+(((Math.floor(i/8)+i%8)%2)?'d':'l');if(sel===i)d.classList.add('sel');var q=p[i]==='.'?'':p[i];d.textContent=q?G[q]:'';d.onclick=function(){if(sel===null){if(q!==''){sel=i;draw()}}else{if(i===sel){sel=null;draw()}else{p[i]=p[sel];p[sel]='.';sel=null;draw();t.textContent='Move played — use .chess move in chat for rules'}}};b.appendChild(d)})(i)}draw()})();</script></body></html>`;

module.exports = {
  name: 'chess',
  alias: ['chessgame', 'chessai'],
  desc: 'Full chess: pass-and-play + vs-AI + HTML board',
  usage: '.chess new | .chess move e2e4 | .chess board | .chess ai | .chess undo | .chess html',
  category: 'games',
  async run({ sock, m, args, reply, prefix }) {
    const sub = (args[0] || 'board').toLowerCase();
    let s = sessions.get(m.chat);
    if (sub === 'new' || !s) {
      s = { game: E.createGame(), ai: sub === 'ainew' ? true : (s?.ai || false) };
      if (sub === 'new') s.ai = false;
      sessions.set(m.chat, s);
      if (sub !== 'board' && sub !== 'new' && s && args.length) { /* fallthrough to move */ }
      else return reply(boardText(s.game) + `\n*_֎ ${prefix}chess move e2e4 · ${prefix}chess ai · ${prefix}chess html_*`);
    }
    if (sub === 'ai') { s.ai = !s.ai; sessions.set(m.chat, s); return reply(`*_֎ AI opponent ${s.ai ? 'ON — I reply as Black' : 'OFF — pass-and-play'}_*`); }
    if (sub === 'undo') {
      if (s.game.history?.length) { s.game = s.game.history[s.game.history.length - 1]; sessions.set(m.chat, s); return reply(boardText(s.game)); }
      return reply('*_֎ nothing to undo_*');
    }
    if (sub === 'html') { try { await sendHtmlPrimitive(sock, m.chat, htmlBoard); } catch {} return reply(boardText(s.game)); }
    if (sub === 'board' && args.length === 1) return reply(boardText(s.game));
    // move: ".chess e2e4" or ".chess move e2e4"
    let mv = sub === 'move' ? (args[1] || '') : args[0];
    if (args[1] && sub !== 'move') mv = args[0] + args[1];
    const clean = String(mv || '').replace(/[^a-h1-8qrbn]/gi, '').toLowerCase();
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(clean)) {
      const from = clean.slice(0, 2), to = clean.slice(2, 4), promo = clean.slice(4) || 'q';
      const next = E.makeMove(s.game, from, to, promo);
      if (!next) return reply(`*_֎ illegal move ${clean} · ${s.game.turn === 'w' ? 'White' : 'Black'} to move_*`);
      s.game = next; sessions.set(m.chat, s);
      let out = boardText(s.game);
      const st = E.gameStatus(s.game);
      if (st.over) { sessions.delete(m.chat); return reply(out); }
      if (s.ai && s.game.turn === 'b' && !st.over) {
        const r = aiReply(s.game);
        if (r?.next) { s.game = r.next; sessions.set(m.chat, s); out = boardText(s.game) + `\n*_֎ AI played ${r.label}_*`; const st2 = E.gameStatus(s.game); if (st2.over) sessions.delete(m.chat); }
      }
      return reply(out);
    }
    return reply(`*_֎ CHESS_*\n*_֎ ${prefix}chess new — fresh board_*\n*_֎ ${prefix}chess e2e4 — move_*\n*_֎ ${prefix}chess board — show_*\n*_֎ ${prefix}chess ai — toggle AI_*\n*_֎ ${prefix}chess undo — take back_*\n*_֎ ${prefix}chess html — tap-board_*`);
  },
};
