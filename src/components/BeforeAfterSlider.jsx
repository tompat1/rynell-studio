import React, { useState, useRef } from 'react';

const BeforeAfterSlider = ({ beforeImage, afterImage, beforeLabel = "ORIGINAL (1080P)", afterLabel = "AI ENHANCED (8K ULTRA)" }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="slider-wrapper">
      <div 
        ref={containerRef}
        className="slider-container"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* Underneath: After (Enhanced 8K) Image */}
        <div className="img-layer after-layer">
          <img src={afterImage} alt="Enhanced 8K" />
          <span className="slider-badge after-badge">{afterLabel}</span>
        </div>

        {/* Overlay: Before (Original) Image clipped to sliderPosition */}
        <div 
          className="img-layer before-layer"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img src={beforeImage} alt="Original Low Res" />
          <span className="slider-badge before-badge">{beforeLabel}</span>
        </div>

        {/* Draggable Divider Handle */}
        <div 
          className="slider-handle"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="handle-line"></div>
          <div className="handle-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M8 6L2 12L8 18M16 6L22 12L16 18" />
            </svg>
          </div>
          <div className="handle-line"></div>
        </div>
      </div>

      <style>{`
        .slider-wrapper {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          user-select: none;
        }

        .slider-container {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
          border: 4px solid var(--text-primary);
          box-shadow: 8px 8px 0 var(--primary-orange);
          background-color: #000;
          cursor: ew-resize;
        }

        .img-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .img-layer img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .slider-badge {
          position: absolute;
          top: 1rem;
          font-family: var(--font-heading);
          font-size: 1.1rem;
          letter-spacing: 1px;
          padding: 0.4rem 1rem;
          border: 2px solid #000;
          box-shadow: 3px 3px 0 #000;
          z-index: 10;
        }

        .before-badge {
          left: 1rem;
          background: #000;
          color: #FFF;
          border-color: #FFF;
        }

        .after-badge {
          right: 1rem;
          background: var(--primary-orange);
          color: #FFF;
        }

        .slider-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 4px;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }

        .handle-line {
          flex: 1;
          width: 4px;
          background-color: var(--primary-orange);
          box-shadow: 0 0 10px rgba(255, 106, 0, 0.8);
        }

        .handle-button {
          width: 48px;
          height: 48px;
          background-color: var(--primary-orange);
          color: #FFF;
          border: 3px solid #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 4px 4px 0 #000;
          transition: transform 0.1s ease;
        }

        .slider-container:hover .handle-button {
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .slider-container {
            height: 350px;
          }
          .slider-badge {
            font-size: 0.85rem;
            padding: 0.2rem 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BeforeAfterSlider;
