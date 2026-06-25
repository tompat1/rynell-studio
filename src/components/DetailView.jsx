import React, { useEffect } from 'react';

const DetailView = ({ item, onClose }) => {
  useEffect(() => {
    if (item) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [item]);

  if (!item) return null;

  return (
    <div className="detail-view-overlay">
      <div className="detail-view-header">
        <button className="back-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          BACK TO SEARCH
        </button>
      </div>

      <div className="detail-view-content">
        {item.type === 'PRODUCT' && (
          <div className="placeholder-product">
            <div className="placeholder-image"></div>
            <div className="placeholder-info">
              <h1>{item.title}</h1>
              <p className="placeholder-tag">{item.tag.toUpperCase()}</p>
              <p className="placeholder-price">$XX.XX</p>
              <button className="checkout-btn">ADD TO CART</button>
            </div>
          </div>
        )}

        {item.type === 'JOURNAL' && (
          <div className="placeholder-journal">
            <h1 className="journal-title">{item.title}</h1>
            <p className="journal-meta">PUBLISHED 2026 • {item.tag.toUpperCase()}</p>
            <div className="placeholder-text-block"></div>
            <div className="placeholder-text-block short"></div>
            <div className="placeholder-text-block"></div>
            <br />
            <div className="placeholder-text-block"></div>
            <div className="placeholder-text-block"></div>
          </div>
        )}

        {item.type === 'SERVICE' && (
          <div className="placeholder-service">
            <h1 className="service-title">{item.title}</h1>
            <p className="service-tag">{item.tag.toUpperCase()}</p>
            <div className="placeholder-image banner"></div>
            <div className="placeholder-text-block"></div>
            <div className="placeholder-text-block short"></div>
          </div>
        )}
      </div>

      <style>{`
        .detail-view-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: var(--bg-primary);
          z-index: 3000;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.4s ease forwards;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .detail-view-header {
          padding: 2rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
        }

        .back-btn {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-heading);
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          color: var(--primary-orange);
          transform: translateX(-5px);
        }

        .detail-view-content {
          flex: 1;
          overflow-y: auto;
          padding: 4rem 2rem;
        }

        /* PRODUCT PLACEHOLDER */
        .placeholder-product {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .placeholder-product { grid-template-columns: 1fr; gap: 2rem; }
        }
        .placeholder-image {
          background: rgba(255, 255, 255, 0.05);
          aspect-ratio: 4/5;
          border: 2px dashed var(--border-color);
        }
        .placeholder-image.banner {
          aspect-ratio: 16/9;
          margin: 2rem 0;
        }
        .placeholder-info h1 {
          font-family: var(--font-heading);
          font-size: 4rem;
          line-height: 1;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .placeholder-tag {
          color: var(--primary-orange);
          font-family: var(--font-heading);
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .placeholder-price {
          font-size: 2rem;
          font-family: var(--font-body);
          margin-bottom: 3rem;
        }

        /* JOURNAL / SERVICE PLACEHOLDER */
        .placeholder-journal, .placeholder-service {
          max-width: 800px;
          margin: 0 auto;
        }
        .journal-title, .service-title {
          font-family: var(--font-heading);
          font-size: 4rem;
          line-height: 1;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .journal-meta, .service-tag {
          color: var(--primary-orange);
          font-family: var(--font-heading);
          font-size: 1.2rem;
          margin-bottom: 4rem;
        }
        .placeholder-text-block {
          height: 20px;
          background: rgba(255, 255, 255, 0.05);
          margin-bottom: 1rem;
          width: 100%;
        }
        .placeholder-text-block.short {
          width: 60%;
        }
      `}</style>
    </div>
  );
};

export default DetailView;
