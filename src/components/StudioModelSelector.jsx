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
  },
  {
    id: 'history',
    icon: '📜',
    title: 'ASSET LIBRARY',
    subtitle: 'SAVED RENDERS & HISTORY',
    desc: 'View, re-download, and reload all your saved AI generations (registered members only).',
    isPaid: false
  }
];

export const FREE_MODELS = STUDIO_MODES.filter(m => !m.isPaid);
export const DELUXE_MODELS = STUDIO_MODES.filter(m => m.isPaid);
export const MODELS = STUDIO_MODES;

const StudioModelSelector = ({ 
  selectedModel, 
  onModelChange, 
  isPremiumUser, 
  isAdmin,
  isRegistered = false,
  onOpenUpgrade,
  usage = { imageStudioRendersLeft: 5, upscalerTrialsLeft: 1, vectorineTrialsLeft: 1 }
}) => {
  const getModeStatus = (modeId) => {
    if (isAdmin) return { isLocked: false, tag: '👑 ADMIN UNLIMITED', type: 'admin' };
    if (isPremiumUser) return { isLocked: false, tag: 'PRO UNLIMITED', type: 'pro' };

    if (modeId === 'history') {
      return isRegistered || isAdmin || isPremiumUser
        ? { isLocked: false, tag: 'SAVED RENDERS', type: 'pro' }
        : { isLocked: false, tag: 'MEMBERS ONLY 🔒', type: 'locked' };
    }

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
          {isAdmin ? (
            <span className="quota-text admin">👑 ROOT ADMIN ACCESS • UNLIMITED RENDERS (CF & RUNPOD)</span>
          ) : !isPremiumUser ? (
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
          background: var(--studio-surface);
          border: 3px solid var(--studio-border);
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
          border-bottom: 1px solid var(--studio-border);
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
          background: color-mix(in srgb, var(--studio-accent-green) 10%, transparent);
          border: 1px solid var(--studio-accent-green);
          color: var(--studio-accent-green);
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
          background: var(--studio-accent-green);
          box-shadow: 0 0 8px var(--studio-accent-green);
          animation: pulseGlow 1.6s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .engine-name-label {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          color: var(--studio-text);
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .quota-strip-summary {
          font-family: monospace;
          font-size: 0.75rem;
          color: var(--studio-text-muted);
          letter-spacing: 0.5px;
        }

        .quota-strip-summary strong {
          color: var(--studio-accent-orange);
        }

        .quota-text.pro {
          color: var(--studio-accent-cyan);
          font-weight: 700;
        }

        .quota-text.admin {
          color: var(--studio-accent-danger);
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .mode-capsule-bar {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }

        .mode-capsule-btn {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.1rem 1.25rem;
          min-width: 0;
          background: var(--studio-surface-raised);
          border: 2px solid var(--studio-border);
          color: var(--studio-text-muted);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mode-capsule-btn:hover {
          border-color: var(--primary-orange);
          color: var(--studio-text);
          transform: translateY(-2px);
          background: var(--studio-surface-soft);
        }

        .mode-capsule-btn.active {
          background: var(--studio-surface-active);
          border: 2px solid var(--primary-orange);
          box-shadow: 4px 4px 0 var(--primary-orange);
          color: var(--studio-text);
          transform: translateY(-2px);
        }

        .mode-capsule-btn.locked {
          opacity: 0.75;
          border-color: var(--studio-border);
        }

        .mode-capsule-btn.locked:hover {
          border-color: var(--studio-accent-danger);
          background: color-mix(in srgb, var(--studio-accent-danger) 8%, var(--studio-surface));
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
          min-width: 0;
        }

        .mode-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .mode-tab-title {
          font-family: var(--font-heading);
          font-size: 0.92rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: var(--studio-text);
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .mode-status-tag {
          font-family: monospace;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          letter-spacing: 0.5px;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .mode-status-tag.free {
          color: var(--studio-accent-green);
          background: color-mix(in srgb, var(--studio-accent-green) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--studio-accent-green) 35%, transparent);
        }

        .mode-status-tag.trial {
          color: var(--studio-accent-orange);
          background: rgba(255, 106, 0, 0.12);
          border: 1px solid rgba(255, 106, 0, 0.35);
        }

        .mode-status-tag.locked {
          color: var(--studio-accent-danger);
          background: color-mix(in srgb, var(--studio-accent-danger) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--studio-accent-danger) 35%, transparent);
        }

        .mode-status-tag.pro {
          color: var(--studio-accent-cyan);
          background: color-mix(in srgb, var(--studio-accent-cyan) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--studio-accent-cyan) 35%, transparent);
        }

        .mode-status-tag.admin {
          color: var(--studio-accent-danger);
          background: color-mix(in srgb, var(--studio-accent-danger) 16%, transparent);
          border: 1px solid color-mix(in srgb, var(--studio-accent-danger) 40%, transparent);
          box-shadow: 0 0 8px color-mix(in srgb, var(--studio-accent-danger) 20%, transparent);
        }

        .mode-tab-engine {
          font-family: monospace;
          font-size: 0.68rem;
          color: var(--studio-text-muted);
          letter-spacing: 0.5px;
        }

        .mode-capsule-btn.active .mode-tab-engine {
          color: var(--studio-accent-orange);
        }

        @media (max-width: 1180px) {
          .mode-capsule-bar {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
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
