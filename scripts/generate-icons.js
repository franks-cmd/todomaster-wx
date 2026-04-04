/**
 * Generate minimal valid PNG placeholder icons for WeChat Mini Program TabBar.
 * Each file is an 81x81 single-color PNG.
 *
 * Usage: node generate-icons.js
 *
 * The generated PNGs are real, valid files that WeChat DevTools will accept.
 * Replace them later with proper designed icons if needed.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUTPUT_DIR = path.resolve(__dirname, '..', 'miniprogram', 'images');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Create a valid PNG file buffer for an 81x81 image filled with a single color.
 * PNG spec: signature + IHDR + IDAT (deflated raw pixel data) + IEND
 */
function createPng(width, height, r, g, b, a) {
  // --- PNG Signature ---
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // --- IHDR chunk ---
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);   // width
  ihdrData.writeUInt32BE(height, 4);  // height
  ihdrData.writeUInt8(8, 8);          // bit depth
  ihdrData.writeUInt8(6, 9);          // color type: RGBA
  ihdrData.writeUInt8(0, 10);         // compression
  ihdrData.writeUInt8(0, 11);         // filter
  ihdrData.writeUInt8(0, 12);         // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // --- IDAT chunk ---
  // Raw image data: for each row, 1 filter byte (0 = None) + width * 4 bytes (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0; // filter byte: None
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 4;
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);

  // --- IEND chunk ---
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

/**
 * Build a PNG chunk: length(4) + type(4) + data + crc32(4)
 */
function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuf]);
}

/**
 * CRC-32 (used by PNG for chunk integrity)
 */
function crc32(buf) {
  // Build table on first call
  if (!crc32.table) {
    crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crc32.table[n] = c;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crc32.table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ---------- Icon definitions ----------

const SIZE = 81;

// Colors
const GRAY = { r: 0x8A, g: 0x8A, b: 0x8A };
const DARK = { r: 0x1B, g: 0x28, b: 0x38 };

const icons = [
  { name: 'tab-todo.png',            color: GRAY },
  { name: 'tab-todo-active.png',     color: DARK },
  { name: 'tab-category.png',        color: GRAY },
  { name: 'tab-category-active.png', color: DARK },
  { name: 'tab-settings.png',        color: GRAY },
  { name: 'tab-settings-active.png', color: DARK },
];

console.log(`Generating ${icons.length} placeholder icons (${SIZE}x${SIZE}) ...`);
console.log(`Output directory: ${OUTPUT_DIR}\n`);

for (const icon of icons) {
  const { r, g, b } = icon.color;
  const buf = createPng(SIZE, SIZE, r, g, b, 255);
  const outPath = path.join(OUTPUT_DIR, icon.name);
  fs.writeFileSync(outPath, buf);
  console.log(`  Created: ${icon.name}  (${buf.length} bytes)`);
}

console.log('\nDone. Replace these placeholders with real icons in WeChat DevTools.');
