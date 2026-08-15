import React from 'react';

const PricingTable = ({ onClose }) => {
  const handleSubscribe = (priceId) => {
    // Redirects to Cloudflare Worker Stripe checkout trigger
    window.location.href = `https://studio.rynell.org/api/checkout?priceId=${priceId}`;
  };

  return (
    <div className="pricing-wrapper">
      <div className="pricing-header">
        <h2 className="pricing-main-title">
          READY FOR <span className="text-orange">8K ULTRA</span> & <span className="text-blue">VECTORINE</span>?
        </h2>
        <p className="pricing-subtitle">
          Unleash maximum GPU matrix capacity, vector tracing, and 8K ultra resolution for your visual workflow.
        </p>
      </div>

      <div className="pricing-grid">
        {/* FREE STUDIO TIER */}
        <div className="pricing-card free-card">
          <div className="card-top">
            <span className="plan-badge">STANDARD</span>
            <h3 className="plan-name">FREE STUDIO</h3>
            <p className="plan-desc">For quick daily scaling and basic testing.</p>
            <div className="plan-price">
              <span className="price-amount">0 SEK</span>
              <span className="price-period">/ ALWAYS FREE</span>
            </div>
          </div>

          <ul className="plan-features">
            <li>✔ Max 4K Output (2x Scaling)</li>
            <li>✔ Standard Photo Real-ESRGAN Model</li>
            <li>✔ Basic SVG Export on Vectorine</li>
            <li>✔ Standard GPU Processing Queue</li>
            <li className="disabled">✖ 24-Hour File Auto-Purge</li>
            <li className="disabled">✖ No Face Reconstruction AI</li>
          </ul>

          <button className="pricing-btn free-btn" onClick={onClose}>
            CONTINUE FREE
          </button>
        </div>

        {/* DELUXE STUDIO TIER */}
        <div className="pricing-card deluxe-card">
          <div className="featured-ribbon">MOST POPULAR</div>
          <div className="card-top">
            <span className="plan-badge deluxe">PRO ENGINE</span>
            <h3 className="plan-name">DELUXE STUDIO</h3>
            <p className="plan-desc">For creators, art directors, and designers who demand uncompromised 8K graphics.</p>
            <div className="plan-price">
              <span className="price-amount text-orange">149 SEK</span>
              <span className="price-period">/ MONTH</span>
            </div>
          </div>

          <ul className="plan-features">
            <li className="highlight">✔ Genuine 8K Output (4x AI Matrix)</li>
            <li className="highlight">✔ Full Vectorine GPU Engine (SVG, EPS, Print PDF)</li>
            <li>✔ All Special AI Models (Face, Anime, Complex)</li>
            <li>✔ Priority GPU Queue (Instant Execution)</li>
            <li>✔ 30-Day Retained Gallery History</li>
            <li>✔ High Fidelity Face Reconstruction (CodeFormer)</li>
          </ul>

          <button 
            className="pricing-btn deluxe-btn"
            onClick={() => handleSubscribe('stripe-price-id-deluxe')}
          >
            UPGRADE TO DELUXE 💎
          </button>
        </div>
      </div>

      <style>{`
        .pricing-wrapper {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
          background: var(--bg-card);
          border: 4px solid var(--border-color);
          box-shadow: 10px 10px 0 #000;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .pricing-main-title {
          font-family: var(--font-heading);
          font-size: 3rem;
          color: var(--text-primary);
          letter-spacing: 2px;
          margin-bottom: 0.8rem;
        }

        .pricing-subtitle {
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .pricing-card {
          position: relative;
          background: var(--bg-secondary);
          border: 3px solid var(--border-color);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .pricing-card.deluxe-card {
          border-color: var(--primary-orange);
          box-shadow: 6px 6px 0 var(--primary-orange);
        }

        .featured-ribbon {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary-orange);
          color: #FFF;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          padding: 0.3rem 1.2rem;
          border: 2px solid #000;
          letter-spacing: 2px;
        }

        .plan-badge {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .plan-badge.deluxe {
          color: var(--primary-orange);
        }

        .plan-name {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          color: var(--text-primary);
          margin: 0.3rem 0;
          letter-spacing: 1px;
        }

        .plan-desc {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          min-height: 45px;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px dashed var(--border-color);
          padding-bottom: 1.5rem;
        }

        .price-amount {
          font-family: var(--font-heading);
          font-size: 3rem;
          color: var(--text-primary);
        }

        .price-period {
          font-family: var(--font-heading);
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 2.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .plan-features li {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .plan-features li.highlight {
          color: var(--primary-orange);
          font-weight: 600;
        }

        .plan-features li.disabled {
          color: var(--text-secondary);
          opacity: 0.4;
          text-decoration: line-through;
        }

        .pricing-btn {
          width: 100%;
          font-family: var(--font-heading);
          font-size: 1.3rem;
          letter-spacing: 2px;
          padding: 1rem;
          border: 3px solid #000;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .free-btn {
          background: transparent;
          color: var(--text-primary);
          border-color: var(--border-color);
        }

        .free-btn:hover {
          border-color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .deluxe-btn {
          background: var(--primary-orange);
          color: #FFF;
          box-shadow: 4px 4px 0 #000;
        }

        .deluxe-btn:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0 #000;
          background: #ff5722;
        }
      `}</style>
    </div>
  );
};

export default PricingTable;
