import React, { useState, useEffect } from 'react';
import boltSvg from '../assets/lightning_bolt_sticker_vector.svg';
import loaderBg from '../assets/loader_clean_bg.webp';
import loaderMobileBg from '../assets/loader_mobile_bg.webp';

const Loader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const duration = 7000;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => onComplete(), 500);
        }, 400);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFading(true);
    setTimeout(() => onComplete(), 500);
  };

  return (
    <div className={`loader-container ${isFading ? 'fade-out' : ''}`}>
      <div 
        className="loader-bg-overlay"
        style={{ 
          '--bg-desktop': `url(${loaderBg})`,
          '--bg-mobile': `url(${loaderMobileBg})`
        }}
      ></div>

      <div className="loader-content">
        
        

        <div className="loader-status">
          <img src={boltSvg} alt="bolt" className="status-bolt left" />
          <span className="status-text">LOADING...</span>
          <img src={boltSvg} alt="bolt" className="status-bolt right" />
        </div>

        <div className="progress-container">
          <div className="progress-wrapper">
            <div className="progress-track">
              {/* The actual filled bar */}
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              >
                {/* The glowing spark at the edge */}
                <div className="progress-flare"></div>
              </div>
            </div>
          </div>
          <div className="progress-percentage">
            {Math.ceil(100 - progress)}%
          </div>
        </div>

        <div className="loader-subtitle">
          POWERING UP CREATIVITY
        </div>

        <button className="loader-next-btn" onClick={handleSkip}>
          NEXT
        </button>
      </div>

      <style>{`
        .loader-container {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background-color: #050a14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease-out;
        }

        .loader-container.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        /* Background Image Layer */
        .loader-bg-overlay {
          position: absolute;
          inset: 0;
          background-image: var(--bg-desktop);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 1;
        }

        .loader-content {
          position: absolute;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 600px;
          padding: 0 5%;
        }



        /* Status Text */
        .loader-status {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .status-text {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          color: #FFF;
          letter-spacing: 4px;
          font-style: italic;
          text-shadow: 2px 2px 0 var(--primary-orange);
        }
        .status-bolt {
          width: 24px;
          height: auto;
          filter: brightness(0) invert(1);
        }
        .status-bolt.left {
          transform: rotate(-15deg);
        }
        .status-bolt.right {
          transform: rotate(15deg);
        }

        /* Progress Bar Area */
        .progress-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .progress-wrapper {
          flex: 1;
          width: 100%;
          padding: 6px;
          background: linear-gradient(90deg, rgba(255,106,0,0.2) 0%, rgba(0,120,255,0.2) 100%);
          border-radius: 50px;
          box-shadow: 0 0 30px rgba(0, 120, 255, 0.2), inset 0 0 10px rgba(0,0,0,0.8);
          border: 2px solid rgba(255,255,255,0.1);
        }

        .progress-percentage {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          color: #FFF;
          min-width: 90px;
          text-align: right;
          text-shadow: 2px 2px 0 var(--secondary-blue);
          transform: skewX(-10deg);
        }

        .progress-track {
          width: 100%;
          height: 28px;
          background: #002255;
          border-radius: 50px;
          position: relative;
          overflow: hidden;
          /* Halftone/dot pattern for the un-filled track */
          background-image: radial-gradient(rgba(0,120,255,0.4) 1px, transparent 1px);
          background-size: 6px 6px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF6A00 0%, #FFB400 100%);
          border-radius: 50px;
          /* Removed transition for smooth requestAnimationFrame updates */
          position: relative;
          box-shadow: 0 0 15px rgba(255, 106, 0, 0.8);
        }

        /* The glowing flare at the leading edge */
        .progress-flare {
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 40px;
          background: #FFF;
          border-radius: 50%;
          box-shadow: 0 0 20px #FFF, 0 0 40px #0078FF, 0 0 60px #0078FF;
          z-index: 10;
          opacity: 0.95;
          filter: blur(1px);
        }

        .loader-subtitle {
          font-family: var(--font-body);
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 4px;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        /* Next Button */
        .loader-next-btn {
          background-color: var(--primary-orange);
          color: #FFF;
          font-family: var(--font-body);
          font-size: 1.2rem;
          font-weight: bold;
          letter-spacing: 3px;
          padding: 0.8rem 3rem;
          border: none;
          cursor: pointer;
          transform: skewX(-10deg);
          box-shadow: 4px 4px 0 #000;
          transition: transform 0.2s ease, background-color 0.2s ease;
          position: absolute;
          bottom: -4rem;
        }
        .loader-next-btn:hover {
          transform: skewX(-10deg) translateY(-2px);
          background-color: #ff5722;
        }

        @media (max-width: 768px) {
          .loader-bg-overlay {
            background-image: var(--bg-mobile);
          }
          .status-text { font-size: 1.5rem; }
          .progress-container {
            flex-direction: column;
            gap: 0.5rem;
          }
          .progress-percentage {
            text-align: center;
          }
          .loader-subtitle {
            display: none;
          }
          .loader-next-btn {
            bottom: -7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
