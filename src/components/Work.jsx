import React from 'react';

const Work = () => {
  return (
    <section id="work" className="section-container">
      <div className="content-wrapper">
        <h2 className="section-title">FEATURED WORK</h2>
        <div className="work-grid">
          {/* Skeleton Placeholders */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="work-card">
              <div className="work-image-placeholder"></div>
              <div className="work-info">
                <h3>PROJECT TITLE {item}</h3>
                <p>Campaign / Branding</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        #work {
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

        .work-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 3rem;
        }

        .work-card {
          position: relative;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .work-card:hover {
          transform: translateY(-10px);
        }

        .work-image-placeholder {
          width: 100%;
          height: 500px;
          background: linear-gradient(135deg, #0A1E3F 0%, #020813 100%);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .work-info {
          margin-top: 1.5rem;
        }

        .work-info h3 {
          font-family: var(--font-heading);
          font-size: 2rem;
          color: #FFF;
          margin: 0;
          letter-spacing: 1px;
        }

        .work-info p {
          font-family: var(--font-body);
          color: #0078FF;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: bold;
          margin-top: 0.5rem;
        }
      `}</style>
    </section>
  );
};

export default Work;
