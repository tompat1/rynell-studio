import React from 'react';
import lightningBolt from '../assets/lightning-bolt.png';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--black)', padding: '3rem 0', borderTop: '2px solid var(--dark-gray)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={lightningBolt} alt="Lightning Bolt" style={{ width: '40px' }} />
          <div>
            <h3 className="comic-text" style={{ fontSize: '2rem' }}>RYNELL STUDIO</h3>
            <p style={{ color: 'var(--dark-gray)', marginTop: '0.2rem', fontWeight: 600 }}>Bold ideas. Loud craft.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#" className="text-orange" style={{ fontWeight: 600, fontSize: '1.1rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'var(--primary-orange)'}>Instagram</a>
          <a href="#" className="text-blue" style={{ fontWeight: 600, fontSize: '1.1rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'var(--secondary-blue)'}>Twitter</a>
          <a href="#" className="text-white" style={{ fontWeight: 600, fontSize: '1.1rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-orange)'} onMouseLeave={(e) => e.target.style.color = 'var(--white)'}>Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
