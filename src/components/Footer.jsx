import React from 'react';

const Footer = () => {
  return (
    <footer className="global-footer">
      <div className="footer-container">
        
        {/* Left Side: Brand & Tagline */}
        <div className="footer-brand">
          <h2 className="footer-logo">RYNELL STUDIO</h2>
          <p className="footer-tagline">
            Bold identity, campaign visuals and AI-powered assets &mdash;<br />
            built with <span style={{ color: 'var(--primary-orange)', fontWeight: 'bold' }}>human taste.</span>
          </p>
        </div>

        {/* Center: Quick Links */}
        <div className="footer-links-grid">
          <div className="footer-column">
            <h4>EXPLORE</h4>
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#studio">Studio</a>
            <a href="#collections">Collections</a>
          </div>
          <div className="footer-column">
            <h4>CONNECT</h4>
            <a href="#shop">Shop</a>
            <a href="#about">About</a>
            <a href="#ads">Ads</a>
            <a href="#journal">Journal</a>
          </div>
        </div>

        {/* Right Side: Social & Contact */}
        <div className="footer-social">
          <h4>SAY HELLO</h4>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            // Trigger contact drawer via a global event or something if we didn't pass it, 
            // but we can pass onContactClick down through App.jsx to Footer.jsx
            // Let's assume we dispatch an event since Footer is deep or just pass it in App.jsx
            document.querySelector('.cta-button').click();
          }} className="contact-email">hello@rynell.org</a>
          <div className="social-icons">
            {/* Instagram */}
            <a href="#" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            {/* Twitter / X */}
            <a href="#" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="4" x2="20" y2="20"></line>
                <line x1="20" y1="4" x2="4" y2="20"></line>
              </svg>
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Rynell Studio. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>

      <style>{`
        .global-footer {
          background-color: #020813;
          border-top: 4px solid #0078FF;
          padding: 6rem 5% 2rem 5%;
          color: #FFF;
          font-family: var(--font-body);
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 2fr 1fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .footer-logo {
          font-family: var(--font-heading);
          font-size: 4rem;
          margin: 0;
          color: #FFF;
          line-height: 0.8;
          text-shadow: 3px 3px 0 #000;
          transform: skewX(-10deg);
        }

        .footer-tagline {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 400px;
        }

        .footer-links-grid {
          display: flex;
          gap: 4rem;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-column h4, .footer-social h4 {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          color: #0078FF;
          letter-spacing: 2px;
        }

        .footer-column a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.3s ease, transform 0.3s ease;
          display: inline-block;
        }

        .footer-column a:hover {
          color: var(--primary-orange);
          transform: translateX(5px);
        }

        .footer-social {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-email {
          color: #FFF;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .contact-email:hover {
          color: var(--primary-orange);
        }

        .social-icons {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .social-icon {
          color: rgba(255, 255, 255, 0.7);
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .social-icon:hover {
          color: #0078FF;
          transform: translateY(-3px);
        }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .footer-legal {
          display: flex;
          gap: 2rem;
        }

        .footer-legal a {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-legal a:hover {
          color: #FFF;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .footer-container {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .global-footer {
            padding: 4rem 2rem 2rem 2rem;
          }
          .footer-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .footer-links-grid {
            gap: 3rem;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
