import React from 'react';
import logoSticker from '../assets/logo-sticker.png';

const BrandPhilosophy = () => {
  return (
    <section className="philosophy section-pad" style={{ backgroundColor: 'var(--primary-orange)', color: 'var(--black)', borderTop: '4px solid var(--black)', borderBottom: '4px solid var(--black)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        
        <div style={{ marginBottom: '3rem' }}>
           <img src={logoSticker} alt="Rynell Studio Logo" style={{ maxWidth: '300px', filter: 'drop-shadow(6px 6px 0px var(--black))', animation: 'float 6s ease-in-out infinite' }} />
        </div>

        <h2 className="comic-text" style={{ fontSize: '3rem', color: 'var(--black)', textShadow: '3px 3px 0 var(--white)' }}>Creative Strategy. Bold Execution.</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginTop: '4rem', flexWrap: 'wrap' }}>
          {[
            { title: 'BOLD', desc: 'We stand out. We make noise.' },
            { title: 'CREATIVE', desc: 'We imagine. We design.' },
            { title: 'ENERGETIC', desc: 'We move fast. We bring energy.' },
            { title: 'AUTHENTIC', desc: 'We keep it real. We stay original.' }
          ].map((item, idx) => (
            <div key={idx} style={{ maxWidth: '200px' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--black)', margin: '0 auto 1rem auto', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--primary-orange)', fontWeight: 800 }}>R</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
              <p style={{ fontWeight: 600 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </section>
  );
};

export default BrandPhilosophy;
