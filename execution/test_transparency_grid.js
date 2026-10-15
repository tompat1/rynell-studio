const TRANSPARENT_FORMATS = ['SVG', 'PNG', 'WEBP', 'AVIF', 'APNG', 'GIF', 'SVGZ', 'JXL'];

function checkIsTransparentFormat(fmt) {
  if (!fmt) return false;
  return TRANSPARENT_FORMATS.includes(String(fmt).toUpperCase());
}

function resolveEffectiveBgGrid(canvasBg, previewBgGrid) {
  if (canvasBg === 'transparent') {
    return 'checker';
  }
  return previewBgGrid;
}

function runTests() {
  console.log('Testing Transparency & Checkered Grid Logic...');

  // 1. Verify format transparency checks
  if (!checkIsTransparentFormat('SVG')) throw new Error('SVG should be transparent');
  if (!checkIsTransparentFormat('WebP')) throw new Error('WebP should be transparent');
  if (!checkIsTransparentFormat('PNG')) throw new Error('PNG should be transparent');
  if (!checkIsTransparentFormat('AVIF')) throw new Error('AVIF should be transparent');
  if (checkIsTransparentFormat('JPG')) throw new Error('JPG should not be transparent');
  console.log('✓ File format transparency detection verified.');

  // 2. Verify effective background grid resolution
  if (resolveEffectiveBgGrid('transparent', 'dark') !== 'checker') {
    throw new Error('transparent canvasBg must yield checker grid');
  }
  if (resolveEffectiveBgGrid('transparent', 'light') !== 'checker') {
    throw new Error('transparent canvasBg must yield checker grid');
  }
  if (resolveEffectiveBgGrid('#ffffff', 'light') !== 'light') {
    throw new Error('solid white canvasBg should yield light grid');
  }
  if (resolveEffectiveBgGrid('#000000', 'dark') !== 'dark') {
    throw new Error('solid black canvasBg should yield dark grid');
  }
  console.log('✓ Checkered grid auto-activation verified.');

  console.log('\nAll transparency grid tests passed successfully!');
}

runTests();
