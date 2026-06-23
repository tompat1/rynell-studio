import React from 'react';
import studioPortrait from '../assets/studio_portrait.jpg';

const Studio = () => {
  return (
    <section id="studio" className="section-container">
      <div className="content-wrapper studio-split">
        <div className="studio-text">
          <h2 className="section-title">THE STUDIO</h2>
          <p className="studio-manifesto">
            We operate at the bleeding edge of visual culture. Our studio is an incubator for bold ideas, 
            blending raw human creativity with state-of-the-art AI tooling to deliver uncompromising aesthetics.
          </p>
        </div>
        <div className="studio-image-wrapper">
          <img src={studioPortrait} alt="Studio Portrait" className="studio-image" />
        </div>
      </div>
      <style>{`
        #studio {
          background-color: #020813;
          padding: 8rem 5%;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .studio-split {
          display: flex;
          align-items: center;
          gap: 5rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .studio-text {
          flex: 1;
        }
        .studio-manifesto {
          font-family: var(--font-body);
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          font-weight: 300;
          border-left: 4px solid var(--primary-orange);
          padding-left: 2rem;
        }
        .studio-image-wrapper {
          flex: 1;
          height: 600px;
          position: relative;
          border: 2px solid #0078FF;
          overflow: hidden;
        }
        .studio-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(20%) contrast(1.1);
        }
        .studio-image-wrapper::after {
          content: 'STUDIO_CAM_01';
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-family: monospace;
          color: #0078FF;
          font-size: 1.2rem;
          background: rgba(2, 8, 19, 0.8);
          padding: 4px 8px;
        }
        @media (max-width: 1024px) {
          .studio-split { flex-direction: column; }
          .studio-image-wrapper { width: 100%; }
        }
      `}</style>
    </section>
  );
};
export default Studio;
