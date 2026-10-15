/**
 * SVGZ Handler (Gzip-compressed SVG)
 * Handles decompression of .svgz to .svg text and compression of .svg to .svgz
 * Uses native DecompressionStream / CompressionStream APIs.
 */

/**
 * Decompress an SVGZ file or ArrayBuffer into SVG string
 * @param {Blob | File | ArrayBuffer} input 
 * @returns {Promise<string>} SVG XML string
 */
export async function decompressSvgz(input) {
  let blob;
  if (input instanceof Blob || input instanceof File) {
    blob = input;
  } else if (input instanceof ArrayBuffer) {
    blob = new Blob([input], { type: 'application/gzip' });
  } else {
    throw new Error('Unsupported input type for SVGZ decompression.');
  }

  // Check for native DecompressionStream support
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
      const decompressedText = await new Response(stream).text();
      if (decompressedText && decompressedText.includes('<svg')) {
        return decompressedText;
      }
    } catch (e) {
      // If gzip decompression fails, perhaps it's already an uncompressed SVG
      console.warn('DecompressionStream gzip failed, checking if already plain SVG text:', e);
    }
  }

  // Fallback: Attempt reading directly as text (in case already plain SVG or uncompressed)
  const directText = await blob.text();
  if (directText.includes('<svg')) {
    return directText;
  }

  throw new Error('Could not decompress SVGZ. Ensure the file is a valid gzip-compressed SVG or uncompressed SVG.');
}

/**
 * Compress an SVG XML string into an SVGZ (gzip-compressed Blob)
 * @param {string} svgString 
 * @returns {Promise<Blob>}
 */
export async function compressSvgToSvgz(svgString) {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  
  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = blob.stream().pipeThrough(new CompressionStream('gzip'));
      const compressedBuffer = await new Response(stream).arrayBuffer();
      return new Blob([compressedBuffer], { type: 'application/gzip' });
    } catch (err) {
      console.warn('CompressionStream failed, returning uncompressed SVG blob:', err);
    }
  }
  
  return blob;
}
