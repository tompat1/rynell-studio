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
              { 
                label: 'BRANDING', 
                svg: (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <g transform="translate(0.7, 0.7)">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2" />
                    </g>
                  </svg>
                )
              },
              { 
                label: 'CAMPAIGN', 
                svg: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )
              },
              { 
                label: 'CONTENT', 
                svg: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                    <polygon points="10 7 15 10 10 13 10 7"></polygon>
                  </svg>
                )
              },
              { 
                label: 'AI-POWERED', 
                svg: (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                    <line x1="7" y1="0" x2="7" y2="2"></line>
                    <line x1="17" y1="0" x2="17" y2="2"></line>
                    <line x1="7" y1="22" x2="7" y2="24"></line>
                    <line x1="17" y1="22" x2="17" y2="24"></line>
                    <line x1="22" y1="7" x2="24" y2="7"></line>
                    <line x1="22" y1="17" x2="24" y2="17"></line>
                    <line x1="0" y1="7" x2="2" y2="7"></line>
                    <line x1="0" y1="17" x2="2" y2="17"></line>
                    <text x="12" y="16" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">AI</text>
                  </svg>
                )
              }
            ].map((item, idx) => (
              <div key={idx} className="icon-item">
                <div className="icon-circle">
                  {item.svg}
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
          border-left: 4px solid #0078FF;
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
          gap: 0.4rem;
        }

        .icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 1.5px solid #0078FF;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          color: #FFFFFF;
        }

        .icon-label {
          font-family: var(--font-body);
          font-size: 0.65rem;
          color: #FFFFFF;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
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
