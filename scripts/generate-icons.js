/**
 * Generate TabBar icons with proper shapes for TodoMaster.
 * Each file is an 81x81 RGBA PNG with transparent background.
 *
 * Icons:
 *   tab-todo      — Checkmark ✓
 *   tab-category  — 2×2 grid
 *   tab-settings  — Sliders (3 lines with knobs)
 *
 * Usage: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUTPUT_DIR = path.resolve(__dirname, '..', 'miniprogram', 'images');
const SIZE = 81;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ========== PNG Encoding ==========

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

function crc32(buf) {
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

function rawDataToPng(width, height, rawData) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = makeChunk('IHDR', ihdrData);
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// ========== Drawing Primitives ==========

function createBlankRawData(width, height) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height, 0);
  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // filter byte: None
  }
  return rawData;
}

function setPixel(rawData, width, x, y, r, g, b, a) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || x >= width || y < 0 || y >= width) return;
  const rowSize = 1 + width * 4;
  const offset = y * rowSize + 1 + x * 4;
  rawData[offset] = r;
  rawData[offset + 1] = g;
  rawData[offset + 2] = b;
  rawData[offset + 3] = a;
}

function fillCircle(rawData, width, cx, cy, radius, r, g, b, a) {
  const r2 = radius * radius;
  const ceil = Math.ceil(radius) + 1;
  for (let dy = -ceil; dy <= ceil; dy++) {
    for (let dx = -ceil; dx <= ceil; dx++) {
      if (dx * dx + dy * dy <= r2) {
        setPixel(rawData, width, cx + dx, cy + dy, r, g, b, a);
      }
    }
  }
}

function fillRect(rawData, width, x, y, w, h, r, g, b, a) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(rawData, width, x + dx, y + dy, r, g, b, a);
    }
  }
}

function fillRoundRect(rawData, width, x, y, w, h, radius, r, g, b, a) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      let inside = true;
      if (dx < radius && dy < radius) {
        inside = (radius - dx) ** 2 + (radius - dy) ** 2 <= radius ** 2;
      } else if (dx >= w - radius && dy < radius) {
        inside = (dx - (w - 1 - radius)) ** 2 + (radius - dy) ** 2 <= radius ** 2;
      } else if (dx < radius && dy >= h - radius) {
        inside = (radius - dx) ** 2 + (dy - (h - 1 - radius)) ** 2 <= radius ** 2;
      } else if (dx >= w - radius && dy >= h - radius) {
        inside = (dx - (w - 1 - radius)) ** 2 + (dy - (h - 1 - radius)) ** 2 <= radius ** 2;
      }
      if (inside) {
        setPixel(rawData, width, x + dx, y + dy, r, g, b, a);
      }
    }
  }
}

function drawLine(rawData, width, x0, y0, x1, y1, thickness, r, g, b, a) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0, cy = y0;
  const halfT = thickness / 2;

  while (true) {
    fillCircle(rawData, width, cx, cy, halfT, r, g, b, a);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

// ========== Icon Shapes ==========

function drawTodoIcon(rawData, width, r, g, b) {
  // Checkmark: two line segments
  drawLine(rawData, width, 18, 42, 32, 58, 6, r, g, b, 255);
  drawLine(rawData, width, 32, 58, 62, 22, 6, r, g, b, 255);
}

function drawCategoryIcon(rawData, width, r, g, b) {
  // 2×2 grid of rounded squares
  const s = 24;
  const gap = 8;
  const ox = Math.floor((width - 2 * s - gap) / 2);
  const oy = ox;

  fillRoundRect(rawData, width, ox, oy, s, s, 5, r, g, b, 255);
  fillRoundRect(rawData, width, ox + s + gap, oy, s, s, 5, r, g, b, 255);
  fillRoundRect(rawData, width, ox, oy + s + gap, s, s, 5, r, g, b, 255);
  fillRoundRect(rawData, width, ox + s + gap, oy + s + gap, s, s, 5, r, g, b, 255);
}

function drawSettingsIcon(rawData, width, r, g, b) {
  // Three horizontal lines with circle knobs at different positions
  const lineYs = [22, 40, 58];
  const knobXs = [30, 52, 38];
  const lineX0 = 16;
  const lineX1 = 64;
  const lineH = 3;
  const knobR = 7;

  for (let i = 0; i < 3; i++) {
    // Horizontal line
    fillRect(rawData, width, lineX0, lineYs[i] - 1, lineX1 - lineX0, lineH, r, g, b, 255);
    // Knob circle
    fillCircle(rawData, width, knobXs[i], lineYs[i], knobR, r, g, b, 255);
  }
}

// ========== Header Button Icons (48×48) ==========

function strokeCircle(rawData, width, cx, cy, outerR, thickness, r, g, b, a) {
  const outer2 = outerR * outerR;
  const innerR = outerR - thickness;
  const inner2 = innerR * innerR;
  const range = Math.ceil(outerR) + 1;
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      const d2 = dx * dx + dy * dy;
      if (d2 <= outer2 && d2 >= inner2) {
        setPixel(rawData, width, cx + dx, cy + dy, r, g, b, a);
      }
    }
  }
}

function drawSearchIcon(rawData, width, r, g, b) {
  // Magnifying glass: circle + diagonal handle
  const cx = Math.floor(width * 0.42);
  const cy = Math.floor(width * 0.38);
  const radius = Math.floor(width * 0.28);
  const thick = Math.max(2, Math.floor(width * 0.06));

  strokeCircle(rawData, width, cx, cy, radius, thick, r, g, b, 255);

  // Handle: diagonal from bottom-right of circle
  const angle = Math.PI / 4; // 45 degrees
  const hx0 = Math.round(cx + (radius - 1) * Math.cos(angle));
  const hy0 = Math.round(cy + (radius - 1) * Math.sin(angle));
  const handleLen = Math.floor(width * 0.28);
  const hx1 = Math.round(hx0 + handleLen * Math.cos(angle));
  const hy1 = Math.round(hy0 + handleLen * Math.sin(angle));

  drawLine(rawData, width, hx0, hy0, hx1, hy1, thick + 1, r, g, b, 255);
}

function drawSortIcon(rawData, width, r, g, b) {
  // Sort: three horizontal lines of decreasing width (longest on top)
  const thick = Math.max(3, Math.floor(width * 0.07));
  const gap = Math.floor(width * 0.25);
  const centerX = Math.floor(width / 2);
  const startY = Math.floor(width * 0.22);

  const widths = [
    Math.floor(width * 0.7),  // longest
    Math.floor(width * 0.5),  // medium
    Math.floor(width * 0.3),  // shortest
  ];

  for (let i = 0; i < 3; i++) {
    const ly = startY + i * gap;
    const lx = centerX - Math.floor(widths[i] / 2);
    fillRoundRect(rawData, width, lx, ly, widths[i], thick, 2, r, g, b, 255);
  }
}

// ========== Generate ==========

const WARM_GRAY = { r: 0xB5, g: 0xA9, b: 0x9B };
const SIENNA    = { r: 0xC4, g: 0x57, b: 0x2A };
const WALNUT    = { r: 0x2A, g: 0x1F, b: 0x14 };

const ICON_SM = 48; // header button icons

const iconDefs = [
  // Tab bar icons (81×81)
  { name: 'tab-todo.png',            draw: drawTodoIcon,     color: WARM_GRAY, size: SIZE },
  { name: 'tab-todo-active.png',     draw: drawTodoIcon,     color: SIENNA,    size: SIZE },
  { name: 'tab-category.png',        draw: drawCategoryIcon, color: WARM_GRAY, size: SIZE },
  { name: 'tab-category-active.png', draw: drawCategoryIcon, color: SIENNA,    size: SIZE },
  { name: 'tab-settings.png',        draw: drawSettingsIcon, color: WARM_GRAY, size: SIZE },
  { name: 'tab-settings-active.png', draw: drawSettingsIcon, color: SIENNA,    size: SIZE },
  // Header button icons (48×48)
  { name: 'icon-search.png',         draw: drawSearchIcon,   color: WALNUT,    size: ICON_SM },
  { name: 'icon-sort.png',           draw: drawSortIcon,     color: WALNUT,    size: ICON_SM },
];

console.log(`Generating ${iconDefs.length} icons ...`);
console.log(`Output: ${OUTPUT_DIR}\n`);

for (const icon of iconDefs) {
  const s = icon.size;
  const rawData = createBlankRawData(s, s);
  icon.draw(rawData, s, icon.color.r, icon.color.g, icon.color.b);
  const png = rawDataToPng(s, s, rawData);
  const outPath = path.join(OUTPUT_DIR, icon.name);
  fs.writeFileSync(outPath, png);
  console.log(`  ${icon.name}  (${s}×${s}, ${png.length} bytes)`);
}

console.log('\nDone.');
