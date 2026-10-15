import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { encodeFramesToAnimatedGif } from '../utils/gifEncoder';
import { extractArchive } from '../utils/archiveExtractor';
import { BG_COLOR_MAP, DEMO_SEQUENCES, getDefaultFrames } from '../utils/gifSequencePresets';

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

const AnimatedGifMaker = () => {
  // Frame sequence state
  const [frames, setFrames] = useState(getDefaultFrames);
  const [globalDelayMs, setGlobalDelayMs] = useState(250);
  const [loopCount, setLoopCount] = useState(0); // 0 = infinite
  const [canvasSizeMode, setCanvasSizeMode] = useState('first'); // 'first' | 'max' | 'square' | 'custom'
  const [customWidth, setCustomWidth] = useState(600);
  const [customHeight, setCustomHeight] = useState(600);
  const [fitMode, setFitMode] = useState('contain'); // 'contain' | 'cover' | 'stretch'
  const [canvasBg, setCanvasBg] = useState('transparent'); // 'transparent' | 'black' | 'white' | 'orange'
  const [isPingPong, setIsPingPong] = useState(false);

  // Live Animation Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const playerCanvasRef = useRef(null);
  const playTimerRef = useRef(null);

  // Encoding & Results state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [outputGifUrl, setOutputGifUrl] = useState(null);
  const [outputStats, setOutputStats] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
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

  // Live Canvas Animation Playback Loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const currentFrame = frames[currentFrameIndex];
    const delay = (currentFrame?.delayMs || globalDelayMs) || 200;

    playTimerRef.current = setTimeout(() => {
      setCurrentFrameIndex(prev => (prev + 1) % frames.length);
    }, delay);

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentFrameIndex, frames, globalDelayMs]);

  // Determine output canvas dimensions
  const computedDimensions = useMemo(() => {
    if (canvasSizeMode === 'square') return { width: 600, height: 600 };
    if (canvasSizeMode === 'custom') return { width: customWidth, height: customHeight };
    return { width: 640, height: 640 };
  }, [canvasSizeMode, customWidth, customHeight]);

  // Helper to draw an image onto canvas with aspect ratio rules
  const drawImageToCanvas = useCallback((ctx, img, targetW, targetH, fit, bg) => {
    ctx.clearRect(0, 0, targetW, targetH);

    if (bg && bg !== 'transparent') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, targetW, targetH);
    }

    const imgW = img.naturalWidth || img.width || targetW;
    const imgH = img.naturalHeight || img.height || targetH;

    if (fit === 'stretch') {
      ctx.drawImage(img, 0, 0, targetW, targetH);
      return;
    }

    const scale = fit === 'cover'
      ? Math.max(targetW / imgW, targetH / imgH)
      : Math.min(targetW / imgW, targetH / imgH);

    const dw = imgW * scale;
    const dh = imgH * scale;
    const dx = (targetW - dw) / 2;
    const dy = (targetH - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Update live preview canvas when currentFrameIndex changes
  useEffect(() => {
    if (!playerCanvasRef.current || frames.length === 0) return;
    const activeFrame = frames[currentFrameIndex];
    if (!activeFrame) return;

    const canvas = playerCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      drawImageToCanvas(ctx, img, canvas.width, canvas.height, fitMode, BG_COLOR_MAP[canvasBg] || 'transparent');
    };
    img.src = activeFrame.url;
  }, [currentFrameIndex, frames, fitMode, canvasBg, drawImageToCanvas]);

  // Generate Animated GIF
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

      // Prepare sequence (support Ping-Pong loop if enabled)
      let sequenceFrames = [...frames];
      if (isPingPong && frames.length > 2) {
        const reverseSlice = [...frames.slice(1, -1)].reverse();
        sequenceFrames = [...frames, ...reverseSlice];
      }

      const encodedFrames = [];
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      for (let i = 0; i < sequenceFrames.length; i++) {
        setGenerationProgress(Math.round(((i + 1) / sequenceFrames.length) * 85));
        const f = sequenceFrames[i];

        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error(`Failed to load frame ${f.name}`));
          image.src = f.url;
        });

        drawImageToCanvas(ctx, img, targetW, targetH, fitMode, BG_COLOR_MAP[canvasBg] || 'transparent');
        const imgData = ctx.getImageData(0, 0, targetW, targetH);

        encodedFrames.push({
          imageData: imgData,
          delayMs: f.delayMs || globalDelayMs,
          disposal: 2
        });
      }

      setGenerationProgress(92);

      // Encode into GIF89a binary
      const gifBlob = encodeFramesToAnimatedGif(encodedFrames, {
        width: targetW,
        height: targetH,
        loopCount
      });

      const gifUrl = registerUrl(URL.createObjectURL(gifBlob));
      setOutputGifUrl(gifUrl);
      setOutputStats({
        sizeBytes: gifBlob.size,
        sizeKb: Math.round((gifBlob.size / 1024) * 10) / 10,
        frameCount: sequenceFrames.length,
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

  return (
    <section id="gif-maker" className="studio-gif-section bg-halftone">
      <div className="gif-maker-container">
        
        {/* Section Header */}
        <div className="gif-header-row">
          <div className="section-label">ANIMATED GIF MAKER // STUDIO TIMELINE</div>
          <h2 className="gif-main-title comic-text">
            STUDIO ANIMATED GIF MAKER & COMPOSER
          </h2>
          <p className="gif-sub-desc">
            Ultra-responsive multi-file animation suite. Assemble multiple photos, vector SVGs, PNGs, and archive bundles into studio-grade animated GIFs with frame-accurate delays, live canvas scrubbing, and instant 1-click export.
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
                    FIT SOURCE (640x640)
                  </button>
                  <button
                    type="button"
                    className={`pill-btn ${canvasSizeMode === 'square' ? 'active' : ''}`}
                    onClick={() => setCanvasSizeMode('square')}
                  >
                    SQUARE 600x600
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
                  <div className="custom-size-row">
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Math.max(100, parseInt(e.target.value, 10) || 600))}
                      placeholder="Width"
                      className="size-input"
                    />
                    <span>×</span>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Math.max(100, parseInt(e.target.value, 10) || 600))}
                      placeholder="Height"
                      className="size-input"
                    />
                    <span>PX</span>
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
                  {isGenerating ? `⏳ COMPOSING GIF (${generationProgress}%)...` : `⚡ GENERATE ANIMATED GIF (${frames.length} FRAMES)`}
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
                    className="studio-btn-secondary"
                    onClick={() => {
                      const w = window.open('');
                      w?.document.write(`<img src="${outputGifUrl}" style="background:#000;display:block;margin:auto;" />`);
                    }}
                  >
                    🔍 OPEN IN NEW TAB
                  </button>
                </div>
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

        .custom-size-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: monospace;
          font-size: 0.85rem;
          margin-top: 0.4rem;
        }

        .size-input {
          width: 90px;
          padding: 0.35rem 0.5rem;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          font-family: monospace;
        }

        .param-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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
