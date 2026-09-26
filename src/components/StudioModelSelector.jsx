import React from 'react';

export const STUDIO_MODES = [
  {
    id: 'qwen_edit',
    icon: '✨',
    title: 'AI IMAGE STUDIO',
    subtitle: 'CLOUDFLARE WORKERS AI (FLUX / SDXL)',
    desc: 'Generate, restyle, and edit images using Cloudflare edge diffusion models (5 free renders).',
    isPaid: false,
    placeholder: "Describe prompt or edit instructions (e.g., 'fashion portrait with rim lighting', 'brutalist poster', 'add sunglasses')...",
    recipes: [
      'Studio portrait with dramatic rim lighting',
      'Brutalist graphic typography poster',
      'Cyberpunk neon night color grading',
      'Clean minimalist studio background'
    ]
  },
  {
    id: 'upscale',
    icon: '⚡',
    title: '4K UPSCALER',
    subtitle: 'CLOUDFLARE PRUNA AI & ESRGAN',
    desc: 'Super-resolution AI upscaling to crisp 4K. Try before you buy with 1 free trial.',
    isPaid: true,
    placeholder: "Upscale mode (enhances resolution up to 4K)...",
    recipes: [
      '4K photorealistic edge upscale',
      'High-clarity texture reconstruction',
      'Studio artwork detail recovery'
    ]
  },
  {
    id: 'logo',
    icon: '📐',
    title: 'VECTORINE',
    subtitle: 'RUNPOD GPU VECTOR ENGINE',
    desc: 'Converts raster logos and graphic elements into clean, scalable SVG vector paths. Try before you buy.',
    isPaid: true,
    placeholder: "Vector tracing parameters (e.g., 'color stacked', 'monochrome high contrast')...",
    recipes: [
      'Trace stacked color vector paths',
      'High-contrast monochrome vector',
      'Geometric vector contours'
    ]
  }
];

export const FREE_MODELS = STUDIO_MODES.filter(m => !m.isPaid);
export const DELUXE_MODELS = STUDIO_MODES.filter(m => m.isPaid);
export const MODELS = STUDIO_MODES;

const StudioModelSelector = ({ 
  selectedModel, 
  onModelChange, 
  isPremiumUser, 
  onOpenUpgrade,
  usage = { imageStudioRendersLeft: 5, upscalerTrialsLeft: 1, vectorineTrialsLeft: 1 }
}) => {
  const getModeStatus = (modeId) => {
    if (isPremiumUser) return { isLocked: false, tag: 'PRO UNLIMITED', type: 'pro' };

    if (modeId === 'qwen_edit') {
      const left = usage.imageStudioRendersLeft ?? 5;
      return left > 0 
        ? { isLocked: false, tag: `${left}/5 FREE RENDERS`, type: 'free' }
        : { isLocked: true, tag: '0/5 • UPGRADE 🔒', type: 'locked' };
    }

    if (modeId === 'upscale') {
      const trials = usage.upscalerTrialsLeft ?? 1;
      return trials > 0
        ? { isLocked: false, tag: 'TRY FREE (1 TRIAL)', type: 'trial' }
        : { isLocked: true, tag: 'TRIAL USED • LOCK 🔒', type: 'locked' };
    }

    if (modeId === 'logo') {
      const trials = usage.vectorineTrialsLeft ?? 1;
      return trials > 0
        ? { isLocked: false, tag: 'TRY FREE (1 TRIAL)', type: 'trial' }
        : { isLocked: true, tag: 'TRIAL USED • LOCK 🔒', type: 'locked' };
    }

    return { isLocked: false, tag: 'FREE', type: 'free' };
  };

  const handleSelectMode = (mode) => {
    const status = getModeStatus(mode.id);
    if (status.isLocked) {
      if (onOpenUpgrade) {
        onOpenUpgrade();
      }
      return;
    }
    onModelChange(mode.id);
  };

  return (
    <div className="unified-studio-selector">
      <div className="selector-top-header">
        <div className="header-meta-group">
          <span className="live-engine-indicator">
            <span className="pulse-dot" /> LIVE ENGINE
          </span>
          <span className="engine-name-label">UNIFIED AI STUDIO // 3 WORKBENCH MODES</span>
        </div>
        <div className="quota-strip-summary">
          {!isPremiumUser ? (
            <span className="quota-text">
              ✨ <strong>{usage.imageStudioRendersLeft ?? 5}/5</strong> Free Studio Renders • ⚡ <strong>{usage.upscalerTrialsLeft ?? 1}</strong> 4K Upscale Trial • 📐 <strong>{usage.vectorineTrialsLeft ?? 1}</strong> Vector Trial
            </span>
          ) : (
            <span className="quota-text pro">💎 DELUXE PRO ACCESS • UNLIMITED USAGE</span>
          )}
        </div>
      </div>

      {/* Mode Capsule Tab Bar */}
      <div className="mode-capsule-bar" role="tablist">
        {STUDIO_MODES.map((mode) => {
          const isSelected = selectedModel === mode.id;
          const status = getModeStatus(mode.id);

          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`mode-capsule-btn ${isSelected ? 'active' : ''} ${status.isLocked ? 'locked' : ''}`}
              onClick={() => handleSelectMode(mode)}
            >
              <span className="mode-icon-glyph">{mode.icon}</span>
              <div className="mode-info-block">
                <div className="mode-title-row">
                  <span className="mode-tab-title">{mode.title}</span>
                  <span className={`mode-status-tag ${status.type}`}>{status.tag}</span>
                </div>
                <span className="mode-tab-engine">{mode.subtitle}</span>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        .unified-studio-selector {
          width: 100%;
          margin-bottom: 2rem;
          background: #08080c;
          border: 3px solid #1a1a24;
          box-shadow: 6px 6px 0 #000;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .selector-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #1f1f2e;
        }

        .header-meta-group {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .live-engine-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(0, 255, 102, 0.1);
          border: 1px solid #00FF66;
          color: #00FF66;
          font-family: var(--font-heading);
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          letter-spacing: 1px;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00FF66;
          box-shadow: 0 0 8px #00FF66;
          animation: pulseGlow 1.6s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .engine-name-label {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          color: var(--text-primary);
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .quota-strip-summary {
          font-family: monospace;
          font-size: 0.75rem;
          color: #888;
          letter-spacing: 0.5px;
        }

        .quota-strip-summary strong {
          color: var(--primary-orange);
        }

        .quota-text.pro {
          color: #00E5FF;
          font-weight: 700;
        }

        .mode-capsule-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .mode-capsule-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.25rem;
          background: #111118;
          border: 2px solid #222230;
          color: #aaa;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mode-capsule-btn:hover {
          border-color: var(--primary-orange);
          color: #fff;
          transform: translateY(-2px);
          background: #161622;
        }

        .mode-capsule-btn.active {
          background: #171510;
          border: 2px solid var(--primary-orange);
          box-shadow: 4px 4px 0 var(--primary-orange);
          color: #fff;
          transform: translateY(-2px);
        }

        .mode-capsule-btn.locked {
          opacity: 0.75;
          border-color: #2b233a;
        }

        .mode-capsule-btn.locked:hover {
          border-color: #ff3366;
          background: #19121a;
        }

        .mode-icon-glyph {
          font-size: 1.6rem;
          flex-shrink: 0;
        }

        .mode-info-block {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow: hidden;
          width: 100%;
        }

        .mode-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .mode-tab-title {
          font-family: var(--font-heading);
          font-size: 0.92rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mode-status-tag {
          font-family: monospace;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        .mode-status-tag.free {
          color: #00FF66;
          background: rgba(0, 255, 102, 0.1);
          border: 1px solid rgba(0, 255, 102, 0.3);
        }

        .mode-status-tag.trial {
          color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.12);
          border: 1px solid rgba(255, 106, 0, 0.35);
        }

        .mode-status-tag.locked {
          color: #ff4d6d;
          background: rgba(255, 77, 109, 0.12);
          border: 1px solid rgba(255, 77, 109, 0.35);
        }

        .mode-status-tag.pro {
          color: #00E5FF;
          background: rgba(0, 229, 255, 0.12);
          border: 1px solid rgba(0, 229, 255, 0.3);
        }

        .mode-tab-engine {
          font-family: monospace;
          font-size: 0.68rem;
          color: #777;
          letter-spacing: 0.5px;
        }

        .mode-capsule-btn.active .mode-tab-engine {
          color: var(--primary-orange);
        }

        @media (max-width: 900px) {
          .mode-capsule-bar {
            grid-template-columns: 1fr;
          }
          .selector-top-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default StudioModelSelector;
