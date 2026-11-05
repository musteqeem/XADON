/**
 * XADON V11 · ZIPMINI — zero-dependency ZIP writer (STORE, no compression).
 * Used by .listleft / .listkicked / .kickall / .groupbackup to deliver
 * full member lists as a real .zip attachment without extra npm packages.
 *
 *   const { zipFiles, zipText } = require('../lib/zipmini');
 *   const buf = zipFiles([{ name: 'left.txt', data: Buffer.from('...') }]);
 */
const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((Math.floor(d.getSeconds() / 2)) & 31);
  const day = ((Math.max(d.getFullYear(), 1980) - 1980) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
  return { time, day };
}

/** files: [{ name, data: Buffer|string }] -> Buffer (a valid .zip, STORE method). */
function zipFiles(files = []) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const { time, day } = dosTime();
  for (const f of files) {
    const name = Buffer.from(String(f.name || 'file.txt').replace(/\\/g, '/'), 'utf8');
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(String(f.data ?? ''), 'utf8');
    const crc = crc32(data);
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6); // flags (bit 11 = utf8 when needed)
    local.writeUInt16LE(0, 8); // method STORE
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    name.copy(local, 30);
    if (/[^\x00-\x7F]/.test(String(f.name || ''))) local.writeUInt16LE(0x0800, 6);
    chunks.push(local, data);
    const cen = Buffer.alloc(46 + name.length);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(local.readUInt16LE(6), 8);
    cen.writeUInt16LE(0, 10);
    cen.writeUInt16LE(time, 12);
    cen.writeUInt16LE(day, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(data.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(name.length, 28);
    cen.writeUInt16LE(0, 30);
    cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34);
    cen.writeUInt16LE(0, 36);
    cen.writeUInt32LE(0, 38);
    cen.writeUInt32LE(offset, 42);
    name.copy(cen, 46);
    central.push(cen);
    offset += local.length + data.length;
  }
  const cenSize = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end-of-central-directory signature
  end.writeUInt16LE(0, 4);          // disk number
  end.writeUInt16LE(0, 6);          // central-dir disk
  end.writeUInt16LE(central.length, 8);   // entries on this disk
  end.writeUInt16LE(central.length, 10);  // total entries
  end.writeUInt32LE(cenSize, 12);   // central-dir size
  end.writeUInt32LE(offset, 16);    // central-dir offset
  end.writeUInt16LE(0, 20);         // comment length
  return Buffer.concat([...chunks, ...central, end]);
}

/** Convenience: zip a single text file. */
function zipText(filename, text) {
  return zipFiles([{ name: filename, data: Buffer.from(String(text ?? ''), 'utf8') }]);
}

module.exports = { zipFiles, zipText, crc32 };
