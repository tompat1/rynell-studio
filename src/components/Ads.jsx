import React, { useEffect, useRef, useState } from 'react';
import camp1 from '../assets/campaigns/campaign_01.jpg';
import camp2 from '../assets/campaigns/campaign_02.jpg';
import camp3 from '../assets/campaigns/campaign_03.jpg';
import camp4 from '../assets/campaigns/campaign_04.jpg';
import camp5 from '../assets/campaigns/campaign_05.jpg';
import camp6 from '../assets/collection/collection_05.webp';
import camp7 from '../assets/collection/collection_06.webp';
import camp8 from '../assets/collection/collection_07.webp';
import camp9 from '../assets/collection/collection_08.webp';

const campaignData = [
  { id: 1, image: camp1, title: 'WHISPER CAMPAIGN' },
  { id: 2, image: camp2, title: 'SCROLL STOPPER' },
  { id: 3, image: camp3, title: 'VISUAL UNIVERSE' },
  { id: 4, image: camp4, title: 'MERCH DROP' },
  { id: 5, image: camp5, title: 'OOH BILLBOARD' },
  { id: 6, image: camp6, title: 'STREET LEVEL' },
  { id: 7, image: camp7, title: 'DIGITAL DISTORTION' },
  { id: 8, image: camp8, title: 'NEON WASH' },
  { id: 9, image: camp9, title: 'RAW CAPTURE' },
];

const Ads = () => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);

  // Duplicate the array to create a continuous looping track
  const displayAds = [...campaignData, ...campaignData];

  useEffect(() => {
    let animationId;
    let lastTime = performance.now();
    const speed = 0.08; 

    const scrollLoop = (time) => {
      if (scrollRef.current && !isHovered && !isDragging) {
        const delta = time - lastTime;
        scrollRef.current.scrollLeft += speed * delta;
        
        // Loop back when we've scrolled past half the content to simulate infinity
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      lastTime = time;
      animationId = requestAnimationFrame(scrollLoop);
    };

    animationId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isHovered, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setInitialScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll faster than mouse
    scrollRef.current.scrollLeft = initialScrollLeft - walk;
  };

  return (
    <section id="ads" className="section-container bg-grunge">
      <div className="ads-header">
        <h2 className="section-title">ADS</h2>
      </div>
      <div 
        className={`ads-carousel ${isDragging ? 'active' : ''}`}
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <div className="ads-track">
          {displayAds.map((item, idx) => (
            <div key={idx} className="ad-card">
              <div className="ad-image">
                <img src={item.image} alt={item.title} className="ad-img" />
              </div>
              <div className="ad-overlay">
                <h3>{item.title}</h3>
                <button>VIEW CAMPAIGN</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        #ads {
          background-color: var(--bg-tertiary);
          padding: 8rem 0 8rem 0;
          overflow: hidden;
        }
        .ads-header {
          padding: 0 5%;
          margin-bottom: 4rem;
        }
        .ads-header .section-title {
          font-family: var(--font-heading);
          font-size: 6rem;
          color: var(--text-primary);
          margin: 0;
          text-shadow: 4px 4px 0 var(--border-color);
          transform: skewX(-10deg);
        }
        .ads-carousel {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          cursor: grab;
        }
        .ads-carousel.active {
          cursor: grabbing;
        }
        .ads-carousel::-webkit-scrollbar {
          display: none;
        }
        .ads-track {
          display: flex;
          gap: 2rem;
          padding-right: 2rem;
          padding-left: 5%;
          width: max-content;
        }
        .ad-card {
          min-width: 600px;
          height: 700px;
          position: relative;
          background: var(--bg-secondary);
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        .ad-image {
          width: 100%;
          height: 100%;
          background: var(--bg-primary);
          transition: transform 0.5s ease;
        }
        .ad-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none; /* Prevents default image drag so we can drag the carousel */
        }
        .ad-card:hover .ad-image {
          transform: scale(1.05);
        }
        .ad-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: rgba(0,0,0,0.6);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none; /* Let the user drag the card through the overlay */
        }
        .ad-card:hover .ad-overlay {
          opacity: 1;
        }
        .ad-overlay h3 {
          font-family: var(--font-heading);
          font-size: 5rem;
          color: #FFF;
          margin: 0 0 2rem 0;
          transform: translateY(20px);
          transition: transform 0.3s ease;
          text-align: center;
          padding: 0 2rem;
        }
        .ad-card:hover .ad-overlay h3 {
          transform: translateY(0);
        }
        .ad-overlay button {
          background: var(--primary-orange);
          color: #FFF;
          border: none;
          padding: 1rem 2rem;
          font-family: var(--font-body);
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transform: translateY(20px);
          transition: transform 0.4s ease;
          pointer-events: auto; /* Re-enable pointer events for the button */
        }
        .ad-card:hover .ad-overlay button {
          transform: translateY(0);
        }
        @media (max-width: 768px) {
          .ads-header .section-title { font-size: 4rem; }
          .ad-card { min-width: 85vw; height: 500px; }
          .ad-overlay h3 { font-size: 3rem; }
        }
      `}</style>
    </section>
  );
};

export default Ads;
