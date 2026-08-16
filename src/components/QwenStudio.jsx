import React, { useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import heroClean from '../assets/hero_page_rynell_studio_clean.webp';

export const QWEN_USE_CASES = [
  {
    id: 'element_removal',
    icon: '🧹',
    title: 'ELEMENT REMOVAL & CLEANUP',
    desc: 'Erase unwanted photobombers, logos, blemishes, or text while reconstructing background & lighting.',
    recipes: [
      'Remove photobomber from background',
      'Erase watermarks and logo overlays',
      'Clean facial blemishes and glare'
    ]
  },
  {
    id: 'text_editing',
    icon: '🔤',
    title: 'BILINGUAL TEXT EDITING',
    desc: 'Add, delete, or rewrite English & Chinese text matching original font, angle, and lighting.',
    recipes: [
      'Rewrite storefront sign to "RYNELL STUDIO"',
      'Translate Chinese background sign to English',
      'Update product label text cleanly'
    ]
  },
  {
    id: 'ecommerce',
    icon: '🛍️',
    title: 'PRODUCT & E-COMMERCE',
    desc: 'Swap product colors, update material textures (matte to glossy), or substitute studio backdrops.',
    recipes: [
      'Change jacket color to electric tangerine',
      'Swap matte finish for glossy leather texture',
      'Replace cluttered background with clean white studio backdrop'
    ]
  },
  {
    id: 'character_ip',
    icon: '👤',
    title: 'CHARACTER & IP CONSISTENCY',
    desc: 'Maintain facial features, clothing, and hairstyle consistency across iterative scenes.',
    recipes: [
      'Keep character face identical, change hair to cyberpunk blue',
      'Generate 4 consistent avatar emotion variations',
      'Update clothing to brutalist streetwear'
    ]
  },
  {
    id: 'style_transfer',
    icon: '🎨',
    title: 'STYLE TRANSFER & ROTATION',
    desc: 'Convert realistic portraits into brutalist art illustrations or adjust object perspectives.',
    recipes: [
      'Convert portrait into pop-art brutalist illustration',
      'Adjust camera angle 30 degrees to the right',
      'Transform scene into neon cyberpunk night'
    ]
  }
];

const QwenStudio = () => {
  const [selectedUseCase, setSelectedUseCase] = useState(QWEN_USE_CASES[0]);
  const [promptText, setPromptText] = useState(QWEN_USE_CASES[0].recipes[0]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS
  const [statusMessage, setStatusMessage] = useState('');

  const WORKER_ENDPOINT = 'https://rynell-ai-gateway.thomasrynell.workers.dev';

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = (e.target && e.target.files && e.target.files[0]) || (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
    if (droppedFile) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64Uri = evt.target.result;
        setPreviewUrl(base64Uri);
        setOutputUrl(null);
        setStatus('IDLE');
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const compressImageForAI = (dataUrl, maxDim = 1024) => {
    return new Promise((resolve) => {
      if (!dataUrl) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleExecuteQwenEdit = async () => {
    if (!promptText.trim()) {
      alert("Please enter an edit instruction!");
      return;
    }

    setStatus('PROCESSING');
    setStatusMessage('CLOUDFLARE WORKERS AI GPU: EXECUTING QWEN IMAGE EDIT MATRIX...');

    const rawImage = outputUrl || previewUrl || heroClean;
    const sourceImage = await compressImageForAI(rawImage, 1024);

    try {
      const resp = await fetch(`${WORKER_ENDPOINT}/api/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageR2Key: file ? file.name : 'qwen-source-asset.png',
          imageBase64: sourceImage,
          modelType: 'qwen_edit',
          prompt: promptText,
          turnstileToken: 'pass-token'
        })
      });

      const data = await resp.json().catch(() => ({}));

      if (data && data.outputUrl) {
        setStatus('SUCCESS');
        setStatusMessage('QWEN AI EDIT COMPLETE: ZERO COMPRESSION LOSS.');
        setOutputUrl(data.outputUrl);
      } else {
        setStatus('ERROR');
        setStatusMessage(`Cloudflare Worker note: ${data.error || 'Execution failed'}`);
      }
    } catch (e) {
      setStatus('ERROR');
      setStatusMessage(`Network error: ${e.message}`);
    }
  };

  return (
    <section id="qwen-studio" className="qwen-studio-section">
      <div className="container">
        
        <div className="qwen-header">
          <div className="qwen-free-badge">100% FREE • CLOUDFLARE WORKERS AI EDGE GPU</div>
          <h2 className="qwen-title">
            QWEN <span className="text-cyan">AI IMAGE EDIT</span> STUDIO
          </h2>
          <p className="qwen-subtitle">
            Natural language image manipulation, precise element removal, bilingual text editing, product color swaps, and character IP consistency.
          </p>
        </div>

        <div className="use-case-grid">
          {QWEN_USE_CASES.map((uc) => {
            const isSelected = selectedUseCase.id === uc.id;
            return (
              <div 
                key={uc.id}
                className={`use-case-card ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setSelectedUseCase(uc);
                  setPromptText(uc.recipes[0]);
                }}
              >
                <div className="uc-icon">{uc.icon}</div>
                <h3 className="uc-title">{uc.title}</h3>
                <p className="uc-desc">{uc.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="qwen-workbench">
          <div className="workbench-controls">
            <div 
              className={`qwen-dropzone ${previewUrl ? 'has-file' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <input 
                type="file" 
                id="qwen-file-input" 
                accept="image/*" 
                onChange={handleFileDrop}
                style={{ display: 'none' }}
              />

              {!previewUrl ? (
                <label htmlFor="qwen-file-input" className="qwen-dropzone-label">
                  <div className="drop-icon">🖼️</div>
                  <h4>DROP IMAGE OR CLICK TO UPLOAD</h4>
                  <span>SUPPORTS PNG, JPG, WEBP • MAX 50MB</span>
                </label>
              ) : (
                <div className="qwen-file-preview">
                  <img src={previewUrl} alt="Preview" className="qwen-preview-thumb" />
                  <div className="qwen-file-meta">
                    <span className="file-name">{file ? file.name : "ORIGINAL_SOURCE.PNG"}</span>
                    <button className="change-btn" onClick={() => { setFile(null); setPreviewUrl(null); setOutputUrl(null); setStatus('IDLE'); }}>CHANGE FILE</button>
                  </div>
                </div>
              )}
            </div>

            <div className="prompt-builder">
              <label className="prompt-label">NATURAL LANGUAGE EDIT PROMPT:</label>
              
              <textarea 
                className="qwen-prompt-input"
                rows="3"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Type what to edit (e.g. 'Remove background, change jacket to orange')..."
              />

              <div className="recipe-pills">
                <span className="recipe-label">PRESET RECIPES:</span>
                <div className="pills-list">
                  {selectedUseCase.recipes.map((recipe, idx) => (
                    <button 
                      key={idx}
                      className={`recipe-pill ${promptText === recipe ? 'active' : ''}`}
                      onClick={() => setPromptText(recipe)}
                    >
                      + {recipe}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              className={`execute-qwen-btn ${status === 'PROCESSING' ? 'loading' : ''}`}
              onClick={handleExecuteQwenEdit}
              disabled={status === 'PROCESSING'}
            >
              {status === 'PROCESSING' ? '⏳ EXECUTING ON CLOUDFLARE EDGE GPU...' : '⚡ EXECUTE FREE QWEN AI EDIT'}
            </button>

            {status !== 'IDLE' && (
              <div className="qwen-status-box">
                <span className="status-dot-pulse"></span>
                <span className="status-message-text">{statusMessage}</span>
              </div>
            )}
          </div>

          <div className="workbench-result-panel">
            <h3 className="result-title">QWEN AI EDIT PREVIEW & MATRIX COMPARISON</h3>
            
            <BeforeAfterSlider
              beforeImage={previewUrl || heroClean}
              afterImage={outputUrl || previewUrl || heroClean}
              beforeLabel="ORIGINAL SOURCE"
              afterLabel="QWEN AI EDITED"
            />

            {outputUrl && (
              <div className="result-action-bar">
                <a href={outputUrl} download="qwen-edited-asset.png" className="download-result-btn">
                  ⬇ DOWNLOAD ULTRA-HIGH RES RESULT
                </a>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .qwen-studio-section {
          padding: 8rem 0;
          background: #060608;
          border-top: 4px solid var(--secondary-blue);
          color: #FFF;
        }

        .qwen-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .qwen-free-badge {
          display: inline-block;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          padding: 0.4rem 1rem;
          background: #00E5FF;
          color: #000;
          font-weight: bold;
          letter-spacing: 2px;
          margin-bottom: 1rem;
          transform: skewX(-8deg);
          box-shadow: 4px 4px 0 #000;
        }

        .qwen-title {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          letter-spacing: 2px;
          margin-bottom: 0.8rem;
        }

        .text-cyan { color: #00E5FF; }

        .qwen-subtitle {
          font-family: var(--font-body);
          font-size: 1.15rem;
          color: #A0A0B0;
          max-width: 800px;
          margin: 0 auto;
        }

        .use-case-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.2rem;
          margin-bottom: 3.5rem;
        }

        .use-case-card {
          background: #0E0E12;
          border: 2px solid #222;
          padding: 1.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .use-case-card:hover {
          border-color: #00E5FF;
          transform: translateY(-3px);
          box-shadow: 4px 4px 0 #00E5FF;
        }

        .use-case-card.active {
          border-color: #00E5FF;
          background: rgba(0, 229, 255, 0.08);
          box-shadow: 6px 6px 0 #00E5FF;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .uc-icon {
          font-size: 1.8rem;
        }

        .free-pill {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          background: #00FF66;
          color: #000;
          padding: 0.15rem 0.5rem;
          font-weight: bold;
        }

        .uc-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          letter-spacing: 1px;
          color: #FFF;
          margin: 0;
        }

        .uc-desc {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: #888;
          line-height: 1.3;
          margin: 0;
        }

        .qwen-workbench {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .workbench-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .workbench-dropzone-box {
          border: 3px dashed #333;
          background: #0E0E12;
          padding: 1.5rem;
          text-align: center;
        }

        .dropzone-label {
          cursor: pointer;
          display: block;
        }

        .hidden-file-input { display: none; }

        .empty-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .drop-icon { font-size: 2.5rem; }

        .drop-text {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          color: #00E5FF;
          letter-spacing: 1px;
        }

        .drop-sub {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: #666;
        }

        .preview-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
        }

        .preview-img {
          max-height: 180px;
          object-fit: contain;
          border: 2px solid #00E5FF;
        }

        .change-btn {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
          background: #222;
          color: #FFF;
          border: 1px solid #444;
          cursor: pointer;
        }

        .prompt-controls-box {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #0E0E12;
          padding: 1.5rem;
          border: 2px solid #222;
        }

        .prompt-label-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .prompt-label {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          color: #00E5FF;
          letter-spacing: 1px;
        }

        .mode-tag {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          background: rgba(0, 229, 255, 0.15);
          color: #00E5FF;
          padding: 0.2rem 0.5rem;
          border: 1px solid #00E5FF;
        }

        .qwen-prompt-input {
          width: 100%;
          background: #000;
          border: 2px solid #333;
          color: #FFF;
          padding: 1rem;
          font-family: var(--font-body);
          font-size: 1rem;
          resize: vertical;
          outline: none;
        }

        .qwen-prompt-input:focus {
          border-color: #00E5FF;
        }

        .recipe-pills-label {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          color: #888;
          letter-spacing: 1px;
        }

        .recipe-pills-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .recipe-pill {
          font-family: var(--font-body);
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
          background: #181820;
          color: #AAA;
          border: 1px solid #333;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .recipe-pill:hover, .recipe-pill.selected {
          background: #00E5FF;
          color: #000;
          border-color: #00E5FF;
          font-weight: bold;
        }

        .execute-qwen-btn {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          letter-spacing: 2px;
          padding: 1.2rem;
          background: #00E5FF;
          color: #000;
          border: 3px solid #000;
          cursor: pointer;
          box-shadow: 4px 4px 0 #FFF;
          transition: all 0.2s ease;
        }

        .execute-qwen-btn:hover {
          background: #00b8cc;
          transform: translateY(-2px);
          box-shadow: 6px 6px 0 #FFF;
        }

        .qwen-processing-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem;
          background: #000;
          border: 2px solid #00E5FF;
        }

        .proc-info h4 {
          font-family: var(--font-heading);
          color: #00E5FF;
          margin: 0 0 0.3rem 0;
        }

        .proc-info p {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: #AAA;
          margin: 0;
        }

        .workbench-result-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .result-title {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          color: #FFF;
          letter-spacing: 1px;
        }

        .result-action-bar {
          margin-top: 1rem;
        }

        .download-result-btn {
          display: block;
          text-align: center;
          font-family: var(--font-heading);
          font-size: 1.1rem;
          letter-spacing: 2px;
          padding: 1rem;
          background: #00FF66;
          color: #000;
          text-decoration: none;
          font-weight: bold;
          box-shadow: 4px 4px 0 #000;
        }

        @media (max-width: 992px) {
          .qwen-workbench {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default QwenStudio;
