import React, { useEffect } from 'react';

const CartDrawer = ({ cart, isCartOpen, setIsCartOpen, removeFromCart }) => {
  const subtotal = cart.reduce((total, item) => total + item.price, 0);

  useEffect(() => {
    if (isCartOpen) document.body.classList.add('drawer-open');
    else document.body.classList.remove('drawer-open');
    return () => document.body.classList.remove('drawer-open');
  }, [isCartOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`drawer-backdrop ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Slide-out Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>YOUR CART</h2>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="cart-items-container">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty.</p>
              <button className="continue-shopping" onClick={() => setIsCartOpen(false)}>
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.title}</h4>
                    <p className="cart-item-size">Size: {item.size}</p>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  </div>
                  <button className="remove-item" onClick={() => removeFromCart(index)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>SUBTOTAL</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button className="checkout-btn">CHECKOUT</button>
          </div>
        )}
      </div>

      <style>{`
        /* Cart Drawer Styles */
        .drawer-backdrop {
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

        .drawer-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .cart-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 450px;
          height: 100vh;
          background-color: var(--bg-secondary);
          z-index: 2001;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--secondary-blue);
        }

        .cart-drawer.open {
          transform: translateX(0);
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid var(--border-color);
        }

        .cart-header h2 {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          color: var(--text-primary);
          margin: 0;
          transform: skewX(-10deg);
        }

        .cart-close {
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .cart-close:hover {
          color: var(--primary-orange);
          transform: rotate(90deg);
        }

        .cart-items-container {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }

        .empty-cart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
          font-family: var(--font-body);
        }

        .continue-shopping {
          margin-top: 1.5rem;
          background: transparent;
          color: var(--secondary-blue);
          border: 1px solid var(--secondary-blue);
          padding: 0.8rem 1.5rem;
          font-family: var(--font-body);
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .continue-shopping:hover {
          background: var(--secondary-blue);
          color: #FFF;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .cart-item {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .cart-item-image {
          width: 80px;
          height: 80px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .cart-item-details h4 {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: var(--text-primary);
          margin: 0;
          line-height: 1;
        }

        .cart-item-size {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .cart-item-price {
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: bold;
          color: var(--primary-orange);
          margin: 0;
        }

        .remove-item {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.3s ease;
          padding: 0.5rem;
        }

        .remove-item:hover {
          color: #ff3333;
        }

        .cart-footer {
          padding: 2rem;
          background: var(--bg-tertiary);
          border-top: 2px solid var(--secondary-blue);
        }

        .cart-subtotal {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-body);
          font-weight: bold;
          font-size: 1.2rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .checkout-btn {
          width: 100%;
          background: var(--primary-orange);
          color: #FFF;
          border: none;
          padding: 1.2rem;
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }

        .checkout-btn:hover {
          background: #ff5722;
          transform: translateY(-2px);
        }

        @media (max-width: 480px) {
          .cart-drawer { max-width: 100%; }
        }
      `}</style>
    </>
  );
};

export default CartDrawer;
