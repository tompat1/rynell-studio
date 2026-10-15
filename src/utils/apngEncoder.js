/**
 * Animated Portable Network Graphics (APNG) Encoder
 * Encodes canvas frames into a standard APNG format.
 */

// CRC32 table for PNG chunk checksums
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf, start, len) {
  let c = 0xffffffff;
  for (let i = start; i < start + len; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(typeStr, data) {
  const len = data ? data.length : 0;
  const chunk = new Uint8Array(4 + 4 + len + 4);
  // Length
  chunk[0] = (len >> 24) & 0xff;
  chunk[1] = (len >> 16) & 0xff;
  chunk[2] = (len >> 8) & 0xff;
  chunk[3] = len & 0xff;
  // Type
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = typeStr.charCodeAt(i);
  }
  // Data
  if (data) {
    chunk.set(data, 8);
  }
  // CRC
  const crc = crc32(chunk, 4, 4 + len);
  chunk[8 + len] = (crc >> 24) & 0xff;
  chunk[8 + len + 1] = (crc >> 16) & 0xff;
  chunk[8 + len + 2] = (crc >> 8) & 0xff;
  chunk[8 + len + 3] = crc & 0xff;
  return chunk;
}

/**
 * Encodes a static canvas into an APNG container with acTL chunk
 * @param {HTMLCanvasElement} canvas 
 * @param {number} numFrames 
 * @returns {Promise<Blob>}
 */
export function encodeCanvasToApng(canvas, numPlays = 0) {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      const buffer = await blob.arrayBuffer();
      const pngBytes = new Uint8Array(buffer);

      // Check PNG signature
      const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      let isPng = true;
      for (let i = 0; i < 8; i++) {
        if (pngBytes[i] !== pngSig[i]) isPng = false;
      }
      if (!isPng) {
        resolve(blob);
        return;
      }

      // Locate IHDR chunk (starts at index 8)
      // IHDR length is 13 bytes -> next chunk starts at 8 + 4 + 4 + 13 + 4 = 33
      const ihdrEnd = 33;

      // Construct acTL chunk (num_frames: 4 bytes, num_plays: 4 bytes)
      const actlData = new Uint8Array(8);
      // num_frames = 1
      actlData[0] = 0; actlData[1] = 0; actlData[2] = 0; actlData[3] = 1;
      // num_plays (0 = infinite)
      actlData[4] = (numPlays >> 24) & 0xff;
      actlData[5] = (numPlays >> 16) & 0xff;
      actlData[6] = (numPlays >> 8) & 0xff;
      actlData[7] = numPlays & 0xff;
      const actlChunk = makeChunk('acTL', actlData);

      // Assemble: Header + IHDR + acTL + rest of original PNG
      const totalLen = ihdrEnd + actlChunk.length + (pngBytes.length - ihdrEnd);
      const apngBytes = new Uint8Array(totalLen);

      apngBytes.set(pngBytes.subarray(0, ihdrEnd), 0);
      apngBytes.set(actlChunk, ihdrEnd);
      apngBytes.set(pngBytes.subarray(ihdrEnd), ihdrEnd + actlChunk.length);

      resolve(new Blob([apngBytes], { type: 'image/apng' }));
    }, 'image/png');
  });
}
