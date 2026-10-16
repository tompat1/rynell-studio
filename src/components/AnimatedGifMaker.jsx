import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useCms } from '../contexts/CmsContext';
import { encodeFramesToAnimatedGif } from '../utils/gifEncoder';
import { extractArchive } from '../utils/archiveExtractor';
import { BG_COLOR_MAP, DEMO_SEQUENCES, getDefaultFrames } from '../utils/gifSequencePresets';

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

const AnimatedGifMaker = () => {
  const { t, isLiveEditMode, isCmsAdmin, openCms } = useCms();
  // Frame sequence state
  const [frames, setFrames] = useState(getDefaultFrames);
  const [globalDelayMs, setGlobalDelayMs] = useState(250);
  const [loopCount, setLoopCount] = useState(0); // 0 = infinite
  const [canvasSizeMode, setCanvasSizeMode] = useState('first'); // 'first' | 'max' | 'square' | 'custom'
  const [customWidth, setCustomWidth] = useState(600);
  const [customHeight, setCustomHeight] = useState(600);
  const [firstFrameDim, setFirstFrameDim] = useState({ width: 640, height: 640 });
  const [fitMode, setFitMode] = useState('contain'); // 'contain' | 'cover' | 'stretch'
  const [canvasBg, setCanvasBg] = useState('transparent'); // 'transparent' | 'black' | 'white' | 'orange'
  const [isPingPong, setIsPingPong] = useState(false);

  // Transitions state
  const [transitionType, setTransitionType] = useState('none'); // 'none' | 'crossfade' | 'slide-left' | 'slide-right' | 'slide-up' | 'fade-black' | 'zoom' | 'wipe-left'
  const [transitionSteps, setTransitionSteps] = useState(2); // 1 | 2 | 3 | 4
  const [transitionDelayMs, setTransitionDelayMs] = useState(70); // 40 | 70 | 100 | 140

  // Live Animation Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentTweenStep, setCurrentTweenStep] = useState(0); // 0 = main frame, >0 = tween step
  const playerCanvasRef = useRef(null);
  const playTimerRef = useRef(null);
  const imageCacheRef = useRef(new Map());

  // Encoding & Results state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [outputGifUrl, setOutputGifUrl] = useState(null);
  const [outputGifBlob, setOutputGifBlob] = useState(null);
  const [outputStats, setOutputStats] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationNotice, setOptimizationNotice] = useState(null);
  const [sentNotice, setSentNotice] = useState(false);
  const rawFramesRef = useRef([]);
  const [isDragging, setIsDragging] = useState(false);

  // Ephemeral 1-hour auto-deletion
  const [expirySeconds, setExpirySeconds] = useState(3600);
  const sessionCreatedRef = useRef(null);
  const expiryTimerRef = useRef(null);
  const activeObjectUrlsRef = useRef([]);
  const fileInputRef = useRef(null);

  // Track blob URLs for cleanup
  const registerUrl = useCallback((url) => {
    if (url && url.startsWith('blob:')) {
      activeObjectUrlsRef.current.push(url);
    }
    return url;
  }, []);

  const cleanupUrls = useCallback(() => {
    activeObjectUrlsRef.current.forEach(u => {
      try { 
        URL.revokeObjectURL(u); 
      } catch (err) {
        console.warn('Failed to revoke object URL:', err);
      }
    });
    activeObjectUrlsRef.current = [];
  }, []);

  // Reset function
  const handleClearAll = useCallback(() => {
    cleanupUrls();
    setFrames([]);
    setOutputGifUrl(null);
    setOutputStats(null);
    setCurrentFrameIndex(0);
    setCurrentTweenStep(0);
    setErrorNotice(null);
  }, [cleanupUrls]);

  // 1-Hour Auto-Delete Lifecycle
  useEffect(() => {
    sessionCreatedRef.current = Date.now();

    if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    expiryTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionCreatedRef.current) / 1000);
      const remaining = Math.max(0, 3600 - elapsed);
      setExpirySeconds(remaining);

      if (remaining <= 0) {
        handleClearAll();
        setErrorNotice('Notice: 1-hour ephemeral privacy window expired. All files and generated animation buffers have been purged.');
        clearInterval(expiryTimerRef.current);
      }
    }, 1000);

    return () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
      cleanupUrls();
    };
  }, [handleClearAll, cleanupUrls]);

  const formatCountdown = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Load sample sequence
  const handleLoadDemoSequence = useCallback((demoId) => {
    const demo = DEMO_SEQUENCES.find(d => d.id === demoId) || DEMO_SEQUENCES[0];
    setErrorNotice(null);
    setOutputGifUrl(null);
    setOutputStats(null);

    const loadedFrames = demo.frames.map((item, index) => ({
      id: `frame_${index}_${item.name}`,
      name: item.name,
      url: item.url,
      delayMs: item.delayMs || demo.delayMs,
      transform: item.transform || 'none',
      width: 600,
      height: 600
    }));

    setFrames(loadedFrames);
    setGlobalDelayMs(demo.delayMs);
    setCurrentFrameIndex(0);
    setCurrentTweenStep(0);
  }, []);

  // Parse incoming files (supports bulk images and ZIP/TAR archives)
  const processIncomingFiles = async (fileList) => {
    setErrorNotice(null);
    if (!fileList || fileList.length === 0) return;

    // Check aggregate size limit (200MB)
    let totalSize = 0;
    for (let i = 0; i < fileList.length; i++) totalSize += fileList[i].size;

    if (totalSize > MAX_FILE_SIZE_BYTES) {
      setErrorNotice(`TOTAL BATCH SIZE EXCEEDS LIMIT: ${(totalSize / (1024 * 1024)).toFixed(1)}MB exceeds 200MB maximum.`);
      return;
    }

    const newFrameItems = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const lowerName = file.name.toLowerCase();

      // Check if archive (ZIP, TAR)
      if (lowerName.endsWith('.zip') || lowerName.endsWith('.tar') || lowerName.endsWith('.7z') || lowerName.endsWith('.rar')) {
        try {
          const extracted = await extractArchive(file);
          for (const item of extracted) {
            const url = registerUrl(URL.createObjectURL(item.blob));
            newFrameItems.push({
              id: `frame_${Date.now()}_${Math.random()}`,
              name: item.name,
              url,
              delayMs: globalDelayMs,
              sizeBytes: item.size
            });
          }
        } catch (err) {
          setErrorNotice(err.message || `Could not extract archive ${file.name}`);
        }
      } else {
        // Regular image file (PNG, JPG, APNG, WebP, AVIF, GIF, SVG, BMP, etc.)
        const url = registerUrl(URL.createObjectURL(file));
        newFrameItems.push({
          id: `frame_${Date.now()}_${Math.random()}`,
          name: file.name,
          url,
          delayMs: globalDelayMs,
          sizeBytes: file.size
        });
      }
    }

    if (newFrameItems.length > 0) {
      setFrames(prev => [...prev, ...newFrameItems]);
      sessionCreatedRef.current = Date.now();
      setExpirySeconds(3600);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  // Reorder frames
  const handleMoveFrame = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= frames.length) return;
    setFrames(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleDeleteFrame = (index) => {
    setFrames(prev => prev.filter((_, i) => i !== index));
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(Math.max(0, frames.length - 2));
    }
  };

  const handleDuplicateFrame = (index) => {
    setFrames(prev => {
      const copy = [...prev];
      const orig = copy[index];
      copy.splice(index + 1, 0, {
        ...orig,
        id: `frame_${Date.now()}_dup`,
        name: `${orig.name} (Copy)`
      });
      return copy;
    });
  };

  const handleReverseFrames = () => {
    setFrames(prev => [...prev].reverse());
  };

  const handleApplyDelayToAll = (newDelay) => {
    setGlobalDelayMs(newDelay);
    setFrames(prev => prev.map(f => ({ ...f, delayMs: newDelay })));
  };

  const handleFrameDelayChange = (index, newDelay) => {
    setFrames(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], delayMs: Math.max(10, parseInt(newDelay, 10) || 10) };
      return copy;
    });
  };

  // Get image from cache or instantiate
  const getImage = useCallback((url) => {
    if (!url) return null;
    if (imageCacheRef.current.has(url)) {
      return imageCacheRef.current.get(url);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    imageCacheRef.current.set(url, img);
    return img;
  }, []);

  // Preload frame images into memory cache
  useEffect(() => {
    frames.forEach(f => {
      if (f.url && !imageCacheRef.current.has(f.url)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = f.url;
        imageCacheRef.current.set(f.url, img);
      }
    });
  }, [frames]);

  // Live Canvas Animation Playback Loop with Transition Tweens
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    if (transitionType === 'none' || frames.length <= 1) {
      const currentFrame = frames[currentFrameIndex];
      const delay = (currentFrame?.delayMs || globalDelayMs) || 200;

      playTimerRef.current = setTimeout(() => {
        setCurrentFrameIndex(prev => (prev + 1) % frames.length);
        setCurrentTweenStep(0);
      }, delay);
    } else if (currentTweenStep === 0) {
      const currentFrame = frames[currentFrameIndex];
      const delay = (currentFrame?.delayMs || globalDelayMs) || 200;

      playTimerRef.current = setTimeout(() => {
        setCurrentTweenStep(1);
      }, delay);
    } else if (currentTweenStep < transitionSteps) {
      playTimerRef.current = setTimeout(() => {
        setCurrentTweenStep(prev => prev + 1);
      }, transitionDelayMs);
    } else {
      playTimerRef.current = setTimeout(() => {
        setCurrentTweenStep(0);
        setCurrentFrameIndex(prev => (prev + 1) % frames.length);
      }, transitionDelayMs);
    }

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [
    isPlaying,
    currentFrameIndex,
    currentTweenStep,
    frames,
    globalDelayMs,
    transitionType,
    transitionSteps,
    transitionDelayMs
  ]);

  // Automatically detect natural source dimensions from the first frame
  useEffect(() => {
    if (frames.length > 0 && frames[0]?.url) {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setFirstFrameDim({ width: img.naturalWidth, height: img.naturalHeight });
        }
      };
      img.src = frames[0].url;
    }
  }, [frames]);

  // Determine output canvas dimensions with safe fallback
  const computedDimensions = useMemo(() => {
    if (canvasSizeMode === 'square') return { width: 600, height: 600 };
    if (canvasSizeMode === 'custom') {
      const w = Math.min(4096, Math.max(1, parseInt(customWidth, 10) || 600));
      const h = Math.min(4096, Math.max(1, parseInt(customHeight, 10) || 600));
      return { width: w, height: h };
    }
    return firstFrameDim;
  }, [canvasSizeMode, customWidth, customHeight, firstFrameDim]);

  // Helper to draw an image onto canvas with aspect ratio rules and optional transform
  const drawFrameHelper = useCallback((ctx, img, targetW, targetH, fit, transform = 'none') => {
    if (!img) return;
    const imgW = img.naturalWidth || img.width || targetW;
    const imgH = img.naturalHeight || img.height || targetH;

    const scale = fit === 'cover'
      ? Math.max(targetW / imgW, targetH / imgH)
      : fit === 'stretch'
      ? 1
      : Math.min(targetW / imgW, targetH / imgH);

    const dw = fit === 'stretch' ? targetW : imgW * scale;
    const dh = fit === 'stretch' ? targetH : imgH * scale;
    const dx = (targetW - dw) / 2;
    const dy = (targetH - dh) / 2;

    ctx.save();
    if (transform && transform !== 'none') {
      ctx.translate(targetW / 2, targetH / 2);
      if (transform.includes('scale(')) {
        const match = transform.match(/scale\(([^)]+)\)/);
        if (match) {
          const s = parseFloat(match[1]);
          if (!isNaN(s)) ctx.scale(s, s);
        }
      }
      if (transform.includes('rotate(')) {
        const match = transform.match(/rotate\(([^)]+)\)/);
        if (match) {
          const deg = parseFloat(match[1]);
          if (!isNaN(deg)) ctx.rotate((deg * Math.PI) / 180);
        }
      }
      if (transform.includes('skewX(')) {
        const match = transform.match(/skewX\(([^)]+)\)/);
        if (match) {
          const deg = parseFloat(match[1]);
          if (!isNaN(deg)) ctx.transform(1, 0, Math.tan((deg * Math.PI) / 180), 1, 0, 0);
        }
      }
      ctx.translate(-targetW / 2, -targetH / 2);
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }, []);

  const drawImageToCanvas = useCallback((ctx, img, targetW, targetH, fit, bg, transform = 'none') => {
    ctx.clearRect(0, 0, targetW, targetH);

    if (bg && bg !== 'transparent') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, targetW, targetH);
    }

    drawFrameHelper(ctx, img, targetW, targetH, fit, transform);
  }, [drawFrameHelper]);

  const drawTransitionToCanvas = useCallback((ctx, imgA, imgB, t, type, targetW, targetH, fit, bg, transformA = 'none', transformB = 'none') => {
    ctx.clearRect(0, 0, targetW, targetH);

    if (bg && bg !== 'transparent') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, targetW, targetH);
    }

    if (type === 'crossfade') {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t);
      drawFrameHelper(ctx, imgA, targetW, targetH, fit, transformA);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = Math.min(1, t);
      drawFrameHelper(ctx, imgB, targetW, targetH, fit, transformB);
      ctx.restore();
    } else if (type === 'slide-left') {
      ctx.save();
      ctx.translate(-t * targetW, 0);
      drawFrameHelper(ctx, imgA, targetW, targetH, fit, transformA);
      ctx.restore();

      ctx.save();
      ctx.translate((1 - t) * targetW, 0);
      drawFrameHelper(ctx, imgB, targetW, targetH, fit, transformB);
      ctx.restore();
    } else if (type === 'slide-right') {
      ctx.save();
      ctx.translate(t * targetW, 0);
      drawFrameHelper(ctx, imgA, targetW, targetH, fit, transformA);
      ctx.restore();

      ctx.save();
      ctx.translate(-(1 - t) * targetW, 0);
      drawFrameHelper(ctx, imgB, targetW, targetH, fit, transformB);
      ctx.restore();
    } else if (type === 'slide-up') {
      ctx.save();
      ctx.translate(0, -t * targetH);
      drawFrameHelper(ctx, imgA, targetW, targetH, fit, transformA);
      ctx.restore();

      ctx.save();
      ctx.translate(0, (1 - t) * targetH);
      drawFrameHelper(ctx, imgB, targetW, targetH, fit, transformB);
      ctx.restore();
    } else if (type === 'fade-black') {
      if (t < 0.5) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - (t * 2));
        drawFrameHelper(ctx, imgA, targetW, targetH, fit, transformA);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - 0.5) * 2);
        drawFrameHelper(ctx, imgB, targetW, targetH, fit, transformB);
        ctx.restore();
      }
    } else if (type === 'zoom') {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t);
      const scaleA = 1 + t * 0.18;
      ctx.translate(targetW / 2, targetH / 2);
      ctx.scale(scaleA, scaleA);
      ctx.translate(-targetW / 2, -targetH / 2);
      drawFrameHelper(ctx, imgA, targetW, targetH, fit, transformA);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = Math.min(1, t);
      const scaleB = 0.82 + t * 0.18;
      ctx.translate(targetW / 2, targetH / 2);
      ctx.scale(scaleB, scaleB);
      ctx.translate(-targetW / 2, -targetH / 2);
      drawFrameHelper(ctx, imgB, targetW, targetH, fit, transformB);
      ctx.restore();
    } else if (type === 'wipe-left') {
      ctx.save();
      drawFrameHelper(ctx, imgA, targetW, targetH, fit, transformA);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, targetW * t, targetH);
      ctx.clip();
      drawFrameHelper(ctx, imgB, targetW, targetH, fit, transformB);
      ctx.restore();
    } else {
      drawFrameHelper(ctx, imgA, targetW, targetH, fit, transformA);
    }
  }, [drawFrameHelper]);

  // Update live preview canvas when currentFrameIndex or currentTweenStep changes
  useEffect(() => {
    if (!playerCanvasRef.current || frames.length === 0) return;
    const activeFrame = frames[currentFrameIndex];
    if (!activeFrame) return;

    const canvas = playerCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetW = canvas.width;
    const targetH = canvas.height;
    const bg = BG_COLOR_MAP[canvasBg] || 'transparent';

    const imgA = getImage(activeFrame.url);
    const nextIdx = (currentFrameIndex + 1) % frames.length;
    const nextFrame = frames[nextIdx];
    const imgB = nextFrame ? getImage(nextFrame.url) : null;

    const render = () => {
      if (transitionType === 'none' || currentTweenStep === 0 || !imgB || frames.length <= 1) {
        drawImageToCanvas(
          ctx,
          imgA,
          targetW,
          targetH,
          fitMode,
          bg,
          activeFrame.transform || 'none'
        );
      } else {
        const t = currentTweenStep / (transitionSteps + 1);
        drawTransitionToCanvas(
          ctx,
          imgA,
          imgB,
          t,
          transitionType,
          targetW,
          targetH,
          fitMode,
          bg,
          activeFrame.transform || 'none',
          nextFrame.transform || 'none'
        );
      }
    };

    if (imgA && imgA.complete && (!imgB || imgB.complete)) {
      render();
    } else {
      let isSubscribed = true;
      const onDone = () => {
        if (isSubscribed) render();
      };
      if (imgA && !imgA.complete) imgA.onload = onDone;
      if (imgB && !imgB.complete) imgB.onload = onDone;
      return () => { isSubscribed = false; };
    }
  }, [
    currentFrameIndex,
    currentTweenStep,
    frames,
    fitMode,
    canvasBg,
    transitionType,
    transitionSteps,
    drawImageToCanvas,
    drawTransitionToCanvas,
    getImage
  ]);

  // Generate Animated GIF with transitions support
  const handleGenerateGif = async () => {
    if (frames.length === 0) {
      setErrorNotice('Please add at least one image or animation frame.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(5);
    setErrorNotice(null);

    try {
      const targetW = computedDimensions.width;
      const targetH = computedDimensions.height;
      const bg = BG_COLOR_MAP[canvasBg] || 'transparent';

      // Prepare sequence (support Ping-Pong loop if enabled)
      let sequenceFrames = [...frames];
      if (isPingPong && frames.length > 2) {
        const reverseSlice = [...frames.slice(1, -1)].reverse();
        sequenceFrames = [...frames, ...reverseSlice];
      }

      // Preload all unique images
      const loadedImageMap = new Map();
      for (const f of sequenceFrames) {
        if (!loadedImageMap.has(f.url)) {
          const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Failed to load frame ${f.name}`));
            image.src = f.url;
          });
          loadedImageMap.set(f.url, img);
        }
      }

      const encodedFrames = [];
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const totalItems = sequenceFrames.length;

      for (let i = 0; i < totalItems; i++) {
        setGenerationProgress(Math.round(((i + 1) / totalItems) * 85));
        const f = sequenceFrames[i];
        const nextF = sequenceFrames[(i + 1) % totalItems];
        const imgA = loadedImageMap.get(f.url);
        const imgB = loadedImageMap.get(nextF.url);

        // 1. Draw main frame
        drawImageToCanvas(ctx, imgA, targetW, targetH, fitMode, bg, f.transform || 'none');
        encodedFrames.push({
          imageData: ctx.getImageData(0, 0, targetW, targetH),
          delayMs: f.delayMs || globalDelayMs,
          disposal: 2
        });

        // 2. Draw transition tweens if enabled
        if (transitionType !== 'none' && totalItems > 1 && imgB) {
          for (let step = 1; step <= transitionSteps; step++) {
            const t = step / (transitionSteps + 1);
            drawTransitionToCanvas(
              ctx,
              imgA,
              imgB,
              t,
              transitionType,
              targetW,
              targetH,
              fitMode,
              bg,
              f.transform || 'none',
              nextF.transform || 'none'
            );
            encodedFrames.push({
              imageData: ctx.getImageData(0, 0, targetW, targetH),
              delayMs: transitionDelayMs,
              disposal: 2
            });
          }
        }
      }

      setGenerationProgress(92);

      // Encode into GIF89a binary
      rawFramesRef.current = encodedFrames;
      const gifBlob = encodeFramesToAnimatedGif(encodedFrames, {
        width: targetW,
        height: targetH,
        loopCount
      });

      const gifUrl = registerUrl(URL.createObjectURL(gifBlob));
      setOutputGifBlob(gifBlob);
      setOutputGifUrl(gifUrl);
      setOptimizationNotice(null);
      setOutputStats({
        sizeBytes: gifBlob.size,
        sizeKb: Math.round((gifBlob.size / 1024) * 10) / 10,
        originalSizeKb: Math.round((gifBlob.size / 1024) * 10) / 10,
        frameCount: encodedFrames.length,
        width: targetW,
        height: targetH,
        fps: Math.round(1000 / (globalDelayMs || 200))
      });

      setGenerationProgress(100);
    } catch (err) {
      console.error('GIF Generation failed:', err);
      setErrorNotice(err.message || 'Failed to encode animated GIF. Please verify image inputs.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Send generated animated GIF directly to StudioCompressor
  const handleSendToCompressor = () => {
    if (!outputGifBlob) return;

    const w = outputStats?.width || 500;
    const h = outputStats?.height || 500;
    const fileName = `rynell_animation_${w}x${h}_${Date.now()}.gif`;
    const file = new File([outputGifBlob], fileName, { type: 'image/gif' });

    window.dispatchEvent(new CustomEvent('rynell:compress-image', {
      detail: { file }
    }));

    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3500);

    const targetEl = document.getElementById('image-compressor');
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Re-encode GIF with lower color palette or unified table to crush bytes in-place
  const handleOptimizeInMaker = async (options = {}) => {
    if (!rawFramesRef.current || rawFramesRef.current.length === 0 || !outputStats) return;

    try {
      setIsOptimizing(true);
      setErrorNotice(null);

      const targetColors = options.maxColors || 128;
      const useUnified = options.useGlobalPaletteOnly !== undefined ? options.useGlobalPaletteOnly : false;

      const optimizedBlob = encodeFramesToAnimatedGif(rawFramesRef.current, {
        width: outputStats.width,
        height: outputStats.height,
        loopCount,
        maxColors: targetColors,
        useGlobalPaletteOnly: useUnified
      });

      const origKb = outputStats.originalSizeKb || outputStats.sizeKb;
      const newKb = Math.round((optimizedBlob.size / 1024) * 10) / 10;
      const savedKb = Math.round((origKb - newKb) * 10) / 10;
      const savedPercent = origKb > 0 ? Math.round(((origKb - newKb) / origKb) * 100) : 0;

      const newUrl = registerUrl(URL.createObjectURL(optimizedBlob));
      setOutputGifBlob(optimizedBlob);
      setOutputGifUrl(newUrl);
      setOutputStats(prev => ({
        ...prev,
        sizeBytes: optimizedBlob.size,
        sizeKb: newKb,
        originalSizeKb: origKb,
        savedPercent: savedPercent > 0 ? savedPercent : null,
        activePresetLabel: options.label || `${targetColors} Colors`
      }));

      setOptimizationNotice(
        savedPercent > 0 
          ? `📉 CRUSHED ${savedPercent}%: SAVED ${savedKb} KB (${origKb} KB → ${newKb} KB)!`
          : `✨ RE-ENCODED AT ${newKb} KB`
      );
    } catch (err) {
      console.error('In-maker optimization failed:', err);
      setErrorNotice('Could not optimize GIF: ' + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <section id="gif-maker" className="studio-gif-section bg-halftone">
      <div className="gif-maker-container">
        
        {/* Section Header */}
        <div 
          className={`gif-header-row ${isLiveEditMode && isCmsAdmin ? 'cms-editable-target' : ''}`}
          onClick={() => isLiveEditMode && isCmsAdmin && openCms('studioTools')}
        >
          <div className="section-label">
            {t('studioTools.gifMaker.sectionLabel', 'ANIMATED GIF MAKER // STUDIO TIMELINE')}
          </div>
          <h2 className="gif-main-title comic-text">
            {t('studioTools.gifMaker.title', 'STUDIO ANIMATED GIF MAKER & COMPOSER')}
          </h2>
          <p className="gif-sub-desc">
            {t('studioTools.gifMaker.subDescription', 'Ultra-responsive multi-file animation suite. Assemble multiple photos, vector SVGs, PNGs, and archive bundles into studio-grade animated GIFs with frame-accurate delays, live canvas scrubbing, and instant 1-click export.')}
          </p>
        </div>

        {/* Studio Specs & Privacy Notice Bar */}
        <div className="studio-specs-banner">
          <div className="spec-item format-spec">
            <span className="spec-glyph">🎞️</span>
            <div className="spec-text-block">
              <span className="spec-title">SUPPORTED FORMATS & ARCHIVES</span>
              <span className="spec-desc">
                GIF, JPG, PNG, APNG, HEIC, HEIF, MNG, JP2, AVIF, JXL, BMP, PDF, ANIM, CDXL, FLI, FLC, BPG, WebP, Aseprite or other images • ZIP, 7z, TAR, RAR archives
              </span>
            </div>
          </div>

          <div className="spec-item size-spec">
            <span className="spec-glyph">⚡</span>
            <div className="spec-text-block">
              <span className="spec-title">MAX TOTAL FILE SIZE</span>
              <span className="spec-desc">200MB Upload Capacity • Multi-File Parallel Extraction</span>
            </div>
          </div>

          <div className="spec-item purge-spec">
            <span className="spec-glyph">🛡️</span>
            <div className="spec-text-block">
              <span className="spec-title">EPHEMERAL ZERO-RETENTION VAULT</span>
              <span className="spec-desc">
                All uploaded files are automatically deleted 1 hour after upload ({formatCountdown(expirySeconds)} remaining)
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorNotice && (
          <div className="gif-error-banner" role="alert">
            <span className="alert-tag">ALERT</span>
            <span className="alert-msg">{errorNotice}</span>
            <button type="button" className="alert-dismiss" onClick={() => setErrorNotice(null)}>✕</button>
          </div>
        )}

        {/* Demo Sequences & Quick Starters */}
        <div className="demo-starter-bar">
          <span className="starter-label">LOAD READY-TO-TEST DEMO SEQUENCE:</span>
          <div className="starter-buttons-row">
            {DEMO_SEQUENCES.map((demo) => (
              <button
                key={demo.id}
                type="button"
                className="starter-demo-btn"
                onClick={() => handleLoadDemoSequence(demo.id)}
              >
                {demo.title}
              </button>
            ))}
          </div>
        </div>

        {/* Workbench: Live Player (Left) & Parameters (Right) */}
        <div className="gif-workbench-grid">
          
          {/* Column 1: Live Interactive Canvas Player */}
          <div className="workbench-pane player-pane">
            <div className="pane-header">
              <span className="pane-title">LIVE PREVIEW PLAYER</span>
              <span className="frame-counter-pill">
                FRAME {frames.length > 0 ? currentFrameIndex + 1 : 0} OF {frames.length}
                {currentTweenStep > 0 && ` ➔ TRANSITION (${Math.round((currentTweenStep / (transitionSteps + 1)) * 100)}%)`}
              </span>
            </div>

            <div className="player-viewport-wrap">
              <canvas
                ref={playerCanvasRef}
                width={computedDimensions.width}
                height={computedDimensions.height}
                className={`player-canvas bg-${canvasBg}`}
              />

              {frames.length === 0 && (
                <div className="empty-player-overlay">
                  <span>⚡ NO FRAMES LOADED</span>
                  <small>Drop images or choose a sample sequence above</small>
                </div>
              )}
            </div>

            {/* Playback Controls Strip */}
            <div className="player-control-strip">
              <div className="playback-btns">
                <button
                  type="button"
                  className="ctrl-btn play-pause-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  title={isPlaying ? 'Pause Animation' : 'Play Animation'}
                >
                  {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                </button>
                <button
                  type="button"
                  className="ctrl-btn step-btn"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTweenStep(0);
                    setCurrentFrameIndex(prev => (prev - 1 + frames.length) % Math.max(1, frames.length));
                  }}
                  title="Previous Frame"
                >
                  ⏮ STEP BACK
                </button>
                <button
                  type="button"
                  className="ctrl-btn step-btn"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTweenStep(0);
                    setCurrentFrameIndex(prev => (prev + 1) % Math.max(1, frames.length));
                  }}
                  title="Next Frame"
                >
                  STEP NEXT ⏭
                </button>
              </div>

              {/* Scrubber slider */}
              {frames.length > 1 && (
                <div className="timeline-scrubber">
                  <input
                    type="range"
                    min="0"
                    max={frames.length - 1}
                    value={currentFrameIndex}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setCurrentTweenStep(0);
                      setCurrentFrameIndex(parseInt(e.target.value, 10));
                    }}
                    className="scrubber-range"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Parameters & Output Controls */}
          <div className="workbench-pane settings-pane">
            <div className="pane-header">
              <span className="pane-title">ANIMATION CONTROLS</span>
              <button type="button" className="clear-all-link" onClick={handleClearAll}>
                🗑️ CLEAR ALL
              </button>
            </div>

            <div className="settings-stack">
              
              {/* Global Delay & Speed Slider */}
              <div className="param-field">
                <div className="field-label-row">
                  <label htmlFor="global-delay-input">GLOBAL FRAME DELAY:</label>
                  <strong className="field-metric">{globalDelayMs} MS ({Math.round(1000 / (globalDelayMs || 100))} FPS)</strong>
                </div>
                <input
                  id="global-delay-input"
                  type="range"
                  min="30"
                  max="1200"
                  step="10"
                  value={globalDelayMs}
                  onChange={(e) => handleApplyDelayToAll(parseInt(e.target.value, 10))}
                  className="studio-slider"
                />
                <div className="quick-presets-row">
                  {[100, 200, 300, 500, 800].map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`preset-btn ${globalDelayMs === d ? 'active' : ''}`}
                      onClick={() => handleApplyDelayToAll(d)}
                    >
                      {d}ms ({Math.round(1000 / d)}fps)
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas Resolution & Aspect Ratio */}
              <div className="param-field">
                <label className="field-label">CANVAS DIMENSIONS & FITTING:</label>
                <div className="radio-pill-group">
                  <button
                    type="button"
                    className={`pill-btn ${canvasSizeMode === 'first' ? 'active' : ''}`}
                    onClick={() => setCanvasSizeMode('first')}
                  >
                    FIT SOURCE ({firstFrameDim.width}×{firstFrameDim.height})
                  </button>
                  <button
                    type="button"
                    className={`pill-btn ${canvasSizeMode === 'square' ? 'active' : ''}`}
                    onClick={() => setCanvasSizeMode('square')}
                  >
                    SQUARE 600×600
                  </button>
                  <button
                    type="button"
                    className={`pill-btn ${canvasSizeMode === 'custom' ? 'active' : ''}`}
                    onClick={() => setCanvasSizeMode('custom')}
                  >
                    CUSTOM
                  </button>
                </div>

                {canvasSizeMode === 'custom' && (
                  <div className="custom-size-container">
                    <div className="custom-size-row">
                      <div className="size-input-wrapper">
                        <label className="size-sublabel">WIDTH</label>
                        <input
                          type="number"
                          min="1"
                          max="4096"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          onBlur={() => {
                            const num = parseInt(customWidth, 10);
                            if (!num || isNaN(num) || num < 1) {
                              setCustomWidth(600);
                            } else {
                              setCustomWidth(Math.min(4096, Math.max(1, num)));
                            }
                          }}
                          placeholder="Width"
                          className="size-input"
                        />
                      </div>
                      <span className="size-times">×</span>
                      <div className="size-input-wrapper">
                        <label className="size-sublabel">HEIGHT</label>
                        <input
                          type="number"
                          min="1"
                          max="4096"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          onBlur={() => {
                            const num = parseInt(customHeight, 10);
                            if (!num || isNaN(num) || num < 1) {
                              setCustomHeight(600);
                            } else {
                              setCustomHeight(Math.min(4096, Math.max(1, num)));
                            }
                          }}
                          placeholder="Height"
                          className="size-input"
                        />
                      </div>
                      <span className="size-unit">PX</span>
                    </div>

                    <div className="custom-presets-row">
                      {[
                        { label: '320×320', w: 320, h: 320 },
                        { label: '480×480', w: 480, h: 480 },
                        { label: '500×500', w: 500, h: 500 },
                        { label: '640×640', w: 640, h: 640 },
                        { label: '800×800', w: 800, h: 800 },
                        { label: '1080×1080', w: 1080, h: 1080 },
                        { label: '1280×720 (16:9)', w: 1280, h: 720 },
                        { label: '720×1280 (9:16)', w: 720, h: 1280 }
                      ].map(p => (
                        <button
                          key={p.label}
                          type="button"
                          className={`size-preset-pill ${Number(customWidth) === p.w && Number(customHeight) === p.h ? 'active' : ''}`}
                          onClick={() => {
                            setCustomWidth(p.w);
                            setCustomHeight(p.h);
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fit Mode & Background */}
              <div className="param-grid-2">
                <div className="param-field">
                  <label className="field-label">FRAME FIT:</label>
                  <div className="btn-group-row">
                    {['contain', 'cover', 'stretch'].map(m => (
                      <button
                        key={m}
                        type="button"
                        className={`pill-btn small ${fitMode === m ? 'active' : ''}`}
                        onClick={() => setFitMode(m)}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="param-field">
                  <label className="field-label">CANVAS BG:</label>
                  <div className="btn-group-row">
                    {['transparent', 'black', 'white', 'orange'].map(bg => (
                      <button
                        key={bg}
                        type="button"
                        className={`pill-btn small ${canvasBg === bg ? 'active' : ''}`}
                        onClick={() => setCanvasBg(bg)}
                      >
                        {bg === 'transparent' ? 'TRANS' : bg.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Frame Transitions (Tweens between images) */}
              <div className="param-field transition-control-group">
                <div className="field-label-row">
                  <label className="field-label">TRANSITION BETWEEN IMAGES:</label>
                  <span className="transition-mode-badge">{transitionType.toUpperCase()}</span>
                </div>

                <div className="transition-pills-grid">
                  {[
                    { id: 'none', label: 'CUT (NONE)' },
                    { id: 'crossfade', label: 'CROSS-FADE' },
                    { id: 'slide-left', label: 'SLIDE LEFT' },
                    { id: 'slide-right', label: 'SLIDE RIGHT' },
                    { id: 'slide-up', label: 'SLIDE UP' },
                    { id: 'fade-black', label: 'DIP TO BLACK' },
                    { id: 'zoom', label: 'ZOOM PULSE' },
                    { id: 'wipe-left', label: 'BAR WIPE' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`pill-btn small transition-btn ${transitionType === t.id ? 'active' : ''}`}
                      onClick={() => {
                        setTransitionType(t.id);
                        setCurrentTweenStep(0);
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {transitionType !== 'none' && (
                  <div className="transition-subcontrols">
                    <div className="subcontrol-row">
                      <span className="subcontrol-label">SMOOTHNESS (TWEEN FRAMES):</span>
                      <div className="btn-group-row">
                        {[
                          { val: 1, label: '1 TWEEN (SNAPPY)' },
                          { val: 2, label: '2 TWEENS (SMOOTH)' },
                          { val: 3, label: '3 TWEENS (FLUID)' },
                          { val: 4, label: '4 TWEENS (ULTRA)' }
                        ].map(s => (
                          <button
                            key={s.val}
                            type="button"
                            className={`pill-btn micro ${transitionSteps === s.val ? 'active' : ''}`}
                            onClick={() => {
                              setTransitionSteps(s.val);
                              setCurrentTweenStep(0);
                            }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="subcontrol-row">
                      <span className="subcontrol-label">TRANSITION SPEED:</span>
                      <div className="btn-group-row">
                        {[
                          { ms: 40, label: '40MS (FAST)' },
                          { ms: 70, label: '70MS (NORMAL)' },
                          { ms: 100, label: '100MS (CINEMATIC)' },
                          { ms: 140, label: '140MS (SLOW)' }
                        ].map(speed => (
                          <button
                            key={speed.ms}
                            type="button"
                            className={`pill-btn micro ${transitionDelayMs === speed.ms ? 'active' : ''}`}
                            onClick={() => setTransitionDelayMs(speed.ms)}
                          >
                            {speed.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Loop & Ping Pong */}
              <div className="param-field">
                <div className="checkbox-options-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isPingPong}
                      onChange={(e) => setIsPingPong(e.target.checked)}
                    />
                    <span>🔀 PING-PONG LOOP (FORWARD THEN REVERSE)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={loopCount === 0}
                      onChange={(e) => setLoopCount(e.target.checked ? 0 : 3)}
                    />
                    <span>♾️ INFINITE LOOP (STANDARD)</span>
                  </label>
                </div>
              </div>

              {/* Generation Trigger */}
              <div className="generate-cta-wrap">
                <button
                  type="button"
                  className="studio-btn-primary make-gif-btn"
                  onClick={handleGenerateGif}
                  disabled={isGenerating || frames.length === 0}
                >
                  {isGenerating 
                    ? `⏳ COMPOSING GIF (${generationProgress}%)...` 
                    : `⚡ GENERATE ANIMATED GIF (${transitionType !== 'none' && frames.length > 1 ? frames.length * (transitionSteps + 1) : frames.length} FRAMES${transitionType !== 'none' ? ` // ${transitionType.toUpperCase()}` : ''})`}
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Frame Timeline Strip & File Dropzone */}
        <div className="timeline-strip-container">
          <div className="timeline-strip-head">
            <div className="head-text">
              <span className="timeline-badge">FRAME SEQUENCE TIMELINE</span>
              <h3 className="timeline-title">ARRANGE & FINE-TUNE INDIVIDUAL FRAMES</h3>
            </div>

            <div className="timeline-quick-actions">
              <button type="button" className="action-pill-btn" onClick={handleReverseFrames}>
                ⇄ REVERSE ORDER
              </button>
              <button 
                type="button" 
                className="action-pill-btn add-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                + ADD MORE IMAGES / ARCHIVE
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.gif,.jpg,.jpeg,.png,.apng,.webp,.avif,.heic,.heif,.mng,.jp2,.jxl,.bmp,.pdf,.anim,.cdxl,.fli,.flc,.bpg,.ase,.aseprite,.svg,.zip,.7z,.tar,.rar"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && processIncomingFiles(e.target.files)}
          />

          {/* Dropzone Container */}
          <div
            className={`multi-dropzone ${isDragging ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {frames.length === 0 ? (
              <div className="dropzone-empty-hero" onClick={() => fileInputRef.current?.click()}>
                <span className="drop-icon">📦</span>
                <span className="drop-text">DROP MULTIPLE IMAGES OR ZIP/TAR ARCHIVE HERE</span>
                <span className="drop-sub">Select multiple files, animated sequences, or archives up to 200MB</span>
              </div>
            ) : (
              <div className="timeline-cards-row">
                {frames.map((frame, index) => {
                  const isActive = currentFrameIndex === index;
                  return (
                    <div 
                      key={frame.id}
                      className={`frame-card ${isActive ? 'active-frame' : ''}`}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentTweenStep(0);
                        setCurrentFrameIndex(index);
                      }}
                    >
                      <div className="frame-card-top">
                        <span className="frame-idx-badge">#{index + 1}</span>
                        <div className="frame-card-mini-actions">
                          <button
                            type="button"
                            className="mini-btn"
                            disabled={index === 0}
                            onClick={(e) => { e.stopPropagation(); handleMoveFrame(index, -1); }}
                            title="Move Left"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            className="mini-btn"
                            disabled={index === frames.length - 1}
                            onClick={(e) => { e.stopPropagation(); handleMoveFrame(index, 1); }}
                            title="Move Right"
                          >
                            ▶
                          </button>
                          <button
                            type="button"
                            className="mini-btn"
                            onClick={(e) => { e.stopPropagation(); handleDuplicateFrame(index); }}
                            title="Duplicate Frame"
                          >
                            📋
                          </button>
                          <button
                            type="button"
                            className="mini-btn del"
                            onClick={(e) => { e.stopPropagation(); handleDeleteFrame(index); }}
                            title="Delete Frame"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="frame-thumb-viewport">
                        <img src={frame.url} alt={frame.name} draggable="false" />
                      </div>

                      <div className="frame-card-foot" onClick={(e) => e.stopPropagation()}>
                        <label className="frame-delay-label">DELAY:</label>
                        <input
                          type="number"
                          value={frame.delayMs || globalDelayMs}
                          onChange={(e) => handleFrameDelayChange(index, e.target.value)}
                          className="frame-delay-input"
                          step="10"
                          min="10"
                        />
                        <span className="ms-unit">MS</span>
                      </div>
                    </div>
                  );
                })}

                {/* Add Card Tile */}
                <div className="add-frame-tile" onClick={() => fileInputRef.current?.click()}>
                  <span className="add-glyph">+</span>
                  <span className="add-txt">ADD FILES</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Banner & Download Section */}
        {outputGifUrl && outputStats && (
          <div className="gif-results-card">
            <div className="results-header">
              <span className="results-badge">GENERATION COMPLETE</span>
              <h3 className="results-title">YOUR ANIMATED GIF IS READY</h3>
            </div>

            <div className="results-body">
              <div className="gif-result-preview-wrap">
                <img src={outputGifUrl} alt="Generated Animated GIF" className="result-gif-img" />
              </div>

              <div className="results-meta-column">
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-lbl">FILE SIZE</span>
                    <span className="stat-val highlight">{outputStats.sizeKb} KB</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-lbl">FRAME COUNT</span>
                    <span className="stat-val">{outputStats.frameCount} FRAMES</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-lbl">CANVAS RESOLUTION</span>
                    <span className="stat-val">{outputStats.width} × {outputStats.height} PX</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-lbl">APPROX SPEED</span>
                    <span className="stat-val">{outputStats.fps} FPS</span>
                  </div>
                </div>

                {/* Quick In-Maker GIF Compression / Palette Squeezer */}
                <div className="gif-compress-box">
                  <div className="compress-box-header">
                    <span className="compress-box-title">🗜️ QUICK GIF COMPRESSION & SQUEEZE</span>
                    <span className="compress-box-sub">
                      GIF is ideal for smaller canvases and inflates quickly on large sizes. Squeeze palette depth to crush file size instantly:
                    </span>
                  </div>

                  <div className="compress-presets-actions">
                    <button
                      type="button"
                      className={`compress-action-pill ${outputStats.activePresetLabel === '128 Colors' ? 'active' : ''}`}
                      onClick={() => handleOptimizeInMaker({ maxColors: 128, useGlobalPaletteOnly: false, label: '128 Colors' })}
                      disabled={isOptimizing}
                      title="Quantize to 128 colors (saves ~30-40% file size)"
                    >
                      {isOptimizing ? '⏳ SQUEEZING...' : '📉 128 COLORS (-35%)'}
                    </button>
                    <button
                      type="button"
                      className={`compress-action-pill ${outputStats.activePresetLabel === '64 Colors' ? 'active' : ''}`}
                      onClick={() => handleOptimizeInMaker({ maxColors: 64, useGlobalPaletteOnly: false, label: '64 Colors' })}
                      disabled={isOptimizing}
                      title="Quantize to 64 colors (saves ~55% file size)"
                    >
                      {isOptimizing ? '⏳ SQUEEZING...' : '📉 64 COLORS (-55%)'}
                    </button>
                    <button
                      type="button"
                      className={`compress-action-pill ${outputStats.activePresetLabel === 'Unified Table' ? 'active' : ''}`}
                      onClick={() => handleOptimizeInMaker({ maxColors: 128, useGlobalPaletteOnly: true, label: 'Unified Table' })}
                      disabled={isOptimizing}
                      title="Reuses one unified color table across all frames"
                    >
                      {isOptimizing ? '⏳ SQUEEZING...' : '🌐 UNIFIED PALETTE (-40%)'}
                    </button>
                    <button
                      type="button"
                      className="compress-action-pill reset"
                      onClick={() => handleOptimizeInMaker({ maxColors: 256, useGlobalPaletteOnly: false, label: 'Full 256 Colors' })}
                      disabled={isOptimizing}
                      title="Restore full 256 colors maximum quality"
                    >
                      🛡️ FULL 256
                    </button>
                  </div>

                  {optimizationNotice && (
                    <div className="opt-notice-badge">
                      {optimizationNotice}
                    </div>
                  )}
                </div>

                <div className="results-cta-actions">
                  <a
                    href={outputGifUrl}
                    download="RYNELL_STUDIO_ANIMATION.gif"
                    className="studio-btn-primary dl-btn"
                  >
                    📥 DOWNLOAD ANIMATED .GIF
                  </a>
                  <button
                    type="button"
                    className="studio-btn-primary send-compressor-btn"
                    onClick={handleSendToCompressor}
                    title="Send this GIF directly into Studio Compressor for MozJPEG/WebP transcoding & advanced optimization"
                  >
                    ⚡ SEND TO STUDIO COMPRESSOR
                  </button>
                  <button
                    type="button"
                    className="studio-btn-secondary"
                    onClick={() => {
                      const w = window.open('');
                      w?.document.write(`<img src="${outputGifUrl}" style="background:#000;display:block;margin:auto;" />`);
                    }}
                  >
                    🔍 OPEN IN NEW TAB
                  </button>
                </div>

                {sentNotice && (
                  <div className="sent-compressor-pill">
                    ⚡ GIF SENT TO STUDIO COMPRESSOR! SCROLLED TO OPTIMIZER QUEUE.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .studio-gif-section {
          padding: 6rem 2rem;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          border-bottom: 4px solid var(--border-color);
        }

        .gif-maker-container {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .gif-header-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .gif-main-title {
          font-family: var(--font-heading);
          font-size: 3.2rem;
          line-height: 1;
          letter-spacing: 2px;
          text-transform: uppercase;
          transform: skewX(-10deg);
          margin: 0;
        }

        .gif-sub-desc {
          font-family: var(--font-body);
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 860px;
          line-height: 1.6;
          margin: 0;
        }

        /* Specs & Policy Banner */
        .studio-specs-banner {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr;
          gap: 1rem;
          background: var(--bg-card);
          border: 3px solid var(--text-primary);
          box-shadow: 6px 6px 0 var(--primary-orange);
          padding: 1rem 1.25rem;
        }

        .spec-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .spec-glyph {
          font-size: 1.5rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .spec-text-block {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .spec-title {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1.2px;
          font-weight: 800;
          color: var(--primary-orange);
        }

        .spec-desc {
          font-family: var(--font-body);
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Error Alert */
        .gif-error-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #ffebe8;
          border: 3px solid #ff3b30;
          color: #900;
          padding: 0.85rem 1.25rem;
          box-shadow: 4px 4px 0 #ff3b30;
        }

        .alert-tag {
          font-family: var(--font-heading);
          background: #ff3b30;
          color: #fff;
          padding: 0.2rem 0.5rem;
          font-size: 0.8rem;
          letter-spacing: 1px;
        }

        .alert-msg {
          flex: 1;
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .alert-dismiss {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
        }

        /* Starter Bar */
        .demo-starter-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          padding: 0.75rem 1.25rem;
        }

        .starter-label {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .starter-buttons-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .starter-demo-btn {
          font-family: var(--font-heading);
          font-size: 0.82rem;
          letter-spacing: 1px;
          padding: 0.4rem 0.85rem;
          background: transparent;
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          box-shadow: 2px 2px 0 var(--text-primary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .starter-demo-btn:hover {
          background: var(--primary-orange);
          color: #fff;
          border-color: var(--primary-orange);
          transform: translateY(-2px);
        }

        /* Workbench Grid */
        .gif-workbench-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 1.5rem;
        }

        .workbench-pane {
          background: var(--bg-card);
          border: 3px solid var(--text-primary);
          box-shadow: 8px 8px 0 var(--primary-orange);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .pane-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .pane-title {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .frame-counter-pill {
          font-family: monospace;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.12);
          border: 1px solid rgba(255, 106, 0, 0.35);
          padding: 0.2rem 0.5rem;
        }

        .clear-all-link {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .clear-all-link:hover {
          color: #ff3b30;
        }

        /* Live Player */
        .player-viewport-wrap {
          width: 100%;
          min-height: 380px;
          background: #000;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .player-canvas {
          max-width: 100%;
          max-height: 420px;
          object-fit: contain;
          display: block;
        }

        .player-canvas.bg-transparent {
          background-image: 
            linear-gradient(45deg, #1c1c1c 25%, transparent 25%), 
            linear-gradient(-45deg, #1c1c1c 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #1c1c1c 75%), 
            linear-gradient(-45deg, transparent 75%, #1c1c1c 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
          background-color: #0d0d0d;
        }

        .player-canvas.bg-black { background: #000; }
        .player-canvas.bg-white { background: #fff; }
        .player-canvas.bg-orange { background: #ff6a00; }

        .empty-player-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          letter-spacing: 1px;
        }

        .player-control-strip {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .playback-btns {
          display: flex;
          gap: 0.5rem;
        }

        .ctrl-btn {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          padding: 0.5rem 1rem;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
        }

        .play-pause-btn {
          background: var(--primary-orange);
          color: #fff;
          border-color: #000;
          box-shadow: 2px 2px 0 #000;
        }

        .timeline-scrubber {
          width: 100%;
        }

        .scrubber-range {
          width: 100%;
          accent-color: var(--primary-orange);
          cursor: pointer;
        }

        /* Settings Stack */
        .settings-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .param-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .field-label-row, .field-label {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .field-metric {
          color: var(--primary-orange);
          font-family: monospace;
        }

        .quick-presets-row, .radio-pill-group, .btn-group-row {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .preset-btn, .pill-btn {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 0.8px;
          padding: 0.35rem 0.75rem;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
        }

        .pill-btn.small {
          font-size: 0.75rem;
          padding: 0.3rem 0.6rem;
        }

        .preset-btn.active, .pill-btn.active {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
        }

        .custom-size-container {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-top: 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.65rem 0.8rem;
        }

        .custom-size-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: monospace;
          font-size: 0.85rem;
        }

        .size-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .size-sublabel {
          font-family: var(--font-heading);
          font-size: 0.62rem;
          letter-spacing: 1px;
          color: #94a3b8;
        }

        .size-times {
          font-weight: 700;
          color: #64748b;
          margin-top: 0.85rem;
        }

        .size-unit {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 1px;
          color: #94a3b8;
          margin-top: 0.85rem;
        }

        .size-input {
          width: 95px;
          padding: 0.4rem 0.6rem;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          font-family: monospace;
          font-size: 0.9rem;
          font-weight: 700;
          outline: none;
          transition: border-color 0.2s;
        }

        .size-input:focus {
          border-color: var(--primary-orange);
        }

        .custom-presets-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.25rem;
        }

        .size-preset-pill {
          font-family: monospace;
          font-size: 0.68rem;
          padding: 0.25rem 0.5rem;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .size-preset-pill:hover {
          background: #1e293b;
          color: #fff;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .size-preset-pill.active {
          background: rgba(255, 106, 0, 0.15);
          color: var(--primary-orange);
          border-color: var(--primary-orange);
          font-weight: 700;
        }

        .param-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* Transitions UI */
        .transition-control-group {
          background: rgba(255, 106, 0, 0.05);
          border: 2px dashed rgba(255, 106, 0, 0.4);
          padding: 0.9rem;
          margin: 0.25rem 0;
        }

        .transition-mode-badge {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.15);
          border: 1px solid rgba(255, 106, 0, 0.45);
          padding: 0.15rem 0.5rem;
          letter-spacing: 0.5px;
        }

        .transition-pills-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
        }

        @media (max-width: 600px) {
          .transition-pills-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .transition-btn {
          text-align: center;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .transition-btn.active {
          background: var(--primary-orange) !important;
          color: #fff !important;
          border-color: #000 !important;
          box-shadow: 2px 2px 0 #000;
        }

        .transition-subcontrols {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-top: 0.65rem;
          padding-top: 0.65rem;
          border-top: 1px dashed var(--border-color);
        }

        .subcontrol-row {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .subcontrol-label {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 0.8px;
          color: var(--text-secondary);
        }

        .pill-btn.micro {
          font-size: 0.72rem;
          padding: 0.25rem 0.5rem;
          font-family: monospace;
        }

        .pill-btn.micro.active {
          background: var(--primary-orange);
          color: #fff;
          border-color: #000;
          box-shadow: 2px 2px 0 #000;
        }

        .checkbox-options-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-heading);
          font-size: 0.82rem;
          letter-spacing: 0.8px;
          cursor: pointer;
        }

        .generate-cta-wrap {
          margin-top: 0.5rem;
        }

        .make-gif-btn {
          width: 100%;
          font-size: 1.25rem;
          letter-spacing: 2px;
          padding: 0.9rem;
          text-align: center;
          justify-content: center;
        }

        /* Timeline Strip */
        .timeline-strip-container {
          background: var(--bg-card);
          border: 3px solid var(--text-primary);
          box-shadow: 8px 8px 0 var(--primary-orange);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .timeline-strip-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .timeline-badge {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 2px;
          color: var(--primary-orange);
        }

        .timeline-title {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          letter-spacing: 1.5px;
          margin: 0;
        }

        .timeline-quick-actions {
          display: flex;
          gap: 0.6rem;
        }

        .action-pill-btn {
          font-family: var(--font-heading);
          font-size: 0.82rem;
          letter-spacing: 1px;
          padding: 0.45rem 0.9rem;
          background: transparent;
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          box-shadow: 2px 2px 0 var(--text-primary);
          cursor: pointer;
        }

        .action-pill-btn.add-btn {
          background: var(--secondary-blue);
          color: #fff;
          border-color: #000;
          box-shadow: 2px 2px 0 #000;
        }

        /* Multi Dropzone */
        .multi-dropzone {
          border: 3px dashed var(--border-color);
          background: rgba(0, 0, 0, 0.2);
          padding: 1.25rem;
          min-height: 200px;
          transition: all 0.2s ease;
        }

        .multi-dropzone.drag-over {
          border-color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.08);
        }

        .dropzone-empty-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 3rem 1rem;
          cursor: pointer;
        }

        .drop-icon {
          font-size: 2.2rem;
        }

        .drop-text {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          letter-spacing: 1.5px;
        }

        .drop-sub {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .timeline-cards-row {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.75rem;
          scrollbar-width: thin;
        }

        .frame-card {
          flex: 0 0 160px;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .frame-card:hover {
          border-color: var(--text-primary);
          transform: translateY(-2px);
        }

        .frame-card.active-frame {
          border-color: var(--primary-orange);
          box-shadow: 4px 4px 0 var(--primary-orange);
          transform: translateY(-2px);
        }

        .frame-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.35rem 0.5rem;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
        }

        .frame-idx-badge {
          font-family: monospace;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary-orange);
        }

        .frame-card-mini-actions {
          display: flex;
          gap: 0.2rem;
        }

        .mini-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 0.7rem;
          cursor: pointer;
          padding: 0.1rem 0.2rem;
        }

        .mini-btn:hover { color: var(--primary-orange); }
        .mini-btn.del:hover { color: #ff3b30; }

        .frame-thumb-viewport {
          width: 100%;
          height: 120px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .frame-thumb-viewport img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .frame-card-foot {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.4rem 0.5rem;
          background: var(--bg-card);
          border-top: 1px solid var(--border-color);
          font-family: monospace;
          font-size: 0.72rem;
        }

        .frame-delay-input {
          width: 55px;
          padding: 0.15rem 0.3rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-family: monospace;
          font-size: 0.75rem;
        }

        .add-frame-tile {
          flex: 0 0 140px;
          border: 2px dashed var(--border-color);
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .add-frame-tile:hover {
          border-color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.06);
        }

        .add-glyph { font-size: 2rem; color: var(--primary-orange); }
        .add-txt { font-family: var(--font-heading); font-size: 0.85rem; letter-spacing: 1px; }

        /* Results Card */
        .gif-results-card {
          background: var(--bg-card);
          border: 4px solid var(--text-primary);
          box-shadow: 10px 10px 0 var(--primary-orange);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .results-header {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .results-badge {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 2px;
          color: var(--primary-orange);
        }

        .results-title {
          font-family: var(--font-heading);
          font-size: 2rem;
          letter-spacing: 1.5px;
          margin: 0;
        }

        .results-body {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2rem;
          align-items: center;
        }

        .gif-result-preview-wrap {
          background: #000;
          border: 3px solid var(--text-primary);
          box-shadow: 6px 6px 0 #000;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 320px;
          max-height: 440px;
          overflow: hidden;
        }

        .result-gif-img {
          max-width: 100%;
          max-height: 420px;
          object-fit: contain;
        }

        .results-meta-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-card {
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .stat-lbl {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .stat-val {
          font-family: monospace;
          font-size: 1.15rem;
          font-weight: 700;
        }

        .stat-val.highlight {
          color: var(--primary-orange);
        }

        .results-cta-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .dl-btn {
          font-size: 1.15rem;
          padding: 0.85rem 1.75rem;
        }

        /* Quick GIF Compression Box & Send to Compressor */
        .gif-compress-box {
          background: #090e18;
          border: 1px solid rgba(255, 106, 0, 0.35);
          box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
          padding: 0.9rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .compress-box-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .compress-box-title {
          font-family: var(--font-heading);
          font-size: 0.88rem;
          letter-spacing: 1px;
          color: var(--primary-orange);
        }

        .compress-box-sub {
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.4;
        }

        .compress-presets-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .compress-action-pill {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.35rem 0.65rem;
          background: #111a2e;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .compress-action-pill:hover:not(:disabled) {
          background: #1e293b;
          border-color: var(--primary-orange);
          color: #fff;
        }

        .compress-action-pill.active {
          background: rgba(255, 106, 0, 0.2);
          border-color: var(--primary-orange);
          color: var(--primary-orange);
        }

        .compress-action-pill.reset {
          background: #0a0f1d;
          border-color: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }

        .opt-notice-badge {
          font-family: monospace;
          font-size: 0.75rem;
          font-weight: 700;
          color: #34d399;
          background: rgba(6, 78, 59, 0.35);
          border: 1px solid rgba(52, 211, 153, 0.4);
          padding: 0.35rem 0.65rem;
          border-radius: 2px;
          display: inline-block;
        }

        .send-compressor-btn {
          background: #0284c7 !important;
          color: #fff !important;
          border: 2px solid #000 !important;
          box-shadow: 4px 4px 0 #000 !important;
          font-size: 1.05rem;
          padding: 0.85rem 1.4rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .send-compressor-btn:hover {
          background: #0369a1 !important;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 #000 !important;
        }

        .sent-compressor-pill {
          font-family: monospace;
          font-size: 0.8rem;
          font-weight: 700;
          color: #38bdf8;
          background: #0c1b33;
          border: 1px solid rgba(56, 189, 248, 0.4);
          padding: 0.5rem 0.85rem;
          text-align: center;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .studio-specs-banner {
            grid-template-columns: 1fr;
          }
          .gif-workbench-grid {
            grid-template-columns: 1fr;
          }
          .results-body {
            grid-template-columns: 1fr;
          }
          .gif-main-title {
            font-size: 2.4rem;
          }
        }

        @media (max-width: 768px) {
          .studio-gif-section {
            padding: 4rem 1rem;
          }
          .param-grid-2 {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default AnimatedGifMaker;
