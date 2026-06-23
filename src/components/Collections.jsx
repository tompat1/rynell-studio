import React from 'react';

const Collections = () => {
  return (
    <section id="collections" className="section-container">
      <div className="collections-header">
        <h2 className="section-title">COLLECTIONS</h2>
      </div>
      <div className="collections-carousel">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="collection-card">
            <div className="collection-image"></div>
            <div className="collection-overlay">
              <h3>SERIES 0{item}</h3>
              <button>VIEW CAMPAIGN</button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        #collections {
          background-color: #051024;
          padding: 8rem 0 8rem 5%;
          overflow: hidden;
        }
        .collections-header {
          max-width: 1400px;
          margin: 0 auto 4rem auto;
          padding-right: 5%;
        }
        .collections-carousel {
          display: flex;
          gap: 2rem;
          overflow-x: auto;
          padding-bottom: 2rem;
          padding-right: 5%;
          scrollbar-width: none;
        }
        .collections-carousel::-webkit-scrollbar {
          display: none;
        }
        .collection-card {
          min-width: 600px;
          height: 700px;
          position: relative;
          background: #020813;
          flex-shrink: 0;
          overflow: hidden;
          cursor: pointer;
        }
        .collection-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #0A1E3F 0%, #020813 100%);
          transition: transform 0.5s ease;
        }
        .collection-card:hover .collection-image {
          transform: scale(1.05);
        }
        .collection-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: rgba(0,0,0,0.6);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .collection-card:hover .collection-overlay {
          opacity: 1;
        }
        .collection-overlay h3 {
          font-family: var(--font-heading);
          font-size: 5rem;
          color: #FFF;
          margin: 0 0 2rem 0;
          transform: translateY(20px);
          transition: transform 0.3s ease;
        }
        .collection-card:hover .collection-overlay h3 {
          transform: translateY(0);
        }
        .collection-overlay button {
          background: var(--primary-orange);
          color: #FFF;
          border: none;
          padding: 1rem 2rem;
          font-family: var(--font-body);
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transform: translateY(20px);
          transition: transform 0.4s ease;
        }
        .collection-card:hover .collection-overlay button {
          transform: translateY(0);
        }
        @media (max-width: 768px) {
          .collection-card { min-width: 85vw; height: 500px; }
          .collection-overlay h3 { font-size: 3rem; }
        }
      `}</style>
    </section>
  );
};
export default Collections;
