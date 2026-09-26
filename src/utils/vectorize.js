import ImageTracer from 'imagetracerjs';

/**
 * Advanced Vectorine raster-to-SVG vector tracing engine.
 * Converts raster images (PNG, JPEG, WEBP) into crisp, scalable SVG vector graphics.
 * 
 * @param {string} imageSrc - Base64 data URI or image URL
 * @param {object} customConfig - Vectorine configuration object
 * @returns {Promise<{ svgDataUrl: string, svgString: string, pathCount: number, colorCount: number, fileSizeKb: number }>}
 */
export const traceRasterToSVG = (imageSrc, customConfig = {}) => {
  return new Promise((resolve, reject) => {
    if (!imageSrc) {
      return reject(new Error("No image source provided for vector tracing."));
    }

    const {
      engineMode = 'sharp',       // 'sharp' | 'classic'
      preset = 'flat',             // 'flat' | 'bw' | 'lineart' | 'grayscale' | 'poster' | 'detailed'
      numberOfColors = 8,
      detail = 0.5,                // lower = sharper (ltres & qtres)
      smoothing = 0.8,             // blurradius
      corners = 0.65,              // corner handling
      minShapeSize = 8,            // pathomit
      noiseCleanup = 2,            // blurdelta
      isGrayscale = false,
      isPureBW = false
    } = customConfig;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width || 800;
        const h = img.naturalHeight || img.height || 600;
        
        // Optimize dimensions for high-fidelity vector path extraction
        const maxDim = 1280;
        let scaleW = w;
        let scaleH = h;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            scaleH = Math.round((h * maxDim) / w);
            scaleW = maxDim;
          } else {
            scaleW = Math.round((w * maxDim) / h);
            scaleH = maxDim;
          }
        }

        canvas.width = scaleW;
        canvas.height = scaleH;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, scaleW, scaleH);

        // Optional grayscale or high-contrast B&W canvas pre-processing
        if (isGrayscale || isPureBW || preset === 'bw' || preset === 'grayscale') {
          const imgDataPre = ctx.getImageData(0, 0, scaleW, scaleH);
          const d = imgDataPre.data;
          for (let i = 0; i < d.length; i += 4) {
            const avg = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
            if (isPureBW || preset === 'bw') {
              const bw = avg > 128 ? 255 : 0;
              d[i] = bw;
              d[i + 1] = bw;
              d[i + 2] = bw;
            } else {
              d[i] = avg;
              d[i + 1] = avg;
              d[i + 2] = avg;
            }
          }
          ctx.putImageData(imgDataPre, 0, 0);
        }

        const imgData = ctx.getImageData(0, 0, scaleW, scaleH);

        // Build ImageTracer configuration options
        let options = {
          ltres: detail,
          qtres: detail,
          pathomit: minShapeSize,
          colorsampling: isPureBW || preset === 'bw' || isGrayscale || preset === 'grayscale' ? 0 : 2,
          numberofcolors: isPureBW || preset === 'bw' ? 2 : numberOfColors,
          mincolorratio: 0.01,
          colorquantcycles: 3,
          scale: 1,
          strokewidth: preset === 'lineart' ? 2 : 1,
          linefilter: preset === 'bw' || isPureBW,
          blurradius: Math.round(smoothing),
          blurdelta: noiseCleanup
        };

        if (engineMode === 'sharp') {
          options.ltres = Math.min(detail, 0.2);
          options.qtres = Math.min(detail, 0.2);
          options.rightangleenhance = true;
        }

        if (preset === 'detailed') {
          options.numberofcolors = Math.max(numberOfColors, 16);
          options.ltres = 0.05;
          options.qtres = 0.05;
          options.pathomit = 1;
        } else if (preset === 'poster') {
          options.numberofcolors = Math.min(numberOfColors, 6);
          options.colorquantcycles = 5;
        } else if (preset === 'lineart') {
          options.numberofcolors = 2;
          options.strokewidth = 2;
          options.linefilter = true;
        }

        // Execute vector tracing
        const svgString = ImageTracer.imagedataToSVG(imgData, options);

        if (!svgString || typeof svgString !== 'string') {
          throw new Error("Failed to generate SVG vector paths.");
        }

        // Count <path elements in the generated SVG
        const pathMatches = svgString.match(/<path/g);
        const pathCount = pathMatches ? pathMatches.length : 0;
        const fileSizeKb = Math.round((new Blob([svgString]).size / 1024) * 10) / 10;

        // Encode SVG to Data URI for seamless browser rendering and downloading
        const encodedSvg = encodeURIComponent(svgString);
        const svgDataUrl = `data:image/svg+xml;utf8,${encodedSvg}`;

        resolve({
          svgDataUrl,
          svgString,
          pathCount,
          colorCount: options.numberofcolors || numberOfColors,
          fileSizeKb
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load source image for vectorization."));
    };

    img.src = imageSrc;
  });
};
