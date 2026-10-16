import { useEffect, useMemo, useRef, useState } from 'react';
import { POPULAR_SEARCH_PILLS, TOOL_SEARCH_DATA } from '../data/searchCatalog';
import { SEARCH_DATA } from '../data/searchData';

const normalize = (value = '') => String(value).toLowerCase().replace(/[→➔]/g, ' to ').replace(/[^a-z0-9]+/g, ' ').trim();

const searchableText = (item) => normalize([
  item.title,
  item.type,
  item.tag,
  item.description,
  ...(item.keywords || [])
].filter(Boolean).join(' '));

const rankResults = (query) => {
  const cleanQuery = normalize(query);
  if (!cleanQuery) return TOOL_SEARCH_DATA.filter((item) => ['converter-image-to-favicon', 'tool-optimizer', 'tool-gif', 'converter-svg-to-webp', 'ai-upscale', 'tool-json'].includes(item.id));
  const terms = cleanQuery.split(' ').filter(Boolean);

  return SEARCH_DATA
    .map((item) => {
      const title = normalize(item.title);
      const text = searchableText(item);
      if (!terms.every((term) => text.includes(term))) return null;
      let score = item.kind === 'TOOL' ? 4 : 0;
      if (title === cleanQuery) score += 100;
      if (title.startsWith(cleanQuery)) score += 55;
      if (title.includes(cleanQuery)) score += 35;
      if (text.includes(cleanQuery)) score += 20;
      score += terms.filter((term) => title.includes(term)).length * 8;
      return { item, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map(({ item }) => item);
};

const SearchDrawer = ({ isOpen, setIsOpen, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const filteredData = useMemo(() => rankResults(searchTerm), [searchTerm]);
  const autocomplete = searchTerm.trim() ? filteredData.slice(0, 6) : [];

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open');
      window.setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [isOpen]);

  const closeSearch = () => {
    setSearchTerm('');
    setActiveSuggestion(-1);
    setIsOpen(false);
  };

  const chooseItem = (item) => {
    if (!item) return;
    setSearchTerm('');
    setActiveSuggestion(-1);
    onSelect(item);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeSearch();
      return;
    }
    if (!autocomplete.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestion((current) => (current + 1) % autocomplete.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestion((current) => current <= 0 ? autocomplete.length - 1 : current - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      chooseItem(autocomplete[activeSuggestion >= 0 ? activeSuggestion : 0]);
    }
  };

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={closeSearch} />

      <aside className={`cart-drawer search-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen} aria-label="Search Rynell Studio">
        <div className="cart-header">
          <div>
            <span className="search-kicker">FIND ANYTHING</span>
            <h2>SEARCH THE STUDIO</h2>
          </div>
          <button className="cart-close" onClick={closeSearch} aria-label="Close search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="drawer-body-scrollable">
          <div className="search-input-wrapper">
            <span className="search-input-icon" aria-hidden="true">⌕</span>
            <input
              ref={inputRef}
              type="search"
              className="brutalist-search"
              placeholder="TRY: FAVICON, WEBP, REMOVE EXIF…"
              value={searchTerm}
              onChange={(event) => { setSearchTerm(event.target.value); setActiveSuggestion(-1); }}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={autocomplete.length > 0}
              aria-controls="studio-search-autocomplete"
              aria-activedescendant={activeSuggestion >= 0 ? `autocomplete-${autocomplete[activeSuggestion]?.id}` : undefined}
            />
            {searchTerm && <button className="search-clear" onClick={() => { setSearchTerm(''); setActiveSuggestion(-1); }} aria-label="Clear search">×</button>}
          </div>

          {autocomplete.length > 0 && (
            <div className="autocomplete-panel" id="studio-search-autocomplete" role="listbox">
              <div className="autocomplete-label">AUTOCOMPLETE</div>
              {autocomplete.map((item, index) => (
                <button
                  type="button"
                  id={`autocomplete-${item.id}`}
                  role="option"
                  aria-selected={index === activeSuggestion}
                  key={item.id}
                  className={`autocomplete-option ${index === activeSuggestion ? 'active' : ''}`}
                  onMouseEnter={() => setActiveSuggestion(index)}
                  onClick={() => chooseItem(item)}
                >
                  <span>{item.title}</span><small>{item.tag}</small>
                </button>
              ))}
            </div>
          )}

          <div className="search-suggestion-block">
            <div className="suggestion-heading"><span>POPULAR TASKS</span><small>CLICK TO SEARCH</small></div>
            <div className="search-pills">
              {POPULAR_SEARCH_PILLS.map((pill) => (
                <button key={pill.query} type="button" className={normalize(searchTerm) === normalize(pill.query) ? 'active' : ''} onClick={() => { setSearchTerm(pill.query); setActiveSuggestion(-1); inputRef.current?.focus(); }}>
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="search-results" aria-live="polite">
            <div className="search-results-heading">
              <span>{searchTerm ? 'SEARCH RESULTS' : 'START HERE'}</span>
              <strong>{filteredData.length} {filteredData.length === 1 ? 'MATCH' : 'MATCHES'}</strong>
            </div>
            {filteredData.length === 0 ? (
              <div className="no-results">
                <strong>NO MATCH FOR “{searchTerm.toUpperCase()}”</strong>
                <span>Try a format, task, feature, product, article, or service.</span>
              </div>
            ) : filteredData.map((item) => (
              <button key={item.id} type="button" className="search-result-item" onClick={() => chooseItem(item)}>
                <div className="result-meta"><span className="result-type">{item.type}</span><span className="result-tag">{item.tag}</span></div>
                <h3 className="result-title">{item.title}</h3>
                {item.description && <p className="result-description">{item.description}</p>}
                <span className="result-action">{item.kind === 'CONTENT' ? 'OPEN' : 'GO TO TOOL'} <b>→</b></span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <style>{`
        .search-drawer { width: min(600px, 100vw); background: var(--bg-primary); color: var(--text-primary); }
        .search-drawer .cart-header { align-items: center; border-bottom: 3px solid var(--text-primary); }
        .search-drawer .cart-header h2 { margin: .15rem 0 0; font-size: clamp(1.8rem, 5vw, 2.6rem); letter-spacing: 1.5px; }
        .search-kicker { color: var(--primary-orange); font: 700 .72rem var(--font-body); letter-spacing: 2px; }
        .search-drawer .drawer-body-scrollable { padding: 1.5rem 2rem 3rem; height: calc(100vh - 100px); overflow-y: auto; }
        .search-input-wrapper { position: relative; display: flex; align-items: center; border: 3px solid var(--text-primary); background: var(--bg-card); box-shadow: 6px 6px 0 var(--primary-orange); }
        .search-input-icon { flex: 0 0 auto; padding-left: 1rem; font: 2rem var(--font-heading); color: var(--primary-orange); transform: rotate(-15deg); }
        .brutalist-search { width: 100%; min-width: 0; background: transparent; border: 0; padding: 1rem .75rem; font-family: var(--font-heading); font-size: clamp(1.25rem, 4vw, 1.8rem); letter-spacing: 1px; color: var(--text-primary); outline: none; }
        .brutalist-search::placeholder { color: var(--text-secondary); opacity: .58; }
        .search-input-wrapper:focus-within { border-color: var(--primary-orange); box-shadow: 7px 7px 0 var(--secondary-blue); }
        .search-clear { margin-right: .65rem; border: 0; background: transparent; color: var(--text-primary); font: 2rem/1 var(--font-heading); cursor: pointer; }
        .autocomplete-panel { margin: .8rem 0 0; border: 2px solid var(--border-color); background: var(--bg-card); }
        .autocomplete-label { padding: .45rem .75rem; color: var(--primary-orange); font: .72rem var(--font-heading); letter-spacing: 1.5px; border-bottom: 1px solid var(--border-color); }
        .autocomplete-option { width: 100%; display: flex; justify-content: space-between; gap: 1rem; padding: .68rem .75rem; border: 0; border-bottom: 1px solid var(--border-color); background: transparent; color: var(--text-primary); text-align: left; cursor: pointer; font: 1rem var(--font-heading); letter-spacing: .7px; }
        .autocomplete-option:last-child { border-bottom: 0; }
        .autocomplete-option small { color: var(--text-secondary); font: .66rem var(--font-body); letter-spacing: .5px; }
        .autocomplete-option:hover, .autocomplete-option.active { background: var(--primary-orange); color: var(--black); }
        .autocomplete-option:hover small, .autocomplete-option.active small { color: var(--black); }
        .search-suggestion-block { margin: 1.75rem 0 2rem; }
        .suggestion-heading, .search-results-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: .8rem; font-family: var(--font-heading); letter-spacing: 1.5px; }
        .suggestion-heading small { color: var(--text-secondary); font: .63rem var(--font-body); letter-spacing: 1px; }
        .search-pills { display: flex; flex-wrap: wrap; gap: .55rem; }
        .search-pills button { border: 2px solid var(--text-primary); background: var(--bg-card); color: var(--text-primary); padding: .5rem .72rem; font: .78rem var(--font-heading); letter-spacing: .8px; box-shadow: 3px 3px 0 var(--black); cursor: pointer; }
        .search-pills button:hover, .search-pills button.active { border-color: var(--primary-orange); background: var(--primary-orange); color: var(--black); transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--black); }
        .search-results { display: flex; flex-direction: column; gap: .85rem; }
        .search-results-heading { padding-bottom: .65rem; border-bottom: 2px solid var(--border-color); color: var(--text-secondary); }
        .search-results-heading strong { color: var(--primary-orange); font-size: .78rem; }
        .search-result-item { position: relative; width: 100%; border: 2px solid var(--border-color); padding: 1rem 1rem .9rem; background: var(--bg-card); color: var(--text-primary); text-align: left; cursor: pointer; transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease; }
        .search-result-item:hover, .search-result-item:focus-visible { border-color: var(--primary-orange); transform: translateX(5px); box-shadow: -5px 0 0 var(--primary-orange); outline: none; }
        .result-meta { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: .35rem; }
        .result-type, .result-tag { font: .68rem var(--font-body); letter-spacing: 1px; }
        .result-type { color: var(--primary-orange); font-weight: 800; }
        .result-tag { color: var(--text-secondary); text-align: right; }
        .result-title { margin: 0; color: var(--text-primary); font-size: 1.45rem; letter-spacing: .8px; }
        .result-description { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: .45rem 0 .7rem; color: var(--text-secondary); font: .78rem/1.45 var(--font-body); }
        .result-action { color: var(--text-secondary); font: .68rem var(--font-heading); letter-spacing: 1.2px; }
        .result-action b { color: var(--primary-orange); font-size: 1rem; }
        .no-results { display: flex; flex-direction: column; gap: .5rem; padding: 2rem 1rem; border: 3px dashed var(--border-color); color: var(--text-secondary); text-align: center; }
        .no-results strong { color: var(--text-primary); font: 1.45rem var(--font-heading); letter-spacing: 1px; }
        .no-results span { font-size: .85rem; }
        @media (max-width: 600px) { .search-drawer .drawer-body-scrollable { padding: 1.2rem 1rem 2.5rem; } .result-description { -webkit-line-clamp: 3; } }
        @media (prefers-reduced-motion: reduce) { .search-result-item, .search-pills button { transition: none; } }
      `}</style>
    </>
  );
};

export default SearchDrawer;
