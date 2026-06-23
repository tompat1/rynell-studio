import React from 'react';
import logoImg from '../assets/logo.webp'; // Reusing the logo

const Services = () => {
  return (
    <section style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0A1E3F', // Dark Blue background
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      padding: '0 5%'
    }}>
      {/* Background Action Lines (Simulated with CSS) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 10px)',
        zIndex: 0
      }}></div>

      <div style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        position: 'relative', 
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Left Text Side */}
        <div style={{ flex: '1', maxWidth: '500px' }}>
          
          {/* DESIGN THAT HITS lockup */}
          <div style={{ transform: 'rotate(-4deg)', marginBottom: '3rem' }}>
            <h2 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '6rem', 
              color: '#FFFFFF',
              lineHeight: '0.8',
              margin: 0,
              textShadow: '3px 3px 0 #000'
            }}>
              DESIGN
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '3rem', 
                color: '#FFFFFF',
                lineHeight: '1',
                textShadow: '2px 2px 0 #000',
                marginTop: '1rem'
              }}>
                THAT
              </span>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '7rem', 
                color: 'var(--primary-orange)',
                lineHeight: '0.8',
                textShadow: '4px 4px 0 #000'
              }}>
                HITS
              </span>
            </div>
          </div>

          <div style={{ 
            borderLeft: '4px solid var(--primary-orange)', 
            paddingLeft: '1.5rem',
            marginBottom: '4rem'
          }}>
            <p style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '1.1rem', 
              color: '#E6E6E6', 
              lineHeight: '1.6',
              fontWeight: 300
            }}>
              <strong style={{ fontWeight: 600, color: '#FFFFFF' }}>Bold identity, campaign visuals</strong><br/>
              and AI-powered assets &mdash;<br/>
              built with <strong style={{ fontWeight: 600, color: 'var(--primary-orange)' }}>human taste.</strong>
            </p>
          </div>

          {/* Icons Grid */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              { label: 'BRANDING', icon: 'M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z' },
              { label: 'CAMPAIGN', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
              { label: 'CONTENT', icon: 'M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z' },
              { label: 'AI-POWERED', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ 
                  width: '50px', height: '50px', 
                  borderRadius: '50%', 
                  border: '2px solid rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
                    <path d={item.icon} />
                  </svg>
                </div>
                <span style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontSize: '0.7rem', 
                  color: 'rgba(255,255,255,0.8)',
                  letterSpacing: '1px'
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Logo Side */}
        <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
          <img 
            src={logoImg} 
            alt="Rynell Studio Giant Logo" 
            style={{ width: '100%', maxWidth: '800px', filter: 'drop-shadow(0 0 20px rgba(255,106,0,0.5))' }}
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
        </div>
      </div>
    </section>
  );
};

export default Services;
