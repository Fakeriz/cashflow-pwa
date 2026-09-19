import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, getPixel) {
  // RGBA 8-bit per channel
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, body, crcBuf]);
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function cashflowIconPixel(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  // Background: dark sleek gradient #0f172a to #030712
  const bgR = Math.round(15 * (1 - ny * 0.7));
  const bgG = Math.round(23 * (1 - ny * 0.7));
  const bgB = Math.round(42 * (1 - ny * 0.7));

  // Distance from center for circle / squircle icon
  const cx = nx - 0.5;
  const cy = ny - 0.5;
  const dist = Math.sqrt(cx * cx + cy * cy);

  // Cashflow curve: y = 0.7 - 0.4 * x^1.3
  const curveY = 0.72 - 0.45 * Math.pow(nx, 1.2);
  const distToCurve = Math.abs(ny - curveY);

  if (distToCurve < 0.03 && nx > 0.15 && nx < 0.85) {
    // Emerald green trajectory line
    return [16, 185, 129, 255];
  }

  // Shaded area under the curve
  if (ny > curveY && ny < 0.82 && nx > 0.15 && nx < 0.85) {
    const alpha = Math.max(0, Math.min(255, Math.round(60 * (1 - (ny - curveY) * 2.5))));
    return [
      Math.round(bgR + (16 - bgR) * (alpha / 255)),
      Math.round(bgG + (185 - bgG) * (alpha / 255)),
      Math.round(bgB + (129 - bgB) * (alpha / 255)),
      255
    ];
  }

  // Indicator dot at the peak
  const peakDx = nx - 0.82;
  const peakDy = ny - curveY;
  if (Math.sqrt(peakDx * peakDx + peakDy * peakDy) < 0.035) {
    return [56, 189, 248, 255]; // Sky blue accent dot
  }

  return [bgR, bgG, bgB, 255];
}

const pwa192 = createPng(192, 192, cashflowIconPixel);
fs.writeFileSync('./public/pwa-192x192.png', pwa192);

const pwa512 = createPng(512, 512, cashflowIconPixel);
fs.writeFileSync('./public/pwa-512x512.png', pwa512);
fs.writeFileSync('./public/pwa-maskable-512x512.png', pwa512);

const appleIcon = createPng(180, 180, cashflowIconPixel);
fs.writeFileSync('./public/apple-touch-icon.png', appleIcon);

console.log('Successfully generated PWA icon PNGs in /public');
