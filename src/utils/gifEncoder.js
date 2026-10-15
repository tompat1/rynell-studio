/**
 * Pure JavaScript GIF89a Multi-Frame Animated GIF Encoder
 * Encodes canvas frames or ImageData into valid multi-frame GIF89a with Netscape 2.0 loop block.
 */

// Simple median-cut / frequency palette generator (up to 256 colors)
function createPalette(rgbaData, maxColors = 256) {
  const colorMap = new Map();
  const step = 4; // Sample step for performance
  
  for (let i = 0; i < rgbaData.length; i += step * 4) {
    const a = rgbaData[i + 3];
    if (a < 128) continue; // transparent pixel
    // Quantize 5 bits per channel for fast color grouping
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
 * Encodes an ImageData object into a single-frame GIF89a Blob
 * @param {ImageData} imageData 
 * @returns {Blob}
 */
export function encodeImageDataToGif(imageData) {
  return encodeFramesToAnimatedGif([{ imageData, delayMs: 100 }], {
    width: imageData.width,
    height: imageData.height,
    loopCount: 0
  });
}

/**
 * Encodes multiple frames into a valid multi-frame Animated GIF89a
 * @param {Array<{ imageData: ImageData, delayMs?: number, disposal?: number }>} frames
 * @param {object} options { width, height, loopCount = 0 }
 * @returns {Blob}
 */
export function encodeFramesToAnimatedGif(frames, options = {}) {
  if (!frames || frames.length === 0) {
    throw new Error('No frames provided for animated GIF generation.');
  }

  const width = options.width || frames[0].imageData.width;
  const height = options.height || frames[0].imageData.height;
  const loopCount = typeof options.loopCount === 'number' ? options.loopCount : 0;

  const bytes = [];

  // 1. Header: GIF89a
  bytes.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

  // 2. Logical Screen Descriptor
  bytes.push(width & 0xff, (width >> 8) & 0xff);
  bytes.push(height & 0xff, (height >> 8) & 0xff);

  // Create initial Global Palette from first frame
  const firstFrameData = frames[0].imageData.data;
  const globalPalette = createPalette(firstFrameData, 256);
  const colorBits = Math.max(2, Math.ceil(Math.log2(globalPalette.length)));
  const gctSize = 1 << colorBits;
  while (globalPalette.length < gctSize) {
    globalPalette.push([0, 0, 0, false]);
  }

  // Packed: GCT flag (1), color resolution (7 = 8-bit), sort (0), GCT size
  const packedGct = 0x80 | 0x70 | (colorBits - 1);
  bytes.push(packedGct);
  bytes.push(0); // Background Color Index (0 = transparent)
  bytes.push(0); // Pixel Aspect Ratio

  // 3. Global Color Table
  for (let i = 0; i < gctSize; i++) {
    const col = globalPalette[i] || [0, 0, 0];
    bytes.push(col[0], col[1], col[2]);
  }

  // 4. Netscape 2.0 Application Extension (Looping animation header)
  if (frames.length > 1) {
    bytes.push(0x21, 0xff, 0x0b); // Extension code, block size (11 bytes)
    // 'NETSCAPE2.0'
    bytes.push(0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30);
    bytes.push(0x03, 0x01); // Sub-block size (3 bytes), sub-block ID (1)
    bytes.push(loopCount & 0xff, (loopCount >> 8) & 0xff); // loop count (0 = infinite)
    bytes.push(0x00); // Block terminator
  }

  // 5. Append each animation frame
  for (let f = 0; f < frames.length; f++) {
    const frame = frames[f];
    const data = frame.imageData.data;
    const fWidth = frame.imageData.width;
    const fHeight = frame.imageData.height;

    // Use local palette per frame for maximum color fidelity
    const localPalette = f === 0 ? globalPalette : createPalette(data, 256);
    const fColorBits = Math.max(2, Math.ceil(Math.log2(localPalette.length)));
    const fPalSize = 1 << fColorBits;
    while (localPalette.length < fPalSize) {
      localPalette.push([0, 0, 0, false]);
    }

    // Delay in centiseconds (1/100 of a second). Minimum 2cs (20ms) for browser stability
    const delayMs = frame.delayMs !== undefined ? frame.delayMs : 100;
    const delayCs = Math.max(2, Math.round(delayMs / 10));

    // Disposal method: 2 = restore to background color (avoids ghosting trails)
    const disposal = frame.disposal !== undefined ? frame.disposal : 2;

    // Graphic Control Extension (8 bytes)
    bytes.push(0x21, 0xf9, 0x04);
    // Packed: reserved (0), disposal method (3 bits), user input (0), transparent color flag (1)
    const gcePacked = (disposal << 2) | 0x01;
    bytes.push(gcePacked);
    bytes.push(delayCs & 0xff, (delayCs >> 8) & 0xff); // Delay time
    bytes.push(0x00); // Transparent color index (0)
    bytes.push(0x00); // Block terminator

    // Image Descriptor
    bytes.push(0x2c); // Separator
    bytes.push(0, 0, 0, 0); // Left = 0, Top = 0
    bytes.push(fWidth & 0xff, (fWidth >> 8) & 0xff);
    bytes.push(fHeight & 0xff, (fHeight >> 8) & 0xff);

    // If frame > 0, include Local Color Table
    if (f > 0) {
      const lctPacked = 0x80 | (fColorBits - 1); // LCT flag set
      bytes.push(lctPacked);
      for (let i = 0; i < fPalSize; i++) {
        const col = localPalette[i] || [0, 0, 0];
        bytes.push(col[0], col[1], col[2]);
      }
    } else {
      bytes.push(0x00); // Use Global Color Table
    }

    // Index pixels with the frame's palette
    const indexedPixels = new Uint8Array(fWidth * fHeight);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      indexedPixels[p] = getNearestColorIndex(data[i], data[i + 1], data[i + 2], data[i + 3], localPalette);
    }

    // Image Data (LZW)
    const minCodeSize = Math.max(2, fColorBits);
    bytes.push(minCodeSize);

    const lzwBytes = lzwEncode(minCodeSize, indexedPixels);

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
  }

  // 6. Trailer: GIF terminator
  bytes.push(0x3b);

  return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
}
