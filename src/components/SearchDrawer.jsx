import React, { useState, useEffect } from 'react';

// Hardcoded mock data for search
const SEARCH_DATA = [
  { type: 'PRODUCT', title: 'Blackout Hoodie', tag: 'Apparel' },
  { type: 'PRODUCT', title: 'Tangerine Cap', tag: 'Accessories' },
  { type: 'PRODUCT', title: 'Neon Nights Tote', tag: 'Accessories' },
  { type: 'JOURNAL', title: 'The Brutalist Manifesto', tag: 'Culture' },
  { type: 'JOURNAL', title: 'Designing for Impact', tag: 'Design' },
  { type: 'SERVICE', title: 'Brand Identity', tag: 'Service' },
  { type: 'SERVICE', title: 'Campaign Creative', tag: 'Service' },
];

const SearchDrawer = ({ isOpen, setIsOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) document.body.classList.add('drawer-open');
    else document.body.classList.remove('drawer-open');
    return () => document.body.classList.remove('drawer-open');
  }, [isOpen]);

  const filteredData = SEARCH_DATA.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div className={`cart-drawer search-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>SEARCH</h2>
          <button className="cart-close" onClick={() => setIsOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="drawer-body-scrollable">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              className="brutalist-search" 
              placeholder="SEARCH..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={isOpen}
            />
          </div>

          <div className="search-results">
            {searchTerm && filteredData.length === 0 ? (
              <p className="no-results">NO RESULTS FOUND FOR "{searchTerm.toUpperCase()}"</p>
            ) : (
              filteredData.map((item, index) => (
                <div key={index} className="search-result-item">
                  <span className="result-type">{item.type}</span>
                  <h3 className="result-title">{item.title}</h3>
                  <span className="result-tag">{item.tag}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .search-drawer .drawer-body-scrollable {
          padding: 2rem;
          height: calc(100vh - 100px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .search-input-wrapper {
          margin-bottom: 3rem;
        }
        .brutalist-search {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 4px solid var(--text-light);
          padding: 1rem 0;
          font-family: var(--font-heading);
          font-size: 2rem;
          color: var(--text-light);
          outline: none;
          transition: all 0.3s ease;
        }
        .brutalist-search:focus {
          border-bottom-color: var(--primary-orange);
        }
        .brutalist-search::placeholder {
          color: var(--text-secondary);
          opacity: 0.5;
        }
        .search-results {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .search-result-item {
          border: 2px solid var(--border-color);
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .search-result-item:hover {
          border-color: var(--primary-orange);
          background: rgba(255, 106, 0, 0.05);
          transform: translateX(10px);
        }
        .result-type {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          color: var(--primary-orange);
          margin-bottom: 0.5rem;
          display: block;
        }
        .result-title {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          margin: 0 0 0.5rem 0;
          color: var(--text-light);
        }
        .result-tag {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .no-results {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: var(--text-secondary);
          text-align: center;
          margin-top: 2rem;
        }
      `}</style>
    </>
  );
};

export default SearchDrawer;
