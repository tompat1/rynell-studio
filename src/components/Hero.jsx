import "react";
import heroImgDark from "../assets/hero_page_rynell_studio_clean.webp";
import heroImgLight from "../assets/hero_page_rynell_studio_clean_light.webp";
import boltSvg from "../assets/lightning_bolt_sticker_vector.svg";

const Hero = () => {
  return (
    <section id="hero" className="hero-section" style={{ position: 'relative' }}>
      <div className="section-label">01 // INTRO</div>
      {/* Big and Bold Background Image */}
      <div className="hero-bg-container">
        <img
          src={heroImgDark}
          alt="Rynell Studio Background"
          className="hero-bg-img img-dark"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <img
          src={heroImgLight}
          alt="Rynell Studio Background Light"
          className="hero-bg-img img-light"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {/* Mobile gradient overlay for text readability */}
        <div className="hero-bg-overlay"></div>
      </div>

      {/* Content Container overlaying the background */}
      <div className="hero-content">
        {/* Left Text Side - On Top of Background */}
        <div className="hero-text-container">
          <h1 className="hero-title">Rynell Studio</h1>
          <h2 className="hero-subtitle">Campaign System</h2>

          <div className="hero-divider"></div>

          <p className="hero-description">
            Visuals that connect. Campaigns that perform.
          </p>

          <div className="hero-bottom-lockup">
            <img src={boltSvg} alt="Bolt Accent" className="hero-bolt-icon" />
            <p className="hero-bottom-text">
              Creative Strategy.<br />Bold Execution.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          min-height: 100vh;
          background-color: var(--bg-primary);
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
          object-fit: contain;
          object-position: right center;
        }

        .hero-bg-img.img-light {
          display: none;
        }

        body.light-theme .hero-bg-img.img-dark {
          display: none;
        }
        body.light-theme .hero-bg-img.img-light {
          display: block;
        }

        .hero-bg-overlay {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, var(--bg-primary) 0%, transparent 100%);
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
          color: var(--text-primary);
          text-shadow: 0 0 10px var(--bg-primary), 3px 3px 0 var(--border-color);
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
          text-shadow: 1px 1px 0 var(--bg-primary);
        }

        .hero-divider {
          height: 1px;
          background: linear-gradient(90deg, var(--secondary-blue) 0%, transparent 100%);
          width: 80%;
          margin-bottom: 1.5rem;
        }

        .hero-description {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text-primary);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 400;
          text-shadow: 1px 1px 0 var(--bg-primary);
        }

        .hero-bottom-lockup {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 6rem;
        }

        .hero-bolt-icon {
          width: 20%;
          height: auto;
          filter: drop-shadow(4px 4px rgba(0, 0, 0, 0.1));
          flex-shrink: 0;
        }



        .hero-bottom-text {
          font-family: var(--font-body);
          font-size: 2rem;
          color: var(--text-secondary);
          letter-spacing: 2px;
          text-transform: uppercase;
          text-shadow: 1px 1px 0 var(--bg-primary);
          border-left: 4px solid var(--primary-orange);
          padding-left: 1.5rem;
          line-height: 1.2;
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
            background: linear-gradient(180deg, transparent 0%, var(--bg-primary) 100%);
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
          .hero-bolt-icon {
            display: none;
          }
          .hero-bottom-text {
            font-size: 1.2rem;
            padding-left: 1rem;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
           padding: 0 1.5rem;
                   margin-top: 5rem;




          }
            .hero-content {
                padding-top: 6rem;
            }
          .hero-bg-img {
            object-position: top right;
            transform: scale(1.5);
            transform-origin: top right;
          }
          .hero-title {
            font-size: 3rem;
            text-shadow: 0 0 10px var(--bg-primary), 2px 2px 0 var(--border-color);
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
            gap: 1rem;
          }
          .hero-bottom-text {
            font-size: 1rem;
            border-left: 3px solid var(--primary-orange);
            padding-left: 0.8rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
