import React from 'react';

const Journal = () => {
  return (
    <section id="journal" className="section-container">
      <div className="content-wrapper">
        <h2 className="section-title">LATEST DISPATCHES</h2>
        <div className="journal-list">
          {[
            { date: 'OCT 12, 2026', title: 'THE FUTURE OF AI GENERATION IN FASHION' },
            { date: 'SEP 28, 2026', title: 'BEHIND THE SCENES: NEON NIGHTS CAMPAIGN' },
            { date: 'AUG 15, 2026', title: 'TYPOGRAPHY AS A BRUTALIST WEAPON' }
          ].map((article, idx) => (
            <div key={idx} className="journal-item">
              <span className="journal-date">{article.date}</span>
              <h3 className="journal-title">{article.title}</h3>
              <span className="journal-arrow">→</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        #journal {
          background-color: #020813;
          padding: 8rem 5%;
        }
        .section-title {
          font-family: var(--font-heading);
          font-size: 6rem;
          color: #FFF;
          margin-bottom: 4rem;
          text-shadow: 4px 4px 0 #000;
          transform: skewX(-10deg);
        }
        .journal-list {
          display: flex;
          flex-direction: column;
        }
        .journal-item {
          display: grid;
          grid-template-columns: 200px 1fr auto;
          align-items: center;
          padding: 3rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .journal-item:hover {
          background-color: rgba(0, 120, 255, 0.05);
        }
        .journal-date {
          font-family: var(--font-body);
          color: #0078FF;
          font-weight: bold;
          letter-spacing: 2px;
        }
        .journal-title {
          font-family: var(--font-heading);
          font-size: 3rem;
          color: #FFF;
          margin: 0;
          transform: skewX(-10deg);
          transition: color 0.3s ease;
        }
        .journal-item:hover .journal-title {
          color: var(--primary-orange);
        }
        .journal-arrow {
          font-size: 3rem;
          color: #FFF;
          transition: transform 0.3s ease;
        }
        .journal-item:hover .journal-arrow {
          transform: translateX(10px);
          color: var(--primary-orange);
        }
        @media (max-width: 768px) {
          .journal-item {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 2rem 0;
          }
          .journal-arrow { display: none; }
          .journal-title { font-size: 2rem; }
        }
      `}</style>
    </section>
  );
};
export default Journal;
