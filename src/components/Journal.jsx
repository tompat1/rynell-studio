import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import aiFashionImg from '../assets/journal/ai_fashion.png';
import neonNightsImg from '../assets/journal/neon_nights.png';
import typographyImg from '../assets/journal/brutalist_typography.png';

const journalData = [
  {
    id: 1,
    title: 'THE FUTURE OF AI GENERATION IN FASHION',
    date: 'SEP 28, 2026',
    image: aiFashionImg,
    content: "AI isn't replacing designers; it's arming them with super-powered conceptual tools. We explore how generative models are pushing the boundaries of high fashion, turning wild ideas into tangible aesthetics at breakneck speeds."
  },
  {
    id: 2,
    title: 'BEHIND THE SCENES: NEON NIGHTS CAMPAIGN',
    date: 'AUG 15, 2026',
    image: neonNightsImg,
    content: "Dark warehouses. Heavy machinery. Neon glow. Dive into the raw, unedited chaos behind our most aggressive campaign yet. See how we orchestrated light and shadow to create imagery that refuses to be ignored."
  },
  {
    id: 3,
    title: 'TYPOGRAPHY AS A BRUTALIST WEAPON',
    date: 'JUL 04, 2026',
    image: typographyImg,
    content: "Words don't just speak; they hit. We break down our approach to using hyper-scaled, aggressive typography. Discover why breaking the rules of kerning and legibility is sometimes the only way to make a brand truly scream."
  }
];

const Journal = () => {
  const [activeArticle, setActiveArticle] = useState(null);

  return (
    <section id="journal" className="section-container">
      <div className="content-wrapper">
        <div className="journal-header">
          <h2 className="section-title">LATEST DISPATCHES</h2>
          <button className="view-all-btn">ALL ARTICLES</button>
        </div>
        
        <div className="journal-list">
          {journalData.map((article) => (
            <div key={article.id} className="journal-item" onClick={() => setActiveArticle(article)}>
              <h3 className="journal-title">{article.title}</h3>
              <div className="journal-meta">
                <span className="journal-date">{article.date}</span>
                <span className="journal-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-out Drawer Portalled to Body */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className={`journal-backdrop ${activeArticle ? 'open' : ''}`}
            onClick={() => setActiveArticle(null)}
          ></div>

          <div className={`journal-drawer ${activeArticle ? 'open' : ''}`}>
            <button className="journal-close" onClick={() => setActiveArticle(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {activeArticle && (
              <div className="journal-drawer-content">
                <div className="journal-drawer-image">
                  <img src={activeArticle.image} alt={activeArticle.title} />
                </div>
                
                <div className="journal-drawer-text">
                  <span className="drawer-date">{activeArticle.date}</span>
                  <h3 className="drawer-title">{activeArticle.title}</h3>
                  <div className="drawer-divider"></div>
                  <p className="drawer-body">{activeArticle.content}</p>
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      )}

      <style>{`
        #journal {
          background-color: #020813;
          padding: 8rem 5%;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .journal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 4rem;
        }
        .journal-header .section-title {
          font-family: var(--font-heading);
          font-size: 6rem;
          color: #FFF;
          margin: 0;
          text-shadow: 4px 4px 0 #000;
          transform: skewX(-10deg);
        }
        .view-all-btn {
          background: transparent;
          color: #FFF;
          border: 2px solid var(--primary-orange);
          padding: 0.8rem 2rem;
          font-family: var(--font-body);
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .view-all-btn:hover {
          background: var(--primary-orange);
        }
        .journal-list {
          display: flex;
          flex-direction: column;
        }
        .journal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2.5rem 0;
          border-top: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .journal-item:last-child {
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        @media (hover: hover) {
          .journal-item:hover {
            background: rgba(255,255,255,0.02);
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }
        .journal-title {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          color: #FFF;
          margin: 0;
          transform: skewX(-5deg);
          transition: color 0.3s ease;
        }
        .journal-item:hover .journal-title {
          color: #0078FF;
        }
        .journal-meta {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .journal-date {
          font-family: var(--font-body);
          color: rgba(255,255,255,0.5);
          letter-spacing: 2px;
        }
        .journal-arrow {
          font-size: 2rem;
          color: var(--primary-orange);
          transition: transform 0.3s ease;
        }
        .journal-item:hover .journal-arrow {
          transform: translateX(10px);
        }

        /* Drawer Styles */
        .journal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          z-index: 2000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }

        .journal-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .journal-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 550px;
          height: 100vh;
          background-color: #051024;
          z-index: 2001;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          overflow-y: auto;
          border-left: 2px solid var(--primary-orange);
        }

        .journal-drawer.open {
          transform: translateX(0);
        }

        .journal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255,255,255,0.2);
          color: #FFF;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 102;
          transition: all 0.2s ease;
        }

        .journal-close:hover {
          background: var(--primary-orange);
          border-color: var(--primary-orange);
          transform: rotate(90deg);
        }

        .journal-drawer-content {
          display: flex;
          flex-direction: column;
        }

        .journal-drawer-image {
          width: 100%;
          height: 350px;
          background: #020813;
        }

        .journal-drawer-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .journal-drawer-text {
          padding: 3rem 2.5rem;
          color: #FFF;
        }

        .drawer-date {
          font-family: var(--font-body);
          color: var(--primary-orange);
          font-size: 0.9rem;
          font-weight: bold;
          letter-spacing: 2px;
          display: block;
          margin-bottom: 1rem;
        }

        .drawer-title {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          line-height: 0.9;
          margin: 0 0 1.5rem 0;
          color: #FFF;
          text-shadow: 2px 2px 0 #000;
          transform: skewX(-5deg);
        }

        .drawer-divider {
          width: 60px;
          height: 4px;
          background-color: #0078FF;
          margin-bottom: 2rem;
        }

        .drawer-body {
          font-family: var(--font-body);
          font-size: 1.15rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 300;
        }

        @media (max-width: 768px) {
          .journal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 2rem;
          }
          .journal-header .section-title { font-size: 4rem; }
          .journal-title { font-size: 2.5rem; }
          .journal-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .journal-meta { width: 100%; justify-content: space-between; }
          .journal-drawer { max-width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default Journal;
