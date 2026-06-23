import React from 'react';

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
        <div className="studio-image-placeholder">
          {/* Placeholder for behind the scenes photo */}
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
        .studio-image-placeholder {
          flex: 1;
          height: 600px;
          background: #0A1E3F;
          border: 2px solid #0078FF;
          position: relative;
        }
        .studio-image-placeholder::after {
          content: 'STUDIO_CAM_01';
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-family: monospace;
          color: #0078FF;
          font-size: 1.2rem;
        }
        @media (max-width: 1024px) {
          .studio-split { flex-direction: column; }
          .studio-image-placeholder { width: 100%; }
        }
      `}</style>
    </section>
  );
};
export default Studio;
