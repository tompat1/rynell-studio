import { useCms } from '../contexts/CmsContext';

const AdminFloatingBar = () => {
  const { isCmsAdmin, openCms, isLiveEditMode, toggleLiveEdit } = useCms();

  if (!isCmsAdmin) return null;

  return (
    <>
      <div className="admin-floating-bar">
        <div className="admin-status-pill">
          <span className="crown-icon">👑</span>
          <span className="admin-tag">ROOT ADMIN</span>
        </div>

        <button 
          type="button" 
          className="admin-cms-open-btn"
          onClick={() => openCms('nav')}
          title="Open Lightweight CMS to edit top navigation and all page text"
        >
          🛠️ CMS: EDIT COPY & MENU
        </button>

        <button 
          type="button" 
          className={`admin-live-mode-toggle ${isLiveEditMode ? 'active' : ''}`}
          onClick={toggleLiveEdit}
          title="Toggle In-Page Live Edit Mode"
        >
          {isLiveEditMode ? '✏️ LIVE: ON' : '✏️ LIVE: OFF'}
        </button>
      </div>

      <style>{`
        .admin-floating-bar {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(8, 12, 20, 0.94);
          backdrop-filter: blur(12px);
          border: 2px solid var(--primary-orange);
          box-shadow: 6px 6px 0 #000, 0 10px 25px rgba(0, 0, 0, 0.5);
          padding: 0.4rem 0.65rem;
          border-radius: 4px;
          animation: floatIn 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .admin-status-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.35);
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
        }

        .crown-icon {
          font-size: 0.85rem;
        }

        .admin-tag {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          letter-spacing: 1px;
          color: #fbbf24;
          font-weight: 700;
        }

        .admin-cms-open-btn {
          font-family: var(--font-heading);
          font-size: 0.82rem;
          letter-spacing: 1px;
          background: var(--primary-orange);
          color: #000;
          font-weight: 700;
          border: none;
          padding: 0.35rem 0.85rem;
          cursor: pointer;
          transition: transform 0.1s ease, background-color 0.15s ease;
        }

        .admin-cms-open-btn:hover {
          background: #ff8533;
          transform: translateY(-1px);
        }

        .admin-live-mode-toggle {
          font-family: monospace;
          font-size: 0.72rem;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #94a3b8;
          padding: 0.3rem 0.6rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .admin-live-mode-toggle:hover {
          color: #fff;
          border-color: #fff;
        }

        .admin-live-mode-toggle.active {
          background: #3b82f6;
          color: #fff;
          border-color: #60a5fa;
          font-weight: 700;
        }

        @keyframes floatIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .admin-floating-bar {
            bottom: 12px;
            right: 12px;
            left: 12px;
            justify-content: space-between;
          }
          .admin-tag {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default AdminFloatingBar;
