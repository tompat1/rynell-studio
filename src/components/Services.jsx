import React from 'react';
import servicesBg from '../assets/design_that_hits_clean.webp';

const Services = () => {
  return (
    <section className="services-section">
      
      {/* Explosive Pop-Art Background Image */}
      <div className="services-bg-container">
        <img 
          src={servicesBg} 
          alt="Explosive Pop-Art Background" 
          className="services-bg-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        {/* Subtle overlay for text readability if needed */}
        <div className="services-overlay"></div>
      </div>

      <div className="services-content-wrapper">
        
        {/* Left Text Side - Floating over the explosive background */}
        <div className="services-text-container">
          
          {/* DESIGN THAT HITS lockup */}
          <div className="headline-lockup">
            <h2 className="design-text">
              DESIGN
            </h2>
            <div className="that-hits-wrapper">
              <span className="that-text">
                THAT
              </span>
              <div className="hits-container">
                <span className="hits-text">
                  HITS
                </span>
                {/* Marker Brush Underline */}
                <svg className="hits-underline" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M2,12 Q25,8 50,15 T98,10 M10,18 Q30,15 60,19 T90,14" stroke="var(--primary-orange)" strokeWidth="6" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            </div>
          </div>

          <div className="paragraph-container">
            <p className="paragraph-text">
              <strong style={{ fontWeight: 600, color: '#FFFFFF' }}>Bold identity, campaign visuals</strong><br/>
              and AI-powered assets &mdash;<br/>
              built with <strong style={{ fontWeight: 600, color: 'var(--primary-orange)' }}>human taste.</strong>
            </p>
          </div>

          {/* Icons Grid */}
          <div className="services-icons">
            {[
              { label: 'BRANDING', icon: 'M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z' },
              { label: 'CAMPAIGN', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
              { label: 'CONTENT', icon: 'M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z' },
              { label: 'AI-POWERED', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z' }
            ].map((item, idx) => (
              <div key={idx} className="icon-item">
                <div className="icon-circle">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
                    <path d={item.icon} />
                  </svg>
                </div>
                <span className="icon-label">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        .services-section {
          min-height: 100vh;
          background-color: #0A1E3F;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          padding: 0 5%;
        }

        .services-bg-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        

        .services-overlay {
          position: absolute;
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%;
          background: linear-gradient(90deg, rgba(10,30,63,0.9) 0%, rgba(10,30,63,0.3) 50%, rgba(10,30,63,0) 100%);
        }

        .services-content-wrapper {
          display: flex;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          align-items: center;
          justify-content: space-between;
        }

        .services-text-container {
          flex: 1;
          max-width: 500px;
          margin-top: 10rem;
        }

        .headline-lockup {
          transform: rotate(-8deg);
          margin-bottom: 6rem;
          position: relative;
        }

        .design-text {
          font-family: var(--font-heading);
          font-size: 11rem;
          color: #FFFFFF;
          line-height: 0.75;
          letter-spacing: 2px;
          margin: 0;
          text-shadow: 5px 5px 0 #000;
          transform: skewX(-15deg);
          display: inline-block;
        }

        .that-hits-wrapper {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 0.5rem;
        }

        .that-text {
          font-family: var(--font-heading);
          font-size: 4.5rem;
          color: #FFFFFF;
          line-height: 1;
          text-shadow: 3px 3px 0 #000;
          transform: skewX(-15deg);
          margin-top: 0.5rem;
        }

        .hits-container {
          position: relative;
          display: inline-block;
        }

        .hits-text {
          font-family: "Permanent Marker", cursive;
          font-size: 7rem;
          color: var(--primary-orange);
          line-height: 0.6;
          text-shadow: 3px 3px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 6px 6px 0 #000;
          position: relative;
          transform: rotate(-5deg);
          display: inline-block;
          z-index: 2;
        }

        .hits-underline {
          width: 120%;
          height: 25px;
          position: absolute;
          bottom: -35px;
          left: -10%;
          transform: rotate(-4deg);
          z-index: 1;
          filter: drop-shadow(3px 3px 0px #000);
        }

        .paragraph-container {
          border-left: 4px solid var(--primary-orange);
          padding-left: 1.5rem;
          margin-bottom: 4rem;
        }

        .paragraph-text {
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: #E6E6E6;
          line-height: 1.6;
          font-weight: 300;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.8);
        }

        .services-icons {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
        }

        .icon-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0,0,0,0.3);
          box-shadow: 2px 2px 0 rgba(0,0,0,0.5);
        }

        .icon-label {
          font-family: var(--font-body);
          font-size: 0.7rem;
          color: rgba(255,255,255,0.9);
          letter-spacing: 1px;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.8);
          font-weight: 600;
        }

        /* Responsive Viewports */
        @media (max-width: 1200px) {
          .design-text { font-size: 8rem; }
          .that-text { font-size: 3.5rem; }
          .hits-text { font-size: 5.5rem; }
          .hits-underline { bottom: -25px; height: 20px; }
          .services-text-container { margin-top: 6rem; }
        }

        @media (max-width: 768px) {
          .services-section {
            padding: 4rem 2rem;
            align-items: flex-end;
          }
          .services-overlay {
            background: linear-gradient(180deg, rgba(10,30,63,0) 0%, rgba(10,30,63,0.8) 50%, rgba(10,30,63,1) 100%);
          }
          .services-bg-img {
            object-position: right top;
          }
          .services-text-container { 
            margin-top: 2rem; 
            max-width: 100%;
          }
          .headline-lockup {
            margin-bottom: 4rem;
          }
          .design-text { font-size: 6rem; }
          .that-text { font-size: 2.5rem; }
          .hits-text { font-size: 4.5rem; }
          .hits-underline { bottom: -20px; height: 15px; }
          
          .paragraph-text { font-size: 1rem; }
          .services-icons { gap: 1rem; }
        }

        @media (max-width: 480px) {
          .services-section {
            padding: 3rem 1.5rem;
            padding-bottom: 4rem;
          }
          .services-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: -39rem;
}
          .services-text-container { margin-top: 0; }
          .headline-lockup { margin-bottom: 3rem; }
          .design-text { 
            font-size: 4rem; 
            text-shadow: 3px 3px 0 #000;
          }
          .that-hits-wrapper { gap: 10px; }
          .that-text { 
            font-size: 2rem; 
            text-shadow: 2px 2px 0 #000;
          }
          .hits-text { 
            font-size: 3.2rem; 
            text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 4px 4px 0 #000;
          }
          .hits-underline { bottom: -15px; height: 12px; }
          
          .paragraph-container { margin-bottom: 3rem; }
          .icon-circle { width: 40px; height: 40px; }
        }
      `}</style>
    </section>
  );
};

export default Services;
