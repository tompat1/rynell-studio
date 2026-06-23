import React from 'react';
import merch1 from '../assets/merch/merch_01.webp';
import merch2 from '../assets/merch/merch_02.webp';
import merch3 from '../assets/merch/merch_03.webp';
import merch4 from '../assets/merch/merch_04.webp';
import merch5 from '../assets/merch/merch_05.webp';
import merch6 from '../assets/merch/merch_06.webp';
import merch7 from '../assets/merch/merch_07.webp';
import merch8 from '../assets/merch/merch_08.webp';

const Shop = () => {
  const merchImages = [merch1, merch2, merch3, merch4, merch5, merch6, merch7, merch8];

  return (
    <section id="shop" className="section-container">
      <div className="content-wrapper">
        <div className="shop-header">
          <h2 className="section-title">LATEST DROPS</h2>
          <button className="view-all-btn">VIEW ALL MERCH</button>
        </div>
        
        <div className="shop-grid">
          {merchImages.map((imgSrc, idx) => (
            <div key={idx} className="shop-item">
              <div className="shop-image-container">
                <img src={imgSrc} alt={`Studio Exclusive 0${idx + 1}`} className="shop-product-img" />
                <div className="shop-hover-overlay">
                  <button className="add-to-cart-btn">ADD TO CART</button>
                </div>
              </div>
              <div className="shop-item-details">
                <h3>STUDIO EXCLUSIVE 0{idx + 1}</h3>
                <p className="price">$85.00</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        #shop {
          background-color: #0A1E3F;
          padding: 8rem 5%;
        }
        .shop-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 4rem;
        }
        .section-title {
          font-family: var(--font-heading);
          font-size: 6rem;
          color: #FFF;
          margin: 0;
          text-shadow: 4px 4px 0 #000;
          transform: skewX(-10deg);
        }
        .view-all-btn {
          background: transparent;
          color: #FFF;
          border: 2px solid #0078FF;
          padding: 0.8rem 2rem;
          font-family: var(--font-body);
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .view-all-btn:hover {
          background: #0078FF;
          color: #FFF;
        }
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        .shop-item {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .shop-image-container {
          position: relative;
          aspect-ratio: 1;
          background: #020813;
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }
        .shop-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .shop-image-container:hover .shop-product-img {
          transform: scale(1.05);
        }
        .shop-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 120, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .shop-image-container:hover .shop-hover-overlay {
          opacity: 1;
        }
        .add-to-cart-btn {
          background: #FFF;
          color: #0078FF;
          border: none;
          padding: 1rem 2rem;
          font-family: var(--font-body);
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transform: translateY(20px);
          transition: transform 0.3s ease;
        }
        .shop-image-container:hover .add-to-cart-btn {
          transform: translateY(0);
        }
        .shop-item-details h3 {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: #FFF;
          margin: 0 0 0.5rem 0;
          letter-spacing: 1px;
        }
        .price {
          font-family: var(--font-body);
          color: var(--primary-orange);
          font-weight: bold;
          margin: 0;
          font-size: 1.1rem;
        }
        @media (max-width: 768px) {
          .shop-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 2rem;
          }
          .section-title { font-size: 4rem; }
        }
      `}</style>
    </section>
  );
};

export default Shop;
