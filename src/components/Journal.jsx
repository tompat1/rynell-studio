import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAudio } from '../contexts/AudioContext';
import aiFashionImg from '../assets/journal/ai_fashion.png';
import neonNightsImg from '../assets/journal/neon_nights.png';
import typographyImg from '../assets/journal/brutalist_typography.png';

// New images for new articles
import img4 from '../assets/campaigns/campaign_01.jpg';
import img5 from '../assets/collection/collection_04.webp';
import img6 from '../assets/design_that_hits_clean.webp';
import img7 from '../assets/studio_portrait.jpg';

export const journalData = [
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
  },
  {
    id: 4,
    title: 'MERCH IS DEAD, LONG LIVE MERCH',
    date: 'JUN 12, 2026',
    image: img4,
    content: "The traditional logo tee is obsolete. We explore the rise of functional, story-driven artifacts and why your next drop needs to feel like a piece of armor, not a billboard."
  },
  {
    id: 5,
    title: 'THE ARCHITECTURE OF A DROP',
    date: 'MAY 22, 2026',
    image: img5,
    content: "Scarcity isn't just a marketing tactic; it's a structural requirement. A breakdown of the math, aesthetics, and frenzy behind orchestrating a modern, blink-and-you-miss-it release."
  },
  {
    id: 6,
    title: 'AI AS A CO-CONSPIRATOR',
    date: 'APR 08, 2026',
    image: img6,
    content: "We are no longer just prompting; we are fighting our algorithms. How adversarial creative processes with generative AI yield the most striking, unpredictable visual results."
  },
  {
    id: 7,
    title: 'WEARABLE BRUTALISM: DESIGNING FOR THE END',
    date: 'MAR 19, 2026',
    image: img7,
    content: "Heavy fabrics, asymmetrical cuts, and distressed finishing. A deep dive into why dystopian aesthetics and survivalist functionality are dominating the current fashion cycle."
  }
];

const Journal = () => {
  const [activeArticle, setActiveArticle] = useState(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const { playTTS, stopAudio, isPlaying } = useAudio();

  useEffect(() => {
    if (activeArticle || isArchiveOpen) document.body.classList.add('drawer-open');
    else document.body.classList.remove('drawer-open');
    return () => document.body.classList.remove('drawer-open');
  }, [activeArticle, isArchiveOpen]);

  const navigateArticle = (direction) => {
    if (!activeArticle) return;
    const currentIndex = journalData.findIndex(a => a.id === activeArticle.id);
    if (direction === 'prev' && currentIndex > 0) {
      setActiveArticle(journalData[currentIndex - 1]);
      if (isPlaying) stopAudio();
    } else if (direction === 'next' && currentIndex < journalData.length - 1) {
      setActiveArticle(journalData[currentIndex + 1]);
      if (isPlaying) stopAudio();
    }
  };

  return (
    <section id="journal" className="section-container" style={{ position: 'relative' }}>
      <div className="section-label">JOURNAL</div>
      <div className="content-wrapper">
        <div className="journal-header">
          <div className="title-group">
            <h2 className="section-title">LATEST DISPATCHES</h2>
            <p className="section-description">Transmissions from the bleeding edge of design culture. Thoughts on AI, brutalist architecture, and the future of merch.</p>
          </div>
          <button className="view-all-btn" onClick={() => setIsArchiveOpen(true)}>ALL ARTICLES</button>
        </div>
        
        <div className="journal-list">
          {journalData.slice(0, 3).map((article) => (
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

      {/* Portals for Archive and Article Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Full Screen Archive Overlay */}
          <div className={`journal-archive-overlay ${isArchiveOpen ? 'open' : ''}`}>
            <div className="archive-header">
              <h2 className="archive-title">FULL ARCHIVE</h2>
              <button className="archive-close" onClick={() => setIsArchiveOpen(false)}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="archive-list">
              {journalData.map((article) => (
                <div key={article.id} className="archive-item" onClick={() => setActiveArticle(article)}>
                  <div className="archive-item-meta">
                    <span className="archive-number">{String(article.id).padStart(2, '0')}</span>
                    <span className="archive-date">{article.date}</span>
                  </div>
                  <h3 className="archive-item-title">{article.title}</h3>
                  <div className="archive-item-arrow">→</div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide-out Drawer Backdrop */}
          <div 
            className={`journal-backdrop ${activeArticle ? 'open' : ''}`}
            onClick={() => setActiveArticle(null)}
          ></div>

          {/* Slide-out Drawer */}
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 className="drawer-title" style={{ margin: 0 }}>{activeArticle.title}</h3>
                    <button 
                      className={`read-to-me-btn ${isPlaying ? 'playing' : ''}`}
                      onClick={() => isPlaying ? stopAudio() : playTTS(activeArticle.content)}
                      style={{ marginBottom: 0 }}
                    >
                      {isPlaying ? "⏹ STOP" : "▶ READ IT TO ME"}
                    </button>
                  </div>
                  <div className="drawer-divider"></div>
                  <p className="drawer-body">{activeArticle.content}</p>
                  
                  <div className="drawer-navigation">
                    <button 
                      className="nav-btn" 
                      onClick={() => navigateArticle('prev')}
                      disabled={journalData.findIndex(a => a.id === activeArticle.id) === 0}
                    >
                      ← PREV
                    </button>
                    <button 
                      className="nav-btn" 
                      onClick={() => navigateArticle('next')}
                      disabled={journalData.findIndex(a => a.id === activeArticle.id) === journalData.length - 1}
                    >
                      NEXT →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      )}

      <style>{`
        #journal {
          background-image: var(--bg-journal);
          background-size: cover;
          background-position: center;
          padding: 8rem 5%;
          border-top: 4px solid var(--text-primary);
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
          color: var(--text-primary);
          margin: 0;
          text-shadow: 4px 4px 0 var(--border-color);
          transform: skewX(-10deg);
        }
        .section-description {
          font-family: var(--font-body);
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin: 0;
          max-width: 500px;
          line-height: 1.5;
          border-left: 4px solid var(--primary-orange);
          padding-left: 1.5rem;
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .view-all-btn {
          background: transparent;
          color: var(--text-primary);
          border: 2px solid var(--secondary-blue);
          padding: 0.8rem 2rem;
          font-family: var(--font-body);
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .view-all-btn:hover {
          background: var(--secondary-blue);
          color: #FFF;
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
          border-top: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .journal-item:last-child {
          border-bottom: 1px solid var(--border-color);
        }
        @media (hover: hover) {
          .journal-item:hover {
            background: var(--bg-secondary);
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }
        .journal-title {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          color: var(--text-primary);
          margin: 0;
          transform: skewX(-5deg);
          transition: color 0.3s ease;
        }
        .journal-item:hover .journal-title {
          color: var(--secondary-blue);
        }
        .journal-meta {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .journal-date {
          font-family: var(--font-body);
          color: var(--text-secondary);
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

        /* Full Screen Archive Styles */
        .journal-archive-overlay {
          position: fixed;
          inset: 0;
          background-color: var(--bg-primary);
          z-index: 2000;
          display: flex;
          flex-direction: column;
          transform: translateY(100%);
          transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
          overflow-y: auto;
        }
        .journal-archive-overlay.open {
          transform: translateY(0);
        }
        .archive-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 5%;
          border-bottom: 2px solid var(--border-color);
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          z-index: 10;
        }
        .archive-title {
          font-family: var(--font-heading);
          font-size: 4rem;
          color: var(--text-primary);
          margin: 0;
          transform: skewX(-10deg);
        }
        .archive-close {
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .archive-close:hover {
          color: var(--primary-orange);
          transform: rotate(90deg);
        }
        .archive-list {
          display: flex;
          flex-direction: column;
          padding: 0 5% 5rem 5%;
        }
        .archive-item {
          display: grid;
          grid-template-columns: 200px 1fr auto;
          align-items: center;
          padding: 3rem 0;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .archive-item:hover {
          background: var(--bg-secondary);
          padding-left: 2rem;
          padding-right: 2rem;
        }
        .archive-item-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .archive-number {
          font-family: var(--font-heading);
          font-size: 2rem;
          color: var(--primary-orange);
        }
        .archive-date {
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--text-secondary);
          letter-spacing: 2px;
        }
        .archive-item-title {
          font-family: var(--font-heading);
          font-size: 4rem;
          color: var(--text-primary);
          margin: 0;
          transform: skewX(-5deg);
          transition: color 0.3s ease;
        }
        .archive-item:hover .archive-item-title {
          color: var(--secondary-blue);
        }
        .archive-item-arrow {
          font-size: 3rem;
          color: var(--border-color);
          transition: all 0.3s ease;
        }
        .archive-item:hover .archive-item-arrow {
          color: var(--primary-orange);
          transform: translateX(10px);
        }

        /* Drawer Styles */
        .journal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          z-index: 2001; /* Above archive */
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
          background-color: var(--bg-tertiary);
          z-index: 2002; /* Above backdrop */
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          overflow-y: auto;
          border-left: 2px solid var(--border-color);
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
          color: var(--text-primary);
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
          background: var(--secondary-blue);
          border-color: var(--secondary-blue);
          transform: rotate(90deg);
          color: #FFF;
        }

        .journal-drawer-content {
          display: flex;
          flex-direction: column;
        }

        .journal-drawer-image {
          width: 100%;
          height: 350px;
          background: var(--bg-primary);
        }

        .journal-drawer-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .journal-drawer-text {
          padding: 3rem 2.5rem;
          color: var(--text-primary);
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
          color: var(--text-primary);
          text-shadow: 2px 2px 0 var(--border-color);
          transform: skewX(-5deg);
        }

        .drawer-divider {
          width: 60px;
          height: 4px;
          background-color: var(--secondary-blue);
          margin-bottom: 2rem;
        }

        .drawer-body {
          font-family: var(--font-body);
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--text-secondary);
          font-weight: 300;
        }

        @media (max-width: 768px) {
          .journal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 2rem;
          }
          .title-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .journal-header .section-title { font-size: 4rem; }
          .journal-title { font-size: 2.5rem; }
          .journal-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .journal-meta { width: 100%; justify-content: space-between; }
          .journal-drawer { max-width: 100%; }
          
          /* Mobile Archive Styles */
          .archive-item {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 2rem 0;
          }
          .archive-item-meta {
            flex-direction: row;
            align-items: center;
          }
          .archive-item-title {
            font-size: 2.5rem;
          }
          .archive-item-arrow {
            display: none;
          }
          .archive-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Journal;
