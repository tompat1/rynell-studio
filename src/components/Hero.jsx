import React from 'react';
import heroImg from '../assets/hero_page_rynell_studio_clean.webp'; // Provided by user

const Hero = () => {
  return (
    <section style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      padding: '0 5%'
    }}>
      
      {/* Big and Bold Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <img 
          src={heroImg} 
          alt="Rynell Studio Background" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            objectPosition: 'right center' 
          }} 
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Content Container overlaying the background */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        position: 'relative', 
        zIndex: 1,
        alignItems: 'center',
      }}>
        
        {/* Left Text Side - On Top of Background */}
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '6.5rem', 
            color: '#E6E6E6', 
            textShadow: '0 0 10px rgba(255,255,255,0.2), 3px 3px 0 #000000',
            marginBottom: '0',
            lineHeight: '0.9'
          }}>
            Rynell Studio
          </h1>
          <h2 style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: '1.2rem', 
            color: 'var(--primary-orange)', 
            letterSpacing: '8px', 
            textTransform: 'uppercase',
            marginTop: '1rem',
            marginBottom: '1.5rem',
            fontWeight: 600,
            textShadow: '1px 1px 0 #000000'
          }}>
            Campaign System
          </h2>
          
          <div style={{ 
            height: '1px', 
            background: 'linear-gradient(90deg, rgba(0,123,255,1) 0%, rgba(0,0,0,0) 100%)', 
            width: '80%', 
            marginBottom: '1.5rem' 
          }}></div>
          
          <p style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: '0.9rem', 
            color: '#FFFFFF', 
            letterSpacing: '2px', 
            textTransform: 'uppercase',
            fontWeight: 400,
            textShadow: '1px 1px 0 #000000'
          }}>
            Visuals that connect. Campaigns that perform.
          </p>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            marginTop: '6rem' 
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '2px solid rgba(255,255,255,0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '4px',
              backgroundColor: 'rgba(0,0,0,0.3)'
            }}>
              <span style={{ fontFamily: 'var(--font-heading)', color: 'rgba(255,255,255,0.8)', fontSize: '1.5rem' }}>R</span>
            </div>
            <p style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '0.8rem', 
              color: 'rgba(255,255,255,0.8)', 
              letterSpacing: '2px', 
              textTransform: 'uppercase',
              textShadow: '1px 1px 0 #000000'
            }}>
              Creative Strategy. Bold Execution.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
