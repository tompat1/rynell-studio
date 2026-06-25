import React, { useEffect, useRef, useState } from 'react';
const collectionModules = import.meta.glob('../assets/collection/*.{png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' });
const collectionImages = Object.values(collectionModules);

const Collections = () => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);

  // Duplicate the array to create a continuous looping track
  const displayImages = [...collectionImages, ...collectionImages];

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
    <section id="collections" className="collections-section" style={{ position: 'relative' }}>
      <div className="section-label">COLLECTIONS</div>
      <div className="collections-header">
        <h2 className="section-title">COLLECTIONS</h2>
        <p className="section-description">Curated aesthetic archives. A rotating selection of our latest visual experiments and structural explorations.</p>
      </div>
      
      <div 
        className={`collections-carousel ${isDragging ? 'active' : ''}`}
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <div className="collections-track">
          {displayImages.map((img, idx) => (
            <div key={idx} className="collection-item">
              <img src={img} alt={`Collection ${idx + 1}`} className="collection-img" />
              <div className="collection-overlay">
                <span className="collection-number">NO. {String((idx % collectionImages.length) + 1).padStart(2, '0')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        #collections {
          background-image: var(--bg-collections);
          background-size: cover;
          background-position: center;
          padding: 8rem 0;
          border-top: 4px solid var(--text-primary);
          overflow: hidden;
        }
        .collections-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 0 5%;
          margin-bottom: 4rem;
        }
        .collections-header .section-title {
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
        .collections-carousel {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
          cursor: grab;
        }
        .collections-carousel.active {
          cursor: grabbing;
        }
        .collections-carousel::-webkit-scrollbar {
          display: none;
        }
        .collections-track {
          display: flex;
          gap: 2rem;
          padding-right: 2rem;
          padding-left: 5%;
          width: max-content;
        }
        .collection-item {
          position: relative;
          width: 400px;
          aspect-ratio: 4/5;
          overflow: hidden;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .collection-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
          pointer-events: none; /* prevents image drag so we can drag the carousel */
        }
        .collection-item:hover .collection-img {
          transform: scale(1.05);
        }
        .collection-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 50%);
          display: flex;
          align-items: flex-end;
          padding: 2rem;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .collection-item:hover .collection-overlay {
          opacity: 1;
        }
        .collection-number {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          color: #FFF;
          transform: translateY(20px);
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          text-shadow: 2px 2px 0 var(--primary-orange);
        }
        .collection-item:hover .collection-number {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .collections-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .collections-header .section-title { font-size: 4rem; }
          .collection-item {
            width: 280px;
          }
          .collection-overlay {
            opacity: 1;
            background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 40%);
            padding: 1rem;
          }
          .collection-number {
            transform: translateY(0);
            font-size: 1.8rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Collections;
