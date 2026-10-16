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
  const maxColors = typeof options.maxColors === 'number' ? Math.max(4, Math.min(256, options.maxColors)) : 256;
  const useGlobalPaletteOnly = !!options.useGlobalPaletteOnly;

  const bytes = [];

  // 1. Header: GIF89a
  bytes.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

  // 2. Logical Screen Descriptor
  bytes.push(width & 0xff, (width >> 8) & 0xff);
  bytes.push(height & 0xff, (height >> 8) & 0xff);

  // Sample data for Global Palette
  let sampleData = frames[0].imageData.data;
  if (useGlobalPaletteOnly && frames.length > 1) {
    const combinedLength = Math.min(600000, frames.length * 40000);
    const combined = new Uint8ClampedArray(combinedLength);
    let offset = 0;
    for (const fr of frames) {
      const d = fr.imageData.data;
      const step = Math.max(1, Math.floor(d.length / 40000));
      for (let i = 0; i < d.length && offset < combinedLength; i += step * 4) {
        combined[offset] = d[i];
        combined[offset + 1] = d[i + 1];
        combined[offset + 2] = d[i + 2];
        combined[offset + 3] = d[i + 3];
        offset += 4;
      }
    }
    sampleData = combined;
  }

  const globalPalette = createPalette(sampleData, maxColors);
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

    // Use global palette if unified mode, otherwise local palette per frame
    const hasLocalPalette = !useGlobalPaletteOnly && f > 0;
    const localPalette = hasLocalPalette ? createPalette(data, maxColors) : globalPalette;
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

    // If frame > 0 and not using global only, include Local Color Table
    if (hasLocalPalette) {
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
    const minCodeSize = Math.max(2, hasLocalPalette ? fColorBits : colorBits);
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

/**
 * Fast binary check to see if a Uint8Array contains an animated GIF (>= 2 frames)
 * @param {Uint8Array} buf
 * @returns {boolean}
 */
export function isAnimatedGif(buf) {
  if (!buf || buf.length < 13) return false;
  if (buf[0] !== 0x47 || buf[1] !== 0x49 || buf[2] !== 0x46) return false;
  let count = 0;
  for (let i = 13; i < buf.length - 9; i++) {
    if (buf[i] === 0x2c) {
      count++;
      if (count > 1) return true;
    }
  }
  return false;
}

/**
 * Pure JavaScript GIF Decoder
 * Decodes all frames from a GIF buffer, applies disposal methods and compositing,
 * and returns frame RGBA arrays, timing, loop count, and canvas dimensions.
 * @param {Uint8Array} buf
 * @returns {{ width: number, height: number, loopCount: number, frames: Array<{ width: number, height: number, delayMs: number, rgba: Uint8ClampedArray, disposal: number }> }}
 */
export function decodeGif(buf) {
  if (!buf || buf.length < 13) throw new Error('Invalid GIF buffer');
  if (buf[0] !== 0x47 || buf[1] !== 0x49 || buf[2] !== 0x46) {
    throw new Error('Not a GIF file');
  }

  const width = buf[6] | (buf[7] << 8);
  const height = buf[8] | (buf[9] << 8);
  const packed = buf[10];
  const hasGct = !!(packed & 0x80);
  const gctSize = hasGct ? (1 << ((packed & 0x07) + 1)) : 0;
  const gct = [];
  let offset = 13;
  if (hasGct) {
    for (let i = 0; i < gctSize; i++) {
      gct.push([buf[offset], buf[offset + 1], buf[offset + 2]]);
      offset += 3;
    }
  }

  const rawFrames = [];
  let graphicControl = { delay: 100, transIndex: -1, disposal: 0 };
  let loopCount = 0;

  while (offset < buf.length) {
    const b = buf[offset++];
    if (b === 0x3b) break; // Trailer
    if (b === 0x21) { // Extension
      const extType = buf[offset++];
      if (extType === 0xf9) { // Graphic Control Extension
        offset++; // block size (4)
        const gcePacked = buf[offset++];
        const disposal = (gcePacked >> 2) & 0x07;
        const hasTrans = !!(gcePacked & 0x01);
        const delay = (buf[offset] | (buf[offset + 1] << 8)) * 10;
        offset += 2;
        const transIdx = buf[offset++];
        graphicControl = {
          delay: delay || 100,
          transIndex: hasTrans ? transIdx : -1,
          disposal
        };
        offset++; // terminator 0x00
      } else if (extType === 0xff) { // Application Extension (Netscape 2.0 Loop)
        const blockSize = buf[offset++];
        let appName = '';
        for (let i = 0; i < blockSize; i++) appName += String.fromCharCode(buf[offset++]);
        if (appName === 'NETSCAPE2.0' || appName === 'ANIMEXTS1.0') {
          const subSize = buf[offset++];
          if (subSize === 3 && buf[offset++] === 1) {
            loopCount = buf[offset] | (buf[offset + 1] << 8);
            offset += 2;
          }
        }
        while (offset < buf.length && buf[offset] !== 0) {
          offset += 1 + buf[offset];
        }
        offset++; // terminator
      } else {
        while (offset < buf.length && buf[offset] !== 0) {
          offset += 1 + buf[offset];
        }
        offset++;
      }
    } else if (b === 0x2c) { // Image Descriptor
      const left = buf[offset] | (buf[offset + 1] << 8);
      const top = buf[offset + 2] | (buf[offset + 3] << 8);
      const fw = buf[offset + 4] | (buf[offset + 5] << 8);
      const fh = buf[offset + 6] | (buf[offset + 7] << 8);
      offset += 8;
      const imgPacked = buf[offset++];
      const hasLct = !!(imgPacked & 0x80);
      const isInterlaced = !!(imgPacked & 0x40);
      const lctSize = hasLct ? (1 << ((imgPacked & 0x07) + 1)) : 0;
      let activePalette = gct;
      if (hasLct) {
        activePalette = [];
        for (let i = 0; i < lctSize; i++) {
          activePalette.push([buf[offset], buf[offset + 1], buf[offset + 2]]);
          offset += 3;
        }
      }

      const lzwMinCodeSize = buf[offset++];
      const dataBlocks = [];
      while (offset < buf.length && buf[offset] !== 0) {
        const blockSize = buf[offset++];
        for (let i = 0; i < blockSize; i++) {
          dataBlocks.push(buf[offset++]);
        }
      }
      offset++;

      const clearCode = 1 << lzwMinCodeSize;
      const eoiCode = clearCode + 1;
      let codeSize = lzwMinCodeSize + 1;
      let maxCode = 1 << codeSize;
      let dict = [];
      const initDict = () => {
        dict = [];
        for (let i = 0; i < clearCode; i++) dict[i] = [i];
        dict[clearCode] = [];
        dict[eoiCode] = null;
        codeSize = lzwMinCodeSize + 1;
        maxCode = 1 << codeSize;
      };
      initDict();

      const rawPixels = [];
      let bitPos = 0;
      const readBits = (count) => {
        let val = 0;
        for (let i = 0; i < count; i++) {
          const byteIdx = (bitPos + i) >> 3;
          if (byteIdx >= dataBlocks.length) break;
          const bitIdx = (bitPos + i) & 7;
          if ((dataBlocks[byteIdx] >> bitIdx) & 1) {
            val |= (1 << i);
          }
        }
        bitPos += count;
        return val;
      };

      let oldCode = -1;
      while (bitPos < dataBlocks.length * 8) {
        const code = readBits(codeSize);
        if (code === clearCode) {
          initDict();
          oldCode = -1;
          continue;
        }
        if (code === eoiCode) break;

        let entry;
        if (code < dict.length) {
          entry = dict[code];
        } else if (code === dict.length && oldCode >= 0) {
          entry = dict[oldCode].concat(dict[oldCode][0]);
        } else {
          break;
        }

        for (let p = 0; p < entry.length; p++) rawPixels.push(entry[p]);

        if (oldCode >= 0 && dict.length < 4096) {
          dict.push(dict[oldCode].concat(entry[0]));
          if (dict.length >= maxCode && codeSize < 12) {
            codeSize++;
            maxCode = 1 << codeSize;
          }
        }
        oldCode = code;
      }

      let pixels = rawPixels;
      if (isInterlaced) {
        pixels = new Array(fw * fh);
        let srcIdx = 0;
        for (let r = 0; r < fh; r += 8) {
          for (let c = 0; c < fw; c++) pixels[r * fw + c] = rawPixels[srcIdx++];
        }
        for (let r = 4; r < fh; r += 8) {
          for (let c = 0; c < fw; c++) pixels[r * fw + c] = rawPixels[srcIdx++];
        }
        for (let r = 2; r < fh; r += 4) {
          for (let c = 0; c < fw; c++) pixels[r * fw + c] = rawPixels[srcIdx++];
        }
        for (let r = 1; r < fh; r += 2) {
          for (let c = 0; c < fw; c++) pixels[r * fw + c] = rawPixels[srcIdx++];
        }
      }

      const rgba = new Uint8ClampedArray(fw * fh * 4);
      for (let i = 0; i < fw * fh; i++) {
        const colorIdx = pixels[i];
        const isTrans = colorIdx === graphicControl.transIndex;
        const color = activePalette[colorIdx] || [0, 0, 0];
        const outIdx = i * 4;
        rgba[outIdx] = color[0];
        rgba[outIdx + 1] = color[1];
        rgba[outIdx + 2] = color[2];
        rgba[outIdx + 3] = isTrans ? 0 : 255;
      }

      rawFrames.push({
        left, top, width: fw, height: fh,
        delayMs: graphicControl.delay,
        disposal: graphicControl.disposal,
        rgba
      });
    }
  }

  // Composite frames onto complete full-canvas buffers
  const compositedFrames = [];
  const canvasBuffer = new Uint8ClampedArray(width * height * 4);
  let prevCanvasBuffer = new Uint8ClampedArray(width * height * 4);

  for (let f = 0; f < rawFrames.length; f++) {
    const rf = rawFrames[f];
    const frameBuffer = new Uint8ClampedArray(canvasBuffer);

    for (let row = 0; row < rf.height; row++) {
      const targetY = rf.top + row;
      if (targetY >= height) break;
      for (let col = 0; col < rf.width; col++) {
        const targetX = rf.left + col;
        if (targetX >= width) break;
        const srcIdx = (row * rf.width + col) * 4;
        const srcA = rf.rgba[srcIdx + 3];
        if (srcA > 0) {
          const destIdx = (targetY * width + targetX) * 4;
          frameBuffer[destIdx] = rf.rgba[srcIdx];
          frameBuffer[destIdx + 1] = rf.rgba[srcIdx + 1];
          frameBuffer[destIdx + 2] = rf.rgba[srcIdx + 2];
          frameBuffer[destIdx + 3] = 255;
        }
      }
    }

    compositedFrames.push({
      width,
      height,
      delayMs: rf.delayMs,
      rgba: new Uint8ClampedArray(frameBuffer),
      disposal: rf.disposal
    });

    if (rf.disposal === 2) {
      for (let row = 0; row < rf.height; row++) {
        const targetY = rf.top + row;
        if (targetY >= height) break;
        for (let col = 0; col < rf.width; col++) {
          const targetX = rf.left + col;
          if (targetX >= width) break;
          const destIdx = (targetY * width + targetX) * 4;
          canvasBuffer[destIdx] = 0;
          canvasBuffer[destIdx + 1] = 0;
          canvasBuffer[destIdx + 2] = 0;
          canvasBuffer[destIdx + 3] = 0;
        }
      }
    } else if (rf.disposal === 3) {
      canvasBuffer.set(prevCanvasBuffer);
    } else {
      prevCanvasBuffer = new Uint8ClampedArray(canvasBuffer);
      canvasBuffer.set(frameBuffer);
    }
  }

  return { width, height, loopCount, frames: compositedFrames };
}

