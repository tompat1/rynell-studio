import React from 'react';

const About = () => {
  return (
    <section id="about" className="section-container bg-halftone">
      <div className="about-content">
        <h2 className="about-manifesto">
          WE DON'T FOLLOW TRENDS.<br/>
          <span className="highlight">WE BUILD THEM.</span>
        </h2>
        <div className="about-description">
          <p>
            Rynell Studio is a multi-disciplinary creative force specializing in aggressive, high-impact visual design. 
            From conceptual branding to explosive campaign visuals and AI-driven asset generation, we deliver work that 
            doesn't just look good—it hits hard.
          </p>
        </div>
      </div>
      <style>{`
        #about {
          background-color: var(--bg-secondary);
          padding: 10rem 5%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .about-content {
          max-width: 1000px;
        }
        .about-manifesto {
          font-family: var(--font-heading);
          font-size: 8rem;
          color: var(--text-primary);
          line-height: 0.85;
          margin: 0 0 3rem 0;
          text-shadow: 4px 4px 0 var(--border-color);
          transform: skewX(-10deg);
        }
        .highlight {
          color: var(--primary-orange);
        }
        .about-description {
          font-family: var(--font-body);
          font-size: 1.5rem;
          color: var(--text-secondary);
          line-height: 1.6;
          font-weight: 300;
          max-width: 800px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) {
          .about-manifesto { font-size: 5rem; }
          .about-description { font-size: 1.2rem; }
        }
        @media (max-width: 480px) {
          .about-manifesto { font-size: 4rem; }
        }
      `}</style>
    </section>
  );
};
export default About;
