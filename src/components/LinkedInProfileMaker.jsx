import { useCallback, useEffect, useRef, useState } from 'react';
import { useCms } from '../contexts/CmsContext';
import samplePortrait from '../assets/studio_portrait.jpg';

const OUTPUT_SIZE = 1080;

const FRAME_PRESETS = [
  { id: 'open', label: 'OPEN TO WORK', text: 'OPEN TO WORK', color: '#18864B', textColor: '#FFFFFF' },
  { id: 'hiring', label: 'HIRING', text: 'WE ARE HIRING', color: '#7B45E7', textColor: '#FFFFFF' },
  { id: 'freelance', label: 'FREELANCE', text: 'AVAILABLE FOR FREELANCE', color: '#FF6A00', textColor: '#000000' },
  { id: 'connect', label: 'CONNECT', text: "LET'S CONNECT", color: '#0A66C2', textColor: '#FFFFFF' }
];

const drawCurvedText = (context, text, options) => {
  const { centerX, centerY, radius, fontSize, color } = options;
  const characters = [...text.trim().toUpperCase()];
  if (!characters.length) return;

  context.save();
  context.fillStyle = color;
  context.font = `800 ${fontSize}px Poppins, Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const tracking = fontSize * 0.13;
  const characterWidths = characters.map((character) => context.measureText(character).width + tracking);
  const totalAngle = characterWidths.reduce((total, width) => total + width, 0) / radius;
  let angle = (Math.PI / 2) + (totalAngle / 2);

  characters.forEach((character, index) => {
    const characterAngle = characterWidths[index] / radius;
    angle -= characterAngle / 2;
    context.save();
    context.translate(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    );
    context.rotate(angle - (Math.PI / 2));
    context.fillText(character, 0, 0);
    context.restore();
    angle -= characterAngle / 2;
  });

  context.restore();
};

const LinkedInProfileMaker = () => {
  const { t, isLiveEditMode, handleLiveEditClick } = useCms();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const renderSequence = useRef(0);
  const [imageSrc, setImageSrc] = useState(samplePortrait);
  const [fileName, setFileName] = useState('STUDIO SAMPLE');
  const [badgeText, setBadgeText] = useState('OPEN TO WORK');
  const [arcColor, setArcColor] = useState('#18864B');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [arcWidth, setArcWidth] = useState(136);
  const [fontSize, setFontSize] = useState(56);
  const [showGuide, setShowGuide] = useState(true);
  const [notice, setNotice] = useState('READY // LOCAL RENDER');
  const [isDragging, setIsDragging] = useState(false);

  const renderCanvas = useCallback((includeGuide = showGuide) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return Promise.resolve(false);
    const sequence = ++renderSequence.current;
    const context = canvas.getContext('2d');
    const image = new Image();

    return new Promise((resolve) => {
      image.onload = () => {
      if (sequence !== renderSequence.current) {
        resolve(false);
        return;
      }
      const coverScale = Math.max(OUTPUT_SIZE / image.naturalWidth, OUTPUT_SIZE / image.naturalHeight) * zoom;
      const drawWidth = image.naturalWidth * coverScale;
      const drawHeight = image.naturalHeight * coverScale;
      const travelX = Math.max(0, (drawWidth - OUTPUT_SIZE) / 2) + OUTPUT_SIZE * 0.24;
      const travelY = Math.max(0, (drawHeight - OUTPUT_SIZE) / 2) + OUTPUT_SIZE * 0.24;
      const drawX = ((OUTPUT_SIZE - drawWidth) / 2) + ((offsetX / 100) * travelX);
      const drawY = ((OUTPUT_SIZE - drawHeight) / 2) + ((offsetY / 100) * travelY);

      context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const center = OUTPUT_SIZE / 2;
      const arcRadius = 438;
      context.save();
      context.strokeStyle = arcColor;
      context.lineWidth = arcWidth;
      context.lineCap = 'butt';
      context.beginPath();
      context.arc(center, center, arcRadius, Math.PI * 0.13, Math.PI * 0.87);
      context.stroke();
      context.restore();

      drawCurvedText(context, badgeText, {
        centerX: center,
        centerY: center,
        radius: arcRadius,
        fontSize,
        color: textColor
      });

      if (includeGuide) {
        context.save();
        context.strokeStyle = 'rgba(255,255,255,.82)';
        context.lineWidth = 3;
        context.setLineDash([14, 12]);
        context.beginPath();
        context.arc(center, center, 492, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      }
      resolve(true);
    };

      image.onerror = () => {
        setNotice('COULD NOT READ THAT IMAGE');
        resolve(false);
      };
      image.src = imageSrc;
    });
  }, [arcColor, arcWidth, badgeText, fontSize, imageSrc, offsetX, offsetY, showGuide, textColor, zoom]);

  useEffect(() => {
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => renderCanvas(showGuide));
      return;
    }
    renderCanvas(showGuide);
  }, [renderCanvas, showGuide]);

  const loadFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice('CHOOSE A JPG, PNG, WEBP OR AVIF IMAGE');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setNotice('IMAGE IS OVER THE 20 MB LIMIT');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      setFileName(file.name.toUpperCase());
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setNotice('PHOTO LOADED // TUNE YOUR FRAME');
    };
    reader.onerror = () => setNotice('COULD NOT READ THAT IMAGE');
    reader.readAsDataURL(file);
  };

  const applyPreset = (preset) => {
    setBadgeText(preset.text);
    setArcColor(preset.color);
    setTextColor(preset.textColor);
    setNotice(`${preset.label} PRESET APPLIED`);
  };

  const resetDesign = () => {
    setBadgeText('OPEN TO WORK');
    setArcColor('#18864B');
    setTextColor('#FFFFFF');
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setArcWidth(136);
    setFontSize(56);
    setShowGuide(true);
    setNotice('DESIGN RESET');
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderCanvas(false).then((didRender) => {
      if (!didRender) return;
      canvas.toBlob((blob) => {
        if (!blob) {
          setNotice('EXPORT FAILED // TRY AGAIN');
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = 'rynell-linkedin-profile-photo.png';
        link.click();
        URL.revokeObjectURL(objectUrl);
        setNotice('1080 × 1080 PNG DOWNLOADED');
        renderCanvas(showGuide);
      }, 'image/png');
    });
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.pointerX = String(event.clientX);
    event.currentTarget.dataset.pointerY = String(event.clientY);
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    const target = event.currentTarget;
    const previousX = Number(target.dataset.pointerX || event.clientX);
    const previousY = Number(target.dataset.pointerY || event.clientY);
    const bounds = target.getBoundingClientRect();
    setOffsetX((value) => Math.max(-100, Math.min(100, value + ((event.clientX - previousX) / bounds.width) * 120)));
    setOffsetY((value) => Math.max(-100, Math.min(100, value + ((event.clientY - previousY) / bounds.height) * 120)));
    target.dataset.pointerX = String(event.clientX);
    target.dataset.pointerY = String(event.clientY);
  };

  const stopDragging = () => setIsDragging(false);

  return (
    <section id="profile-photo-maker" className="profile-maker-section bg-halftone">
      <div
        className={`section-label ${isLiveEditMode ? 'cms-editable-target' : ''}`}
        onClick={(event) => handleLiveEditClick(event, 'studioTools.profileMaker.sectionLabel')}
      >
        {t('studioTools.profileMaker.sectionLabel', 'PROFILE PHOTO LAB')}
      </div>

      <div className="container profile-maker-container">
        <header className="profile-maker-header">
          <div>
            <div className="profile-kicker"><span /> FREE CREATOR TOOL // NO SIGN-UP</div>
            <h2
              className={`profile-maker-title ${isLiveEditMode ? 'cms-editable-target' : ''}`}
              onClick={(event) => handleLiveEditClick(event, 'studioTools.profileMaker.title')}
            >
              {t('studioTools.profileMaker.title', 'MAKE YOUR LINKEDIN PROFILE HIT HARDER.')}
            </h2>
            <p
              className={`profile-maker-subtitle ${isLiveEditMode ? 'cms-editable-target' : ''}`}
              onClick={(event) => handleLiveEditClick(event, 'studioTools.profileMaker.subDescription')}
            >
              {t('studioTools.profileMaker.subDescription', 'Upload a portrait, build a custom curved badge, and export a sharp profile-ready image in under a minute.')}
            </p>
          </div>
          <div className="profile-local-stamp">100%<br />LOCAL</div>
        </header>

        <div className="profile-workbench">
          <div className="profile-workbench-bar">
            <span className="profile-status-dot" />
            <span>PROFILE FRAME ENGINE</span>
            <span className="profile-workbench-meta">1080 × 1080 PNG // BROWSER-ONLY</span>
          </div>

          <div className="profile-workbench-grid">
            <div className="profile-control-panel">
              <div className="profile-panel-heading">
                <span>01 / BUILD YOUR FRAME</span>
                <button type="button" className="profile-reset-btn" onClick={resetDesign}>RESET</button>
              </div>

              <div
                className="profile-upload-zone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); loadFile(event.dataTransfer.files?.[0]); }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex="0"
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click(); }}
                aria-label="Upload portrait image"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(event) => loadFile(event.target.files?.[0])}
                  hidden
                />
                <span className="profile-upload-icon">↥</span>
                <span><strong>UPLOAD PORTRAIT</strong><small>{fileName} // MAX 20 MB</small></span>
                <span className="profile-upload-action">CHOOSE IMAGE</span>
              </div>

              <div className="profile-control-block">
                <label className="profile-control-label" htmlFor="profile-badge-text"><span>BADGE COPY</span><span>{badgeText.length}/28</span></label>
                <input
                  id="profile-badge-text"
                  className="profile-text-input"
                  value={badgeText}
                  maxLength="28"
                  onChange={(event) => setBadgeText(event.target.value)}
                  placeholder="YOUR MESSAGE"
                />
                <div className="profile-preset-row">
                  {FRAME_PRESETS.map((preset) => (
                    <button key={preset.id} type="button" className="profile-preset-chip" onClick={() => applyPreset(preset)}>
                      <span style={{ background: preset.color }} />{preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-color-grid">
                <label className="profile-color-control">
                  <span>ARC COLOR</span>
                  <span className="profile-color-value">
                    <input type="color" value={arcColor} onChange={(event) => setArcColor(event.target.value)} aria-label="Arc color" />
                    <strong>{arcColor.toUpperCase()}</strong>
                  </span>
                </label>
                <label className="profile-color-control">
                  <span>TEXT COLOR</span>
                  <span className="profile-color-value">
                    <input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} aria-label="Text color" />
                    <strong>{textColor.toUpperCase()}</strong>
                  </span>
                </label>
              </div>

              <div className="profile-range-grid">
                <label className="profile-range-control">
                  <span><b>PHOTO ZOOM</b><em>{zoom.toFixed(2)}×</em></span>
                  <input type="range" min="1" max="2.4" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
                </label>
                <label className="profile-range-control">
                  <span><b>ARC WEIGHT</b><em>{arcWidth} PX</em></span>
                  <input type="range" min="90" max="190" step="2" value={arcWidth} onChange={(event) => setArcWidth(Number(event.target.value))} />
                </label>
                <label className="profile-range-control">
                  <span><b>TYPE SIZE</b><em>{fontSize} PX</em></span>
                  <input type="range" min="38" max="72" step="1" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} />
                </label>
              </div>

              <div className="profile-toggle-row">
                <label className="profile-check-label"><input type="checkbox" checked={showGuide} onChange={(event) => setShowGuide(event.target.checked)} /> SHOW LINKEDIN CROP GUIDE</label>
                <button type="button" className="profile-center-btn" onClick={() => { setOffsetX(0); setOffsetY(0); }}>CENTER PHOTO</button>
              </div>
            </div>

            <div className="profile-preview-panel">
              <div className="profile-panel-heading"><span>02 / LIVE PROFILE PREVIEW</span><span>DRAG TO REPOSITION</span></div>
              <div className="profile-preview-stage">
                <div
                  className={`profile-canvas-wrap ${isDragging ? 'dragging' : ''}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={stopDragging}
                  onPointerCancel={stopDragging}
                  onPointerLeave={stopDragging}
                >
                  <canvas ref={canvasRef} width={OUTPUT_SIZE} height={OUTPUT_SIZE} aria-label="LinkedIn profile photo preview" />
                </div>
                <div className="profile-preview-note"><span>○</span> Dashed line previews LinkedIn's circular crop. It is never included in your download.</div>
              </div>
            </div>
          </div>

          <div className="profile-export-bar">
            <span className="profile-notice" aria-live="polite">{notice}</span>
            <div className="profile-privacy-note"><span>●</span> YOUR PHOTO NEVER LEAVES THIS DEVICE</div>
            <button type="button" className="profile-download-btn" onClick={downloadImage}>DOWNLOAD PROFILE PNG <span>↓</span></button>
          </div>
        </div>

        <div className="profile-steps">
          <span><b>01</b> UPLOAD A CLEAR PORTRAIT</span>
          <span><b>02</b> CUSTOMIZE YOUR MESSAGE</span>
          <span><b>03</b> DOWNLOAD & ADD TO LINKEDIN</span>
        </div>
        <p className="profile-disclaimer">Independent creator tool. Not affiliated with or endorsed by LinkedIn.</p>
      </div>

      <style>{`
        .profile-maker-section { position: relative; padding: 8rem 0 6rem; background: var(--bg-primary); color: var(--text-primary); overflow: hidden; scroll-margin-top: 80px; }
        .profile-maker-container { position: relative; z-index: 1; }
        .profile-maker-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 2rem; margin-bottom: 2.4rem; }
        .profile-kicker { display: flex; align-items: center; gap: .6rem; font: 800 .78rem/1 var(--font-body); letter-spacing: 1.5px; color: var(--studio-accent-cyan); }
        .profile-kicker span { width: 28px; height: 3px; background: var(--primary-orange); }
        .profile-maker-title { max-width: 1040px; margin: 1rem 0 .8rem; font-size: clamp(3.8rem, 8.2vw, 8.5rem); letter-spacing: 1px; line-height: .82; transform: skewX(-7deg); text-wrap: balance; }
        .profile-maker-title::first-line { color: var(--primary-orange); }
        .profile-maker-subtitle { max-width: 720px; color: var(--text-secondary); font-size: 1.03rem; }
        .profile-local-stamp { padding: 1rem 1.15rem .85rem; border: 3px solid var(--primary-orange); color: var(--primary-orange); box-shadow: 6px 6px 0 var(--secondary-blue); font: 2rem/.8 var(--font-heading); letter-spacing: 1px; text-align: center; transform: rotate(4deg); }
        .profile-workbench { border: 3px solid var(--studio-text); background: var(--studio-surface); color: var(--studio-text); box-shadow: 12px 12px 0 var(--primary-orange); }
        .profile-workbench-bar, .profile-panel-heading, .profile-export-bar { display: flex; align-items: center; gap: .7rem; font: .82rem/1 var(--font-heading); letter-spacing: 1.6px; }
        .profile-workbench-bar { min-height: 48px; padding: .8rem 1.1rem; border-bottom: 2px solid var(--studio-border); background: var(--studio-surface-raised); }
        .profile-status-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--studio-accent-green); box-shadow: 0 0 0 4px color-mix(in srgb, var(--studio-accent-green) 18%, transparent); }
        .profile-workbench-meta { margin-left: auto; color: var(--studio-text-muted); }
        .profile-workbench-grid { display: grid; grid-template-columns: minmax(340px, .84fr) minmax(420px, 1.16fr); }
        .profile-control-panel, .profile-preview-panel { min-width: 0; padding: 1.3rem; }
        .profile-control-panel { border-right: 2px solid var(--studio-border); }
        .profile-panel-heading { justify-content: space-between; min-height: 28px; margin-bottom: 1rem; color: var(--studio-accent-orange); }
        .profile-reset-btn, .profile-center-btn { border: 0; background: none; color: var(--studio-text-muted); font: .72rem var(--font-heading); letter-spacing: 1.3px; cursor: pointer; }
        .profile-reset-btn:hover, .profile-center-btn:hover { color: var(--studio-accent-orange); }
        .profile-upload-zone { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: .85rem; min-height: 84px; padding: .8rem 1rem; border: 2px dashed var(--studio-border); background: var(--studio-surface-raised); cursor: pointer; transition: border-color .2s ease, transform .2s ease; }
        .profile-upload-zone:hover, .profile-upload-zone:focus-visible { border-color: var(--studio-accent-cyan); outline: none; transform: translateY(-2px); }
        .profile-upload-icon { display: grid; place-items: center; width: 45px; height: 45px; border: 2px solid var(--studio-text); color: var(--studio-accent-orange); font: 1.8rem/1 var(--font-heading); box-shadow: 3px 3px 0 var(--studio-accent-orange); }
        .profile-upload-zone strong, .profile-upload-zone small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .profile-upload-zone strong { font: .94rem var(--font-heading); letter-spacing: 1.2px; }
        .profile-upload-zone small { margin-top: .18rem; color: var(--studio-text-muted); font: .63rem var(--font-body); }
        .profile-upload-action { padding: .55rem .7rem; border: 2px solid var(--studio-text); font: .72rem var(--font-heading); letter-spacing: 1px; }
        .profile-control-block { margin-top: 1.2rem; }
        .profile-control-label, .profile-range-control > span { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: .45rem; color: var(--studio-text-muted); font: .7rem var(--font-heading); letter-spacing: 1.2px; }
        .profile-text-input { width: 100%; height: 52px; border: 2px solid var(--studio-border); border-radius: 0; background: var(--studio-field); color: var(--studio-text); padding: 0 .9rem; outline: none; font: 1.15rem var(--font-heading); letter-spacing: 1.2px; text-transform: uppercase; }
        .profile-text-input:focus { border-color: var(--studio-accent-cyan); box-shadow: 4px 4px 0 var(--studio-accent-cyan); }
        .profile-preset-row { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: .7rem; }
        .profile-preset-chip { display: flex; align-items: center; gap: .35rem; padding: .4rem .55rem; border: 1px solid var(--studio-border); background: var(--studio-surface-soft); color: var(--studio-text); font: .64rem var(--font-heading); letter-spacing: .7px; cursor: pointer; }
        .profile-preset-chip:hover { border-color: var(--studio-text); }
        .profile-preset-chip span { width: 9px; height: 9px; border-radius: 50%; border: 1px solid var(--studio-text); }
        .profile-color-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .7rem; margin-top: 1.2rem; }
        .profile-color-control { padding: .75rem; border: 1px solid var(--studio-border); color: var(--studio-text-muted); font: .68rem var(--font-heading); letter-spacing: 1.1px; }
        .profile-color-value { display: flex; align-items: center; gap: .55rem; margin-top: .45rem; color: var(--studio-text); }
        .profile-color-value input { width: 35px; height: 30px; padding: 0; border: 2px solid var(--studio-text); border-radius: 0; background: none; cursor: pointer; }
        .profile-color-value strong { font-size: .73rem; }
        .profile-range-grid { display: grid; gap: .85rem; margin-top: 1.2rem; }
        .profile-range-control > span { margin-bottom: .25rem; }
        .profile-range-control b, .profile-range-control em { font-weight: 400; font-style: normal; }
        .profile-range-control em { color: var(--studio-accent-cyan); }
        .profile-range-control input { width: 100%; accent-color: var(--studio-accent-orange); cursor: ew-resize; }
        .profile-toggle-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-top: 1.2rem; padding-top: 1rem; border-top: 1px solid var(--studio-border); }
        .profile-check-label { display: flex; align-items: center; gap: .45rem; color: var(--studio-text-muted); font: .66rem var(--font-heading); letter-spacing: .8px; cursor: pointer; }
        .profile-check-label input { width: 16px; height: 16px; accent-color: var(--studio-accent-orange); }
        .profile-preview-panel { background: var(--studio-surface-raised); }
        .profile-preview-panel .profile-panel-heading span:last-child { color: var(--studio-text-muted); }
        .profile-preview-stage { display: grid; place-items: center; min-height: 610px; padding: 1.4rem; border: 1px solid var(--studio-border); background-image: linear-gradient(45deg, var(--studio-surface-soft) 25%, transparent 25%), linear-gradient(-45deg, var(--studio-surface-soft) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--studio-surface-soft) 75%), linear-gradient(-45deg, transparent 75%, var(--studio-surface-soft) 75%); background-size: 22px 22px; background-position: 0 0, 0 11px, 11px -11px, -11px 0; }
        .profile-canvas-wrap { width: min(100%, 540px); aspect-ratio: 1; border: 3px solid var(--studio-text); border-radius: 50%; overflow: hidden; box-shadow: 9px 9px 0 var(--studio-accent-orange); cursor: grab; touch-action: none; user-select: none; }
        .profile-canvas-wrap.dragging { cursor: grabbing; }
        .profile-canvas-wrap canvas { display: block; width: 100%; height: 100%; }
        .profile-preview-note { display: flex; align-items: center; gap: .5rem; max-width: 540px; margin-top: 1.4rem; color: var(--studio-text-muted); font: .62rem var(--font-body); letter-spacing: .2px; text-transform: uppercase; }
        .profile-preview-note span { color: var(--studio-text); font-size: 1rem; }
        .profile-export-bar { min-height: 76px; padding: 1rem 1.3rem; border-top: 2px solid var(--studio-border); }
        .profile-notice { color: var(--studio-accent-cyan); }
        .profile-privacy-note { display: flex; gap: .4rem; margin-left: auto; color: var(--studio-text-muted); font-size: .68rem; }
        .profile-privacy-note span { color: var(--studio-accent-green); }
        .profile-download-btn { display: flex; align-items: center; gap: 1rem; min-height: 46px; padding: .65rem 1rem; border: 2px solid var(--black); background: var(--primary-orange); color: var(--black); box-shadow: 4px 4px 0 var(--secondary-blue); font: 1rem var(--font-heading); letter-spacing: 1.2px; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; }
        .profile-download-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--secondary-blue); }
        .profile-download-btn span { font-size: 1.3rem; }
        .profile-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2.8rem; }
        .profile-steps span { display: flex; align-items: center; gap: .8rem; padding: .8rem 1rem; border-top: 2px solid var(--border-color); color: var(--text-secondary); font: .72rem var(--font-heading); letter-spacing: 1px; }
        .profile-steps b { color: var(--primary-orange); font-size: 1.25rem; }
        .profile-disclaimer { margin-top: 1.2rem; color: var(--text-secondary); font-size: .68rem; opacity: .7; }
        @media (max-width: 980px) { .profile-workbench-grid { grid-template-columns: 1fr; } .profile-control-panel { border-right: 0; border-bottom: 2px solid var(--studio-border); } .profile-preview-stage { min-height: auto; } .profile-export-bar { align-items: flex-start; flex-wrap: wrap; } .profile-privacy-note { margin-left: 0; } .profile-download-btn { margin-left: auto; } }
        @media (max-width: 680px) { .profile-maker-section { padding-top: 6.5rem; } .profile-maker-header { grid-template-columns: 1fr; align-items: start; } .profile-local-stamp { display: none; } .profile-maker-title { font-size: clamp(3.35rem, 17vw, 5.2rem); } .profile-workbench { box-shadow: 7px 7px 0 var(--primary-orange); } .profile-workbench-meta { display: none; } .profile-control-panel, .profile-preview-panel { padding: .9rem; } .profile-upload-zone { grid-template-columns: auto minmax(0, 1fr); } .profile-upload-action { grid-column: 1 / -1; text-align: center; } .profile-color-grid { grid-template-columns: 1fr; } .profile-preview-stage { padding: .9rem; } .profile-canvas-wrap { box-shadow: 6px 6px 0 var(--studio-accent-orange); } .profile-export-bar { flex-direction: column; align-items: stretch; } .profile-download-btn { justify-content: space-between; width: 100%; margin: .25rem 0 0; } .profile-steps { grid-template-columns: 1fr; gap: .2rem; } }
        @media (prefers-reduced-motion: reduce) { .profile-upload-zone, .profile-download-btn { transition: none; } }
      `}</style>
    </section>
  );
};

export default LinkedInProfileMaker;
