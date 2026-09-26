import React from 'react';

export const STUDIO_MODES = [
  {
    id: 'qwen_edit',
    icon: '🎩',
    title: 'SMART EDIT & ACCESSORIES',
    subtitle: 'INSTRUCTPIX2PIX • NATURAL LANGUAGE EDITING',
    desc: 'Add hats, sunglasses, clothing, or edit features naturally while preserving facial likeness and background.',
    badge: '100% FREE',
    isDeluxe: false,
    placeholder: "Describe edit (e.g., 'add a top-hat', 'add sunglasses', 'change shirt to electric orange')...",
    recipes: [
      'Add a stylish black top-hat',
      'Add designer brutalist sunglasses',
      'Change shirt to orange streetwear',
      'Add studio dramatic rim lighting'
    ]
  },
  {
    id: 'photo',
    icon: '📸',
    title: 'PORTRAIT & FACE ENHANCE',
    subtitle: 'REALISTIC TEXTURE RECONSTRUCTION',
    desc: 'Restores facial pores, micro-textures, eyes, and studio lighting with zero compression loss.',
    badge: '100% FREE',
    isDeluxe: false,
    placeholder: "Describe enhancement (e.g., 'ultra-high detail portrait, 8k studio lighting, clear sharp eyes')...",
    recipes: [
      'Restore facial micro-textures and sharp eyes',
      'Cinematic 8K studio portrait lighting',
      'Clean skin glare and studio shadow grading',
      'High-contrast monochrome studio portrait'
    ]
  },
  {
    id: 'illustration',
    icon: '🎨',
    title: 'ART & STYLE TRANSFER',
    subtitle: 'AESTHETIC STYLING & COLOR GRADING',
    desc: 'Transform into brutalist posters, neon cyberpunk night, pop-art, or match reference image palette.',
    badge: '100% FREE',
    isDeluxe: false,
    placeholder: "Describe artistic style (e.g., 'brutalist pop-art poster, cyberpunk neon, bold ink')...",
    recipes: [
      'Transform into brutalist typography poster',
      'Cyberpunk neon night aesthetics',
      'Clean anime line-art and ink contours',
      'Match artistic style and palette of reference'
    ]
  },
  {
    id: 'cleanup',
    icon: '🧹',
    title: 'ELEMENT REMOVAL & CLEANUP',
    subtitle: 'BACKGROUND & BLEMISH RECONSTRUCTION',
    desc: 'Erase unwanted background objects, watermarks, blemishes, and photobombers seamlessly.',
    badge: '100% FREE',
    isDeluxe: false,
    placeholder: "Describe elements to remove (e.g., 'remove photobomber in background, erase watermark')...",
    recipes: [
      'Remove photobomber and distracting objects',
      'Erase watermarks and overlay text',
      'Clean background to minimalist studio wall',
      'Remove harsh glare and reflections'
    ]
  },
  {
    id: 'logo',
    icon: '📐',
    title: 'VECTORINE (RASTER TO SVG)',
    subtitle: 'RUNPOD VTRACER GPU VECTOR ENGINE',
    desc: 'Converts raster logos and graphic elements into infinite-resolution SVG vector curves.',
    badge: 'DELUXE 💎',
    isDeluxe: true,
    placeholder: "Optional vector tracing parameters (e.g., 'monochrome high contrast', 'color stacked')...",
    recipes: [
      'Trace monochrome high-contrast vector',
      'Stacked color vector curves',
      'Geometric brutalist vector logo'
    ]
  }
];

export const FREE_MODELS = STUDIO_MODES.filter(m => !m.isDeluxe);
export const DELUXE_MODELS = STUDIO_MODES.filter(m => m.isDeluxe);
export const MODELS = STUDIO_MODES;

const StudioModelSelector = ({ selectedModel, onModelChange, isPremiumUser, onOpenUpgrade }) => {
  const handleSelectMode = (mode) => {
    if (mode.isDeluxe && !isPremiumUser) {
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }
    onModelChange(mode.id);
  };

  const activeMode = STUDIO_MODES.find(m => m.id === selectedModel) || STUDIO_MODES[0];

  return (
    <div className="unified-studio-selector">
      <div className="selector-top-header">
        <div className="header-meta-group">
          <span className="live-engine-indicator">
            <span className="pulse-dot" /> LIVE ENGINE
          </span>
          <span className="engine-name-label">UNIFIED AI STUDIO // 5 WORKBENCH MODES</span>
        </div>
        <span className="engine-subtag">EDGE AI • ZERO EGRESS • DIRECT CLOUDFLARE GATEWAY</span>
      </div>

      {/* Mode Capsule Tab Bar */}
      <div className="mode-capsule-bar" role="tablist">
        {STUDIO_MODES.map((mode) => {
          const isSelected = selectedModel === mode.id;
          const isLocked = mode.isDeluxe && !isPremiumUser;

          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`mode-capsule-btn ${isSelected ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => handleSelectMode(mode)}
            >
              <span className="mode-icon-glyph">{mode.icon}</span>
              <div className="mode-info-block">
                <span className="mode-tab-title">{mode.title}</span>
                <span className={`mode-tab-badge ${mode.isDeluxe ? 'deluxe' : 'free'}`}>
                  {isLocked ? 'LOCK 🔒' : mode.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Mode Capability Descriptor Bar */}
      <div className="active-mode-description-bar">
        <div className="desc-icon-circle">{activeMode.icon}</div>
        <div className="desc-text-wrapper">
          <div className="desc-headline">
            <strong className="desc-title">{activeMode.title}</strong>
            <span className="desc-engine-tag">{activeMode.subtitle}</span>
          </div>
          <p className="desc-summary">{activeMode.desc}</p>
        </div>
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

        .engine-subtag {
          font-family: monospace;
          font-size: 0.75rem;
          color: #666;
          letter-spacing: 1px;
        }

        .mode-capsule-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .mode-capsule-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
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
          opacity: 0.7;
          border-color: #332a40;
        }

        .mode-icon-glyph {
          font-size: 1.4rem;
          flex-shrink: 0;
        }

        .mode-info-block {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          overflow: hidden;
        }

        .mode-tab-title {
          font-family: var(--font-heading);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mode-tab-badge {
          font-family: monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          align-self: flex-start;
          padding: 0.1rem 0.4rem;
        }

        .mode-tab-badge.free {
          background: rgba(0, 255, 102, 0.12);
          color: #00FF66;
          border: 1px solid rgba(0, 255, 102, 0.3);
        }

        .mode-tab-badge.deluxe {
          background: rgba(0, 229, 255, 0.12);
          color: #00E5FF;
          border: 1px solid rgba(0, 229, 255, 0.3);
        }

        .active-mode-description-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.2rem;
          background: #0d0d14;
          border-left: 4px solid var(--primary-orange);
          border-top: 1px solid #1a1a24;
          border-right: 1px solid #1a1a24;
          border-bottom: 1px solid #1a1a24;
        }

        .desc-icon-circle {
          font-size: 1.6rem;
          flex-shrink: 0;
        }

        .desc-text-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .desc-headline {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .desc-title {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          color: #fff;
          letter-spacing: 1px;
        }

        .desc-engine-tag {
          font-family: monospace;
          font-size: 0.72rem;
          color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.1);
          padding: 0.15rem 0.5rem;
          border: 1px solid rgba(255, 106, 0, 0.3);
          letter-spacing: 0.5px;
        }

        .desc-summary {
          margin: 0;
          font-size: 0.82rem;
          color: #888;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
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
