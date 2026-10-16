# Studio tool feature backlog

Researched on 2026-10-16 from current image-tool category pages and converter catalogs. The live search now promotes the high-demand features the studio already has: image compression, WebP/AVIF, favicon/ICO, GIF creation, SVG conversion, 4K upscaling, and JSON-to-CSV.

## Recommended additions

1. **HEIC / HEIF to JPG, PNG, and WebP** — common iPhone-photo compatibility task.
2. **AI background remover** — single-click subject cutout with transparent PNG/WebP export.
3. **General image resizer and cropper** — exact pixels, percentages, aspect-ratio presets, and social-media sizes.
4. **Image to PDF and PDF to image** — combine multiple images, reorder pages, and control page size.
5. **GIF to MP4 / WebM** — smaller, social-ready animation export.
6. **ICO / favicon package expansion** — add Apple touch icons, 192/512px PWA icons, `site.webmanifest`, and copy-ready HTML tags.
7. **Image metadata inspector** — view dimensions, bit depth, alpha, EXIF, ICC, and animation frame count before stripping.
8. **Animated WebP / APNG maker** — reuse the existing GIF timeline with modern animation outputs.
9. **Watermark and text overlay tool** — batch positioning, opacity, margins, and reusable presets.
10. **Color palette extractor** — export CSS variables, Tailwind tokens, SVG swatches, and JSON.
11. **QR code generator** — SVG/PNG output with error correction and brand-safe styling.
12. **Meme / social caption maker** — fast text layout over images and GIFs.

## Evidence used for prioritization

- CloudConvert prominently supports ICO/favicon conversion and broad image-format conversion.
- TinyPNG centers WebP, AVIF, JPEG, and PNG compression/conversion.
- Current all-in-one browser image-tool catalogs repeatedly feature favicon generation, HEIC conversion, background removal, resizing, image-to-PDF, and GIF editing.

Implementation order should start with HEIC conversion, background removal, and general resize/crop because they fill the broadest gaps in the current studio.
