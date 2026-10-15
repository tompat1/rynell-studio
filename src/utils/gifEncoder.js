/**
 * Pure JavaScript GIF89a Encoder
 * Encodes canvas ImageData into valid GIF89a binary blob.
 */

// Simple median-cut / uniform palette generator (up to 256 colors)
function createPalette(rgbaData, maxColors = 256) {
  const colorMap = new Map();
  const step = 4; // Sample every pixel
  
  for (let i = 0; i < rgbaData.length; i += step * 4) {
    const a = rgbaData[i + 3];
    if (a < 128) continue; // transparent pixel
    // Quantize 5 bits per channel for fast grouping
    const r = (rgbaData[i] >> 3) << 3;
    const g = (rgbaData[i + 1] >> 3) << 3;
    const b = (rgbaData[i + 2] >> 3) << 3;
    const key = (r << 16) | (g << 8) | b;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Sort by popularity
  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
  const palette = [];
  
  // First color reserved for transparency
  palette.push([0, 0, 0, true]); // transparent
  
  const targetPaletteSize = Math.min(sorted.length, maxColors - 1);
  for (let i = 0; i < targetPaletteSize; i++) {
    const rgb = sorted[i][0];
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    palette.push([r, g, b, false]);
  }

  // Pad palette to power of 2 (at least 2, up to 256)
  let pSize = 2;
  while (pSize < palette.length) pSize *= 2;
  while (palette.length < pSize) {
    palette.push([0, 0, 0, false]);
  }

  return palette;
}

// Find nearest color in palette
function getNearestColorIndex(r, g, b, a, palette) {
  if (a < 128) return 0; // transparent index
  
  let bestIdx = 1;
  let minDiff = Infinity;
  
  for (let i = 1; i < palette.length; i++) {
    const p = palette[i];
    const dr = r - p[0];
    const dg = g - p[1];
    const db = b - p[2];
    const diff = dr * dr + dg * dg + db * db;
    if (diff < minDiff) {
      minDiff = diff;
      bestIdx = i;
      if (diff === 0) break;
    }
  }
  return bestIdx;
}

// LZW compress pixel indices
function lzwEncode(minCodeSize, indexedPixels) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let maxCode = (1 << codeSize);
  
  const output = [];
  let curBits = 0;
  let curVal = 0;

  function writeBits(code, bits) {
    curVal |= (code << curBits);
    curBits += bits;
    while (curBits >= 8) {
      output.push(curVal & 0xff);
      curVal >>= 8;
      curBits -= 8;
    }
  }

  writeBits(clearCode, codeSize);

  let dict = new Map();
  for (let i = 0; i < clearCode; i++) {
    dict.set(String(i), i);
  }
  let nextCode = eoiCode + 1;

  let prefix = "";
  for (let i = 0; i < indexedPixels.length; i++) {
    const k = indexedPixels[i];
    const pk = prefix === "" ? String(k) : `${prefix},${k}`;
    if (dict.has(pk)) {
      prefix = pk;
    } else {
      writeBits(dict.get(prefix), codeSize);
      dict.set(pk, nextCode++);
      if (nextCode > maxCode) {
        if (codeSize < 12) {
          codeSize++;
          maxCode = (1 << codeSize);
        } else {
          writeBits(clearCode, codeSize);
          dict = new Map();
          for (let c = 0; c < clearCode; c++) {
            dict.set(String(c), c);
          }
          nextCode = eoiCode + 1;
          codeSize = minCodeSize + 1;
          maxCode = (1 << codeSize);
        }
      }
      prefix = String(k);
    }
  }

  if (prefix !== "") {
    writeBits(dict.get(prefix), codeSize);
  }

  writeBits(eoiCode, codeSize);

  // Flush remaining bits
  if (curBits > 0) {
    output.push(curVal & 0xff);
  }

  return output;
}

/**
 * Encodes an ImageData object into a GIF89a Blob
 * @param {ImageData} imageData 
 * @returns {Blob}
 */
export function encodeImageDataToGif(imageData) {
  const { width, height, data } = imageData;
  const palette = createPalette(data, 256);
  const colorBits = Math.max(2, Math.ceil(Math.log2(palette.length)));
  const gctSize = 1 << colorBits;
  
  // Pad palette array to gctSize
  while (palette.length < gctSize) {
    palette.push([0, 0, 0, false]);
  }

  // Index pixels
  const indexedPixels = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    indexedPixels[p] = getNearestColorIndex(data[i], data[i + 1], data[i + 2], data[i + 3], palette);
  }

  const bytes = [];
  
  // 1. Header: GIF89a
  bytes.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

  // 2. Logical Screen Descriptor
  bytes.push(width & 0xff, (width >> 8) & 0xff);
  bytes.push(height & 0xff, (height >> 8) & 0xff);
  
  // Packed field: GCT flag (1), color resolution (7 = 8 bits), sort flag (0), GCT size
  const packed = 0x80 | 0x70 | (colorBits - 1);
  bytes.push(packed);
  bytes.push(0); // Background Color Index (0 is transparent)
  bytes.push(0); // Pixel Aspect Ratio

  // 3. Global Color Table
  for (let i = 0; i < gctSize; i++) {
    const col = palette[i] || [0, 0, 0];
    bytes.push(col[0], col[1], col[2]);
  }

  // 4. Graphic Control Extension (for transparency)
  bytes.push(0x21, 0xf9, 0x04);
  bytes.push(0x01); // packed: transparent color flag set
  bytes.push(0x00, 0x00); // delay time (0)
  bytes.push(0x00); // transparent color index (0)
  bytes.push(0x00); // block terminator

  // 5. Image Descriptor
  bytes.push(0x2c); // Image separator
  bytes.push(0, 0, 0, 0); // Left, Top
  bytes.push(width & 0xff, (width >> 8) & 0xff);
  bytes.push(height & 0xff, (height >> 8) & 0xff);
  bytes.push(0); // Packed fields (no local color table)

  // 6. Image Data (LZW)
  const minCodeSize = Math.max(2, colorBits);
  bytes.push(minCodeSize);
  
  const lzwBytes = lzwEncode(minCodeSize, indexedPixels);
  
  // Write in blocks of max 255 bytes
  let offset = 0;
  while (offset < lzwBytes.length) {
    const blockSize = Math.min(255, lzwBytes.length - offset);
    bytes.push(blockSize);
    for (let b = 0; b < blockSize; b++) {
      bytes.push(lzwBytes[offset + b]);
    }
    offset += blockSize;
  }
  bytes.push(0x00); // Block terminator

  // 7. Trailer
  bytes.push(0x3b);

  return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
}
