import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import studioPortrait from '../assets/studio_portrait.jpg';

const About = () => {
  const { playTTS, stopAudio, isPlaying } = useAudio();
  const manifestoText = "Rynell Studio is a multi-disciplinary creative force specializing in aggressive, high-impact visual design. From conceptual branding to explosive campaign visuals and AI-driven asset generation, we deliver work that doesn't just look good—it hits hard. We operate at the bleeding edge of visual culture, blending raw human creativity with state-of-the-art AI tooling to deliver uncompromising aesthetics.";

  return (
    <section id="about" className="section-container">
      
      {/* Manifesto Section */}
      <div className="about-content">
        <h2 className="about-manifesto">
          WE DON'T FOLLOW TRENDS.<br/>
          <span className="highlight">WE BUILD THEM.</span>
        </h2>
      </div>

      {/* Studio Split Section */}
      <div className="content-wrapper studio-split">
        <div className="studio-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>THE STUDIO</h2>
            <button 
              className={`read-to-me-btn ${isPlaying ? 'playing' : ''}`}
              onClick={() => isPlaying ? stopAudio() : playTTS(manifestoText)}
              style={{ marginBottom: 0, marginTop: '-1rem' }}
            >
              {isPlaying ? "⏹ STOP" : "▶ READ IT TO ME"}
            </button>
          </div>
          <p className="studio-manifesto-text">
            Rynell Studio is a multi-disciplinary creative force specializing in aggressive, high-impact visual design. 
            From conceptual branding to explosive campaign visuals and AI-driven asset generation, we deliver work that 
            doesn't just look good—it hits hard. We operate at the bleeding edge of visual culture, blending raw human creativity with state-of-the-art AI tooling to deliver uncompromising aesthetics.
          </p>
        </div>
        <div className="studio-image-wrapper">
          <img src={studioPortrait} alt="Studio Portrait" className="studio-image" />
        </div>
      </div>

      <style>{`
        #about {
          background-image: var(--bg-about);
          background-size: cover;
          background-position: center;
          padding: 10rem 5%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8rem;
          border-top: 4px solid var(--text-primary);
          border-bottom: 4px solid var(--text-primary);
        }
        
        /* Manifesto Styles */
        .about-content {
          max-width: 1000px;
          text-align: center;
        }
        .about-manifesto {
          font-family: var(--font-heading);
          font-size: 8rem;
          color: var(--text-primary);
          line-height: 0.85;
          margin: 0;
          text-shadow: 4px 4px 0 var(--border-color);
          transform: skewX(-10deg);
        }
        .highlight {
          color: var(--primary-orange);
        }

        /* Studio Split Styles */
        .studio-split {
          display: flex;
          align-items: center;
          gap: 5rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
        .studio-text {
          flex: 1;
        }
        .section-title {
          font-family: var(--font-heading);
          font-size: 6rem;
          color: var(--text-primary);
          margin: 0 0 2rem 0;
          text-shadow: 4px 4px 0 var(--border-color);
          transform: skewX(-10deg);
        }
        .studio-manifesto-text {
          font-family: var(--font-body);
          font-size: 1.5rem;
          color: var(--text-secondary);
          line-height: 1.6;
          font-weight: 300;
          border-left: 4px solid var(--primary-orange);
          padding-left: 2rem;
          margin: 0;
        }
        .studio-image-wrapper {
          flex: 1;
          height: 600px;
          position: relative;
          border: 2px solid var(--secondary-blue);
          overflow: hidden;
        }
        .studio-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(20%) contrast(1.1);
        }
        .studio-image-wrapper::after {
          content: 'STUDIO_CAM_01';
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-family: monospace;
          color: var(--secondary-blue);
          font-size: 1.2rem;
          background: var(--bg-primary);
          padding: 4px 8px;
        }

        @media (max-width: 1024px) {
          .about-manifesto { font-size: 5rem; }
          .studio-split { flex-direction: column; gap: 3rem; }
          .studio-image-wrapper { width: 100%; }
        }
        @media (max-width: 768px) {
          .section-title { 
            font-size: 4rem; 
            text-shadow: 2px 2px 0 var(--border-color);
          }
          .studio-manifesto-text { font-size: 1.2rem; }
        }
        @media (max-width: 480px) {
          .about-manifesto { font-size: 4rem; }
          .studio-manifesto-text { font-size: 1.2rem; }
          .section-title { font-size: 3rem; }
        }
      `}</style>
    </section>
  );
};
export default About;
