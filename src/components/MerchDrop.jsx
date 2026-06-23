import React from 'react';
import merchComposite from '../assets/merch-composite.png';

const MerchDrop = () => {
  return (
    <section className="merch section-pad bg-halftone">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="comic-text" style={{ fontSize: '4rem', transform: 'rotate(-2deg)', display: 'inline-block' }}>MERCH DROP</h2>
          <p className="text-blue" style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '1rem' }}>Caps &bull; Hoodies &bull; Stickers &bull; Totes</p>
        </div>
        
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
          <img 
            src={merchComposite} 
            alt="Rynell Studio Merch Drop" 
            style={{ width: '100%', border: '4px solid var(--black)', boxShadow: '10px 10px 0 var(--secondary-blue)', borderRadius: '12px' }} 
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <button className="btn btn-blue" style={{ transform: 'rotate(1deg)' }}>Shop Collection</button>
        </div>
      </div>
    </section>
  );
};

export default MerchDrop;
