import React, { useState, useEffect } from 'react';
import boltSvg from '../assets/lightning_bolt_sticker_vector.svg';

const Navbar = ({ cartCount, setIsCartOpen, theme, setTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    'ADS', 'COLLECTIONS', 'SHOP', 'ABOUT', 'JOURNAL'
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`global-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          
          {/* Logo */}
          <div 
            className="navbar-logo-wrapper" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src={boltSvg} alt="Bolt" className="nav-bolt-icon" />
            <div className="navbar-logo">
              RYNELL STUDIO
            </div>
          </div>

          {/* Desktop Links */}
          <div className="navbar-links-desktop">
            {navLinks.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="nav-link">
                {link}
              </a>
            ))}
          </div>

          {/* Right Side: Icons, CTA & Mobile Toggle */}
          <div className="navbar-actions">
            
            <div className="nav-icons">
              <button 
                className="icon-btn theme-toggle-btn" 
                aria-label="Toggle Theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>

              <button className="icon-btn" aria-label="Search">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              
              <button className="icon-btn" aria-label="Account">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>

              <button className="icon-btn cart-icon-btn" aria-label="Cart" onClick={() => setIsCartOpen(true)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>
            </div>

            <button className="cta-button">LET'S TALK</button>
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="navbar-logo-wrapper">
            <img src={boltSvg} alt="Bolt" className="nav-bolt-icon" />
            <div className="navbar-logo">RYNELL STUDIO</div>
          </div>
          <button 
            className="mobile-menu-close" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="mobile-menu-links">
          {navLinks.map((link) => (
            <a 
              key={link} 
              href={`#${link.toLowerCase()}`} 
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link}
            </a>
          ))}
          <button className="mobile-cta-button">LET'S TALK</button>
        </div>
      </div>

      <style>{`
        .global-navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.4s ease;
          padding: 1.5rem 0;
          background-color: #0A1E3F;
          background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 8px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .global-navbar.scrolled {
          padding: 1rem 0;
          background-color: rgba(5, 16, 36, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 5%;
        }

        .navbar-logo-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .nav-bolt-icon {
          width: 38px;
          height: auto;
          filter: drop-shadow(2px 2px 0 var(--border-color));
        }

        .navbar-logo {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          color: #FFF;
          letter-spacing: 2px;
          line-height: 1;
          transform: skewX(-10deg);
          text-shadow: 2px 2px 0 var(--border-color);
        }

        .navbar-links-desktop {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          letter-spacing: 1.5px;
          font-weight: 500;
          transition: color 0.3s ease;
          position: relative;
        }

        .nav-link:hover {
          color: #0078FF;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0%;
          height: 2px;
          background-color: #0078FF;
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-icons {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: color 0.3s ease, transform 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .icon-btn:hover {
          color: #0078FF;
          transform: translateY(-2px);
        }

        .cart-icon-btn {
          position: relative;
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -10px;
          background: var(--primary-orange);
          color: #FFF;
          font-family: var(--font-body);
          font-size: 0.65rem;
          font-weight: bold;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .cta-button {
          background-color: var(--primary-orange);
          color: #FFF;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          padding: 0.8rem 1.8rem;
          border: none;
          cursor: pointer;
          transform: skewX(-10deg);
          transition: transform 0.2s ease, background-color 0.2s ease;
          box-shadow: 4px 4px 0 #000;
        }

        .cta-button:hover {
          transform: skewX(-10deg) translateY(-2px);
          background-color: #ff5722;
        }

        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #FFF;
          cursor: pointer;
          padding: 0;
        }

        /* Mobile Overlay Styles */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #051024;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          transform: translateY(-100%);
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .mobile-menu-overlay.open {
          transform: translateY(0);
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 5%;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-menu-close {
          background: transparent;
          border: none;
          color: #FFF;
          cursor: pointer;
          padding: 0;
        }

        .mobile-menu-links {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 2rem;
          overflow-y: auto;
        }

        .mobile-nav-link {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          color: #FFF;
          text-decoration: none;
          letter-spacing: 2px;
          transform: skewX(-10deg);
          transition: color 0.3s ease;
        }

        .mobile-nav-link:hover {
          color: var(--primary-orange);
        }

        .mobile-cta-button {
          margin-top: 2rem;
          background-color: #0078FF;
          color: #FFF;
          font-family: var(--font-body);
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 1rem 3rem;
          border: none;
          cursor: pointer;
          transform: skewX(-10deg);
          box-shadow: 4px 4px 0 #000;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1200px) {
          .navbar-links-desktop {
            gap: 1.2rem;
          }
          .nav-link {
            font-size: 0.75rem;
            letter-spacing: 1px;
          }
        }

        @media (max-width: 1024px) {
          .navbar-links-desktop {
            display: none; /* Hide standard links */
          }
          .cta-button {
            display: none; /* Hide standard CTA */
          }
          .mobile-menu-toggle {
            display: flex; /* Show hamburger */
          }
        }

        @media (max-width: 768px) {
          .navbar-logo {
            display: none;
          }
          .global-navbar {
            padding: 1rem 0;
          }
          .global-navbar.scrolled {
            padding: 0.75rem 0;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
