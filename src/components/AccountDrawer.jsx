import React, { useState, useEffect } from 'react';

const AccountDrawer = ({ isOpen, setIsOpen }) => {
  const [isLogin, setIsLogin] = useState(true);
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
    }, 1500);
  };

  return (
    <>
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div className={`cart-drawer account-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>{isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}</h2>
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
              <form className="brutalist-form" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="form-group">
                    <label>FULL NAME</label>
                    <input type="text" placeholder="YOUR NAME" required />
                  </div>
                )}
                
                <div className="form-group">
                  <label>EMAIL ADDRESS</label>
                  <input type="email" placeholder="YOUR@EMAIL.COM" required />
                </div>

                <div className="form-group">
                  <label>PASSWORD</label>
                  <input type="password" placeholder="••••••••" required />
                </div>

                <button type="submit" className="checkout-btn" style={{ marginTop: '2rem' }}>
                  {isLogin ? 'SIGN IN' : 'REGISTER'}
                </button>
              </form>

              <div className="auth-toggle">
                <p>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    type="button" 
                    className="text-btn" 
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'CREATE ONE' : 'LOG IN'}
                  </button>
                </p>
              </div>
            </>
          )}

          {status === 'PROCESSING' && (
            <div className="processing-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem' }}>
              <div className="spinner"></div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-primary)' }}>
                {isLogin ? 'AUTHENTICATING...' : 'CREATING ACCOUNT...'}
              </h3>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="success-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem', textAlign: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--text-primary)' }}>
                {isLogin ? 'WELCOME BACK' : 'ACCOUNT CREATED'}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>You are now authenticated in the studio system.</p>
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
          color: var(--text-light);
        }
        .form-group input {
          background: transparent;
          border: 2px solid var(--border-color);
          padding: 1rem;
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--text-light);
          outline: none;
          transition: all 0.3s ease;
        }
        .form-group input:focus {
          border-color: var(--primary-orange);
          box-shadow: 0 0 10px rgba(255, 106, 0, 0.2);
        }
        .auth-toggle {
          margin-top: 3rem;
          text-align: center;
          font-family: var(--font-body);
          color: var(--text-secondary);
        }
        .text-btn {
          background: none;
          border: none;
          color: var(--primary-orange);
          font-family: var(--font-heading);
          font-size: 1.2rem;
          cursor: pointer;
          margin-left: 1rem;
          text-decoration: underline;
        }
        .text-btn:hover {
          color: var(--text-light);
        }
      `}</style>
    </>
  );
};

export default AccountDrawer;
