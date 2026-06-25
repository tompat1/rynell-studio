import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAudio } from '../contexts/AudioContext';
import servicesBgDark from '../assets/design_that_hits_clean.webp';
import servicesBgLight from '../assets/design_that_hits_clean_light.webp';
import imgBranding from '../assets/services/service_branding.png';
import imgCampaign from '../assets/services/service_campaign.png';
import imgContent from '../assets/services/service_content.png';
import imgAi from '../assets/services/service_ai.png';

export const servicesData = [
  { 
    label: 'BRANDING', 
    title: 'BRAND IDENTITY',
    description: 'More than just a logo. We build holistic, scalable brand identities that cut through the noise. From typography systems to visual guidelines, we craft the DNA of your brand.',
    image: imgBranding,
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
    title: 'CAMPAIGN CREATIVE',
    description: 'High-impact visual campaigns designed to convert. We conceptualize and execute bold, multi-channel aesthetics that grab attention and refuse to let go.',
    image: imgCampaign,
    svg: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    )
  },
  { 
    label: 'CONTENT', 
    title: 'CONTENT CREATION',
    description: 'Engaging, platform-native content creation. Whether it\'s motion graphics, video, or rich static media, we produce assets that tell your story dynamically.',
    image: imgContent,
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
    title: 'AI-POWERED ASSETS',
    description: 'The future of asset generation, guided by human taste. We leverage state-of-the-art AI to rapidly prototype, iterate, and scale visual assets without sacrificing the premium studio finish.',
    image: imgAi,
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
];

const Services = () => {
  const [activeService, setActiveService] = useState(null);
  const { playTTS, stopAudio, isPlaying } = useAudio();

  useEffect(() => {
    if (activeService) document.body.classList.add('drawer-open');
    else document.body.classList.remove('drawer-open');
    return () => document.body.classList.remove('drawer-open');
  }, [activeService]);

  const navigateService = (direction) => {
    if (!activeService) return;
    const currentIndex = servicesData.findIndex(s => s.label === activeService.label);
    if (direction === 'prev' && currentIndex > 0) {
      setActiveService(servicesData[currentIndex - 1]);
      if (isPlaying) stopAudio();
    } else if (direction === 'next' && currentIndex < servicesData.length - 1) {
      setActiveService(servicesData[currentIndex + 1]);
      if (isPlaying) stopAudio();
    }
  };

  return (
    <section id="services" className="services-section" style={{ position: 'relative' }}>
      <div className="section-label">SERVICES</div>
      
      {/* Explosive Pop-Art Background Image */}
      <div className="services-bg-container">
        <img 
          src={servicesBgDark} 
          alt="Explosive Pop-Art Background" 
          className="services-bg-img img-dark"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <img 
          src={servicesBgLight} 
          alt="Explosive Pop-Art Background Light" 
          className="services-bg-img img-light"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
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
                <span className="hits-text" style={{ color: 'var(--text-primary)' }}>
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
              <strong style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Bold identity, campaign visuals</strong><br/>
              and AI-powered assets &mdash;<br/>
              built with <strong style={{ fontWeight: 600, color: 'var(--primary-orange)' }}>human taste.</strong>
            </p>
          </div>

          {/* Icons Grid */}
          <div className="services-icons">
            {servicesData.map((item, idx) => (
              <div key={idx} className="icon-item" onClick={() => setActiveService(item)}>
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

      {/* Slide-out Drawer Portalled to Body */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className={`services-backdrop ${activeService ? 'open' : ''}`}
            onClick={() => setActiveService(null)}
          ></div>

          <div className={`service-drawer ${activeService ? 'open' : ''}`}>
            <button className="drawer-close" onClick={() => setActiveService(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {activeService && (
              <div className="drawer-content">
                <div className="drawer-image-placeholder" style={{ padding: 0 }}>
                  {activeService.image ? (
                    <img src={activeService.image} alt={activeService.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="placeholder-pattern"></div>
                  )}
                </div>
                
                <div className="drawer-text-content">
                  <div className="drawer-icon">
                    {activeService.svg}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 className="drawer-title" style={{ margin: 0 }}>{activeService.title}</h3>
                    <button 
                      className={`read-to-me-btn ${isPlaying ? 'playing' : ''}`}
                      onClick={() => isPlaying ? stopAudio() : playTTS(activeService.description)}
                      style={{ marginBottom: 0 }}
                    >
                      {isPlaying ? "⏹ STOP" : "▶ READ IT TO ME"}
                    </button>
                  </div>
                  <div className="drawer-divider"></div>
                  <p className="drawer-description">{activeService.description}</p>
                  
                  <div className="drawer-navigation">
                    <button 
                      className="nav-btn" 
                      onClick={() => navigateService('prev')}
                      disabled={servicesData.findIndex(s => s.label === activeService.label) === 0}
                    >
                      ← PREV
                    </button>
                    <button 
                      className="nav-btn" 
                      onClick={() => navigateService('next')}
                      disabled={servicesData.findIndex(s => s.label === activeService.label) === servicesData.length - 1}
                    >
                      NEXT →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      )}

      <style>{`
        .services-section {
          min-height: 100vh;
          background-color: var(--bg-primary);
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

        .services-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
        }

        .services-bg-img.img-light {
          display: none;
        }

        body.light-theme .services-bg-img.img-dark {
          display: none;
        }
        body.light-theme .services-bg-img.img-light {
          display: block;
        }

        .services-overlay {
          position: absolute;
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%;
          background: linear-gradient(90deg, var(--bg-primary) 0%, transparent 100%);
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
          color: var(--text-primary);
          line-height: 0.75;
          letter-spacing: 2px;
          margin: 0;
          text-shadow: 5px 5px 0 var(--border-color);
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
          color: var(--text-primary);
          line-height: 1;
          text-shadow: 3px 3px 0 var(--border-color);
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
          text-shadow: 3px 3px 0 var(--border-color), -2px -2px 0 var(--border-color), 2px -2px 0 var(--border-color), -2px 2px 0 var(--border-color), 6px 6px 0 var(--border-color);
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
          filter: drop-shadow(3px 3px 0px var(--border-color));
        }

        .paragraph-container {
          border-left: 4px solid var(--secondary-blue);
          padding-left: 1.5rem;
          margin-bottom: 4rem;
        }

        .paragraph-text {
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          font-weight: 300;
          text-shadow: 1px 1px 0 var(--bg-primary);
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
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .icon-item:hover {
          transform: translateY(-5px) scale(1.05);
        }

        .icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 1.5px solid var(--secondary-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          color: var(--text-primary);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .icon-item:hover .icon-circle {
          box-shadow: 0 0 20px rgba(0, 120, 255, 0.5), inset 0 0 10px rgba(0, 120, 255, 0.2);
          background-color: rgba(0, 120, 255, 0.1);
        }

        .icon-label {
          font-family: var(--font-body);
          font-size: 0.65rem;
          color: var(--text-primary);
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }

        .icon-item:hover .icon-label {
          color: var(--secondary-blue);
        }

        /* Drawer Styles */
        .services-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(5px);
          z-index: 2000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }

        .services-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .service-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 450px;
          height: 100vh;
          background-color: var(--bg-tertiary);
          z-index: 2001;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          overflow-y: auto;
          border-left: 1px solid var(--border-color);
        }

        .service-drawer.open {
          transform: translateX(0);
        }

        .drawer-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 102;
          transition: all 0.2s ease;
        }

        .drawer-close:hover {
          background: var(--secondary-blue);
          border-color: var(--secondary-blue);
          transform: rotate(90deg);
        }

        .drawer-content {
          display: flex;
          flex-direction: column;
        }

        .drawer-image-placeholder {
          width: 100%;
          height: 300px;
          background: linear-gradient(135deg, var(--secondary-blue) 0%, var(--bg-primary) 100%);
          position: relative;
          overflow: hidden;
        }

        .placeholder-pattern {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          opacity: 0.1;
          background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #FFFFFF 10px, #FFFFFF 11px);
        }

        .drawer-text-content {
          padding: 3rem 2rem;
          color: var(--text-primary);
        }

        .drawer-icon {
          color: var(--secondary-blue);
          margin-bottom: 1.5rem;
        }

        .drawer-icon svg {
          width: 45px;
          height: 45px;
        }

        .drawer-title {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          line-height: 0.9;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          text-shadow: 2px 2px 0 var(--border-color);
          transform: skewX(-10deg);
        }

        .drawer-divider {
          width: 50px;
          height: 4px;
          background-color: var(--primary-orange);
          margin-bottom: 2rem;
        }

        .drawer-description {
          font-family: var(--font-body);
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--text-secondary);
          font-weight: 300;
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
            background: linear-gradient(180deg, transparent 0%, var(--bg-primary) 100%);
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
            object-fit: cover;
            object-position: 85% center;
            transform: none;
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
          
          .icon-circle { 
            width: 50px; 
            height: 50px; 
          }
          .icon-circle svg {
            width: 26px !important;
            height: 26px !important;
          }
          
          .service-drawer {
            max-width: 100%; /* Full screen on mobile */
          }
          .drawer-image-placeholder {
            height: 250px;
          }
          .drawer-title {
            font-size: 3rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Services;
