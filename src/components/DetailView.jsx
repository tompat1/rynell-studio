import React, { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { SEARCH_DATA } from './SearchDrawer';

const DetailView = ({ item, onClose, addToCart, setItem, openShopArchive }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const { playTTS, stopAudio, isPlaying } = useAudio();

  useEffect(() => {
    if (item) {
      document.body.classList.add('drawer-open');
      if (item.type === 'PRODUCT' && item.sizes && item.sizes.length > 0) {
        setSelectedSize(item.sizes[0]);
      }
    } else {
      document.body.classList.remove('drawer-open');
      setSelectedSize(null);
    }
    return () => document.body.classList.remove('drawer-open');
  }, [item]);

  if (!item) return null;

  const handleAddToCart = () => {
    if (addToCart && item.type === 'PRODUCT') {
      addToCart({ ...item, size: selectedSize });
      onClose();
    }
  };

  const handleNavigate = (direction) => {
    if (!setItem) return;
    const typeData = SEARCH_DATA.filter(x => x.type === item.type);
    const currentIndex = typeData.findIndex(x => x.id === item.id);
    
    if (direction === 'prev' && currentIndex > 0) {
      setItem(typeData[currentIndex - 1]);
      if (isPlaying) stopAudio();
    } else if (direction === 'next' && currentIndex < typeData.length - 1) {
      setItem(typeData[currentIndex + 1]);
      if (isPlaying) stopAudio();
    }
  };

  const renderNavigation = () => {
    if (!item) return null;
    const typeData = SEARCH_DATA.filter(x => x.type === item.type);
    const currentIndex = typeData.findIndex(x => x.id === item.id);
    
    if (typeData.length <= 1) return null;

    return (
      <div className="drawer-navigation">
        <button 
          className="nav-btn" 
          onClick={() => handleNavigate('prev')}
          disabled={currentIndex === 0}
        >
          ← PREV
        </button>
        <button 
          className="nav-btn" 
          onClick={() => handleNavigate('next')}
          disabled={currentIndex === typeData.length - 1}
        >
          NEXT →
        </button>
      </div>
    );
  };

  return (
    <div className="detail-view-overlay">
      <div className="detail-view-header">
        <button className="back-btn" onClick={onClose}>
          CLOSE
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="detail-view-content">
        {item.type === 'PRODUCT' && (
          <div className="placeholder-product">
            <div className="placeholder-image" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none' }}></div>
            <div className="placeholder-info">
              <h1>{item.title}</h1>
              <p className="placeholder-tag">{item.tag.toUpperCase()}</p>
              {item.color && <p className="color-label" style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>COLOR: {item.color}</p>}
              <p className="placeholder-price">${item.price.toFixed(2)}</p>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.2rem' }}>{item.details}</p>
              
              {item.sizes && item.sizes.length > 0 && (
                <div className="detail-size-selector">
                  <p className="size-label">SIZE</p>
                  <div className="size-options">
                    {item.sizes.map(size => (
                      <button 
                        key={size}
                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="checkout-btn" onClick={handleAddToCart} style={{ flex: 2 }}>ADD TO CART</button>
                <button 
                  className="checkout-btn" 
                  onClick={() => {
                    onClose();
                    if (openShopArchive) openShopArchive();
                  }} 
                  style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                >
                  ALL MERCH
                </button>
              </div>
              {renderNavigation()}
            </div>
          </div>
        )}

        {item.type === 'JOURNAL' && (
          <div className="placeholder-journal">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <h1 className="journal-title" style={{ margin: 0 }}>{item.title}</h1>
              <button 
                className={`read-to-me-btn ${isPlaying ? 'playing' : ''}`}
                onClick={() => isPlaying ? stopAudio() : playTTS(item.content)}
              >
                {isPlaying ? "⏹ STOP" : "▶ READ IT TO ME"}
              </button>
            </div>
            <p className="journal-meta">PUBLISHED {item.date} • {item.tag.toUpperCase()}</p>
            <div className="placeholder-image banner" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none' }}></div>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.8' }}>{item.content}</p>
            {renderNavigation()}
          </div>
        )}

        {item.type === 'SERVICE' && (
          <div className="placeholder-service">
            <h1 className="service-title">{item.title}</h1>
            <p className="service-tag">{item.tag.toUpperCase()}</p>
            <div className="placeholder-image banner" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none' }}></div>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.8' }}>{item.description}</p>
            {renderNavigation()}
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
          justify-content: flex-end;
        }

        .checkout-btn:hover {
          background: var(--primary-orange);
          color: #FFF;
          border-color: var(--primary-orange);
        }

        /* Size Selector */
        .detail-size-selector {
          margin-bottom: 2rem;
        }
        .size-label {
          font-family: var(--font-heading);
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }
        .size-options {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .size-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 1rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .size-btn:hover {
          border-color: var(--text-secondary);
        }
        .size-btn.active {
          background: var(--secondary-blue);
          border-color: var(--secondary-blue);
          color: #FFF;
        }

        /* Read To Me Button */
        .read-to-me-btn {
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 0.5rem 1rem;
          font-family: var(--font-heading);
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .read-to-me-btn:hover {
          border-color: var(--text-secondary);
        }
        .read-to-me-btn.playing {
          background: var(--primary-orange);
          color: var(--bg-primary);
          border-color: var(--primary-orange);
        }

        /* Navigation */
        .drawer-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }
        .nav-btn {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-heading);
          font-size: 1.2rem;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .nav-btn:hover:not(:disabled) {
          color: var(--primary-orange);
        }
        .nav-btn:disabled {
          color: var(--border-color);
          cursor: not-allowed;
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
