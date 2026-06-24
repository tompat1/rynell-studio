import React, { useState } from 'react';
import merch1 from '../assets/merch/bolt_sticker_merch_neutral_01.webp';
import merch2 from '../assets/merch/cap_merch_tangerine_02.webp';
import merch3 from '../assets/merch/hoodie_merch_tangerine_03.webp';
import merch4 from '../assets/merch/tote_merch_milk_04.webp';
import merch5 from '../assets/merch/stickerpack_merch_neutral_05.webp';
import merch6 from '../assets/merch/tee_merch_blackout_06.webp';
import merch7 from '../assets/merch/hoodie_merch_blackout_07.webp';
import merch8 from '../assets/merch/cap_merch_blackout_07.webp';
import merch9 from '../assets/merch/poster_merch_blackout_08.webp';
import merch10 from '../assets/merch/tote_merch_blackout_09.webp';
import merch11 from '../assets/merch/caseiphone_merch_blackout_10.webp';

const merchData = [
  { id: 1, image: merch1, title: 'BOLT STICKER NEUTRAL', price: 5.00, details: 'Die-cut vinyl decal.', sizes: ['OS'] },
  { id: 2, image: merch2, title: 'STUDIO CAP TANGERINE', price: 35.00, details: 'Cotton twill. Embroidered logo.', sizes: ['OS'] },
  { id: 3, image: merch3, title: 'LOGO HOODIE TANGERINE', price: 120.00, details: '400gsm Organic Cotton. Boxy fit.', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 4, image: merch4, title: 'TOTE BAG MILK', price: 45.00, details: 'Heavy canvas. Reinforced straps.', sizes: ['OS'] },
  { id: 5, image: merch5, title: 'STICKER PACK NEUTRAL', price: 15.00, details: 'Set of 5 vinyl decals.', sizes: ['OS'] },
  { id: 6, image: merch6, title: 'BRUTALIST TEE BLACKOUT', price: 55.00, details: 'Vintage wash. Boxy fit.', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 7, image: merch7, title: 'LOGO HOODIE BLACKOUT', price: 120.00, details: '400gsm Organic Cotton. Boxy fit.', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 8, image: merch8, title: 'STUDIO CAP BLACKOUT', price: 35.00, details: 'Cotton twill. Embroidered logo.', sizes: ['OS'] },
  { id: 9, image: merch9, title: 'STUDIO POSTER BLACKOUT', price: 25.00, details: 'A2 size. 200gsm silk paper.', sizes: ['OS'] },
  { id: 10, image: merch10, title: 'TOTE BAG BLACKOUT', price: 45.00, details: 'Heavy canvas. Reinforced straps.', sizes: ['OS'] },
  { id: 11, image: merch11, title: 'IPHONE CASE BLACKOUT', price: 30.00, details: 'Matte finish. Drop protection.', sizes: ['13', '14', '15'] },
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
          <div className="title-group">
            <h2 className="section-title">LATEST DROPS</h2>
            <p className="section-description">Physical artifacts of our visual philosophy. Limited run apparel and accessories designed for the modern dystopia.</p>
          </div>
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
          background-color: var(--bg-shop-color);
          padding: 8rem 5%;
          border-top: 4px solid var(--text-primary);
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
          color: var(--text-primary);
          margin: 0;
          text-shadow: 4px 4px 0 var(--border-color);
          transform: skewX(-10deg);
        }
        .section-description {
          font-family: var(--font-body);
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin: 0;
          max-width: 500px;
          line-height: 1.5;
          border-left: 4px solid var(--primary-orange);
          padding-left: 1.5rem;
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .view-all-btn {
          background: transparent;
          color: var(--text-primary);
          border: 2px solid var(--secondary-blue);
          padding: 0.8rem 2rem;
          font-family: var(--font-body);
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .view-all-btn:hover {
          background: var(--secondary-blue);
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
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
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
          background: var(--bg-card);
          backdrop-filter: blur(8px);
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          border-top: 1px solid var(--secondary-blue);
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
          color: var(--text-secondary);
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
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.85rem;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .size-btn:hover {
          border-color: var(--text-secondary);
        }

        .size-btn.active {
          background: var(--secondary-blue);
          border-color: var(--secondary-blue);
          color: #FFF;
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
          color: var(--text-primary);
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
          .title-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .section-title { font-size: 4rem; }
          
          .shop-image-container {
            aspect-ratio: auto;
            height: auto;
          }
          
          .shop-product-img {
            aspect-ratio: 1;
            height: auto;
          }

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
