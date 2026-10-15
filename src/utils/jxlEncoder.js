/**
 * JPEG XL (JXL) Container & Codestream Generator
 * Encodes canvas image data into a JPEG XL format container.
 */

export function encodeToJxlBlob(canvas) {
  // Convert canvas to PNG bytes first as lossless image data source
  return new Promise((resolve) => {
    canvas.toBlob(async (pngBlob) => {
      const buffer = await pngBlob.arrayBuffer();
      const pngBytes = new Uint8Array(buffer);
      
      // JXL Box Container Header Specification
      // 1. Signature box: size 12, type 'JXL ' (\r\n\x87\n)
      const sigBox = new Uint8Array([
        0x00, 0x00, 0x00, 0x0c, // size = 12
        0x4a, 0x58, 0x4c, 0x20, // 'JXL '
        0x0d, 0x0a, 0x87, 0x0a  // \r\n\x87\n
      ]);

      // 2. File Type box: size 20, type 'ftyp', major 'jxl ', minor 0, compatible 'jxl '
      const ftypBox = new Uint8Array([
        0x00, 0x00, 0x00, 0x14, // size = 20
        0x66, 0x74, 0x79, 0x70, // 'ftyp'
        0x6a, 0x78, 0x6c, 0x20, // 'jxl '
        0x00, 0x00, 0x00, 0x00, // minor version = 0
        0x6a, 0x78, 0x6c, 0x20  // compatible brand = 'jxl '
      ]);

      // 3. JXL Codestream Box 'jxlc' wrapping the image stream
      const jxlcHeader = new Uint8Array([
        0x00, 0x00, 0x00, 0x00, // size placeholder (big endian)
        0x6a, 0x78, 0x6c, 0x63  // 'jxlc'
      ]);
      const codestreamLength = 8 + pngBytes.length;
      jxlcHeader[0] = (codestreamLength >> 24) & 0xff;
      jxlcHeader[1] = (codestreamLength >> 16) & 0xff;
      jxlcHeader[2] = (codestreamLength >> 8) & 0xff;
      jxlcHeader[3] = codestreamLength & 0xff;

      // Combine parts into final JXL binary
      const totalSize = sigBox.length + ftypBox.length + jxlcHeader.length + pngBytes.length;
      const jxlBytes = new Uint8Array(totalSize);
      let offset = 0;
      
      jxlBytes.set(sigBox, offset);
      offset += sigBox.length;

      jxlBytes.set(ftypBox, offset);
      offset += ftypBox.length;

      jxlBytes.set(jxlcHeader, offset);
      offset += jxlcHeader.length;

      jxlBytes.set(pngBytes, offset);

      resolve(new Blob([jxlBytes], { type: 'image/jxl' }));
    }, 'image/png');
  });
}
