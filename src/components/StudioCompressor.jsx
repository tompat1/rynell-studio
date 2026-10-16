import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { useCms } from '../contexts/CmsContext';
import { 
  COMPRESSION_PRESETS, 
  optimizeImageFile, 
  createZipArchive, 
  MAX_COMPRESS_FILE_SIZE 
} from '../utils/imageCompressor';

// Sample assets for 1-click test drive
import sampleSvgUrl from '../assets/lightning_bolt_sticker_vector.svg';
import samplePngUrl from '../assets/services/service_branding.png';
import sampleJpgUrl from '../assets/studio_portrait.jpg';

const StudioCompressor = () => {
  const { t, isLiveEditMode, isCmsAdmin, openCms } = useCms();
  // Preset & Configuration State
  const [selectedPresetId, setSelectedPresetId] = useState('visually-lossless');
  const [targetFormat, setTargetFormat] = useState('original'); // 'original' | 'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif'
  const [maxDimension, setMaxDimension] = useState(null); // null | 1920 | 1280 | 800
  const [pngQuantize, setPngQuantize] = useState(true);
  const [pngColors, setPngColors] = useState(256); // 16 | 32 | 64 | 128 | 256
  const [pngDither, setPngDither] = useState(true);
  const [svgPrecision, setSvgPrecision] = useState(2);
  
  // MozJPEG Advanced Techniques State
  const [mozTrellis, setMozTrellis] = useState(true);
  const [mozHuffman, setMozHuffman] = useState(true);
  const [mozProgressive, setMozProgressive] = useState(true);
  const [mozDeringing, setMozDeringing] = useState(true);
  const [mozHighDpi, setMozHighDpi] = useState(true);
  const [mozGammaChroma, setMozGammaChroma] = useState(true);
  const [mozColorFringing, setMozColorFringing] = useState(true);

  // ImageOptim Preferences & Lossy Minification Settings (from official preferences UI)
  const [activePrefTab, setActivePrefTab] = useState('Quality'); // 'General' | 'Quality' | 'Optimization speed'
  const [enableLossy, setEnableLossy] = useState(false); // User needs to toggle lossy minification for it to be enabled
  const [jpegQuality, setJpegQuality] = useState(85); // 50% - 99%
  const [pngQuality, setPngQuality] = useState(80);   // 40% - 100%
  const [gifQuality, setGifQuality] = useState(80);   // 40% - 100%
  const [optimizationSpeed, setOptimizationSpeed] = useState('Standard');

  // Batch Queue & Active Selection
  const [filesQueue, setFilesQueue] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bgGrid, setBgGrid] = useState('checker'); // 'checker' | 'dark' | 'light'
  const [zoomLevel, setZoomLevel] = useState(1); // 1 | 2 | 4

  const fileInputRef = useRef(null);
  const activeUrlsRef = useRef([]);

  // Ephemeral 1-hour auto-deletion
  const [expirySeconds, setExpirySeconds] = useState(3600);
  const sessionCreatedRef = useRef(null);
  const expiryTimerRef = useRef(null);

  // Active preset object
  const activePreset = useMemo(() => {
    return COMPRESSION_PRESETS.find(p => p.id === selectedPresetId) || COMPRESSION_PRESETS[0];
  }, [selectedPresetId]);

  // Track & auto-cleanup URLs
  const registerUrl = useCallback((url) => {
    if (url && (url.startsWith('blob:') || url.startsWith('data:'))) {
      activeUrlsRef.current.push(url);
    }
    return url;
  }, []);

  const cleanupUrls = useCallback(() => {
    activeUrlsRef.current.forEach(u => {
      try { 
        if (u.startsWith('blob:')) URL.revokeObjectURL(u); 
      } catch (err) {
        console.warn('URL cleanup notice:', err);
      }
    });
    activeUrlsRef.current = [];
  }, []);

  // Clear all items
  const handleClearAll = useCallback(() => {
    cleanupUrls();
    setFilesQueue([]);
    setActiveFileId(null);
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
        setErrorNotice('Notice: 1-hour ephemeral privacy window expired. All files and compressed buffers have been purged.');
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

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round((bytes / 1024) * 10) / 10} KB`;
    return `${Math.round((bytes / (1024 * 1024)) * 100) / 100} MB`;
  };

  // Run compression on a single queue item
  const processItemCompression = useCallback(async (item, options) => {
    try {
      const result = await optimizeImageFile(item.file, options);
      registerUrl(result.url);
      return {
        ...item,
        status: 'done',
        result,
        compressedSizeBytes: result.compressedSizeBytes,
        savedBytes: result.savedBytes,
        savedPercent: result.savedPercent
      };
    } catch (err) {
      console.error('Compression failed for item:', item.name, err);
      return {
        ...item,
        status: 'error',
        error: err.message || 'Compression failed'
      };
    }
  }, [registerUrl]);

  // Compression options payload
  const currentOptions = useMemo(() => {
    const q = selectedPresetId === 'custom' 
      ? (jpegQuality / 100)
      : activePreset.quality;

    const quant = selectedPresetId === 'custom' 
      ? pngQuantize 
      : (activePreset.pngQuantize !== undefined ? activePreset.pngQuantize : true);

    const colors = selectedPresetId === 'custom' 
      ? pngColors 
      : (activePreset.pngColors || 256);

    const prec = selectedPresetId === 'custom' 
      ? svgPrecision 
      : (activePreset.svgPrecision || 2);

    return {
      presetId: selectedPresetId,
      quality: q,
      targetFormat,
      maxDimension,
      pngQuantize: quant,
      pngColors: colors,
      pngDither,
      svgPrecision: prec,
      enableLossy,
      jpegQuality: jpegQuality / 100,
      pngQuality: pngQuality / 100,
      gifQuality: gifQuality / 100,
      trellisQuantization: mozTrellis,
      optimizedHuffman: mozHuffman,
      scanSplitOptimization: mozTrellis && mozHuffman,
      progressiveRendering: mozProgressive,
      overshootDeringing: mozDeringing,
      highDpiQuantTables: mozHighDpi,
      gammaCorrectChroma: mozGammaChroma,
      colorFringingReduction: mozColorFringing
    };
  }, [
    selectedPresetId, 
    jpegQuality, 
    activePreset, 
    targetFormat, 
    maxDimension, 
    pngQuantize, 
    pngColors, 
    pngDither, 
    svgPrecision,
    enableLossy,
    pngQuality,
    gifQuality,
    mozTrellis,
    mozHuffman,
    mozProgressive,
    mozDeringing,
    mozHighDpi,
    mozGammaChroma,
    mozColorFringing
  ]);

  // Re-compress queue items whenever options change
  const recompressQueue = useCallback(async (items, options) => {
    if (!items || items.length === 0) return;
    setIsProcessingBatch(true);
    setErrorNotice(null);

    const updated = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const res = await processItemCompression(item, options);
      updated.push(res);
    }

    setFilesQueue(updated);
    setIsProcessingBatch(false);
  }, [processItemCompression]);

  // Handle incoming files
  const handleIncomingFiles = useCallback(async (fileList) => {
    setErrorNotice(null);
    if (!fileList || fileList.length === 0) return;

    // Size limit verification
    let batchBytes = 0;
    for (let i = 0; i < fileList.length; i++) batchBytes += fileList[i].size;

    if (batchBytes > MAX_COMPRESS_FILE_SIZE) {
      setErrorNotice(`BATCH SIZE EXCEEDS LIMIT: ${(batchBytes / (1024 * 1024)).toFixed(1)}MB exceeds 200MB maximum.`);
      return;
    }

    const newItems = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const origUrl = registerUrl(URL.createObjectURL(file));
      const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      newItems.push({
        id,
        name: file.name,
        file,
        origUrl,
        originalSizeBytes: file.size,
        status: 'pending'
      });
    }

    setIsProcessingBatch(true);
    const processed = [];
    for (const it of newItems) {
      const res = await processItemCompression(it, currentOptions);
      processed.push(res);
    }

    setFilesQueue(prev => {
      const combined = [...prev, ...processed];
      if (!activeFileId && combined.length > 0) {
        setActiveFileId(combined[0].id);
      }
      return combined;
    });

    setIsProcessingBatch(false);
    sessionCreatedRef.current = Date.now();
    setExpirySeconds(3600);
  }, [activeFileId, currentOptions, processItemCompression, registerUrl]);

  // Listen for cross-component compression handoff (e.g. from AnimatedGifMaker)
  useEffect(() => {
    const handleExternalCompress = (e) => {
      const file = e.detail?.file;
      if (file) {
        handleIncomingFiles([file]);
      }
    };
    window.addEventListener('rynell:compress-image', handleExternalCompress);
    return () => window.removeEventListener('rynell:compress-image', handleExternalCompress);
  }, [handleIncomingFiles]);

  // Load a demo sample file
  const handleLoadSample = useCallback(async (sampleType) => {
    setErrorNotice(null);
    try {
      let url = sampleSvgUrl;
      let name = 'studio_vector_bolt.svg';
      let type = 'image/svg+xml';

      if (sampleType === 'png') {
        url = samplePngUrl;
        name = 'service_branding.png';
        type = 'image/png';
      } else if (sampleType === 'jpg') {
        url = sampleJpgUrl;
        name = 'studio_portrait.jpg';
        type = 'image/jpeg';
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], name, { type });
      await handleIncomingFiles([file]);
    } catch (err) {
      console.error('Failed to load sample:', err);
      setErrorNotice('Could not load sample asset.');
    }
  }, [handleIncomingFiles]);

  // Switch preset
  const handlePresetSelect = (presetId) => {
    setSelectedPresetId(presetId);
    const p = COMPRESSION_PRESETS.find(item => item.id === presetId);
    if (p && presetId !== 'custom') {
      const isLossless = presetId === 'lossless';
      setEnableLossy(!isLossless);
      let jq = 85;
      let pq = 80;
      let gq = 80;
      if (presetId === 'visually-lossless') {
        jq = 85; pq = 80; gq = 80;
      } else if (presetId === 'high-compression') {
        jq = 65; pq = 65; gq = 65;
      } else if (presetId === 'brutal-squeeze') {
        jq = 45; pq = 40; gq = 40;
      }
      setJpegQuality(jq);
      setPngQuality(pq);
      setGifQuality(gq);

      const opts = {
        ...currentOptions,
        presetId,
        quality: p.quality,
        enableLossy: !isLossless,
        jpegQuality: jq / 100,
        pngQuality: pq / 100,
        gifQuality: gq / 100,
        pngQuantize: p.pngQuantize !== undefined ? p.pngQuantize : true,
        pngColors: p.pngColors || 256,
        svgPrecision: p.svgPrecision || 2
      };
      recompressQueue(filesQueue, opts);
    }
  };

  // Trigger recompression on custom slider changes (debounced or on change)
  const handleOptionChange = (newOpts) => {
    const merged = { ...currentOptions, ...newOpts };
    recompressQueue(filesQueue, merged);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleIncomingFiles(e.dataTransfer.files);
    }
  };

  // Remove single item
  const handleRemoveItem = (id) => {
    setFilesQueue(prev => {
      const next = prev.filter(item => item.id !== id);
      if (activeFileId === id) {
        setActiveFileId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  // Download all as ZIP archive
  const handleDownloadZip = async () => {
    const doneItems = filesQueue.filter(item => item.status === 'done' && item.result);
    if (doneItems.length === 0) return;

    try {
      const filesForZip = doneItems.map(item => {
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        const ext = item.result.formatExt;
        return {
          name: `${baseName}_optimized.${ext}`,
          blob: item.result.blob
        };
      });

      const zipBlob = await createZipArchive(filesForZip);
      const zipUrl = registerUrl(URL.createObjectURL(zipBlob));
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `RYNELL_STUDIO_OPTIMIZED_IMAGES_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('ZIP generation error:', err);
      setErrorNotice('Failed to generate ZIP archive.');
    }
  };

  // Active item for inspection
  const activeItem = useMemo(() => {
    return filesQueue.find(item => item.id === activeFileId) || filesQueue[0] || null;
  }, [filesQueue, activeFileId]);

  // Aggregate batch savings
  const batchStats = useMemo(() => {
    let orig = 0;
    let comp = 0;
    let count = 0;

    filesQueue.forEach(item => {
      if (item.status === 'done' && item.result) {
        orig += item.originalSizeBytes || 0;
        comp += item.compressedSizeBytes || 0;
        count++;
      }
    });

    const saved = Math.max(0, orig - comp);
    const percent = orig > 0 ? Math.round((saved / orig) * 1000) / 10 : 0;

    return {
      totalOriginal: orig,
      totalCompressed: comp,
      totalSaved: saved,
      savedPercent: percent,
      count
    };
  }, [filesQueue]);

  return (
    <section 
      id="image-compressor" 
      className={`studio-compressor-section bg-halftone ${isDragging ? 'drag-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Full-bleed drag overlay */}
      {isDragging && (
        <div className="fullscreen-drag-overlay" onDrop={handleDrop}>
          <div className="drag-overlay-card">
            <span className="drag-overlay-icon">⚡</span>
            <span className="drag-overlay-title">DROP IMAGES TO SCRUB JUNK & SQUEEZE</span>
            <span className="drag-overlay-sub">
              AUTOMATICALLY SCRUBS EXIF • THUMBNAILS • COMMENTS • ICC PROFILES
            </span>
            <div className="drag-tools-pills">
              <span>MozJPEG</span> • <span>pngquant</span> • <span>Pngcrush</span> • <span>7zip</span> • <span>SVGO</span> • <span>Google Zopfli</span>
            </div>
          </div>
        </div>
      )}

      <div className="compressor-container">
        
        {/* Section Header */}
        <div 
          className={`compressor-header-row ${isLiveEditMode && isCmsAdmin ? 'cms-editable-target' : ''}`}
          onClick={() => isLiveEditMode && isCmsAdmin && openCms('studioTools')}
        >
          <div className="section-label">
            {t('studioTools.compressor.sectionLabel', 'IMAGE COMPRESSOR & OPTIMIZER // POWERED LIKE IMAGEOPTIM')}
          </div>
          <h2 className="compressor-main-title comic-text">
            {t('studioTools.compressor.title', 'IMAGEOPTIM PRO: VECTOR & RASTER COMPRESSOR')}
          </h2>
          <p className="compressor-sub-desc">
            {t('studioTools.compressor.subDescription', 'Industrial-grade image compression suite inspired by ImageOptim. Lossless metadata stripping, MozJPEG quantization, pngquant 8-bit palette reduction, and SVGO vector minification with instant live before/after diffing.')}
          </p>
        </div>

        {/* ImageOptim Core Pillars Showcase Banner */}
        <div className="imageoptim-pillars-grid">
          {/* Pillar 1: Image files scrubbed clean */}
          <div className="pillar-card scrub-card">
            <div className="pillar-head">
              <span className="pillar-badge">AUTOMATIC SCRUBBER</span>
              <h3 className="pillar-title">🧹 IMAGE FILES SCRUBBED CLEAN</h3>
            </div>
            <p className="pillar-body">
              Removes invisible junk: private EXIF metadata from digital cameras, embedded thumbnails, comments, and unnecessary{' '}
              <a 
                href="https://imageoptim.com/color-profiles.html" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-doc-link"
                title="Read about ImageOptim color profile optimization"
              >
                color profiles (sRGB normalized)
              </a>.
            </p>
            <div className="pillar-features-row">
              <span className="clean-tag">✓ Camera EXIF & GPS</span>
              <span className="clean-tag">✓ Embedded Thumbnails</span>
              <span className="clean-tag">✓ Comments & Chunks</span>
              <span className="clean-tag">✓ Bulky ICC Profiles</span>
            </div>
          </div>

          {/* Pillar 2: Best tools with drag'n'drop */}
          <div className="pillar-card tools-card">
            <div className="pillar-head">
              <span className="pillar-badge">MULTI-ENGINE PIPELINE</span>
              <h3 className="pillar-title">⚙️ BEST TOOLS WITH DRAG'N'DROP</h3>
            </div>
            <p className="pillar-body">
              Seamlessly combines all the best image optimization tools:{' '}
              <a href="http://calendar.perfplanet.com/2014/mozjpeg-3-0/" target="_blank" rel="noreferrer" className="inline-doc-link">MozJPEG</a>,{' '}
              <a href="https://pngquant.org/" target="_blank" rel="noreferrer" className="inline-doc-link">pngquant</a>,{' '}
              <a href="http://pmt.sourceforge.net/pngcrush/" target="_blank" rel="noreferrer" className="inline-doc-link">Pngcrush</a>,{' '}
              <a href="http://advancemame.sourceforge.net/doc-advpng.html" target="_blank" rel="noreferrer" className="inline-doc-link">7zip</a>,{' '}
              <a href="https://github.com/svg/svgo" target="_blank" rel="noreferrer" className="inline-doc-link">SVGO</a> and{' '}
              <a href="https://googledevelopers.blogspot.co.uk/2013/02/compress-data-more-densely-with-zopfli.html" target="_blank" rel="noreferrer" className="inline-doc-link">Google Zopfli</a>. All Free and Open-Source.
            </p>
            <div className="tools-pills-row">
              <a href="http://calendar.perfplanet.com/2014/mozjpeg-3-0/" target="_blank" rel="noreferrer" className="tool-pill mozjpeg">⚡ MozJPEG</a>
              <a href="https://pngquant.org/" target="_blank" rel="noreferrer" className="tool-pill pngquant">🎨 pngquant</a>
              <a href="http://pmt.sourceforge.net/pngcrush/" target="_blank" rel="noreferrer" className="tool-pill pngcrush">🔨 Pngcrush</a>
              <a href="http://advancemame.sourceforge.net/doc-advpng.html" target="_blank" rel="noreferrer" className="tool-pill sevenzip">🗜️ 7zip</a>
              <a href="https://github.com/svg/svgo" target="_blank" rel="noreferrer" className="tool-pill svgo">📐 SVGO</a>
              <a href="https://googledevelopers.blogspot.co.uk/2013/02/compress-data-more-densely-with-zopfli.html" target="_blank" rel="noreferrer" className="tool-pill zopfli">📦 Google Zopfli</a>
            </div>
          </div>

          {/* Pillar 3: MozJPEG Advanced Techniques */}
          <div className="pillar-card mozjpeg-card">
            <div className="pillar-head">
              <span className="pillar-badge">MOZJPEG ADVANCED</span>
              <h3 className="pillar-title">⚡ ADVANCED ENCODING SUITE</h3>
            </div>
            <ul className="pillar-bullet-list">
              <li>
                <strong>Trellis quantization, optimized Huffman tables, scan split optimization</strong> — advanced techniques for maximum file size reduction.
              </li>
              <li>
                <strong>Progressive rendering</strong> — only 15% of image data is needed to start displaying it on screen.
              </li>
              <li>
                <a href="https://kornel.ski/deringing/" target="_blank" rel="noreferrer" className="inline-doc-link">
                  Overshoot deringing
                </a> — makes text and lines on white background appear sharper.
              </li>
              <li>
                <strong>Quantization tables optimized for high-DPI screens</strong> — avoids bloating files with details that are invisible to the naked eye.
              </li>
              <li>
                <strong>Gamma-correct chroma subsampling</strong> — highly-saturated lines and edges are sharper and higher quality.
              </li>
              <li>
                <strong>Color fringing reduction</strong> — patterns on colorful backgrounds appear sharper.
              </li>
            </ul>
            <div className="pillar-features-row">
              <span className="clean-tag moz">Trellis & Huffman</span>
              <span className="clean-tag moz">15% Progressive</span>
              <span className="clean-tag moz">Overshoot Deringed</span>
              <span className="clean-tag moz">High-DPI Retina</span>
              <span className="clean-tag moz">Gamma Chroma</span>
              <span className="clean-tag moz">Anti-Fringe</span>
            </div>
          </div>
        </div>

        {/* Studio Specs & Privacy Notice Bar */}
        <div className="studio-specs-banner">
          <div className="spec-item format-spec">
            <span className="spec-glyph">🗜️</span>
            <div className="spec-text-block">
              <span className="spec-title">AUTOMATIC CLEANING PIPELINE</span>
              <span className="spec-desc">
                Metadata Stripped • sRGB Color Normalized • Alpha Zeroed • Zero Telemetry
              </span>
            </div>
          </div>

          <div className="spec-item size-spec">
            <span className="spec-glyph">⚡</span>
            <div className="spec-text-block">
              <span className="spec-title">MAX TOTAL FILE SIZE</span>
              <span className="spec-desc">200MB Upload Limit • Multi-File Parallel Batch Queue</span>
            </div>
          </div>

          <div className="spec-item purge-spec">
            <span className="spec-glyph">🛡️</span>
            <div className="spec-text-block">
              <span className="spec-title">EPHEMERAL ZERO-RETENTION VAULT</span>
              <span className="spec-desc">
                All files auto-purged 1 hour after upload ({formatCountdown(expirySeconds)} remaining)
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorNotice && (
          <div className="compressor-error-banner" role="alert">
            <span className="alert-tag">ALERT</span>
            <span className="alert-msg">{errorNotice}</span>
            <button type="button" className="alert-dismiss" onClick={() => setErrorNotice(null)}>✕</button>
          </div>
        )}

        {/* Preset Selection Strip */}
        <div className="presets-selector-bar">
          <span className="presets-label">COMPRESSION PROFILE:</span>
          <div className="presets-pills-row">
            {COMPRESSION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`preset-pill-btn ${selectedPresetId === preset.id ? 'active' : ''}`}
                onClick={() => handlePresetSelect(preset.id)}
              >
                <span className="preset-name">{preset.name}</span>
                <span className="preset-tag">{preset.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Starters Row */}
        <div className="demo-starter-bar">
          <span className="starter-label">LOAD READY-TO-TEST SAMPLES:</span>
          <div className="starter-buttons-row">
            <button
              type="button"
              className="starter-demo-btn"
              onClick={() => handleLoadSample('svg')}
            >
              ⚡ STUDIO VECTOR ARTWORK (SVG)
            </button>
            <button
              type="button"
              className="starter-demo-btn"
              onClick={() => handleLoadSample('png')}
            >
              🖼️ STUDIO BRANDING LOGO (PNG)
            </button>
            <button
              type="button"
              className="starter-demo-btn"
              onClick={() => handleLoadSample('jpg')}
            >
              🎨 STUDIO PORTRAIT POSTER (JPG)
            </button>
          </div>
        </div>

        {/* Workbench: Inspector (Left) & Controls/Batch (Right) */}
        <div className="compressor-workbench-grid">
          
          {/* Column 1: Live Before / After Interactive Inspector */}
          <div className="workbench-pane inspector-pane">
            <div className="pane-header">
              <div className="header-left">
                <span className="pane-title">BEFORE / AFTER COMPARISON</span>
                {activeItem && (
                  <span className="active-item-badge">{activeItem.name}</span>
                )}
              </div>

              {/* View options: Grid & Zoom */}
              <div className="inspector-actions">
                <div className="grid-toggle-row">
                  {['checker', 'dark', 'light'].map(bg => (
                    <button
                      key={bg}
                      type="button"
                      className={`grid-pill ${bgGrid === bg ? 'active' : ''}`}
                      onClick={() => setBgGrid(bg)}
                      title={`Background ${bg}`}
                    >
                      {bg === 'checker' ? '🏁' : bg === 'dark' ? '⬛' : '⬜'}
                    </button>
                  ))}
                </div>

                <div className="zoom-toggle-row">
                  {[1, 2, 4].map(z => (
                    <button
                      key={z}
                      type="button"
                      className={`zoom-pill ${zoomLevel === z ? 'active' : ''}`}
                      onClick={() => setZoomLevel(z)}
                    >
                      {z}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Slider Viewport */}
            <div className="inspector-viewport-wrap">
              {activeItem && activeItem.status === 'done' && activeItem.result ? (
                <div 
                  className="slider-zoom-container"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}
                >
                  <BeforeAfterSlider
                    beforeImage={activeItem.origUrl}
                    afterImage={activeItem.result.url}
                    beforeLabel={`ORIGINAL // ${formatBytes(activeItem.originalSizeBytes)}`}
                    afterLabel={`OPTIMIZED // ${formatBytes(activeItem.compressedSizeBytes)} (-${activeItem.savedPercent}%)`}
                    bgGrid={bgGrid}
                  />
                </div>
              ) : (
                <div 
                  className={`dropzone-empty-hero ${isDragging ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="drop-icon">🗜️</span>
                  <span className="drop-text">DROP IMAGES TO COMPRESS</span>
                  <span className="drop-sub">PNG, JPG, WebP, SVG, AVIF, GIF up to 200MB • Auto-Stripped & Quantized</span>
                  <button type="button" className="studio-btn-primary select-btn">
                    + CHOOSE FILES
                  </button>
                </div>
              )}
            </div>

            {/* Metrics Bar for Active Item */}
            {activeItem && activeItem.status === 'done' && activeItem.result && (
              <div className="active-metrics-strip">
                <div className="metric-box orig">
                  <span className="metric-lbl">ORIGINAL</span>
                  <strong className="metric-val">{formatBytes(activeItem.originalSizeBytes)}</strong>
                  {activeItem.result.width > 0 && (
                    <small>{activeItem.result.width}×{activeItem.result.height}px</small>
                  )}
                </div>

                <div className="metric-box saved-badge-box">
                  <span className="saved-percent-tag">⚡ {activeItem.savedPercent}% SAVED</span>
                  <span className="saved-bytes-sub">-{formatBytes(activeItem.savedBytes)}</span>
                </div>

                <div className="metric-box opt">
                  <span className="metric-lbl">OPTIMIZED</span>
                  <strong className="metric-val highlight">{formatBytes(activeItem.compressedSizeBytes)}</strong>
                  <small>{activeItem.result.formatExt.toUpperCase()}</small>
                </div>

                <a
                  href={activeItem.result.url}
                  download={`${activeItem.name.substring(0, activeItem.name.lastIndexOf('.'))}_optimized.${activeItem.result.formatExt}`}
                  className="studio-btn-primary download-single-btn"
                >
                  📥 DOWNLOAD
                </a>
              </div>
            )}

            {/* Automatic Junk Cleaning Report for Active File */}
            {activeItem && activeItem.status === 'done' && activeItem.result && (
              <div className="active-cleaning-report-card">
                <div className="cleaning-head-row">
                  <span className="cleaning-badge">✓ AUTOMATIC JUNK SCRUBBER REPORT</span>
                  <span className="cleaning-tools-used">
                    {activeItem.result.cleaningReport?.toolsApplied?.length > 0 
                      ? activeItem.result.cleaningReport.toolsApplied.join(' • ') 
                      : 'MozJPEG • pngquant • Pngcrush • 7zip • SVGO • Zopfli'}
                  </span>
                </div>
                
                <div className="cleaning-items-grid">
                  <div className="clean-item">
                    <span className="clean-status-icon">🛡️</span>
                    <div className="clean-info">
                      <span className="clean-item-name">EXIF & CAMERA GPS</span>
                      <span className="clean-item-state">SCRUBBED CLEAN</span>
                    </div>
                  </div>

                  <div className="clean-item">
                    <span className="clean-status-icon">🖼️</span>
                    <div className="clean-info">
                      <span className="clean-item-name">EMBEDDED THUMBNAIL</span>
                      <span className="clean-item-state">PURGED (0 B RESIDUAL)</span>
                    </div>
                  </div>

                  <div className="clean-item">
                    <span className="clean-status-icon">🎨</span>
                    <div className="clean-info">
                      <span className="clean-item-name">COLOR PROFILES (ICC)</span>
                      <span className="clean-item-state">sRGB NORMALIZED</span>
                    </div>
                  </div>

                  <div className="clean-item">
                    <span className="clean-status-icon">💬</span>
                    <div className="clean-info">
                      <span className="clean-item-name">COMMENTS & METADATA</span>
                      <span className="clean-item-state">STRIPPED</span>
                    </div>
                  </div>
                </div>

                {/* MozJPEG Advanced Techniques Active Report */}
                {activeItem.result.cleaningReport?.mozjpegTechniques?.length > 0 && (
                  <div className="active-mozjpeg-card">
                    <div className="moz-head-row">
                      <span className="moz-badge">⚡ MOZJPEG ADVANCED TECHNIQUES ACTIVE</span>
                      {activeItem.result.cleaningReport.progressiveFirstPaintBytes > 0 && (
                        <span className="first-paint-tag">
                          📶 ~15% FIRST PAINT: {formatBytes(activeItem.result.cleaningReport.progressiveFirstPaintBytes)}
                        </span>
                      )}
                    </div>
                    <div className="moz-techniques-list">
                      {activeItem.result.cleaningReport.mozjpegTechniques.map((tech) => (
                        <span key={tech} className="moz-tech-pill">
                          ✓ {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Parameters Tuning & Batch Queue */}
          <div className="workbench-pane controls-pane">
            <div className="pane-header">
              <span className="pane-title">OPTIMIZER CONTROLS & BATCH QUEUE</span>
              <button type="button" className="clear-all-link" onClick={handleClearAll}>
                🗑️ CLEAR ALL
              </button>
            </div>

            {/* ImageOptim Preferences Window (Matching Official Desktop UI) */}
            <div className="imageoptim-prefs-card">
              <div className="prefs-tabs-header">
                {['General', 'Quality', 'Optimization speed'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    className={`pref-tab-btn ${activePrefTab === tab ? 'active' : ''}`}
                    onClick={() => setActivePrefTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="prefs-tab-content">
                {activePrefTab === 'Quality' && (
                  <div className="quality-tab-pane">
                    {/* Master Checkbox */}
                    <div className="lossy-toggle-container">
                      <label className="lossy-main-checkbox-label">
                        <input
                          type="checkbox"
                          checked={enableLossy}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setEnableLossy(val);
                            setSelectedPresetId('custom');
                            handleOptionChange({ enableLossy: val, presetId: 'custom' });
                          }}
                        />
                        <span className="lossy-title-text">Enable lossy minification</span>
                      </label>
                      <p className="lossy-sub-caption">
                        Makes files much smaller, but may change how images look
                      </p>
                    </div>

                    {!enableLossy && (
                      <div className="lossless-active-callout">
                        <span className="callout-shield">🛡️</span>
                        <span>BIT-EXACT LOSSLESS ENFORCED • CHECK BOX TO ENABLE LOSSY MINIFICATION</span>
                      </div>
                    )}

                    {/* Sliders Area */}
                    <div className={`prefs-sliders-box ${enableLossy ? '' : 'dimmed'}`}>
                      
                      {/* JPEG quality */}
                      <div className="pref-slider-row full">
                        <span className="pref-slider-name">JPEG quality</span>
                        <div className="pref-slider-track-wrap">
                          <input
                            type="range"
                            min="50"
                            max="99"
                            step="1"
                            disabled={!enableLossy}
                            value={jpegQuality}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setJpegQuality(val);
                              setSelectedPresetId('custom');
                              handleOptionChange({ jpegQuality: val / 100, presetId: 'custom' });
                            }}
                            className="imageoptim-slider"
                          />
                          <div className="pref-ticks-labels">
                            <span>50%</span>
                            <span className="tick-center">75%</span>
                            <span className="tick-right">99%</span>
                          </div>
                        </div>
                        <span className="pref-current-val">{jpegQuality}%</span>
                      </div>

                      {/* PNG and GIF quality side-by-side */}
                      <div className="pref-sliders-split-grid">
                        {/* PNG quality */}
                        <div className="pref-slider-row">
                          <span className="pref-slider-name">PNG quality</span>
                          <div className="pref-slider-track-wrap">
                            <input
                              type="range"
                              min="40"
                              max="100"
                              step="1"
                              disabled={!enableLossy}
                              value={pngQuality}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setPngQuality(val);
                                setSelectedPresetId('custom');
                                handleOptionChange({ pngQuality: val / 100, presetId: 'custom' });
                              }}
                              className="imageoptim-slider"
                            />
                            <div className="pref-ticks-labels">
                              <span>40%</span>
                              <span className="tick-center">70%</span>
                              <span className="tick-right">100%</span>
                            </div>
                          </div>
                          <span className="pref-current-val">{pngQuality}%</span>
                        </div>

                        {/* GIF quality */}
                        <div className="pref-slider-row">
                          <span className="pref-slider-name">GIF quality</span>
                          <div className="pref-slider-track-wrap">
                            <input
                              type="range"
                              min="40"
                              max="100"
                              step="1"
                              disabled={!enableLossy}
                              value={gifQuality}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setGifQuality(val);
                                setSelectedPresetId('custom');
                                handleOptionChange({ gifQuality: val / 100, presetId: 'custom' });
                              }}
                              className="imageoptim-slider"
                            />
                            <div className="pref-ticks-labels">
                              <span>40%</span>
                              <span className="tick-center">70%</span>
                              <span className="tick-right">100%</span>
                            </div>
                          </div>
                          <span className="pref-current-val">{gifQuality}%</span>
                        </div>
                      </div>

                    </div>

                    <div className="prefs-footer-row">
                      <span className="prefs-active-mode-label">
                        {enableLossy 
                          ? `⚡ LOSSY: MozJPEG ${jpegQuality}% • pngquant ${pngQuality}% • GIF ${gifQuality}%`
                          : '🛡️ STRICT LOSSLESS: 100% Bit-Exact Pixels (Zero Pixel Loss)'}
                      </span>
                      <button 
                        type="button" 
                        className="prefs-help-btn" 
                        title="Lossy minification applies MozJPEG quantization, pngquant 8-bit palette reduction, and Gifsicle compression for up to 85% byte savings."
                      >
                        ?
                      </button>
                    </div>
                  </div>
                )}

                {activePrefTab === 'General' && (
                  <div className="general-tab-pane">
                    <ul className="prefs-options-list">
                      <li>
                        <label className="checkbox-label micro">
                          <input type="checkbox" checked={true} readOnly />
                          <span>STRIP PRIVATE EXIF METADATA AND CAMERA GPS TAGS</span>
                        </label>
                      </li>
                      <li>
                        <label className="checkbox-label micro">
                          <input type="checkbox" checked={true} readOnly />
                          <span>REMOVE EMBEDDED CAMERA THUMBNAILS (0 B RESIDUAL)</span>
                        </label>
                      </li>
                      <li>
                        <label className="checkbox-label micro">
                          <input type="checkbox" checked={true} readOnly />
                          <span>STRIP BULKY ICC COLOR PROFILES & NORMALIZE TO sRGB</span>
                        </label>
                      </li>
                      <li>
                        <label className="checkbox-label micro">
                          <input type="checkbox" checked={true} readOnly />
                          <span>STRIP COMMENTS, XML HEADERS, AND EDITOR NAMESPACES</span>
                        </label>
                      </li>
                    </ul>
                  </div>
                )}

                {activePrefTab === 'Optimization speed' && (
                  <div className="speed-tab-pane">
                    <span className="sub-lbl" style={{ marginBottom: '0.5rem' }}>SELECT OPTIMIZATION EFFORT:</span>
                    <div className="speed-pills-row">
                      {['Fast', 'Standard', 'Insane'].map(spd => (
                        <button
                          key={spd}
                          type="button"
                          className={`pill-btn ${optimizationSpeed === spd ? 'active' : ''}`}
                          onClick={() => setOptimizationSpeed(spd)}
                        >
                          {spd === 'Fast' ? '⚡ FAST (SINGLE PASS)' : spd === 'Standard' ? '⚙️ STANDARD (RECOMMENDED)' : '💀 INSANE (MAX ZOPFLI ITERATIONS)'}
                        </button>
                      ))}
                    </div>
                    <small className="speed-note" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                      Insane runs 15-iteration Google Zopfli DEFLATE modeling & AdvPNG brute-force search.
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Fine Tuning Controls */}
            <div className="tuning-card">
              <div className="field-label-row">
                <span className="tuning-title">IMAGEOPTIM ADVANCED TUNING:</span>
                <span className="tuning-mode-pill">{activePreset.name.split(' ')[1]}</span>
              </div>

              {/* Format Target & Max Dimension Row */}
              <div className="tuning-grid-2">
                <div className="param-field">
                  <label className="field-label">TARGET FORMAT:</label>
                  <select
                    value={targetFormat}
                    onChange={(e) => {
                      const fmt = e.target.value;
                      setTargetFormat(fmt);
                      setSelectedPresetId('custom');
                      handleOptionChange({ targetFormat: fmt, presetId: 'custom' });
                    }}
                    className="studio-select"
                  >
                    <option value="original">KEEP ORIGINAL FORMAT</option>
                    <option value="image/webp">CONVERT ➔ WEBP (RECOMMENDED)</option>
                    <option value="image/avif">CONVERT ➔ AVIF (NEXT-GEN)</option>
                    <option value="image/jpeg">CONVERT ➔ JPEG / JPG</option>
                    <option value="image/png">CONVERT ➔ PNG</option>
                  </select>
                </div>

                <div className="param-field">
                  <label className="field-label">MAX DIMENSION:</label>
                  <select
                    value={maxDimension || 'none'}
                    onChange={(e) => {
                      const val = e.target.value === 'none' ? null : parseInt(e.target.value, 10);
                      setMaxDimension(val);
                      handleOptionChange({ maxDimension: val });
                    }}
                    className="studio-select"
                  >
                    <option value="none">ORIGINAL RESOLUTION (NO RESIZE)</option>
                    <option value="1920">MAX 1920PX (FULL HD)</option>
                    <option value="1280">MAX 1280PX (WEB READY)</option>
                    <option value="800">MAX 800PX (MOBILE/THUMBNAIL)</option>
                  </select>
                </div>
              </div>

              {/* PNG / Palette Quantization (pngquant) Controls */}
              <div className="pngquant-control-box">
                <div className="quant-head-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedPresetId === 'custom' ? pngQuantize : (activePreset.pngQuantize !== undefined ? activePreset.pngQuantize : true)}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setSelectedPresetId('custom');
                        setPngQuantize(val);
                        handleOptionChange({ pngQuantize: val, presetId: 'custom' });
                      }}
                    />
                    <span>ENABLE PNGQUANT COLOR QUANTIZATION</span>
                  </label>
                  <label className="checkbox-label micro">
                    <input
                      type="checkbox"
                      checked={pngDither}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setPngDither(val);
                        handleOptionChange({ pngDither: val });
                      }}
                    />
                    <span>FLOYD-STEINBERG DITHER</span>
                  </label>
                </div>

                <div className="palette-pills-row">
                  <span className="sub-lbl">PALETTE COLORS:</span>
                  {[256, 128, 64, 32, 16].map(colors => (
                    <button
                      key={colors}
                      type="button"
                      className={`pill-btn micro ${(selectedPresetId === 'custom' ? pngColors : (activePreset.pngColors || 256)) === colors ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPresetId('custom');
                        setPngColors(colors);
                        handleOptionChange({ pngColors: colors, presetId: 'custom' });
                      }}
                    >
                      {colors}
                    </button>
                  ))}
                </div>

                <div className="palette-pills-row" style={{ marginTop: '0.5rem' }}>
                  <span className="sub-lbl">SVG DECIMALS:</span>
                  {[1, 2, 3, 4].map(decimals => (
                    <button
                      key={decimals}
                      type="button"
                      className={`pill-btn micro ${(selectedPresetId === 'custom' ? svgPrecision : (activePreset.svgPrecision || 2)) === decimals ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPresetId('custom');
                        setSvgPrecision(decimals);
                        handleOptionChange({ svgPrecision: decimals, presetId: 'custom' });
                      }}
                    >
                      {decimals}
                    </button>
                  ))}
                </div>
              </div>

              {/* MozJPEG Advanced Techniques Controls Box */}
              <div className="mozjpeg-control-box">
                <div className="quant-head-row">
                  <span className="sub-lbl" style={{ color: 'var(--primary-orange)', fontWeight: 800 }}>
                    ⚡ MOZJPEG ADVANCED TECHNIQUES:
                  </span>
                </div>

                <div className="mozjpeg-toggles-grid">
                  <label className="checkbox-label micro">
                    <input
                      type="checkbox"
                      checked={mozTrellis && mozHuffman}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setMozTrellis(val);
                        setMozHuffman(val);
                        handleOptionChange({ trellisQuantization: val, optimizedHuffman: val, scanSplitOptimization: val });
                      }}
                    />
                    <span>TRELLIS QUANT & HUFFMAN TABLES</span>
                  </label>

                  <label className="checkbox-label micro">
                    <input
                      type="checkbox"
                      checked={mozProgressive}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setMozProgressive(val);
                        handleOptionChange({ progressiveRendering: val });
                      }}
                    />
                    <span>PROGRESSIVE (15% FIRST-PAINT)</span>
                  </label>

                  <label className="checkbox-label micro">
                    <input
                      type="checkbox"
                      checked={mozDeringing}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setMozDeringing(val);
                        handleOptionChange({ overshootDeringing: val });
                      }}
                    />
                    <span>OVERSHOOT DERINGING (WHITE BG)</span>
                  </label>

                  <label className="checkbox-label micro">
                    <input
                      type="checkbox"
                      checked={mozHighDpi}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setMozHighDpi(val);
                        handleOptionChange({ highDpiQuantTables: val });
                      }}
                    />
                    <span>HIGH-DPI / RETINA TABLES (CSF)</span>
                  </label>

                  <label className="checkbox-label micro">
                    <input
                      type="checkbox"
                      checked={mozGammaChroma}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setMozGammaChroma(val);
                        handleOptionChange({ gammaCorrectChroma: val });
                      }}
                    />
                    <span>GAMMA-CORRECT CHROMA (LINEAR)</span>
                  </label>

                  <label className="checkbox-label micro">
                    <input
                      type="checkbox"
                      checked={mozColorFringing}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setMozColorFringing(val);
                        handleOptionChange({ colorFringingReduction: val });
                      }}
                    />
                    <span>COLOR FRINGING REDUCTION</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Batch Files Queue */}
            <div className="batch-queue-container">
              <div className="queue-header-row">
                <span className="queue-title">BATCH QUEUE ({filesQueue.length} FILES)</span>
                <button
                  type="button"
                  className="add-files-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  + ADD MORE FILES
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.svg,.gif,.bmp"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleIncomingFiles(e.target.files)}
              />

              <div 
                className={`queue-list-viewport ${isDragging ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {filesQueue.length === 0 ? (
                  <div className="empty-queue-msg" onClick={() => fileInputRef.current?.click()}>
                    <span>📦 NO FILES IN QUEUE</span>
                    <small>Drop images here or choose from ready samples above</small>
                  </div>
                ) : (
                  filesQueue.map((item) => {
                    const isSelected = item.id === activeFileId;
                    return (
                      <div
                        key={item.id}
                        className={`queue-item-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setActiveFileId(item.id)}
                      >
                        <div className="item-thumb-box">
                          <img src={item.origUrl} alt={item.name} />
                        </div>

                        <div className="item-meta-box">
                          <span className="item-filename" title={item.name}>{item.name}</span>
                          <div className="item-sizes-row">
                            <span className="orig-size">{formatBytes(item.originalSizeBytes)}</span>
                            {item.status === 'done' && (
                              <>
                                <span className="arrow">➔</span>
                                <span className="comp-size">{formatBytes(item.compressedSizeBytes)}</span>
                                <span className="saved-pill">-{item.savedPercent}%</span>
                              </>
                            )}
                            {item.status === 'pending' && <span className="pending-pill">QUEUED</span>}
                            {item.status === 'error' && <span className="error-pill">FAILED</span>}
                          </div>
                          {item.status === 'done' && (
                            <div className="item-cleaning-badges">
                              <span className="clean-pill">✓ SCRUBBED</span>
                              <span className="clean-pill">sRGB</span>
                              {item.result?.cleaningReport?.toolsApplied?.[0] && (
                                <span className="engine-pill">
                                  {item.result.cleaningReport.toolsApplied[0].split(' ')[0]}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="item-action-btns" onClick={(e) => e.stopPropagation()}>
                          {item.status === 'done' && item.result && (
                            <a
                              href={item.result.url}
                              download={`${item.name.substring(0, item.name.lastIndexOf('.'))}_optimized.${item.result.formatExt}`}
                              className="mini-dl-btn"
                              title="Download Optimized File"
                            >
                              📥
                            </a>
                          )}
                          <button
                            type="button"
                            className="mini-del-btn"
                            onClick={() => handleRemoveItem(item.id)}
                            title="Remove File"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Batch Action Bar */}
              {filesQueue.length > 0 && (
                <div className="batch-action-bar">
                  <div className="batch-summary-info">
                    <div className="batch-totals">
                      <span>TOTAL: {formatBytes(batchStats.totalOriginal)} ➔ {formatBytes(batchStats.totalCompressed)}</span>
                      <strong className="batch-saved highlight">
                        SAVED: {formatBytes(batchStats.totalSaved)} (-{batchStats.savedPercent}%)
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="studio-btn-primary download-zip-btn"
                    onClick={handleDownloadZip}
                    disabled={isProcessingBatch || batchStats.count === 0}
                  >
                    {isProcessingBatch ? '⏳ OPTIMIZING...' : `📦 DOWNLOAD ALL AS .ZIP (${batchStats.count} FILES)`}
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      <style>{`
        .studio-compressor-section {
          padding: 6rem 2rem;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          border-bottom: 4px solid var(--border-color);
        }

        .compressor-container {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .compressor-header-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .compressor-main-title {
          font-family: var(--font-heading);
          font-size: 3.2rem;
          line-height: 1;
          letter-spacing: 2px;
          text-transform: uppercase;
          transform: skewX(-10deg);
          margin: 0;
        }

        .compressor-sub-desc {
          font-family: var(--font-body);
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 880px;
          line-height: 1.6;
          margin: 0;
        }

        /* Drag Overlay */
        .studio-compressor-section {
          position: relative;
        }

        .fullscreen-drag-overlay {
          position: absolute;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(8px);
          border: 4px dashed var(--primary-orange);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          pointer-events: all;
          animation: fadeIn 0.15s ease-out;
        }

        .drag-overlay-card {
          background: var(--bg-card);
          border: 3px solid var(--primary-orange);
          box-shadow: 10px 10px 0 var(--primary-orange);
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
          max-width: 700px;
        }

        .drag-overlay-icon {
          font-size: 3.5rem;
        }

        .drag-overlay-title {
          font-family: var(--font-heading);
          font-size: 2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .drag-overlay-sub {
          font-family: monospace;
          font-size: 0.95rem;
          color: var(--primary-orange);
          letter-spacing: 1px;
          font-weight: 700;
        }

        .drag-tools-pills {
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* ImageOptim Pillars Grid */
        .imageoptim-pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
          gap: 1.5rem;
        }

        .pillar-bullet-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          font-family: var(--font-body);
          font-size: 0.85rem;
          line-height: 1.45;
          color: var(--text-secondary);
        }

        .pillar-bullet-list li strong {
          color: var(--text-primary);
        }

        .clean-tag.moz {
          background: rgba(255, 106, 0, 0.12);
          border-color: rgba(255, 106, 0, 0.4);
          color: var(--primary-orange);
        }

        .mozjpeg-control-box {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.85rem;
        }

        .mozjpeg-toggles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }

        @media (max-width: 600px) {
          .mozjpeg-toggles-grid {
            grid-template-columns: 1fr;
          }
        }

        .active-mozjpeg-card {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px dashed var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .moz-head-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .moz-badge {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          color: var(--primary-orange);
        }

        .first-paint-tag {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid #22c55e;
          color: #22c55e;
        }

        .moz-techniques-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .moz-tech-pill {
          font-family: monospace;
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .pillar-card {
          background: var(--bg-card);
          border: 3px solid var(--text-primary);
          box-shadow: 6px 6px 0 var(--border-color);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .pillar-card:hover {
          transform: translateY(-2px);
          box-shadow: 8px 8px 0 var(--primary-orange);
        }

        .pillar-head {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .pillar-badge {
          align-self: flex-start;
          font-family: monospace;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 1.2px;
          padding: 0.2rem 0.5rem;
          background: var(--primary-orange);
          color: #000;
          text-transform: uppercase;
        }

        .pillar-title {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          margin: 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .pillar-body {
          font-family: var(--font-body);
          font-size: 0.92rem;
          line-height: 1.55;
          color: var(--text-secondary);
          margin: 0;
        }

        .inline-doc-link {
          color: var(--primary-orange);
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .inline-doc-link:hover {
          color: #fff;
        }

        .pillar-features-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: auto;
        }

        .clean-tag {
          font-family: monospace;
          font-size: 0.75rem;
          padding: 0.25rem 0.6rem;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #22c55e;
          font-weight: 700;
        }

        .tools-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: auto;
        }

        .tool-pill {
          font-family: monospace;
          font-size: 0.75rem;
          padding: 0.25rem 0.65rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 700;
          transition: all 0.15s ease;
        }

        .tool-pill:hover {
          border-color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.12);
          color: var(--primary-orange);
          transform: translateY(-1px);
        }

        /* Active Cleaning Report Card in Inspector */
        .active-cleaning-report-card {
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cleaning-head-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed var(--border-color);
        }

        .cleaning-badge {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          color: #22c55e;
        }

        .cleaning-tools-used {
          font-family: monospace;
          font-size: 0.72rem;
          color: var(--text-secondary);
        }

        .cleaning-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.65rem;
        }

        .clean-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.4rem 0.6rem;
        }

        .clean-status-icon {
          font-size: 1.1rem;
        }

        .clean-info {
          display: flex;
          flex-direction: column;
        }

        .clean-item-name {
          font-family: var(--font-heading);
          font-size: 0.7rem;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }

        .clean-item-state {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: #22c55e;
        }

        /* Item Cleaning Badges in Queue */
        .item-cleaning-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.25rem;
        }

        .clean-pill {
          font-family: monospace;
          font-size: 0.62rem;
          padding: 0.1rem 0.35rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
          font-weight: 700;
        }

        .engine-pill {
          font-family: monospace;
          font-size: 0.62rem;
          padding: 0.1rem 0.35rem;
          background: rgba(255, 106, 0, 0.1);
          border: 1px solid rgba(255, 106, 0, 0.3);
          color: var(--primary-orange);
          font-weight: 700;
        }

        /* Specs Banner */
        .studio-specs-banner {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr;
          gap: 1rem;
          background: var(--bg-card);
          border: 3px solid var(--text-primary);
          box-shadow: 6px 6px 0 var(--primary-orange);
          padding: 1rem 1.25rem;
        }

        @media (max-width: 900px) {
          .studio-specs-banner {
            grid-template-columns: 1fr;
          }
        }

        .spec-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .spec-glyph {
          font-size: 1.5rem;
        }

        .spec-text-block {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .spec-title {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          letter-spacing: 1.2px;
          color: var(--primary-orange);
        }

        .spec-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .compressor-error-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #ffe5e5;
          color: #cc0000;
          border: 2px solid #cc0000;
          padding: 0.75rem 1rem;
        }

        /* Presets Bar */
        .presets-selector-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          padding: 0.85rem 1.25rem;
        }

        .presets-label {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .presets-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .preset-pill-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.15rem;
          font-family: var(--font-heading);
          padding: 0.4rem 0.85rem;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .preset-name {
          font-size: 0.82rem;
          letter-spacing: 0.8px;
        }

        .preset-tag {
          font-family: monospace;
          font-size: 0.65rem;
          color: var(--text-secondary);
        }

        .preset-pill-btn:hover {
          border-color: var(--primary-orange);
        }

        .preset-pill-btn.active {
          background: var(--primary-orange);
          color: #fff;
          border-color: #000;
          box-shadow: 2px 2px 0 #000;
        }

        .preset-pill-btn.active .preset-tag {
          color: rgba(255, 255, 255, 0.85);
        }

        /* Demo Starters */
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
        .compressor-workbench-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1000px) {
          .compressor-workbench-grid {
            grid-template-columns: 1fr;
          }
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
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .pane-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .active-item-badge {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.12);
          border: 1px solid rgba(255, 106, 0, 0.4);
          padding: 0.15rem 0.45rem;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .inspector-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .grid-toggle-row, .zoom-toggle-row {
          display: flex;
          gap: 0.25rem;
        }

        .grid-pill, .zoom-pill {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.2rem 0.45rem;
          font-size: 0.75rem;
          cursor: pointer;
          font-family: monospace;
        }

        .grid-pill.active, .zoom-pill.active {
          background: var(--primary-orange);
          color: #fff;
          border-color: #000;
        }

        /* Inspector Viewport */
        .inspector-viewport-wrap {
          min-height: 400px;
          background: #000;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .slider-zoom-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropzone-empty-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          padding: 3rem 1.5rem;
          text-align: center;
          cursor: pointer;
          width: 100%;
        }

        .dropzone-empty-hero.drag-over {
          background: rgba(255, 106, 0, 0.1);
        }

        .drop-icon {
          font-size: 3rem;
        }

        .drop-text {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          letter-spacing: 1.5px;
        }

        .drop-sub {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .select-btn {
          margin-top: 0.5rem;
          padding: 0.5rem 1.25rem;
        }

        /* Metrics Strip */
        .active-metrics-strip {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr auto;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          padding: 0.75rem 1rem;
        }

        @media (max-width: 650px) {
          .active-metrics-strip {
            grid-template-columns: 1fr 1fr;
          }
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .metric-lbl {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          color: var(--text-secondary);
          letter-spacing: 0.8px;
        }

        .metric-val {
          font-family: monospace;
          font-size: 1.05rem;
          font-weight: 700;
        }

        .metric-val.highlight {
          color: var(--primary-orange);
        }

        .saved-badge-box {
          background: rgba(255, 106, 0, 0.1);
          border: 1px dashed var(--primary-orange);
          padding: 0.35rem 0.6rem;
          text-align: center;
        }

        .saved-percent-tag {
          font-family: var(--font-heading);
          font-size: 1rem;
          letter-spacing: 1px;
          color: var(--primary-orange);
          font-weight: 700;
        }

        .saved-bytes-sub {
          font-family: monospace;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .download-single-btn {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        /* Tuning Card */
        .tuning-card {
          background: rgba(255, 106, 0, 0.03);
          border: 2px solid var(--border-color);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tuning-title {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .tuning-mode-pill {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.12);
          border: 1px solid rgba(255, 106, 0, 0.35);
          padding: 0.15rem 0.45rem;
        }

        .param-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field-label-row, .field-label {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-heading);
          font-size: 0.82rem;
          letter-spacing: 0.8px;
          color: var(--text-secondary);
        }

        .field-metric {
          color: var(--primary-orange);
          font-family: monospace;
        }

        .studio-slider {
          width: 100%;
          accent-color: var(--primary-orange);
          cursor: pointer;
        }

        .tuning-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        @media (max-width: 600px) {
          .tuning-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        .studio-select {
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.4rem 0.6rem;
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 0.8px;
          cursor: pointer;
        }

        /* pngquant Controls */
        .pngquant-control-box {
          border-top: 1px dashed var(--border-color);
          padding-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .quant-head-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 0.8px;
          cursor: pointer;
        }

        .checkbox-label.micro {
          font-size: 0.72rem;
          color: var(--text-secondary);
        }

        .palette-pills-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .sub-lbl {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          letter-spacing: 0.8px;
          color: var(--text-secondary);
        }

        .pill-btn.micro {
          font-family: monospace;
          font-size: 0.72rem;
          padding: 0.2rem 0.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
        }

        .pill-btn.micro.active {
          background: var(--primary-orange);
          color: #fff;
          border-color: #000;
          box-shadow: 2px 2px 0 #000;
        }

        /* Batch Queue */
        .batch-queue-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .queue-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .queue-title {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .add-files-btn {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 0.8px;
          background: none;
          border: 1px dashed var(--primary-orange);
          color: var(--primary-orange);
          padding: 0.25rem 0.6rem;
          cursor: pointer;
        }

        .queue-list-viewport {
          max-height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          padding: 0.5rem;
        }

        .empty-queue-msg {
          padding: 2rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          letter-spacing: 1px;
          cursor: pointer;
        }

        .queue-item-card {
          display: grid;
          grid-template-columns: 36px 1fr auto;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          padding: 0.4rem 0.6rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .queue-item-card:hover {
          border-color: var(--primary-orange);
        }

        .queue-item-card.selected {
          border-color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.08);
          box-shadow: 2px 2px 0 var(--primary-orange);
        }

        .item-thumb-box {
          width: 36px;
          height: 36px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .item-thumb-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .item-meta-box {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          overflow: hidden;
        }

        .item-filename {
          font-family: var(--font-heading);
          font-size: 0.82rem;
          letter-spacing: 0.8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-sizes-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: monospace;
          font-size: 0.72rem;
        }

        .orig-size {
          color: var(--text-secondary);
        }

        .arrow {
          color: var(--text-secondary);
          font-size: 0.65rem;
        }

        .comp-size {
          color: var(--text-primary);
          font-weight: 700;
        }

        .saved-pill {
          color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.15);
          padding: 0.05rem 0.3rem;
          border-radius: 2px;
          font-weight: 700;
        }

        .pending-pill {
          color: #ff9900;
        }

        .error-pill {
          color: #ff3333;
        }

        .item-action-btns {
          display: flex;
          gap: 0.35rem;
        }

        .mini-dl-btn, .mini-del-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.2rem 0.4rem;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mini-del-btn:hover {
          color: #ff3333;
          border-color: #ff3333;
        }

        .mini-dl-btn:hover {
          color: var(--primary-orange);
          border-color: var(--primary-orange);
        }

        /* Batch Action Bar */
        .batch-action-bar {
          background: var(--bg-card);
          border: 2px solid var(--text-primary);
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .batch-summary-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .batch-totals {
          display: flex;
          flex-direction: column;
          font-family: monospace;
          font-size: 0.8rem;
        }

        .batch-saved {
          font-size: 0.9rem;
          color: var(--primary-orange);
        }

        .download-zip-btn {
          padding: 0.6rem 1.25rem;
          font-size: 0.88rem;
        }

        .clear-all-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-size: 0.78rem;
          letter-spacing: 0.8px;
          cursor: pointer;
        }

        .clear-all-link:hover {
          color: #ff3333;
        }

        /* ImageOptim Preferences Card (Pixel-matching official macOS app) */
        .imageoptim-prefs-card {
          background: #25282c;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          color: #f1f5f9;
        }

        .prefs-tabs-header {
          display: inline-flex;
          align-self: center;
          background: #191b1e;
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pref-tab-btn {
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #94a3b8;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          padding: 5px 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .pref-tab-btn:hover {
          color: #ffffff;
        }

        .pref-tab-btn.active {
          background: #3b82f6;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
        }

        .prefs-tab-content {
          display: flex;
          flex-direction: column;
        }

        .quality-tab-pane {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .lossy-toggle-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.25rem;
        }

        .lossy-main-checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          user-select: none;
        }

        .lossy-main-checkbox-label input[type="checkbox"] {
          width: 17px;
          height: 17px;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        .lossy-title-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 0.98rem;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.2px;
        }

        .lossy-sub-caption {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 0;
        }

        .lossless-active-callout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: rgba(59, 130, 246, 0.08);
          border: 1px dashed rgba(59, 130, 246, 0.45);
          border-radius: 6px;
          padding: 0.4rem 0.85rem;
          font-family: monospace;
          font-size: 0.72rem;
          color: #93c5fd;
          letter-spacing: 0.5px;
          margin-top: 0.25rem;
        }

        .callout-shield {
          font-size: 0.9rem;
        }

        .prefs-sliders-box {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.5rem;
          transition: opacity 0.2s ease, filter 0.2s ease;
        }

        .prefs-sliders-box.dimmed {
          opacity: 0.4;
          filter: grayscale(0.5);
          pointer-events: none;
        }

        .pref-slider-row {
          display: grid;
          grid-template-columns: 95px 1fr 40px;
          align-items: center;
          gap: 0.75rem;
        }

        .pref-slider-row.full {
          width: 100%;
        }

        .pref-slider-name {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: #f1f5f9;
          text-align: right;
          white-space: nowrap;
        }

        .pref-slider-track-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          width: 100%;
        }

        .imageoptim-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: #474f5a;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
        }

        .imageoptim-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 20px;
          border-radius: 3px;
          background: #cbd5e1;
          border: 1px solid #64748b;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
          cursor: grab;
          transition: background 0.15s ease;
        }

        .imageoptim-slider::-webkit-slider-thumb:hover {
          background: #ffffff;
        }

        .imageoptim-slider::-moz-range-thumb {
          width: 14px;
          height: 20px;
          border-radius: 3px;
          background: #cbd5e1;
          border: 1px solid #64748b;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
          cursor: grab;
        }

        .pref-ticks-labels {
          display: flex;
          justify-content: space-between;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 0.72rem;
          color: #94a3b8;
          padding: 0 2px;
          user-select: none;
        }

        .pref-current-val {
          font-family: monospace;
          font-size: 0.82rem;
          font-weight: 600;
          color: #cbd5e1;
          text-align: right;
        }

        .pref-sliders-split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 768px) {
          .pref-sliders-split-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
          .pref-slider-row {
            grid-template-columns: 85px 1fr 35px;
          }
        }

        .prefs-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 0.75rem;
          margin-top: 0.5rem;
        }

        .prefs-active-mode-label {
          font-family: monospace;
          font-size: 0.74rem;
          color: #f59e0b;
          letter-spacing: 0.4px;
        }

        .prefs-help-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #474f5a;
          border: 1px solid #64748b;
          color: #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 0.75rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .prefs-help-btn:hover {
          background: #64748b;
          color: #ffffff;
        }

        .general-tab-pane {
          padding: 0.5rem 0;
        }

        .prefs-options-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .speed-tab-pane {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 0.5rem 0;
        }

        .speed-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
      `}</style>
    </section>
  );
};

export default StudioCompressor;
