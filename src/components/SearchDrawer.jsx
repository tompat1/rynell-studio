import React, { useState, useEffect } from 'react';

import { merchData } from './Shop';
import { journalData } from './Journal';
import { servicesData } from './Services';

// Construct search data dynamically from real assets
const SEARCH_DATA = [
  ...merchData.map(item => ({ ...item, type: 'PRODUCT', tag: 'Shop', id: `product-${item.id}` })),
  ...journalData.map(item => ({ ...item, type: 'JOURNAL', tag: 'Journal', id: `journal-${item.id}` })),
  ...servicesData.map(item => ({ ...item, type: 'SERVICE', tag: 'Service', id: `service-${item.label}` }))
];

const SearchDrawer = ({ isOpen, setIsOpen, onSelect }) => {
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
            {!searchTerm && <h3 className="search-results-heading">LATEST ADDITIONS</h3>}
            {searchTerm && filteredData.length > 0 && <h3 className="search-results-heading">SEARCH RESULTS</h3>}
            {searchTerm && filteredData.length === 0 ? (
              <p className="no-results">NO RESULTS FOUND FOR "{searchTerm.toUpperCase()}"</p>
            ) : (
              filteredData.map((item) => (
                <div 
                  key={item.id} 
                  className="search-result-item"
                  onClick={() => onSelect(item)}
                >
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
        .search-results-heading {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          letter-spacing: 1px;
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
