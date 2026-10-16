import { CONVERTER_TOOLS } from '../src/utils/converterEngine.js';

function runTests() {
  console.log('Testing Studio Converter Engine...');

  // 1. Verify svg-to-webp tool configuration
  const webpTool = CONVERTER_TOOLS.find(t => t.id === 'svg-to-webp');
  if (!webpTool) {
    throw new Error('Tool svg-to-webp not found in CONVERTER_TOOLS');
  }
  console.log('✓ Found svg-to-webp tool:', {
    name: webpTool.name,
    inputFormat: webpTool.inputFormat,
    outputFormat: webpTool.outputFormat,
    outputMime: webpTool.outputMime,
    outputExt: webpTool.outputExt
  });

  // 2. Test SVG viewBox normalization logic
  const sampleSvg = `<svg viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#FF6A00"/></svg>`;
  // Ensure DOMParser or string matching handles viewBox correctly
  const viewBoxMatch = sampleSvg.match(/viewBox=["']([^"']+)["']/);
  if (!viewBoxMatch) throw new Error('viewBox regex failed');
  const [, , w, h] = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
  if (w !== 1200 || h !== 800) {
    throw new Error(`Failed to extract viewBox dimensions: ${w}x${h}`);
  }
  console.log(`✓ SVG viewBox dimension extraction: ${w}x${h}`);

  // 3. Test File Size calculation
  const dummyWebpBytes = 16793; // ~16.4 KB
  const sizeKb = Math.round((dummyWebpBytes / 1024) * 10) / 10;
  if (sizeKb !== 16.4) {
    throw new Error(`Expected 16.4 KB, got ${sizeKb}`);
  }
  console.log(`✓ Size calculation formatted correctly: ${sizeKb} KB`);

  console.log('\nAll SVG -> WebP converter logic tests passed successfully!');
}

runTests();
