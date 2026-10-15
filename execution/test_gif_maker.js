import { encodeFramesToAnimatedGif } from '../src/utils/gifEncoder.js';

// Polyfill minimal ImageData if running in Node.js
function makeMockImageData(width, height, colorR, colorG, colorB) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = colorR;
    data[i + 1] = colorG;
    data[i + 2] = colorB;
    data[i + 3] = 255;
  }
  return { width, height, data };
}

async function testAnimatedGifEncoder() {
  console.log("⚡ Testing Studio Multi-Frame Animated GIF Encoder...");

  const frames = [
    { imageData: makeMockImageData(100, 100, 255, 106, 0), delayMs: 200 }, // Studio Orange
    { imageData: makeMockImageData(100, 100, 0, 123, 255), delayMs: 200 }, // Studio Blue
    { imageData: makeMockImageData(100, 100, 10, 30, 63), delayMs: 200 },  // Dark Blue
    { imageData: makeMockImageData(100, 100, 255, 180, 0), delayMs: 200 }  // Yellow
  ];

  const blob = encodeFramesToAnimatedGif(frames, { width: 100, height: 100, loopCount: 0 });
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 1. Check Header (GIF89a)
  const header = String.fromCharCode(...bytes.subarray(0, 6));
  if (header !== 'GIF89a') {
    throw new Error(`Expected GIF89a header, got ${header}`);
  }
  console.log("✓ Header verified: GIF89a");

  // 2. Check Netscape 2.0 application loop block
  const fullStr = new TextDecoder('latin1').decode(bytes);
  if (!fullStr.includes('NETSCAPE2.0')) {
    throw new Error("Missing NETSCAPE2.0 application extension for looping animation!");
  }
  console.log("✓ Loop block verified: NETSCAPE2.0 (Infinite Loop)");

  // 3. Check for 4 Graphic Control Extensions
  let gceCount = 0;
  for (let i = 0; i < bytes.length - 3; i++) {
    if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 0x04) {
      gceCount++;
    }
  }
  if (gceCount !== 4) {
    throw new Error(`Expected 4 Graphic Control Extensions for 4 frames, found ${gceCount}`);
  }
  console.log(`✓ All 4 frame Graphic Control Extensions verified (count: ${gceCount})`);

  // 4. Check Trailer
  const lastByte = bytes[bytes.length - 1];
  if (lastByte !== 0x3b) {
    throw new Error(`Expected trailer 0x3B, got 0x${lastByte.toString(16)}`);
  }
  console.log(`✓ Trailer verified: 0x3B (File size: ${(bytes.length / 1024).toFixed(2)} KB)`);

  console.log("\n✨ ALL ANIMATED GIF MAKER TESTS PASSED! ✨\n");
}

testAnimatedGifEncoder().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
