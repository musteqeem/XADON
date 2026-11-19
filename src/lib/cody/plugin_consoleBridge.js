// consoleBridge.js — streams the bot's REAL console output to the web panel,
// giving the dashboard a Render-style live console with [HH:MM:SS] timestamps
// rendered to the side, like Render's log viewer. @crysnovax—FIX14-08-26
const util = require('util');

const MAX_HISTORY = 300;
const history = [];
let ioRef = null;
let patched = false;

const LEVELS = { log: 'info', info: 'info', warn: 'warn', error: 'error', debug: 'debug' };

// strip ANSI escape codes so the panel shows clean text
const stripAnsi = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, '');

function fmt(args) {
    return args
        .map(a => {
            if (typeof a === 'string') return stripAnsi(a);
            if (a instanceof Error) return stripAnsi(a.stack || a.message);
            return stripAnsi(util.inspect(a, { depth: 2, colors: false }));
        })
        .join(' ');
}

// Entry kept in the history buffer carries a plain [HH:MM:SS] text prefix so
// the panel shows Render-style timestamps on every line.
function push(level, text) {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    const entry = { ts: Date.now(), level, text, time: `[${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}]` };
    history.push(entry);
    if (history.length > MAX_HISTORY) history.shift();
    if (ioRef) {
        try { ioRef.emit('console', entry); } catch {}
    }
}

function setupConsoleBridge(io) {
    if (io) ioRef = io;
    if (patched) return;
    patched = true;

    const orig = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        debug: console.debug.bind(console)
    };

    for (const m of Object.keys(orig)) {
        console[m] = function (...args) {
            orig[m](...args);
            try { push(LEVELS[m] || 'info', fmt(args)); } catch {}
        };
    }

    if (io) {
        io.on('connection', (socket) => {
            try { socket.emit('console-history', history.slice(-100)); } catch {}
        });
    }

    console.log('[CONSOLE BRIDGE] live console streaming enabled');
}

module.exports = { setupConsoleBridge, getHistory: () => history };
