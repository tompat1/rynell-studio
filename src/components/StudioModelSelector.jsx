import React from 'react';

export const FREE_MODELS = [
  {
    id: 'qwen_edit',
    title: 'QWEN AI IMAGE EDIT & ENHANCE',
    subtitle: 'CLOUDFLARE WORKERS AI EDGE GPU',
    desc: 'Native Cloudflare Workers AI engine for intelligent image editing, style transfer, and prompt reconstruction with zero egress latency.',
    badge: '100% FREE',
    isDeluxe: false,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    )
  },
  {
    id: 'photo',
    title: 'PHOTOGRAPHY & PORTRAITS',
    subtitle: 'REAL-ESRGAN + FACE RECONSTRUCTION',
    desc: 'Restores facial pores, micro-textures, and eyes. Prevents painterly smudging on raw photographic sources.',
    badge: '100% FREE',
    isDeluxe: false,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    )
  },
  {
    id: 'illustration',
    title: 'ART & ILLUSTRATION',
    subtitle: 'ANIME-X4PLUS / DIGITAL PAINTING',
    desc: 'Cleans compression artifacts while preserving smooth color transitions and clean drawn ink lines.',
    badge: '100% FREE',
    isDeluxe: false,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
        <circle cx="11" cy="11" r="2"/>
      </svg>
    )
  }
];

export const DELUXE_MODELS = [
  {
    id: 'logo',
    title: 'LOGOS & GRAPHICS (VECTORINE)',
    subtitle: 'RUNPOD VTRACER GPU VECTOR ENGINE',
    desc: 'Converts raster pixel blocks into infinite resolution SVG vector curves. Print-ready precision.',
    badge: 'DELUXE ONLY',
    isDeluxe: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    )
  },
  {
    id: 'complex_art',
    title: 'COMPLEX 8K ULTRA MATRIX',
    subtitle: 'HEAVY AI RE-SAMPLING ENGINE',
    desc: 'Maximal texture reconstruction for heavy visual assets, posters, and complex 3D renders.',
    badge: 'DELUXE ONLY',
    isDeluxe: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  }
];

export const MODELS = [...FREE_MODELS, ...DELUXE_MODELS];

const StudioModelSelector = ({ selectedModel, onModelChange, isPremiumUser, onOpenUpgrade }) => {
  const handleSelectModel = (model) => {
    const isLocked = model.isDeluxe && !isPremiumUser;
    if (isLocked) {
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }
    onModelChange(model.id);

    // Smoothly navigate / scroll down to the respective tool workbench
    setTimeout(() => {
      const workbench = document.getElementById('studio-workbench');
      if (workbench) {
        const yOffset = -75;
        const y = workbench.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 40);
  };

  const renderCard = (model) => {
    const isLocked = model.isDeluxe && !isPremiumUser;
    const isSelected = selectedModel === model.id;

    return (
      <div
        key={model.id}
        onClick={() => handleSelectModel(model)}
        className={`model-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectModel(model);
          }
        }}
      >
        <div className="model-card-header">
          <div className="icon-badge-group">
            <span className="model-icon">{model.icon}</span>
            <h4 className="model-name">{model.title}</h4>
          </div>

          <span className={`tier-tag ${model.isDeluxe ? 'deluxe' : 'free'}`}>
            {model.isDeluxe ? (isPremiumUser ? 'UNLOCKED' : 'DELUXE 💎') : '100% FREE'}
          </span>
        </div>

        <span className="model-subtitle">{model.subtitle}</span>
        <p className="model-desc">{model.desc}</p>

        {isLocked ? (
          <div className="lock-overlay">
            <span className="lock-icon">🔒 DELUXE MODE</span>
            <span className="unlock-prompt">Click to unlock 8K Vectorine</span>
          </div>
        ) : (
          <div className="model-card-actions">
            <button 
              type="button" 
              className={`launch-tool-btn ${isSelected ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectModel(model);
              }}
            >
              {isSelected ? (
                <>
                  <span className="live-dot" /> ACTIVE TOOL • OPEN WORKBENCH ↓
                </>
              ) : (
                <>
                  <span className="launch-icon">⚡</span> SELECT & LAUNCH TOOL ↓
                </>
              )}
            </button>

            {model.id === 'qwen_edit' && (
              <button
                type="button"
                className="secondary-studio-btn"
                title="Jump to dedicated Qwen Studio with 5 preset use cases"
                onClick={(e) => {
                  e.stopPropagation();
                  onModelChange(model.id);
                  const qwen = document.getElementById('qwen-studio');
                  if (qwen) {
                    const yOffset = -75;
                    const y = qwen.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
              >
                ✨ OR OPEN 5-PRESET QWEN STUDIO ↓
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="model-selector-container">
      <h3 className="selector-main-title">
        SELECT PROCESSING ENGINE
      </h3>

      {/* Free Tier Group */}
      <div className="engine-group-wrapper">
        <div className="group-label-bar green-bar">
          <span className="group-title-text">⚡ FREE ENGINE TIER</span>
          <span className="group-sub-tag">NO CREDITS REQUIRED • UNLIMITED EGRESS</span>
        </div>
        <div className="model-grid">
          {FREE_MODELS.map(renderCard)}
        </div>
      </div>

      {/* Paid Deluxe Group */}
      <div className="engine-group-wrapper">
        <div className="group-label-bar orange-bar">
          <span className="group-title-text">💎 DELUXE PRO ENGINES</span>
          <span className="group-sub-tag">GPU VECTOR TRACING & HEAVY 8K RE-SAMPLING</span>
        </div>
        <div className="model-grid">
          {DELUXE_MODELS.map(renderCard)}
        </div>
      </div>
      <style>{`
        .model-selector-container {
          width: 100%;
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .selector-main-title {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          color: var(--text-primary);
          letter-spacing: 2px;
          margin-bottom: 0.5rem;
        }

        .engine-group-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .group-label-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          border-left: 4px solid var(--primary-orange);
          background: rgba(255, 255, 255, 0.03);
          font-family: var(--font-heading);
        }

        .group-label-bar.green-bar {
          border-left-color: #00FF66;
        }

        .group-label-bar.orange-bar {
          border-left-color: var(--primary-orange);
        }

        .group-title-text {
          font-size: 1.1rem;
          color: var(--text-primary);
          letter-spacing: 1px;
        }

        .green-bar .group-title-text {
          color: #00FF66;
        }

        .orange-bar .group-title-text {
          color: var(--primary-orange);
        }

        .group-sub-tag {
          font-size: 0.75rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .selector-title {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          color: var(--text-primary);
          letter-spacing: 2px;
          margin-bottom: 1rem;
        }

        .model-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.2rem;
        }

        .model-card {
          position: relative;
          background: var(--bg-card);
          border: 3px solid var(--border-color);
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .model-card:hover {
          border-color: var(--primary-orange);
          transform: translateY(-2px);
          box-shadow: 4px 4px 0 var(--primary-orange);
        }

        .model-card.selected {
          border-color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.08);
          box-shadow: 6px 6px 0 var(--primary-orange);
        }

        .model-card.locked {
          opacity: 0.75;
          border-style: dashed;
        }

        .model-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .icon-badge-group {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .model-icon {
          color: var(--primary-orange);
          display: flex;
          align-items: center;
        }

        .model-name {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: 1px;
        }

        .tier-tag {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          padding: 0.2rem 0.6rem;
          border-radius: 2px;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .tier-tag.free {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
        }

        .tier-tag.deluxe {
          background: var(--primary-orange);
          color: #000;
          font-weight: bold;
        }

        .model-subtitle {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          color: var(--secondary-blue);
          letter-spacing: 1px;
        }

        .model-desc {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }

        .lock-overlay {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 106, 0, 0.15);
          border: 1px solid var(--primary-orange);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          color: var(--primary-orange);
        }

        .unlock-prompt {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--text-primary);
        }

        .model-card-actions {
          margin-top: auto;
          padding-top: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .launch-tool-btn {
          width: 100%;
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1.5px;
          padding: 0.55rem 0.8rem;
          background: #111;
          color: #FFF;
          border: 2px solid #333;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .model-card:hover .launch-tool-btn {
          border-color: var(--primary-orange);
          background: #18181f;
        }

        .launch-tool-btn.active {
          background: var(--primary-orange);
          color: #000;
          border-color: var(--primary-orange);
          font-weight: bold;
          box-shadow: 0 0 10px rgba(255, 106, 0, 0.4);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00FF66;
          box-shadow: 0 0 8px #00FF66;
          animation: pulse-dot 1.4s infinite ease-in-out;
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        .launch-icon {
          color: var(--primary-orange);
          font-size: 0.95rem;
        }

        .secondary-studio-btn {
          background: transparent;
          border: 1px dashed #00E5FF;
          color: #00E5FF;
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 1px;
          padding: 0.35rem 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .secondary-studio-btn:hover {
          background: rgba(0, 229, 255, 0.1);
          border-style: solid;
        }
      `}</style>
    </div>
  );
};

export default StudioModelSelector;
