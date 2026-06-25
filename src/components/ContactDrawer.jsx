import React, { useState, useEffect } from 'react';

const ContactDrawer = ({ isOpen, setIsOpen }) => {
  const [status, setStatus] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open');
      setStatus('IDLE');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('PROCESSING');
    setTimeout(() => {
      setStatus('SUCCESS');
    }, 2000);
  };

  return (
    <>
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>LET'S TALK</h2>
          <button className="cart-close" onClick={() => setIsOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="drawer-body-scrollable">
          {status === 'IDLE' && (
            <>
              <div className="contact-summary" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', marginBottom: '1rem' }}>INITIATE TRANSMISSION</h3>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
                  Drop your specs and requirements. We build aesthetics that hit hard. Let's make something dangerous.
                </p>
              </div>

              <form className="brutalist-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>NAME / CALLSIGN</label>
                  <input type="text" placeholder="WHO ARE YOU?" required />
                </div>
                <div className="form-group">
                  <label>COMM CHANNEL (EMAIL)</label>
                  <input type="email" placeholder="YOUR@EMAIL.COM" required />
                </div>
                <div className="form-group">
                  <label>OBJECTIVE</label>
                  <input type="text" placeholder="BRANDING, CAMPAIGN, MERCH..." required />
                </div>
                <div className="form-group">
                  <label>TRANSMISSION DATA</label>
                  <textarea placeholder="GIVE US THE DETAILS..." required style={{ minHeight: '150px' }}></textarea>
                </div>

                <button type="submit" className="checkout-btn" style={{ marginTop: '2rem' }}>
                  SEND TRANSMISSION
                </button>
              </form>
            </>
          )}

          {status === 'PROCESSING' && (
            <div className="processing-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem' }}>
              <div className="spinner"></div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-primary)' }}>ENCRYPTING...</h3>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="success-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem', textAlign: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--text-primary)' }}>TRANSMISSION RECEIVED</h3>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>We have your coordinates. We'll be in touch.</p>
              <button className="checkout-btn" onClick={() => setIsOpen(false)}>CLOSE</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .drawer-body-scrollable {
          padding: 2rem;
          height: calc(100vh - 150px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .brutalist-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          color: var(--text-primary);
        }
        .form-group input, .form-group textarea {
          background: transparent;
          border: 2px solid var(--border-color);
          padding: 1rem;
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--text-primary);
          outline: none;
          transition: all 0.3s ease;
          resize: vertical;
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: var(--primary-orange);
          box-shadow: 4px 4px 0 var(--primary-orange);
          transform: translate(-2px, -2px);
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid var(--border-color);
          border-top-color: var(--primary-orange);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default ContactDrawer;
