import React from 'react';
import heroImg from '../assets/hero_page_rynell_studio_clean.webp'; // Provided by user

const Hero = () => {
  return (
    <section className="hero-section">
      
      {/* Big and Bold Background Image */}
      <div className="hero-bg-container">
        <img 
          src={heroImg} 
          alt="Rynell Studio Background" 
          className="hero-bg-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        {/* Mobile gradient overlay for text readability */}
        <div className="hero-bg-overlay"></div>
      </div>

      {/* Content Container overlaying the background */}
      <div className="hero-content">
        
        {/* Left Text Side - On Top of Background */}
        <div className="hero-text-container">
          <h1 className="hero-title">
            Rynell Studio
          </h1>
          <h2 className="hero-subtitle">
            Campaign System
          </h2>
          
          <div className="hero-divider"></div>
          
          <p className="hero-description">
            Visuals that connect. Campaigns that perform.
          </p>

          <div className="hero-bottom-lockup">
            <div className="hero-logo-box">
              <span>R</span>
            </div>
            <p className="hero-bottom-text">
              Creative Strategy. Bold Execution.
            </p>
          </div>
        </div>

      </div>

      <style>{`
        .hero-section {
          min-height: 100vh;
          background-color: #000000;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          padding: 0 5%;
        }

        .hero-bg-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: right center;
        }

        .hero-bg-overlay {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%);
        }

        .hero-content {
          display: flex;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          align-items: center;
        }

        .hero-text-container {
          max-width: 600px;
        }

        .hero-title {
          font-family: var(--font-heading);
          font-size: 6.5rem;
          color: #E6E6E6;
          text-shadow: 0 0 10px rgba(255,255,255,0.2), 3px 3px 0 #000000;
          margin-bottom: 0;
          line-height: 0.9;
        }

        .hero-subtitle {
          font-family: var(--font-body);
          font-size: 1.2rem;
          color: var(--primary-orange);
          letter-spacing: 8px;
          text-transform: uppercase;
          margin-top: 1rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
          text-shadow: 1px 1px 0 #000000;
        }

        .hero-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(0,123,255,1) 0%, rgba(0,0,0,0) 100%);
          width: 80%;
          margin-bottom: 1.5rem;
        }

        .hero-description {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: #FFFFFF;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 400;
          text-shadow: 1px 1px 0 #000000;
        }

        .hero-bottom-lockup {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 6rem;
        }

        .hero-logo-box {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background-color: rgba(0,0,0,0.3);
          flex-shrink: 0;
        }

        .hero-logo-box span {
          font-family: var(--font-heading);
          color: rgba(255,255,255,0.8);
          font-size: 1.5rem;
        }

        .hero-bottom-text {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: rgba(255,255,255,0.8);
          letter-spacing: 2px;
          text-transform: uppercase;
          text-shadow: 1px 1px 0 #000000;
        }

        /* Responsive Viewports */
        @media (max-width: 1024px) {
          .hero-title {
            font-size: 5rem;
          }
          .hero-bottom-lockup {
            margin-top: 4rem;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 0 2rem;
          }
          .hero-bg-overlay {
            display: block;
            background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%);
          }
          .hero-bg-img {
            object-position: top right;
            transform: scale(0.92);
            transform-origin: top right;
          }
          .hero-title {
            font-size: 4rem;
          }
          .hero-subtitle {
            font-size: 1rem;
            letter-spacing: 4px;
          }
          .hero-divider {
            width: 100%;
          }
          .hero-bottom-lockup {
            margin-top: 3rem;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 0 1.5rem;
          }
          .hero-bg-img {
            object-position: top right;
            transform: scale(0.92);
            transform-origin: top right;
          }
          .hero-title {
            font-size: 3rem;
            text-shadow: 0 0 10px rgba(255,255,255,0.2), 2px 2px 0 #000000;
          }
          .hero-subtitle {
            font-size: 0.9rem;
            letter-spacing: 2px;
          }
          .hero-description {
            font-size: 0.8rem;
            letter-spacing: 1px;
          }
          .hero-bottom-lockup {
            margin-top: 2.5rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.8rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
