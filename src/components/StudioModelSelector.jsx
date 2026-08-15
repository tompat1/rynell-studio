import React from 'react';

export const MODELS = [
  {
    id: 'photo',
    title: 'PHOTOGRAPHY & PORTRAITS',
    subtitle: 'REAL-ESRGAN + FACE RECONSTRUCTION',
    desc: 'Restores facial pores, micro-textures, and eyes. Prevents painterly smudging on raw photographic sources.',
    badge: 'STANDARD (4K/8K)',
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
    badge: 'STANDARD (4K/8K)',
    isDeluxe: false,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
        <circle cx="11" cy="11" r="2"/>
      </svg>
    )
  },
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

const StudioModelSelector = ({ selectedModel, onModelChange, isPremiumUser, onOpenUpgrade }) => {
  return (
    <div className="model-selector-container">
      <h3 className="selector-title">
        SELECT PROCESSING ENGINE
      </h3>

      <div className="model-grid">
        {MODELS.map((model) => {
          const isLocked = model.isDeluxe && !isPremiumUser;
          const isSelected = selectedModel === model.id;

          return (
            <div
              key={model.id}
              onClick={() => {
                if (isLocked) {
                  if (onOpenUpgrade) onOpenUpgrade();
                } else {
                  onModelChange(model.id);
                }
              }}
              className={`model-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
            >
              <div className="model-card-header">
                <div className="icon-badge-group">
                  <span className="model-icon">{model.icon}</span>
                  <h4 className="model-name">{model.title}</h4>
                </div>

                <span className={`tier-tag ${model.isDeluxe ? 'deluxe' : 'free'}`}>
                  {model.isDeluxe ? (isPremiumUser ? 'UNLOCKED' : 'DELUXE 💎') : 'FREE'}
                </span>
              </div>

              <span className="model-subtitle">{model.subtitle}</span>
              <p className="model-desc">{model.desc}</p>

              {isLocked && (
                <div className="lock-overlay">
                  <span className="lock-icon">🔒 DELUXE MODE</span>
                  <span className="unlock-prompt">Click to unlock 8K Vectorine</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .model-selector-container {
          width: 100%;
          margin-bottom: 2rem;
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
      `}</style>
    </div>
  );
};

export default StudioModelSelector;
