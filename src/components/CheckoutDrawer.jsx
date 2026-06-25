import React, { useState, useEffect } from 'react';

const CheckoutDrawer = ({ isOpen, setIsOpen, cart, clearCart }) => {
  const [status, setStatus] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS
  const subtotal = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  const total = subtotal > 0 ? subtotal + 15 : 0; // $15 flat shipping

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
      clearCart();
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
          <h2>CHECKOUT</h2>
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
              <div className="order-summary" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', marginBottom: '1rem' }}>ORDER SUMMARY</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  <span>SUBTOTAL</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  <span>SHIPPING</span>
                  <span>$15.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  <span>TOTAL</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <form className="brutalist-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>EMAIL ADDRESS</label>
                  <input type="email" placeholder="YOUR@EMAIL.COM" required />
                </div>
                <div className="form-group">
                  <label>SHIPPING ADDRESS</label>
                  <input type="text" placeholder="STREET, CITY, ZIP" required />
                </div>
                <div className="form-group">
                  <label>CARD NUMBER</label>
                  <input type="text" placeholder="XXXX XXXX XXXX XXXX" required />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>EXP</label>
                    <input type="text" placeholder="MM/YY" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>CVC</label>
                    <input type="text" placeholder="XXX" required />
                  </div>
                </div>

                <button type="submit" className="checkout-btn" style={{ marginTop: '2rem' }}>
                  PAY ${total.toFixed(2)}
                </button>
              </form>
            </>
          )}

          {status === 'PROCESSING' && (
            <div className="processing-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem' }}>
              <div className="spinner"></div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-primary)' }}>PROCESSING...</h3>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="success-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem', textAlign: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--text-primary)' }}>ORDER SECURED</h3>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>A confirmation has been sent to your network.</p>
              <button className="checkout-btn" onClick={() => setIsOpen(false)}>CONTINUE BROWSING</button>
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
        .form-group input {
          background: transparent;
          border: 2px solid var(--border-color);
          padding: 1rem;
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--text-primary);
          outline: none;
          transition: all 0.3s ease;
        }
        .form-group input:focus {
          border-color: var(--primary-orange);
          box-shadow: 0 0 10px rgba(255, 106, 0, 0.2);
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-orange);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default CheckoutDrawer;
