import React, { useState, useEffect, useRef, useMemo } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { 
  CONVERTER_TOOLS, 
  executeConversion, 
  MAX_FILE_SIZE_BYTES 
} from '../utils/converterEngine';
import sampleSvgUrl from '../assets/lightning_bolt_sticker_vector.svg';
import sampleRasterUrl from '../assets/merch/bolt_sticker_merch_neutral_01.webp';

const StudioConverter = () => {
  const [selectedToolId, setSelectedToolId] = useState('svg-to-png');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'svg-to' | 'to-svg' | 'special'
  
  // File & Conversion state
  const [sourceFile, setSourceFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState(null);
  const [sourceMeta, setSourceMeta] = useState(null);
  
  const [resultData, setResultData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  
  // Conversion Settings
  const [rasterScale, setRasterScale] = useState(2);
  const [exportQuality, setExportQuality] = useState(0.92);
  const [canvasBg, setCanvasBg] = useState('transparent');
  const [vectorPreset, setVectorPreset] = useState('flat');
  const [vectorColors, setVectorColors] = useState(8);
  const [previewBgGrid, setPreviewBgGrid] = useState('checker'); // 'checker' | 'dark' | 'light'
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side'

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-delete ephemeral session countdown (1 hour)
  const [expirySeconds, setExpirySeconds] = useState(3600);
  const expiryTimerRef = useRef(null);
  const sessionCreatedRef = useRef(null);
  const activeUrlsRef = useRef([]);

  const currentTool = useMemo(() => {
    return CONVERTER_TOOLS.find(t => t.id === selectedToolId) || CONVERTER_TOOLS[0];
  }, [selectedToolId]);

  // Track & auto-cleanup URLs
  const registerObjectUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      activeUrlsRef.current.push(url);
    }
    return url;
  };

  const cleanupObjectUrls = () => {
    activeUrlsRef.current.forEach(u => {
      try { 
        URL.revokeObjectURL(u); 
      } catch (err) {
        console.warn('Failed to revoke object URL:', err);
      }
    });
    activeUrlsRef.current = [];
  };

  // Reset workbench
  const handleReset = React.useCallback(() => {
    cleanupObjectUrls();
    setSourceFile(null);
    setSourceUrl(null);
    setSourceMeta(null);
    setResultData(null);
    setErrorNotice(null);
  }, []);

  // 1-Hour Ephemeral Retention Countdown
  useEffect(() => {
    sessionCreatedRef.current = Date.now();

    if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);

    expiryTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionCreatedRef.current) / 1000);
      const remaining = Math.max(0, 3600 - elapsed);
      setExpirySeconds(remaining);

      if (remaining <= 0) {
        // Automatic deletion triggered
        handleReset();
        setErrorNotice('Notice: Session expired. Uploaded files and cached assets have been automatically purged per our 1-hour privacy policy.');
        clearInterval(expiryTimerRef.current);
      }
    }, 1000);

    return () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
      cleanupObjectUrls();
    };
  }, [handleReset]);

  const formatCountdown = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Switch to paired reverse tool
  const handleSwapTool = () => {
    if (!currentTool.pairId) return;
    handleToolChange(currentTool.pairId);
  };

  const handleToolChange = (newToolId) => {
    setSelectedToolId(newToolId);
    setErrorNotice(null);
    setResultData(null);
    // If current source file does not match new accept requirements, prompt user
  };

  // File handling & validation
  const handleIncomingFile = (file) => {
    setErrorNotice(null);
    if (!file) return;

    // 200MB size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorNotice(`FILE EXCEEDS MAXIMUM SIZE: ${sizeMb}MB exceeds the 200MB hard limit.`);
      return;
    }

    // Format validation helper
    const name = file.name.toLowerCase();
    const isSvg = name.endsWith('.svg') || file.type.includes('svg');
    const isSvgz = name.endsWith('.svgz');

    if (currentTool.inputFormat === 'SVG' && !isSvg && !isSvgz) {
      setErrorNotice(`Selected tool requires SVG input (Uploaded: ${file.name}). Please drop an SVG or switch to ${file.name.split('.').pop().toUpperCase()} to SVG.`);
    }

    setSourceFile(file);
    const url = registerObjectUrl(URL.createObjectURL(file));
    setSourceUrl(url);

    setSourceMeta({
      name: file.name,
      sizeKb: Math.round((file.size / 1024) * 10) / 10,
      sizeBytes: file.size,
      type: file.type || name.split('.').pop().toUpperCase()
    });

    setResultData(null);
    // Restart 1-hour auto-deletion clock on new upload
    sessionCreatedRef.current = Date.now();
    setExpirySeconds(3600);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleIncomingFile(e.dataTransfer.files[0]);
    }
  };

  // Load built-in studio sample asset for instant testing
  const handleLoadSample = (sampleType) => {
    setErrorNotice(null);
    if (sampleType === 'svg') {
      setSourceFile(null);
      setSourceUrl(sampleSvgUrl);
      setSourceMeta({
        name: 'lightning_bolt_sticker_vector.svg',
        sizeKb: 19.1,
        sizeBytes: 19500,
        type: 'image/svg+xml'
      });
      // Auto-select SVG-to-PNG if raster-to-svg was active
      if (currentTool.direction === 'raster-to-svg') {
        setSelectedToolId('svg-to-png');
      }
    } else {
      setSourceFile(null);
      setSourceUrl(sampleRasterUrl);
      setSourceMeta({
        name: 'bolt_sticker_merch_neutral_01.webp',
        sizeKb: 76.4,
        sizeBytes: 78200,
        type: 'image/webp'
      });
      // Auto-select WebP to SVG
      setSelectedToolId('webp-to-svg');
    }
    setResultData(null);
    sessionCreatedRef.current = Date.now();
    setExpirySeconds(3600);
  };

  // Execute Conversion
  const handleConvert = async () => {
    if (!sourceUrl) {
      setErrorNotice('Please upload a file or load a sample asset first.');
      return;
    }

    setIsProcessing(true);
    setErrorNotice(null);

    try {
      const result = await executeConversion({
        toolId: currentTool.id,
        file: sourceFile,
        sourceUrl,
        options: {
          scale: rasterScale,
          quality: exportQuality,
          bgColor: canvasBg,
          vectorPreset,
          vectorColors,
          vectorDetail: 0.3
        }
      });

      registerObjectUrl(result.url);
      setResultData(result);
    } catch (err) {
      console.error('Conversion failed:', err);
      setErrorNotice(err.message || 'Conversion failed. Please verify the input file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy SVG markup
  const handleCopySvgCode = async () => {
    if (!resultData?.svgText) return;
    try {
      await navigator.clipboard.writeText(resultData.svgText);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2200);
    } catch (err) {
      console.warn('Failed to copy SVG code to clipboard:', err);
    }
  };

  // Filtered tools
  const filteredTools = useMemo(() => {
    if (activeFilter === 'svg-to') {
      return CONVERTER_TOOLS.filter(t => t.direction === 'svg-to-raster');
    }
    if (activeFilter === 'to-svg') {
      return CONVERTER_TOOLS.filter(t => t.direction === 'raster-to-svg');
    }
    if (activeFilter === 'special') {
      return CONVERTER_TOOLS.filter(t => t.direction.includes('archive') || t.id.includes('apng') || t.id.includes('jxl') || t.id.includes('gif'));
    }
    return CONVERTER_TOOLS;
  }, [activeFilter]);

  return (
    <section id="converter-tools" className="studio-converter-section bg-halftone">
      <div className="converter-container">
        
        {/* Comic Section Header */}
        <div className="section-header-row">
          <div className="section-label">STUDIO CONVERTER // IMAGE MATRIX</div>
          <h2 className="converter-main-title comic-text">
            IMAGE & VECTOR CONVERTER MATRIX
          </h2>
          <p className="converter-sub-desc">
            Ultra-fast in-browser graphics conversion engine. Render SVG vector blueprints into high-resolution rasters, or trace photos, PNGs, and WebPs into crisp, scalable SVG vector curves with dual-view before & after inspection.
          </p>
        </div>

        {/* Studio Specs & Privacy Notice Bar */}
        <div className="studio-policy-banner">
          <div className="policy-pill format-pill">
            <span className="policy-icon">📐</span>
            <div className="policy-text-group">
              <span className="policy-title">SUPPORTED IMAGE TYPES</span>
              <span className="policy-detail">SVG (Scalable Vector Graphics) • PNG • JPG • WebP • AVIF • APNG • JXL • GIF • SVGZ</span>
            </div>
          </div>

          <div className="policy-pill size-pill">
            <span className="policy-icon">⚡</span>
            <div className="policy-text-group">
              <span className="policy-title">MAX FILE SIZE</span>
              <span className="policy-detail">200MB Upload Limit • Instant In-Memory Processing</span>
            </div>
          </div>

          <div className="policy-pill retention-pill">
            <span className="policy-icon">🛡️</span>
            <div className="policy-text-group">
              <span className="policy-title">EPHEMERAL PRIVACY VAULT</span>
              <span className="policy-detail">
                All uploaded files are automatically deleted 1 hour after upload ({formatCountdown(expirySeconds)} remaining)
              </span>
            </div>
          </div>
        </div>

        {/* Error / Warning Alert */}
        {errorNotice && (
          <div className="converter-error-banner" role="alert">
            <span className="alert-badge">ALERT</span>
            <span className="alert-text">{errorNotice}</span>
            <button className="alert-close-btn" onClick={() => setErrorNotice(null)}>✕</button>
          </div>
        )}

        {/* Tool Filter Tabs & Quick Pair Swap */}
        <div className="tool-control-strip">
          <div className="filter-tab-group" role="tablist">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              ALL CONVERTERS ({CONVERTER_TOOLS.length})
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'svg-to' ? 'active' : ''}`}
              onClick={() => setActiveFilter('svg-to')}
            >
              SVG ➔ RASTER (PNG, JPG, WEBP, AVIF...)
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'to-svg' ? 'active' : ''}`}
              onClick={() => setActiveFilter('to-svg')}
            >
              RASTER ➔ SVG (TRACE & VECTORIZE)
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'special' ? 'active' : ''}`}
              onClick={() => setActiveFilter('special')}
            >
              SPECIALTY (APNG, JXL, GIF, SVGZ)
            </button>
          </div>

          {currentTool.pairId && (
            <button className="swap-pair-btn" onClick={handleSwapTool} title={`Switch to ${currentTool.pairId.replace(/-/g, ' ').toUpperCase()}`}>
              <span className="swap-icon">⇄</span>
              <span>FLIP DIRECTION ({currentTool.outputFormat} ➔ {currentTool.inputFormat})</span>
            </button>
          )}
        </div>

        {/* Converter Tool Selection Grid */}
        <div className="converter-grid">
          {filteredTools.map((tool) => {
            const isSelected = tool.id === selectedToolId;
            return (
              <button
                key={tool.id}
                type="button"
                className={`tool-card-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToolChange(tool.id)}
              >
                <div className="tool-card-top">
                  <span className="tool-glyph">{tool.icon}</span>
                  <div className="tool-flow-pill">
                    <span className="format-in">{tool.inputFormat}</span>
                    <span className="arrow-sym">➔</span>
                    <span className="format-out">{tool.outputFormat}</span>
                  </div>
                </div>
                <div className="tool-name">{tool.name}</div>
                <div className="tool-subdesc">{tool.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Workbench Section: Upload & Settings */}
        <div className="converter-workbench-panel">
          
          {/* Active Tool Header Strip */}
          <div className="workbench-head">
            <div className="workbench-title-group">
              <span className="workbench-tool-badge">ACTIVE CONVERTER</span>
              <h3 className="workbench-tool-title">{currentTool.name}</h3>
              <span className="workbench-tool-specs">
                INPUT: <strong>{currentTool.inputFormat}</strong> • OUTPUT: <strong>{currentTool.outputFormat}</strong> • MAX: <strong>200MB</strong>
              </span>
            </div>

            {/* Quick Sample Asset Loaders */}
            <div className="sample-asset-actions">
              <span className="sample-label">TRY SAMPLE ASSET:</span>
              <button 
                type="button" 
                className="sample-btn svg-sample" 
                onClick={() => handleLoadSample('svg')}
              >
                ⚡ STUDIO BOLT (SVG)
              </button>
              <button 
                type="button" 
                className="sample-btn raster-sample" 
                onClick={() => handleLoadSample('raster')}
              >
                🖼️ MERCH BADGE (WEBP)
              </button>
            </div>
          </div>

          {/* Dual Column: Dropzone & Settings */}
          <div className="workbench-body-grid">
            
            {/* Column 1: Input Dropzone */}
            <div className="workbench-col dropzone-col">
              <div
                className={`dropzone-box ${isDragging ? 'drag-active' : ''} ${sourceUrl ? 'has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={currentTool.accept}
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleIncomingFile(e.target.files[0])}
                />

                <div className="dropzone-content">
                  <div className="dropzone-icon-glow">
                    <span className="drop-icon">{currentTool.icon}</span>
                  </div>
                  
                  <div className="drop-headline">
                    {sourceMeta ? 'CHANGE INPUT FILE' : `DROP YOUR ${currentTool.inputFormat} FILE HERE`}
                  </div>
                  
                  <div className="drop-subtext">
                    or click to browse filesystem • up to 200MB supported
                  </div>

                  {sourceMeta && (
                    <div className="active-file-pill" onClick={(e) => e.stopPropagation()}>
                      <span className="file-name">📄 {sourceMeta.name}</span>
                      <span className="file-size">{sourceMeta.sizeKb} KB</span>
                    </div>
                  )}

                  <div className="privacy-badge-inline">
                    🔒 100% Client-Side Engine • Auto-deleted after 1 hour
                  </div>
                </div>
              </div>

              {sourceUrl && (
                <div className="dropzone-footer-actions">
                  <button type="button" className="action-link-btn clear-btn" onClick={handleReset}>
                    ✕ REMOVE FILE
                  </button>
                  <button 
                    type="button" 
                    className="action-convert-btn" 
                    onClick={handleConvert}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '⚡ CONVERTING...' : `▶ RUN CONVERT (${currentTool.inputFormat} ➔ ${currentTool.outputFormat})`}
                  </button>
                </div>
              )}
            </div>

            {/* Column 2: Parameters & Fine Tuning */}
            <div className="workbench-col settings-col">
              <div className="settings-panel-box">
                <div className="settings-title">⚙️ CONVERSION PARAMETERS</div>

                {/* SVG to Raster Controls */}
                {currentTool.direction === 'svg-to-raster' && (
                  <div className="settings-group">
                    <div className="control-row">
                      <label className="control-label">
                        <span>RESOLUTION UPSCALE:</span>
                        <strong className="param-value">{rasterScale}x ({rasterScale === 1 ? 'Standard' : rasterScale === 2 ? 'Retina @2x' : 'Ultra 4K @4x'})</strong>
                      </label>
                      <div className="scale-pill-buttons">
                        {[1, 2, 4].map(s => (
                          <button
                            key={s}
                            type="button"
                            className={`scale-btn ${rasterScale === s ? 'active' : ''}`}
                            onClick={() => setRasterScale(s)}
                          >
                            {s}x {s === 4 ? '🔥 4K' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    {currentTool.outputFormat !== 'PNG' && currentTool.outputFormat !== 'APNG' && currentTool.outputFormat !== 'GIF' && (
                      <div className="control-row">
                        <label className="control-label">
                          <span>COMPRESSION QUALITY:</span>
                          <strong className="param-value">{Math.round(exportQuality * 100)}%</strong>
                        </label>
                        <input
                          type="range"
                          min="0.4"
                          max="1.0"
                          step="0.05"
                          value={exportQuality}
                          onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                          className="studio-slider"
                        />
                      </div>
                    )}

                    <div className="control-row">
                      <label className="control-label">
                        <span>CANVAS BACKGROUND:</span>
                        <strong className="param-value">{canvasBg.toUpperCase()}</strong>
                      </label>
                      <div className="bg-pill-buttons">
                        <button
                          type="button"
                          className={`bg-btn ${canvasBg === 'transparent' ? 'active' : ''}`}
                          onClick={() => setCanvasBg('transparent')}
                          disabled={currentTool.outputFormat === 'JPG'}
                        >
                          TRANSPARENT
                        </button>
                        <button
                          type="button"
                          className={`bg-btn ${canvasBg === '#ffffff' ? 'active' : ''}`}
                          onClick={() => setCanvasBg('#ffffff')}
                        >
                          SOLID WHITE
                        </button>
                        <button
                          type="button"
                          className={`bg-btn ${canvasBg === '#000000' ? 'active' : ''}`}
                          onClick={() => setCanvasBg('#000000')}
                        >
                          SOLID BLACK
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Raster to SVG Controls */}
                {currentTool.direction === 'raster-to-svg' && (
                  <div className="settings-group">
                    <div className="control-row">
                      <label className="control-label">
                        <span>VECTOR PRESET:</span>
                        <strong className="param-value">{vectorPreset.toUpperCase()}</strong>
                      </label>
                      <div className="preset-pill-buttons">
                        {['flat', 'detailed', 'poster', 'lineart', 'bw'].map(p => (
                          <button
                            key={p}
                            type="button"
                            className={`scale-btn ${vectorPreset === p ? 'active' : ''}`}
                            onClick={() => setVectorPreset(p)}
                          >
                            {p.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="control-row">
                      <label className="control-label">
                        <span>MAX COLOR PALETTE:</span>
                        <strong className="param-value">{vectorColors} COLORS</strong>
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="32"
                        step="2"
                        value={vectorColors}
                        onChange={(e) => setVectorColors(parseInt(e.target.value, 10))}
                        className="studio-slider"
                      />
                    </div>
                  </div>
                )}

                {/* SVGZ Specialty Controls */}
                {(currentTool.id === 'svgz-to-svg' || currentTool.id === 'svg-to-svgz') && (
                  <div className="settings-group">
                    <p className="special-notice-text">
                      Gzip stream encoding directly decompresses and serializes XML vector codestreams without quality loss.
                    </p>
                  </div>
                )}

                {/* Instant Trigger Button */}
                <div className="settings-action-row">
                  <button 
                    type="button" 
                    className="studio-cta-convert"
                    onClick={handleConvert}
                    disabled={!sourceUrl || isProcessing}
                  >
                    {isProcessing ? '⏳ PROCESSING CONVERSION...' : `⚡ CONVERT NOW ➔ ${currentTool.outputFormat}`}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* STUDIO PREVIEW ENGINE: Showing Before & After in the same preview control */}
        {sourceUrl && (
          <div className="studio-preview-engine-card">
            
            <div className="preview-engine-header">
              <div className="engine-title-wrap">
                <span className="engine-tag">STUDIO PREVIEW ENGINE</span>
                <h3 className="engine-headline">BEFORE & AFTER COMPARISON CONTROL</h3>
              </div>

              <div className="preview-tools-bar">
                {/* Background Checker Toggle */}
                <div className="bg-toggle-group">
                  <span className="toggle-lbl">BG:</span>
                  <button 
                    className={`bg-toggle-btn ${previewBgGrid === 'checker' ? 'active' : ''}`}
                    onClick={() => setPreviewBgGrid('checker')}
                    title="Checkered grid (transparency)"
                  >
                    🏁
                  </button>
                  <button 
                    className={`bg-toggle-btn ${previewBgGrid === 'dark' ? 'active' : ''}`}
                    onClick={() => setPreviewBgGrid('dark')}
                    title="Dark background"
                  >
                    ⬛
                  </button>
                  <button 
                    className={`bg-toggle-btn ${previewBgGrid === 'light' ? 'active' : ''}`}
                    onClick={() => setPreviewBgGrid('light')}
                    title="Light background"
                  >
                    ⬜
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="view-mode-buttons">
                  <button 
                    className={`mode-btn ${viewMode === 'slider' ? 'active' : ''}`}
                    onClick={() => setViewMode('slider')}
                  >
                    DUAL SLIDER
                  </button>
                  <button 
                    className={`mode-btn ${viewMode === 'side' ? 'active' : ''}`}
                    onClick={() => setViewMode('side')}
                  >
                    SIDE BY SIDE
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Preview Canvas Area */}
            <div className={`preview-viewport bg-${previewBgGrid}`}>
              {viewMode === 'slider' ? (
                <BeforeAfterSlider
                  beforeImage={sourceUrl}
                  afterImage={resultData ? resultData.url : sourceUrl}
                  beforeLabel={`INPUT (${currentTool.inputFormat})`}
                  afterLabel={resultData ? `RESULT (${currentTool.outputFormat})` : `READY TO CONVERT`}
                />
              ) : (
                <div className="side-by-side-layout">
                  <div className="side-pane">
                    <div className="side-badge">SOURCE // {currentTool.inputFormat}</div>
                    <img src={sourceUrl} alt="Source Input" />
                  </div>
                  <div className="side-pane">
                    <div className="side-badge result">
                      {resultData ? `CONVERTED // ${currentTool.outputFormat}` : 'PREVIEW PENDING'}
                    </div>
                    <img src={resultData ? resultData.url : sourceUrl} alt="Output Result" />
                  </div>
                </div>
              )}
            </div>

            {/* Results Metadata & Download Actions */}
            {resultData && (
              <div className="preview-results-bar">
                <div className="stats-metric-strip">
                  <div className="metric-item">
                    <span className="metric-label">INPUT SIZE</span>
                    <span className="metric-val">{sourceMeta?.sizeKb || '—'} KB</span>
                  </div>
                  <div className="metric-divider">➔</div>
                  <div className="metric-item">
                    <span className="metric-label">OUTPUT SIZE</span>
                    <span className="metric-val highlight">{resultData.sizeKb} KB</span>
                  </div>
                  {resultData.width > 0 && (
                    <div className="metric-item">
                      <span className="metric-label">DIMENSIONS</span>
                      <span className="metric-val">{resultData.width} × {resultData.height} PX</span>
                    </div>
                  )}
                  <div className="metric-item">
                    <span className="metric-label">OUTPUT FORMAT</span>
                    <span className="metric-val format-tag">.{currentTool.outputExt.toUpperCase()}</span>
                  </div>
                </div>

                <div className="results-cta-group">
                  {resultData.svgText && (
                    <button 
                      type="button" 
                      className="studio-btn-secondary"
                      onClick={handleCopySvgCode}
                    >
                      {copyCodeSuccess ? '✓ COPIED SVG CODE!' : '📋 COPY SVG MARKUP'}
                    </button>
                  )}

                  <a
                    href={resultData.url}
                    download={`RYNELL_STUDIO_${(sourceMeta?.name || 'CONVERTED').replace(/\.[^/.]+$/, "")}.${currentTool.outputExt}`}
                    className="studio-btn-primary download-action"
                  >
                    📥 DOWNLOAD .{currentTool.outputExt.toUpperCase()} ASSET
                  </a>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      <style>{`
        .studio-converter-section {
          padding: 6rem 2rem;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          position: relative;
          border-bottom: 4px solid var(--border-color);
        }

        .converter-container {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .section-header-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .converter-main-title {
          font-family: var(--font-heading);
          font-size: 3.2rem;
          line-height: 1;
          letter-spacing: 2px;
          text-transform: uppercase;
          transform: skewX(-10deg);
          margin: 0;
          color: var(--text-primary);
        }

        .converter-sub-desc {
          font-family: var(--font-body);
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 860px;
          line-height: 1.6;
          margin: 0;
        }

        /* Studio Policy Bar */
        .studio-policy-banner {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1.6fr;
          gap: 1rem;
          background: var(--bg-card);
          border: 3px solid var(--text-primary);
          box-shadow: 6px 6px 0 var(--primary-orange);
          padding: 1rem 1.25rem;
        }

        .policy-pill {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .policy-icon {
          font-size: 1.5rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .policy-text-group {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .policy-title {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1.2px;
          font-weight: 800;
          color: var(--primary-orange);
        }

        .policy-detail {
          font-family: var(--font-body);
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Error Alert */
        .converter-error-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #ffebe8;
          border: 3px solid #ff3b30;
          color: #900;
          padding: 0.85rem 1.25rem;
          box-shadow: 4px 4px 0 #ff3b30;
        }

        .alert-badge {
          font-family: var(--font-heading);
          background: #ff3b30;
          color: #fff;
          padding: 0.2rem 0.5rem;
          font-size: 0.8rem;
          letter-spacing: 1px;
        }

        .alert-text {
          flex: 1;
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .alert-close-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: inherit;
        }

        /* Filter Strip */
        .tool-control-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .filter-tab-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-btn {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          border-color: var(--primary-orange);
          transform: translateY(-2px);
        }

        .filter-btn.active {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
          box-shadow: 3px 3px 0 var(--primary-orange);
        }

        .swap-pair-btn {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          padding: 0.5rem 1.1rem;
          background: var(--secondary-blue);
          color: #fff;
          border: 2px solid #000;
          box-shadow: 3px 3px 0 #000;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.15s ease;
        }

        .swap-pair-btn:hover {
          transform: translateY(-2px);
          box-shadow: 4px 4px 0 #000;
        }

        .swap-icon {
          font-size: 1.2rem;
          font-weight: bold;
        }

        /* Converter Grid */
        .converter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .tool-card-btn {
          background: var(--bg-card);
          border: 3px solid var(--border-color);
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tool-card-btn:hover {
          border-color: var(--primary-orange);
          transform: translateY(-3px);
          box-shadow: 4px 4px 0 #000;
        }

        .tool-card-btn.selected {
          border-color: var(--primary-orange);
          background: color-mix(in srgb, var(--primary-orange) 8%, var(--bg-card));
          box-shadow: 6px 6px 0 var(--primary-orange);
          transform: translateY(-3px);
        }

        .tool-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 0.6rem;
        }

        .tool-glyph {
          font-size: 1.6rem;
        }

        .tool-flow-pill {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-family: monospace;
          font-size: 0.75rem;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.35);
          color: #fff;
          padding: 0.2rem 0.5rem;
          border: 1px solid var(--border-color);
        }

        .format-out {
          color: var(--primary-orange);
        }

        .tool-name {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 0.3rem;
        }

        .tool-subdesc {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Workbench */
        .converter-workbench-panel {
          background: var(--bg-card);
          border: 3px solid var(--text-primary);
          box-shadow: 8px 8px 0 var(--primary-orange);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .workbench-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 2px solid var(--border-color);
        }

        .workbench-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .workbench-tool-badge {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          color: var(--primary-orange);
        }

        .workbench-tool-title {
          font-family: var(--font-heading);
          font-size: 2rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin: 0;
          line-height: 1.1;
        }

        .workbench-tool-specs {
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .sample-asset-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .sample-label {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .sample-btn {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          padding: 0.4rem 0.8rem;
          background: transparent;
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          box-shadow: 2px 2px 0 var(--text-primary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sample-btn:hover {
          background: var(--primary-orange);
          color: #fff;
          border-color: var(--primary-orange);
          transform: translateY(-2px);
        }

        /* Workbench Body */
        .workbench-body-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .workbench-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Dropzone */
        .dropzone-box {
          border: 3px dashed var(--border-color);
          background: rgba(0, 0, 0, 0.2);
          padding: 2.5rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 240px;
        }

        .dropzone-box:hover, .dropzone-box.drag-active {
          border-color: var(--primary-orange);
          background: color-mix(in srgb, var(--primary-orange) 5%, transparent);
          box-shadow: inset 0 0 20px rgba(255, 106, 0, 0.15);
        }

        .dropzone-box.has-file {
          border-color: var(--secondary-blue);
          border-style: solid;
        }

        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .dropzone-icon-glow {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--primary-orange) 20%, transparent);
          border: 2px solid var(--primary-orange);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .drop-icon {
          font-size: 1.8rem;
        }

        .drop-headline {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .drop-subtext {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .active-file-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-primary);
          border: 2px solid var(--secondary-blue);
          padding: 0.4rem 0.9rem;
          margin-top: 0.5rem;
          font-family: monospace;
          font-size: 0.82rem;
          box-shadow: 3px 3px 0 #000;
        }

        .privacy-badge-inline {
          margin-top: 0.5rem;
          font-family: monospace;
          font-size: 0.72rem;
          color: var(--text-secondary);
          opacity: 0.85;
        }

        .dropzone-footer-actions {
          display: flex;
          gap: 1rem;
        }

        .action-link-btn {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          background: none;
          border: 2px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.6rem 1rem;
          cursor: pointer;
        }

        .action-convert-btn {
          flex: 1;
          font-family: var(--font-heading);
          font-size: 1.1rem;
          letter-spacing: 1.5px;
          background: var(--primary-orange);
          color: #fff;
          border: 3px solid #000;
          box-shadow: 4px 4px 0 #000;
          padding: 0.75rem 1.25rem;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .action-convert-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0 #000;
        }

        /* Settings Panel */
        .settings-panel-box {
          background: rgba(0, 0, 0, 0.15);
          border: 2px solid var(--border-color);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
        }

        .settings-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          letter-spacing: 1.5px;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .settings-group {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .control-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-label {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .param-value {
          color: var(--primary-orange);
          font-family: monospace;
          font-weight: 700;
        }

        .scale-pill-buttons, .bg-pill-buttons, .preset-pill-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .scale-btn, .bg-btn {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          padding: 0.4rem 0.8rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
        }

        .scale-btn.active, .bg-btn.active {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
        }

        .studio-slider {
          width: 100%;
          accent-color: var(--primary-orange);
          cursor: pointer;
        }

        .special-notice-text {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .settings-action-row {
          margin-top: auto;
          padding-top: 1rem;
        }

        .studio-cta-convert {
          width: 100%;
          font-family: var(--font-heading);
          font-size: 1.25rem;
          letter-spacing: 2px;
          background: var(--primary-orange);
          color: #fff;
          border: 3px solid #000;
          box-shadow: 4px 4px 0 #000;
          padding: 0.9rem;
          cursor: pointer;
          text-transform: uppercase;
          transition: transform 0.15s ease;
        }

        .studio-cta-convert:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0 #000;
        }

        .studio-cta-convert:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* STUDIO PREVIEW ENGINE CARD */
        .studio-preview-engine-card {
          background: var(--bg-card);
          border: 4px solid var(--text-primary);
          box-shadow: 10px 10px 0 var(--primary-orange);
          display: flex;
          flex-direction: column;
        }

        .preview-engine-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.25rem 1.75rem;
          background: var(--bg-primary);
          border-bottom: 3px solid var(--border-color);
        }

        .engine-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .engine-tag {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 2px;
          color: var(--secondary-blue);
          font-weight: 800;
        }

        .engine-headline {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          letter-spacing: 1.5px;
          margin: 0;
          text-transform: uppercase;
        }

        .preview-tools-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bg-toggle-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .toggle-lbl {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .bg-toggle-btn {
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          padding: 0.2rem 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .bg-toggle-btn.active {
          border-color: var(--primary-orange);
        }

        .view-mode-buttons {
          display: flex;
          gap: 0.4rem;
        }

        .mode-btn {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          padding: 0.4rem 0.75rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
        }

        .mode-btn.active {
          background: var(--primary-orange);
          color: #fff;
          border-color: #000;
        }

        /* Preview Viewport */
        .preview-viewport {
          padding: 2rem;
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .preview-viewport.bg-checker {
          background-image: 
            linear-gradient(45deg, rgba(128,128,128,0.15) 25%, transparent 25%), 
            linear-gradient(-45deg, rgba(128,128,128,0.15) 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, rgba(128,128,128,0.15) 75%), 
            linear-gradient(-45deg, transparent 75%, rgba(128,128,128,0.15) 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: #111;
        }

        .preview-viewport.bg-dark {
          background: #0a0a0a;
        }

        .preview-viewport.bg-light {
          background: #f7f7f7;
        }

        .side-by-side-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          width: 100%;
          max-width: 1000px;
        }

        .side-pane {
          position: relative;
          background: #000;
          border: 3px solid var(--border-color);
          box-shadow: 4px 4px 0 #000;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 360px;
          overflow: hidden;
        }

        .side-pane img {
          max-width: 100%;
          max-height: 460px;
          object-fit: contain;
        }

        .side-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          padding: 0.25rem 0.6rem;
          background: #000;
          color: #fff;
          border: 1px solid #fff;
          z-index: 5;
        }

        .side-badge.result {
          background: var(--primary-orange);
          border-color: #000;
        }

        /* Results Action Strip */
        .preview-results-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding: 1.25rem 1.75rem;
          background: var(--bg-primary);
          border-top: 3px solid var(--border-color);
        }

        .stats-metric-strip {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .metric-label {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .metric-val {
          font-family: monospace;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .metric-val.highlight {
          color: var(--primary-orange);
        }

        .metric-val.format-tag {
          color: var(--secondary-blue);
        }

        .metric-divider {
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        .results-cta-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .studio-btn-secondary {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          letter-spacing: 1.5px;
          background: transparent;
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          box-shadow: 3px 3px 0 var(--text-primary);
          padding: 0.7rem 1.2rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .studio-btn-secondary:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
          transform: translateY(-2px);
        }

        .download-action {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          letter-spacing: 1.5px;
          background: var(--primary-orange);
          color: #fff;
          border: 3px solid #000;
          box-shadow: 5px 5px 0 #000;
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .download-action:hover {
          transform: translateY(-2px);
          box-shadow: 7px 7px 0 #000;
        }

        @media (max-width: 1024px) {
          .studio-policy-banner {
            grid-template-columns: 1fr;
          }
          .workbench-body-grid {
            grid-template-columns: 1fr;
          }
          .converter-main-title {
            font-size: 2.4rem;
          }
        }

        @media (max-width: 768px) {
          .studio-converter-section {
            padding: 4rem 1rem;
          }
          .converter-grid {
            grid-template-columns: 1fr;
          }
          .side-by-side-layout {
            grid-template-columns: 1fr;
          }
          .preview-results-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .results-cta-group {
            flex-direction: column;
          }
          .download-action, .studio-btn-secondary {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default StudioConverter;
