/**
 * Client-Side Archive Extractor (ZIP, TAR, 7z/RAR detector)
 * Extracts image files from archive files directly in the browser using Web Standards.
 */

const IMAGE_EXTENSIONS = [
  '.gif', '.jpg', '.jpeg', '.png', '.apng', '.webp', '.avif', 
  '.heic', '.heif', '.mng', '.jp2', '.jxl', '.bmp', '.pdf', 
  '.anim', '.cdxl', '.fli', '.flc', '.bpg', '.ase', '.aseprite', '.svg'
];

function isImageFilename(filename) {
  const lower = filename.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function getMimeType(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png') || lower.endsWith('.apng')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.avif')) return 'image/avif';
  if (lower.endsWith('.bmp')) return 'image/bmp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.jxl')) return 'image/jxl';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}

/**
 * Extracts image files from a ZIP archive
 */
async function extractZipImages(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const files = [];
  let offset = 0;

  // Search for local file headers (0x04034b50)
  while (offset + 30 <= bytes.length) {
    if (
      bytes[offset] === 0x50 &&
      bytes[offset + 1] === 0x4b &&
      bytes[offset + 2] === 0x03 &&
      bytes[offset + 3] === 0x04
    ) {
      // Local File Header
      const compressionMethod = bytes[offset + 8] | (bytes[offset + 9] << 8);
      const compressedSize = bytes[offset + 18] | (bytes[offset + 19] << 8) | (bytes[offset + 20] << 16) | (bytes[offset + 21] << 24);
      const filenameLen = bytes[offset + 26] | (bytes[offset + 27] << 8);
      const extraFieldLen = bytes[offset + 28] | (bytes[offset + 29] << 8);

      const filenameBytes = bytes.subarray(offset + 30, offset + 30 + filenameLen);
      const filename = new TextDecoder().decode(filenameBytes);

      const dataStart = offset + 30 + filenameLen + extraFieldLen;
      const dataEnd = dataStart + compressedSize;

      if (dataEnd <= bytes.length && isImageFilename(filename) && !filename.endsWith('/') && !filename.includes('__MACOSX')) {
        const rawCompressedData = bytes.subarray(dataStart, dataEnd);
        let decompressedBytes = null;

        if (compressionMethod === 0) {
          // Stored (no compression)
          decompressedBytes = rawCompressedData;
        } else if (compressionMethod === 8 && typeof DecompressionStream !== 'undefined') {
          // Deflate compression
          try {
            const ds = new DecompressionStream('deflate-raw');
            const stream = new Response(rawCompressedData).body.pipeThrough(ds);
            decompressedBytes = new Uint8Array(await new Response(stream).arrayBuffer());
          } catch (err) {
            console.warn(`Could not deflate ${filename}:`, err);
          }
        }

        if (decompressedBytes) {
          const mime = getMimeType(filename);
          const blob = new Blob([decompressedBytes], { type: mime });
          files.push({
            name: filename.split('/').pop(),
            blob,
            size: decompressedBytes.length
          });
        }
      }

      // Move forward
      offset = dataEnd > offset ? dataEnd : offset + 30;
    } else {
      offset++;
    }
  }

  return files;
}

/**
 * Extracts image files from a TAR archive
 */
function extractTarImages(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const files = [];
  let offset = 0;

  while (offset + 512 <= bytes.length) {
    // Check if empty block (zero-filled terminator)
    if (bytes[offset] === 0 && bytes[offset + 1] === 0) break;

    // Read filename (first 100 bytes)
    const nameBytes = bytes.subarray(offset, offset + 100);
    const nullIdx = nameBytes.indexOf(0);
    const filename = new TextDecoder().decode(nullIdx >= 0 ? nameBytes.subarray(0, nullIdx) : nameBytes).trim();

    // Read size (offset 124..135, octal ASCII)
    const sizeStr = new TextDecoder().decode(bytes.subarray(offset + 124, offset + 136)).trim();
    const fileSize = parseInt(sizeStr, 8) || 0;

    const dataStart = offset + 512;
    const dataEnd = dataStart + fileSize;

    if (fileSize > 0 && dataEnd <= bytes.length && isImageFilename(filename)) {
      const fileData = bytes.subarray(dataStart, dataEnd);
      const mime = getMimeType(filename);
      files.push({
        name: filename.split('/').pop(),
        blob: new Blob([fileData], { type: mime }),
        size: fileSize
      });
    }

    // TAR blocks are padded to 512-byte boundaries
    offset = dataStart + Math.ceil(fileSize / 512) * 512;
  }

  return files;
}

/**
 * Main archive extraction dispatcher
 * Accepts ZIP, TAR, 7z, RAR, etc.
 * @param {File | Blob} archiveFile
 * @returns {Promise<Array<{ name: string, blob: Blob, size: number }>>}
 */
export async function extractArchive(archiveFile) {
  const name = archiveFile.name.toLowerCase();
  const buffer = await archiveFile.arrayBuffer();
  const header = new Uint8Array(buffer.slice(0, 8));

  // 1. Detect ZIP (PK\x03\x04 or .zip)
  if ((header[0] === 0x50 && header[1] === 0x4b) || name.endsWith('.zip')) {
    const extracted = await extractZipImages(buffer);
    if (extracted.length > 0) return extracted;
  }

  // 2. Detect TAR
  if (name.endsWith('.tar')) {
    const extracted = extractTarImages(buffer);
    if (extracted.length > 0) return extracted;
  }

  // 3. 7z signature (0x37 0x7A 0xBC 0xAF 0x27 0x1C)
  if (header[0] === 0x37 && header[1] === 0x7a) {
    throw new Error('7z archives require pre-unzipping or converting to standard ZIP/TAR before upload.');
  }

  // 4. RAR signature (Rar!\x1A\x07)
  if (header[0] === 0x52 && header[1] === 0x61 && header[2] === 0x72) {
    throw new Error('RAR archives are proprietary. Please upload files in standard ZIP or TAR format.');
  }

  // Fallback: try ZIP extraction anyway
  try {
    const fallback = await extractZipImages(buffer);
    if (fallback.length > 0) return fallback;
  } catch (err) {
    console.warn('Fallback ZIP extraction encountered an error:', err);
  }

  throw new Error('No supported image files found inside the archive. Ensure files are valid images.');
}
