import React from 'react';
import camp1 from '../assets/campaigns/campaign_01.jpg';
import camp2 from '../assets/campaigns/campaign_02.jpg';
import camp3 from '../assets/campaigns/campaign_03.jpg';
import camp4 from '../assets/campaigns/campaign_04.jpg';
import camp5 from '../assets/campaigns/campaign_05.jpg';

const campaignData = [
  { id: 1, image: camp1, title: 'WHISPER CAMPAIGN' },
  { id: 2, image: camp2, title: 'SCROLL STOPPER' },
  { id: 3, image: camp3, title: 'VISUAL UNIVERSE' },
  { id: 4, image: camp4, title: 'MERCH DROP' },
  { id: 5, image: camp5, title: 'OOH BILLBOARD' },
];

const Collections = () => {
  return (
    <section id="collections" className="section-container bg-grunge">
      <div className="collections-header">
        <h2 className="section-title">COLLECTIONS</h2>
      </div>
      <div className="collections-carousel">
        {campaignData.map((item) => (
          <div key={item.id} className="collection-card">
            <div className="collection-image">
              <img src={item.image} alt={item.title} className="collection-img" />
            </div>
            <div className="collection-overlay">
              <h3>{item.title}</h3>
              <button>VIEW CAMPAIGN</button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        #collections {
          background-color: var(--bg-tertiary);
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
          background: var(--bg-secondary);
          flex-shrink: 0;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--border-color);
        }
        .collection-image {
          width: 100%;
          height: 100%;
          background: var(--bg-primary);
          transition: transform 0.5s ease;
        }
        .collection-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          text-align: center;
          padding: 0 2rem;
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
