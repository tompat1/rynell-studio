/**
 * Studio Image Conversion Engine
 * High-performance browser-based conversion for SVG, raster formats (PNG, JPG, WebP, AVIF, GIF, APNG, JXL),
 * and compressed SVGZ.
 */

import { traceRasterToSVG } from './vectorize.js';
import { encodeImageDataToGif } from './gifEncoder.js';
import { encodeToJxlBlob } from './jxlEncoder.js';
import { encodeCanvasToApng } from './apngEncoder.js';
import { decompressSvgz, compressSvgToSvgz } from './svgzHandler.js';

export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
export const AUTO_DELETE_DELAY_MS = 60 * 60 * 1000; // 1 hour

export const CONVERTER_TOOLS = [
  {
    id: 'svg-to-png',
    name: 'SVG to PNG',
    pairId: 'png-to-svg',
    direction: 'svg-to-raster',
    inputFormat: 'SVG',
    outputFormat: 'PNG',
    accept: '.svg,image/svg+xml',
    outputMime: 'image/png',
    outputExt: 'png',
    icon: '⚡',
    desc: 'Render scalable vector graphics into crisp, transparent PNG images at up to 4K resolution.'
  },
  {
    id: 'png-to-svg',
    name: 'PNG to SVG',
    pairId: 'svg-to-png',
    direction: 'raster-to-svg',
    inputFormat: 'PNG',
    outputFormat: 'SVG',
    accept: '.png,image/png',
    outputMime: 'image/svg+xml',
    outputExt: 'svg',
    icon: '📐',
    desc: 'Trace raster PNG pixels into clean, scalable SVG vector paths with smart contour smoothing.'
  },
  {
    id: 'svg-to-jpg',
    name: 'SVG to JPG',
    pairId: 'jpg-to-svg',
    direction: 'svg-to-raster',
    inputFormat: 'SVG',
    outputFormat: 'JPG',
    accept: '.svg,image/svg+xml',
    outputMime: 'image/jpeg',
    outputExt: 'jpg',
    icon: '🖼️',
    desc: 'Convert vector graphics to compressed JPEG with custom quality and background fill.'
  },
  {
    id: 'jpg-to-svg',
    name: 'JPG to SVG',
    pairId: 'svg-to-jpg',
    direction: 'raster-to-svg',
    inputFormat: 'JPG',
    outputFormat: 'SVG',
    accept: '.jpg,.jpeg,image/jpeg',
    outputMime: 'image/svg+xml',
    outputExt: 'svg',
    icon: '📐',
    desc: 'Vectorize photos and high-contrast JPG artwork into scalable multi-color SVG shapes.'
  },
  {
    id: 'svg-to-webp',
    name: 'SVG to WebP',
    pairId: 'webp-to-svg',
    direction: 'svg-to-raster',
    inputFormat: 'SVG',
    outputFormat: 'WebP',
    accept: '.svg,image/svg+xml',
    outputMime: 'image/webp',
    outputExt: 'webp',
    icon: '🌐',
    desc: 'Export SVGs to modern Google WebP format with alpha channel and maximum web compression.'
  },
  {
    id: 'webp-to-svg',
    name: 'WebP to SVG',
    pairId: 'svg-to-webp',
    direction: 'raster-to-svg',
    inputFormat: 'WebP',
    outputFormat: 'SVG',
    accept: '.webp,image/webp',
    outputMime: 'image/svg+xml',
    outputExt: 'svg',
    icon: '📐',
    desc: 'Extract vector paths and layered shapes directly from WebP web images.'
  },
  {
    id: 'svg-to-avif',
    name: 'SVG to AVIF',
    pairId: 'avif-to-svg',
    direction: 'svg-to-raster',
    inputFormat: 'SVG',
    outputFormat: 'AVIF',
    accept: '.svg,image/svg+xml',
    outputMime: 'image/avif',
    outputExt: 'avif',
    icon: '🚀',
    desc: 'Next-gen AV1 image format with superior compression efficiency and HDR color fidelity.'
  },
  {
    id: 'avif-to-svg',
    name: 'AVIF to SVG',
    pairId: 'svg-to-avif',
    direction: 'raster-to-svg',
    inputFormat: 'AVIF',
    outputFormat: 'SVG',
    accept: '.avif,image/avif',
    outputMime: 'image/svg+xml',
    outputExt: 'svg',
    icon: '📐',
    desc: 'Trace next-generation AVIF raster images into infinitely scalable vector curves.'
  },
  {
    id: 'svg-to-apng',
    name: 'SVG to APNG',
    pairId: null,
    direction: 'svg-to-raster',
    inputFormat: 'SVG',
    outputFormat: 'APNG',
    accept: '.svg,image/svg+xml',
    outputMime: 'image/apng',
    outputExt: 'png',
    icon: '🎞️',
    desc: 'Assemble vector graphics into Animated Portable Network Graphics (APNG) containers.'
  },
  {
    id: 'svg-to-jxl',
    name: 'SVG to JXL',
    pairId: null,
    direction: 'svg-to-raster',
    inputFormat: 'SVG',
    outputFormat: 'JXL',
    accept: '.svg,image/svg+xml',
    outputMime: 'image/jxl',
    outputExt: 'jxl',
    icon: '✨',
    desc: 'Render SVGs directly into modern JPEG XL (JXL) box containers with lossless precision.'
  },
  {
    id: 'svg-to-gif',
    name: 'SVG to GIF',
    pairId: 'gif-to-svg',
    direction: 'svg-to-raster',
    inputFormat: 'SVG',
    outputFormat: 'GIF',
    accept: '.svg,image/svg+xml',
    outputMime: 'image/gif',
    outputExt: 'gif',
    icon: '👾',
    desc: 'Convert vector drawings into 8-bit GIF89a graphics with indexed color palette.'
  },
  {
    id: 'gif-to-svg',
    name: 'GIF to SVG',
    pairId: 'svg-to-gif',
    direction: 'raster-to-svg',
    inputFormat: 'GIF',
    outputFormat: 'SVG',
    accept: '.gif,image/gif',
    outputMime: 'image/svg+xml',
    outputExt: 'svg',
    icon: '📐',
    desc: 'Vectorize retro pixel art and GIF graphics into crisp geometric vector paths.'
  },
  {
    id: 'svgz-to-svg',
    name: 'SVGZ to SVG',
    pairId: 'svg-to-svgz',
    direction: 'archive-svg',
    inputFormat: 'SVGZ',
    outputFormat: 'SVG',
    accept: '.svgz,application/gzip,application/x-gzip',
    outputMime: 'image/svg+xml',
    outputExt: 'svg',
    icon: '📦',
    desc: 'Decompress gzip-compressed .svgz archives into standard, human-readable SVG vector markup.'
  },
  {
    id: 'svg-to-svgz',
    name: 'SVG to SVGZ',
    pairId: 'svgz-to-svg',
    direction: 'svg-to-archive',
    inputFormat: 'SVG',
    outputFormat: 'SVGZ',
    accept: '.svg,image/svg+xml',
    outputMime: 'application/gzip',
    outputExt: 'svgz',
    icon: '🗜️',
    desc: 'Gzip-compress large SVG vector files into high-density .svgz archives for maximum bandwidth savings.'
  }
];

/**
 * Load an image source into an HTMLImageElement
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('blob:') && !src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for conversion.'));
    img.src = src;
  });
}

/**
 * Convert SVG text or data URL to HTML Canvas with viewBox normalization
 */
async function renderSvgToCanvas(svgSrc, { scale = 2, bgColor = 'transparent', file = null } = {}) {
  let targetUrl = svgSrc;

  // Pre-normalize SVG markup to guarantee width, height, and xmlns are set
  try {
    let svgString = null;
    if (file && (file.name.toLowerCase().endsWith('.svg') || file.type.includes('svg'))) {
      svgString = await file.text();
    } else if (svgSrc && typeof svgSrc === 'string') {
      const resp = await fetch(svgSrc);
      svgString = await resp.text();
    }

    if (svgString && svgString.includes('<svg')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (svgEl) {
        if (!svgEl.getAttribute('xmlns')) {
          svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }
        const rawW = svgEl.getAttribute('width');
        const rawH = svgEl.getAttribute('height');
        const isPercentW = rawW && rawW.includes('%');
        const isPercentH = rawH && rawH.includes('%');
        let w = isPercentW ? 0 : parseFloat(rawW);
        let h = isPercentH ? 0 : parseFloat(rawH);
        const viewBox = svgEl.getAttribute('viewBox');
        if ((!w || !h || isNaN(w) || isNaN(h)) && viewBox) {
          const parts = viewBox.trim().split(/[\s,]+/);
          if (parts.length === 4) {
            w = parseFloat(parts[2]);
            h = parseFloat(parts[3]);
            if (w > 0 && h > 0) {
              svgEl.setAttribute('width', String(w));
              svgEl.setAttribute('height', String(h));
            }
          }
        }
        if (!w || !h || isNaN(w) || isNaN(h)) {
          svgEl.setAttribute('width', '800');
          svgEl.setAttribute('height', '800');
        }
        const serialized = new XMLSerializer().serializeToString(doc);
        const safeSvgBlob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
        targetUrl = URL.createObjectURL(safeSvgBlob);
      }
    }
  } catch (err) {
    console.warn('SVG normalization notice:', err);
  }

  let img;
  try {
    img = await loadImage(targetUrl);
  } finally {
    if (targetUrl !== svgSrc && targetUrl.startsWith('blob:')) {
      URL.revokeObjectURL(targetUrl);
    }
  }

  const canvas = document.createElement('canvas');
  const baseW = img.naturalWidth || img.width || 800;
  const baseH = img.naturalHeight || img.height || 800;
  const w = Math.round(baseW * scale);
  const h = Math.round(baseH * scale);
  
  canvas.width = Math.max(1, Math.min(w, 8192));
  canvas.height = Math.max(1, Math.min(h, 8192));
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not initialize 2D canvas context.');

  if (bgColor && bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, width: canvas.width, height: canvas.height };
}

/**
 * Main conversion dispatcher
 */
export async function executeConversion({
  toolId,
  file,
  sourceUrl,
  options = {}
}) {
  const tool = CONVERTER_TOOLS.find(t => t.id === toolId);
  if (!tool) throw new Error(`Unknown converter tool: ${toolId}`);

  // 1. File size check
  if (file && file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds maximum limit of 200MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
  }

  const {
    scale = 2,
    quality = 0.92,
    bgColor = 'transparent',
    vectorPreset = 'flat',
    vectorColors = 8,
    vectorDetail = 0.3
  } = options;

  let resultBlob;
  let resultUrl;
  let resultText = null;
  let width = 0;
  let height = 0;

  // Branch A: SVGZ to SVG
  if (toolId === 'svgz-to-svg') {
    const svgString = await decompressSvgz(file || sourceUrl);
    resultText = svgString;
    resultBlob = new Blob([svgString], { type: 'image/svg+xml' });
    resultUrl = URL.createObjectURL(resultBlob);

    // Measure dimensions if possible
    try {
      const img = await loadImage(resultUrl);
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
    } catch (e) {
      console.warn('Could not measure SVGZ dimensions:', e);
    }
  }
  // Branch B: SVG to SVGZ
  else if (toolId === 'svg-to-svgz') {
    let svgString = resultText;
    if (!svgString && file) {
      svgString = await file.text();
    } else if (!svgString && sourceUrl) {
      const resp = await fetch(sourceUrl);
      svgString = await resp.text();
    }
    resultBlob = await compressSvgToSvgz(svgString);
    resultUrl = URL.createObjectURL(resultBlob);
  }
  // Branch C: Raster to SVG (PNG->SVG, JPG->SVG, WebP->SVG, AVIF->SVG, GIF->SVG)
  else if (tool.direction === 'raster-to-svg') {
    const traceResult = await traceRasterToSVG(sourceUrl, {
      preset: vectorPreset,
      numberOfColors: vectorColors,
      detail: vectorDetail,
      engineMode: 'sharp'
    });

    resultText = traceResult.svgString;
    resultBlob = new Blob([traceResult.svgString], { type: 'image/svg+xml' });
    resultUrl = URL.createObjectURL(resultBlob);
    
    // Quick dimension read
    try {
      const img = await loadImage(sourceUrl);
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
    } catch (e) {
      console.warn('Could not read raster dimensions:', e);
    }
  }
  // Branch D: SVG to Raster (PNG, JPG, WebP, AVIF, APNG, JXL, GIF)
  else {
    const fillBg = tool.outputFormat === 'JPG' ? (bgColor === 'transparent' ? '#ffffff' : bgColor) : bgColor;
    const { canvas, width: cW, height: cH } = await renderSvgToCanvas(sourceUrl, { scale, bgColor: fillBg, file });
    width = cW;
    height = cH;

    if (toolId === 'svg-to-gif') {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const imgData = ctx.getImageData(0, 0, width, height);
      resultBlob = encodeImageDataToGif(imgData);
      resultUrl = URL.createObjectURL(resultBlob);
    } else if (toolId === 'svg-to-jxl') {
      resultBlob = await encodeToJxlBlob(canvas);
      // For preview purposes, create a blob or use canvas data url
      resultUrl = URL.createObjectURL(resultBlob);
    } else if (toolId === 'svg-to-apng') {
      resultBlob = await encodeCanvasToApng(canvas);
      resultUrl = URL.createObjectURL(resultBlob);
    } else if (toolId === 'svg-to-avif') {
      resultBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob && blob.type.includes('avif')) {
            resolve(blob);
          } else {
            // Fallback for browsers without direct canvas AVIF export
            canvas.toBlob((webPBlob) => resolve(webPBlob), 'image/webp', quality);
          }
        }, 'image/avif', quality);
      });
      resultUrl = URL.createObjectURL(resultBlob);
    } else {
      // Standard PNG, JPG, WebP with reliable fallback
      resultBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            try {
              const dataUrl = canvas.toDataURL(tool.outputMime, quality);
              const arr = dataUrl.split(',');
              const mime = arr[0].match(/:(.*?);/)?.[1] || tool.outputMime;
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              resolve(new Blob([u8arr], { type: mime }));
            } catch (fallbackErr) {
              console.warn('Canvas toBlob fallback triggered:', fallbackErr);
              canvas.toBlob((pBlob) => resolve(pBlob), 'image/png');
            }
          }
        }, tool.outputMime, quality);
      });
      resultUrl = URL.createObjectURL(resultBlob);
    }
  }

  const resultSizeKb = Math.round((resultBlob.size / 1024) * 10) / 10;
  
  return {
    tool,
    blob: resultBlob,
    url: resultUrl,
    svgText: resultText,
    sizeKb: resultSizeKb,
    sizeBytes: resultBlob.size,
    width,
    height
  };
}
