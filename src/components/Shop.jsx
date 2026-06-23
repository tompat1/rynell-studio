import React, { useState } from 'react';
import merch1 from '../assets/merch/merch_01.webp';
import merch2 from '../assets/merch/merch_02.webp';
import merch3 from '../assets/merch/merch_03.webp';
import merch4 from '../assets/merch/merch_04.webp';
import merch5 from '../assets/merch/merch_05.webp';
import merch6 from '../assets/merch/merch_06.webp';
import merch7 from '../assets/merch/merch_07.webp';
import merch8 from '../assets/merch/merch_08.webp';

const merchData = [
  { id: 1, image: merch1, title: 'HEAVYWEIGHT LOGO HOODIE', price: 120.00, details: '400gsm Organic Cotton. Boxy fit.', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 2, image: merch2, title: 'NEON NIGHTS LONG SLEEVE', price: 85.00, details: '100% Cotton. Screen printed graphics.', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 3, image: merch3, title: 'BRUTALIST GRAPHIC TEE', price: 55.00, details: 'Vintage wash. Distressed collar.', sizes: ['M', 'L', 'XL', 'XXL'] },
  { id: 4, image: merch4, title: 'STUDIO UTILITY JACKET', price: 210.00, details: 'Heavy canvas. Multipocket design.', sizes: ['S', 'M', 'L'] },
  { id: 5, image: merch5, title: 'CAMPAIGN BEANIE', price: 35.00, details: 'Acrylic blend. Embroidered logo.', sizes: ['OS'] },
  { id: 6, image: merch6, title: 'ACID WASH TANK', price: 45.00, details: 'Ribbed cotton. Cropped fit.', sizes: ['XS', 'S', 'M'] },
  { id: 7, image: merch7, title: 'OVERSIZED TOTE BAG', price: 65.00, details: '100% Canvas. Reinforced straps.', sizes: ['OS'] },
  { id: 8, image: merch8, title: 'EXPERIMENTAL ZIP-UP', price: 140.00, details: 'French terry. Custom hardware.', sizes: ['S', 'M', 'L', 'XL'] },
];

const ShopItem = ({ item, addToCart }) => {
  const [selectedSize, setSelectedSize] = useState(item.sizes[0]);

  const handleAddToCart = () => {
    addToCart({ ...item, size: selectedSize });
  };

  return (
    <div className="shop-item">
      <div className="shop-image-container">
        <img src={item.image} alt={item.title} className="shop-product-img" />
        
        <div className="quick-add-overlay">
          <div className="quick-add-content">
            <p className="item-details">{item.details}</p>
            
            <div className="size-selector">
              <div className="size-options">
                {item.sizes.map(size => (
                  <button 
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button className="confirm-add-btn" onClick={handleAddToCart}>
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
      
      <div className="shop-item-details">
        <h3>{item.title}</h3>
        <p className="price">${item.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

const Shop = ({ addToCart }) => {
  return (
    <section id="shop" className="section-container">
      <div className="content-wrapper">
        <div className="shop-header">
          <h2 className="section-title">LATEST DROPS</h2>
          <button className="view-all-btn">VIEW ALL MERCH</button>
        </div>
        
        <div className="shop-grid">
          {merchData.map((item) => (
            <ShopItem key={item.id} item={item} addToCart={addToCart} />
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
        
        /* Quick Add Overlay */
        .quick-add-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: rgba(2, 8, 19, 0.95);
          backdrop-filter: blur(8px);
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          border-top: 1px solid rgba(0, 120, 255, 0.5);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        
        .shop-image-container:hover .quick-add-overlay {
          transform: translateY(0);
        }

        .item-details {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .size-selector {
          margin-bottom: 1.5rem;
        }

        .size-options {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .size-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: #FFF;
          font-family: var(--font-body);
          font-size: 0.85rem;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .size-btn:hover {
          border-color: rgba(255,255,255,0.5);
        }

        .size-btn.active {
          background: #0078FF;
          border-color: #0078FF;
          font-weight: bold;
        }

        .confirm-add-btn {
          background: var(--primary-orange);
          color: #FFF;
          border: none;
          padding: 1rem;
          font-family: var(--font-body);
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.3s ease;
        }

        .confirm-add-btn:hover {
          background: #ff5722;
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
          .quick-add-overlay {
            transform: translateY(0); /* Always visible on mobile */
            position: static;
            border-top: none;
            padding: 1rem 0 0 0;
            background: transparent;
          }
        }
      `}</style>
    </section>
  );
};

export default Shop;
