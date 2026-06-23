import React from 'react';

const Ads = () => {
  return (
    <section id="ads" className="section-container">
      <div className="content-wrapper">
        <h2 className="section-title">COMMERCIAL ADS</h2>
        <div className="ads-video-placeholder">
          <div className="play-button">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
      </div>
      <style>{`
        #ads {
          background-color: #051024;
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
        .ads-video-placeholder {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: linear-gradient(135deg, #0A1E3F 0%, #020813 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .ads-video-placeholder:hover {
          transform: scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .play-button {
          width: 100px;
          height: 100px;
          background-color: var(--primary-orange);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
          transition: transform 0.3s ease;
        }
        .ads-video-placeholder:hover .play-button {
          transform: scale(1.1);
        }
      `}</style>
    </section>
  );
};
export default Ads;
